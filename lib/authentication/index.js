import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";
import { appBarContent, appContent, AstromiddlewareContent, authFileContent, clerkMiddlewareContent, clerkUI, HomePageComponent, isFrameworkSupported, mainFileContent, middlewareContent, nuxtMiddlewareContent, ProtectedRouteContent, SignIn, SignInPage, SignInReactPage, SignUp, SignUpPage, SignUpReactPage } from "./utils/utility.js";
import inquirer from "inquirer";

export async function setupAuthjs(state) {
    const { framework, projectName, language } = state;

    console.log(chalk.blue(`🔐 Setting up Auth.js for ${framework} project: ${projectName} \n📝 Language: ${language}`));

    // Validate framework support
    if (!isFrameworkSupported(framework)) {
        console.log(chalk.red(`❌ Framework '${framework}' is not supported for Auth.js setup.`));
        console.log(chalk.yellow('Supported frameworks: next, svelte, vue, vite-react, astro, nuxt'));
        return;
    }
    if (framework === 'next') {
        try {
            const targetDir = path.resolve(projectName);
            const currentDir = process.cwd();

            if (currentDir !== targetDir) {
                if (fs.existsSync(targetDir)) {
                    process.chdir(targetDir);
                    console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
                } else {
                    console.error(chalk.red(`Directory "${projectName}" does not exist.`));
                    // Optional: process.exit(1);
                }
            }
            console.log(chalk.blue(`Installing next-auth package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "next-auth@beta"], { cwd: rootDir, stdio: "inherit" });
            await execa("npx", ["auth", "secret"], { cwd: rootDir, stdio: "inherit" });

            console.log(chalk.green(`✅ next-auth package installed successfully.`));
            console.log(chalk.blue(`Configuring Next.js project for Auth.js...`));


            // --- Existing directories ---
            const libPath = path.join(rootDir, "lib");
            const actionPath = path.join(libPath, "actions");

            [rootDir, libPath, actionPath].forEach((dir) => {
                fs.mkdirSync(dir, { recursive: true });
            });

            // --- New: handle src/app/api/[...nextauth]/route ---
            const srcDir = path.join(rootDir, 'src');

            const authFilePath = path.join(actionPath, `auth.${language === 'ts' ? 'ts' : 'js'}`);
            const authlibContent = authFileContent(language);
            if (!fs.existsSync(authFilePath)) {
                fs.writeFileSync(authFilePath, authlibContent);
                console.log(chalk.green(`✅ Created ${authFilePath}`));
            }

            if (fs.existsSync(srcDir)) {

                const appDir = path.join(srcDir, 'app');

                fs.mkdirSync(appDir, { recursive: true });

                const nextauthApiDir = path.join(appDir, 'api', 'auth', '[...nextauth]');

                fs.mkdirSync(nextauthApiDir, { recursive: true });

                const middlewarePath = path.join(srcDir, 'middleware.' + (language === 'ts' ? 'ts' : 'js'));

                fs.existsSync(middlewarePath) || fs.writeFileSync(middlewarePath, middlewareContent);

                const routeFilePath = path.join(nextauthApiDir, `route.${language === 'ts' ? 'ts' : 'js'}`);

                if (!fs.existsSync(routeFilePath)) {
                    fs.writeFileSync(routeFilePath, `import { handlers } from "auth";\n\nexport const { GET, POST } = handlers;\n`);
                    console.log(chalk.green(`✅ Created ${routeFilePath}`));
                }

                const layoutPath = path.join(rootDir, "src", "app", `layout.${language === 'ts' ? 'tsx' : ('js')}`);

                if (!fs.existsSync(layoutPath)) {
                    console.log(chalk.red(`❌ layout.${language === 'ts' ? 'tsx' : ('js')} not found at ${layoutPath}`));
                    return;
                }

                const appBarPath = path.join(rootDir, "src", "components", `AppBar.${language === 'ts' ? 'tsx' : ('js')}`);
                const AppBarContent = appBarContent;
                fs.writeFileSync(appBarPath, AppBarContent);

                let content = fs.readFileSync(layoutPath, "utf-8");
                let changed = false;

                // 1️⃣ Add import for SessionProvider if missing
                if (!content.includes("SessionProvider")) {
                    const importSession = `import { SessionProvider } from "next-auth/react";\n`;
                    content = importSession + content;
                    changed = true;
                    console.log(chalk.green("✅ Added SessionProvider import"));
                }

                // 2️⃣ Add import for AppBar if missing
                if (!content.includes("AppBar")) {
                    const importAppbar = `import AppBar from "@/components/AppBar";\n`;
                    // Insert after other imports for cleanliness
                    content = importAppbar + content;
                    changed = true;
                    console.log(chalk.green("✅ Added AppBar import"));
                }

                // 3️⃣ Wrap children with <SessionProvider> if not present
                if (!content.includes("<SessionProvider")) {
                    // Very naive wrap — assumes a single <body> tag exists
                    content = content.replace(
                        /<body([^>]*)>/,
                        `<body$1>\n        <SessionProvider>\n          <AppBar />`
                    );
                    content = content.replace(
                        /{children}/,
                        `{children}\n          </SessionProvider>`
                    );
                    changed = true;
                    console.log(chalk.green("✅ Wrapped body with <SessionProvider> & <AppBar />"));
                }

                if (changed) {
                    fs.writeFileSync(layoutPath, content, "utf-8");
                    console.log(chalk.blue(`✍️  layout.${language === 'ts' ? 'tsx' : ('js')} updated successfully.`));
                } else {
                    console.log(chalk.yellow("ℹ️  SessionProvider and AppBar already present. No changes made."));
                }

                const HomePagePath = path.join(rootDir, "src", "app", `page.${language === 'ts' ? 'tsx' : ('js')}`);

                if (!fs.existsSync(HomePagePath)) {
                    console.log(chalk.red(`❌ layout.${language === 'ts' ? 'tsx' : ('js')} not found at ${HomePagePath}`));
                    return;
                }
                let homePageContent = fs.readFileSync(HomePagePath, "utf-8");
                let homePageChanged = false;

                if (!homePageContent.includes("useEffect") ||
                    !homePageContent.includes("signIn") ||
                    !homePageContent.includes("useSession")) {
                    const importauth = `"use client";\nimport { signIn, useSession } from "next-auth/react";\nimport { useEffect } from "react";\n`;
                    // Insert after other imports for cleanliness
                    homePageContent = homePageContent.replace(/"use client"/, importauth);
                    homePageChanged = true;
                    console.log(chalk.green("✅ Added useEFfect,signIn and useSession import"));
                }
                const sessionGuard = `const { data: session, status } = useSession();\nuseEffect(() => {\n\tif (status === "unauthenticated") {\n\tsignIn(); // or signIn("google"), or signIn(undefined, { callbackUrl: "/dashboard" })\n}\n}, [status]);\n\nif (status === "loading" || status === "unauthenticated") return <p>Loading...</p>;`;

                if (!homePageContent.includes("data: session")) {
                    homePageContent = homePageContent.replace(
                        /(export default function Home\(\)\s*{)/,
                        `$1\n${sessionGuard}`
                    );
                    homePageChanged = true;
                    console.log(chalk.green("✅ Injected session guard code inside Home()"));
                }

                if (homePageChanged) {
                    fs.writeFileSync(HomePagePath, homePageContent, "utf8");
                    console.log(chalk.green(`🎉 Updated ${HomePagePath}`));
                } else {
                    console.log(chalk.yellow("ℹ️  No changes needed – code already present"));
                }

                // --- Jsconfig.json ---
                if (language !== 'ts') {
                    const jsconfigPath = path.join(rootDir, "jsconfig.json");

                    if (!fs.existsSync(jsconfigPath)) {
                        console.error(chalk.red("❌ jsconfig.json not found."));
                    } else {
                        const raw = fs.readFileSync(jsconfigPath, "utf-8");
                        let config;

                        try {
                            config = JSON.parse(raw);
                        } catch (err) {
                            console.error(chalk.red("❌ Failed to parse jsconfig.json:"), err);
                            process.exit(1);
                        }

                        // Ensure nested objects exist
                        config.compilerOptions = config.compilerOptions || {};
                        config.compilerOptions.paths = config.compilerOptions.paths || {};

                        // Only add if missing
                        if (!config.compilerOptions.paths["auth"]) {
                            config.compilerOptions.paths["auth"] = ["./lib/actions/auth.js"];

                            // Pretty-print with 2-space indentation
                            fs.writeFileSync(jsconfigPath, JSON.stringify(config, null, 2));
                            console.log(chalk.green("✅ Added 'auth' path alias to jsconfig.json"));
                        } else {
                            console.log(chalk.yellow("ℹ️ 'auth' path alias already present, skipping."));
                        }
                    }
                }
                else {
                    const tsconfigPath = path.join(rootDir, "tsconfig.json");

                    if (!fs.existsSync(tsconfigPath)) {
                        console.error(chalk.red("❌ tsconfig.json not found."));
                    } else {
                        const raw = fs.readFileSync(tsconfigPath, "utf-8");
                        let config;

                        try {
                            config = JSON.parse(raw);
                        } catch (err) {
                            console.error(chalk.red("❌ Failed to parse tsconfig.json:"), err);
                            process.exit(1);
                        }

                        // Ensure nested objects exist
                        config.compilerOptions = config.compilerOptions || {};
                        config.compilerOptions.paths = config.compilerOptions.paths || {};

                        // Add alias if not present
                        if (!config.compilerOptions.paths["auth"]) {
                            config.compilerOptions.paths["auth"] = ["./lib/actions/auth.ts"];

                            fs.writeFileSync(tsconfigPath, JSON.stringify(config, null, 2));
                            console.log(chalk.green("✅ Added 'auth' path alias to tsconfig.json"));
                        } else {
                            console.log(chalk.yellow("ℹ️ 'auth' path alias already exists, skipping."));
                        }
                    }
                }

            } else {
                console.log(chalk.yellow('⚠️ src folder not found, skipping app/api creation.'));
            }

        } catch (error) {
            console.error(chalk.red("Error setting up Authjs for authentication"), error.message);
            console.log(chalk.yellow("You may need to finish authjs setup manually."));
        }
    } else {
        console.log(chalk.yellow(`⚠️ Auth.js setup for framework '${framework}' is not yet automated. Please refer to https://authjs.dev/ for manual setup instructions.`));
    }
    return;
}

export async function setupClerk(state) {
    const { framework, projectName, language, styling } = state;

    console.log(chalk.blue(`🔐 Setting up clerk for ${framework} project: ${projectName} \n📝 Language: ${language}`));
    const useTailwind = (styling === "tailwind");
    // Validate framework support
    if (!isFrameworkSupported(framework)) {
        console.log(chalk.red(`❌ Framework '${framework}' is not supported for Auth.js setup.`));
        console.log(chalk.yellow('Supported frameworks: next, svelte, vue, vite-react, astro, nuxt, react'));
        return;
    }
    if (framework === 'next') {
        try {
            const targetDir = path.resolve(projectName);
            const currentDir = process.cwd();

            if (currentDir !== targetDir) {
                if (fs.existsSync(targetDir)) {
                    process.chdir(targetDir);
                    console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
                } else {
                    console.error(chalk.red(`Directory "${projectName}" does not exist.`));
                    // Optional: process.exit(1);
                }
            }
            console.log(chalk.blue(`Installing clerk package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/nextjs"], { cwd: rootDir, stdio: "inherit" });

            console.log(chalk.green(`✅ clerk package installed successfully.`));
            console.log(chalk.blue(`Configuring Next.js project for Auth.js...`));

            [rootDir].forEach((dir) => {
                fs.mkdirSync(dir, { recursive: true });
            });

            const srcDir = path.join(rootDir, 'src');
            if (fs.existsSync(srcDir)) {
                const middlewareContent = clerkMiddlewareContent;
                const middlewareFilePath = path.join(srcDir, `middleware.${language === 'ts' ? 'ts' : 'js'}`);
                fs.writeFileSync(middlewareFilePath, middlewareContent);

                const filePath = path.join(srcDir, `app`, `page.${language === 'ts' ? 'tsx' : 'js'}`);
                let content = fs.readFileSync(filePath, "utf8");

                let changed = false;

                // ✅ Add the Clerk import if missing
                const clerkImportLine =
                    `import { RedirectToSignIn, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";\n`;

                if (!content.includes("from \"@clerk/nextjs\"")) {
                    if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                        const firstLineEnd = content.indexOf("\n") + 1;
                        content =
                            content.slice(0, firstLineEnd) + clerkImportLine + content.slice(firstLineEnd);
                    } else {
                        // if no "use client"
                        content = clerkImportLine + content;
                    }
                    changed = true;
                    console.log(chalk.green("✅ Added Clerk import line to app/page.js"));
                }

                // Existing SignedOut/SignedIn wrapper logic...
                if (!content.includes("<SignedOut>")) {
                    content = content.replace(
                        /\breturn\b\s*\(\s*(?:<>)?/,
                        `return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <header>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>
    `
                    );

                    content = content.replace(
                        /\)\s*;\s*(\n\s*\}?)?$/,
                        `      </SignedIn>\n</>\n);\n}`
                    );

                    changed = true;
                    console.log(chalk.green("✅ Wrapped return JSX with <SignedOut>/<SignedIn> block"));
                }

                if (changed) {
                    fs.writeFileSync(filePath, content, "utf8");
                }

                const layoutPath = path.join("src", "app", `layout.${language === 'ts' ? 'tsx' : 'js'}`);
                let layoutcontent = fs.readFileSync(layoutPath, "utf-8");
                let layoutchanged = false;

                // Add import if missing
                if (!layoutcontent.includes("ClerkProvider")) {
                    const importLine = `import { ClerkProvider } from "@clerk/nextjs";\n`;
                    // place after the last import
                    layoutcontent = layoutcontent.replace(/(import .*?;\n)(?!import)/s, match => match + importLine);
                    layoutchanged = true;
                }

                // Wrap {children} with <ClerkProvider>
                if (!layoutcontent.includes("<ClerkProvider>")) {
                    layoutcontent = layoutcontent.replace(
                        /{children}/,
                        `<ClerkProvider>\n          {children}\n          <Toaster />\n        </ClerkProvider>`
                    );
                    layoutchanged = true;
                }

                if (layoutchanged) fs.writeFileSync(layoutPath, layoutcontent, "utf-8");

            } else {
                console.log(chalk.yellow('⚠️ src folder not found, skipping app/api creation.'));
            }

            console.log(chalk.green.bold(`🎉✅ Clerk setup completed successfully! ✅🎉\nYour app is now configured with Clerk authentication.\nRemember to add your Publishable Key in the .env file:\nVITE_CLERK_PUBLISHABLE_KEY=your_key_here\n\nYou can now start your app and enjoy secure authentication! 🚀`));

        } catch (error) {
            console.error(chalk.red("Error setting up Clerk for authentication"), error.message);
            console.log(chalk.yellow("You may need to finish Clerk setup manually."));
        }
    } else if (framework === 'vite-react') {
        try {

            const targetDir = path.resolve(projectName);
            const currentDir = process.cwd();

            if (currentDir !== targetDir) {
                if (fs.existsSync(targetDir)) {
                    process.chdir(targetDir);
                    console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
                } else {
                    console.error(chalk.red(`Directory "${projectName}" does not exist.`));
                    // Optional: process.exit(1);
                }
            }
            const { publishableKey } = await inquirer.prompt([
                {
                    type: "input",
                    name: "publishableKey",
                    message: "Enter your VITE_CLERK_PUBLISHABLE_KEY : ",
                },
            ]);

            console.log(chalk.blue(`Installing clerk package...`));

            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/clerk-react"], { cwd: rootDir, stdio: "inherit" });

            console.log(chalk.blue(`Installing react-router-dom ....`));
            await execa("npm", ["install", "react-router-dom"], {
                cwd: rootDir, stdio: "inherit"
            });

            const srcDir = path.join(rootDir, "src");
            const componentsDir = path.join(srcDir, "components");
            if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
            if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir);

            const envFilePath = path.join(rootDir, ".env");
            fs.writeFileSync(envFilePath, `VITE_CLERK_PUBLISHABLE_KEY=${publishableKey}`);

            // Main.jsx/tsxx file setup
            const mainFilePath = path.join(srcDir, `main.${language === 'ts' ? 'tsx' : 'jsx'}`);
            const mainFilecontent=mainFileContent(language);
            fs.writeFileSync(mainFilePath, mainFilecontent);

            const appFilePath = path.join(srcDir, `App.${language === 'ts' ? 'tsx' : 'jsx'}`)
            fs.writeFileSync(appFilePath, appContent);

            const protectedRoutePath = path.join(srcDir, "components", `ProtectedRoute.${language === 'ts' ? 'tsx' : 'jsx'}`);
            const protectedRoutecontent=ProtectedRouteContent(language);
            fs.writeFileSync(protectedRoutePath, protectedRoutecontent)

            const homePagePath = path.join(srcDir, "components", `HomePage.${language === 'ts' ? 'tsx' : 'jsx'}`);
            const homePageContent = HomePageComponent(useTailwind);
            fs.writeFileSync(homePagePath, homePageContent);

            const signInPagePath = path.join(srcDir, "components", `SignInPage.${language === 'ts' ? 'tsx' : 'jsx'}`);
            const signInPageContent = SignInReactPage(useTailwind)
            fs.writeFileSync(signInPagePath, signInPageContent);

            const signUpPagePath = path.join(srcDir, "components", `SignUpPage.${language === 'ts' ? 'tsx' : 'jsx'}`);
            const signUpPageContent = SignUpReactPage(useTailwind);
            fs.writeFileSync(signUpPagePath, signUpPageContent)

            console.log(chalk.green.bold(`🎉✅ Clerk setup completed successfully! ✅🎉\nYour app is now configured with Clerk authentication.\nYou can now start your app and enjoy secure authentication! 🚀`));

        } catch (error) {
            console.error(chalk.red("Error setting up Clerk for authentication"), error.message);
            console.log(chalk.yellow("You may need to finish clerk setup manually."));
        }
    } else if (framework === 'astro') {
        try {
            const targetDir = path.resolve(projectName);
            const currentDir = process.cwd();
            const srcDir = path.join(currentDir, 'src');
            if (currentDir !== targetDir) {
                if (fs.existsSync(targetDir)) {
                    process.chdir(targetDir);
                    console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
                }
            }

            const { publishableKey } = await inquirer.prompt([
                {
                    type: "input",
                    name: "publishableKey",
                    message: "Enter your PUBLIC_CLERK_PUBLISHABLE_KEY :",
                },
            ]);
            const { secretkey } = await inquirer.prompt([
                {
                    type: "input",
                    name: "secretkey",
                    message: "Enter your CLERK_SECRET_KEY : "
                }
            ])
            console.log(chalk.blue(`Installing clerk package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/astro"], { cwd: rootDir, stdio: "inherit" });
            await execa("npm", ["install", "@astrojs/node"], { cwd: rootDir, stdio: "inherit" });

            const envFiles = [".env.local", ".env.example"];
            const clerkEnvVars = `PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}\nCLERK_SECRET_KEY=${secretkey}\n`.trim();

            for (const file of envFiles) {
                const envfilePath = path.resolve(file);
                try {
                    let envcontent = "";

                    // If file exists, read it; otherwise create a new one
                    if (fs.existsSync(envfilePath)) {
                        envcontent = fs.readFileSync(envfilePath, "utf-8");
                    }

                    // Prevent duplicate entries (idempotent)
                    if (!envcontent.includes("PUBLIC_CLERK_PUBLISHABLE_KEY")) {
                        envcontent += `\n\n${clerkEnvVars}`;
                        fs.writeFileSync(envfilePath, envcontent.trim() + "\n", "utf-8");
                        console.log(`✅ Clerk environment variables added to ${file}`);
                    } else {
                        console.log(`ℹ️  Clerk environment variables already exist in ${file}`);
                    }
                } catch (err) {
                    console.error(`❌ Error updating ${file}:`, err.message);
                }
            }

            const configfilePath = path.resolve("astro.config.mjs");

            try {
                let content = fs.readFileSync(configfilePath, "utf-8");

                // ✅ Add missing imports (only if not already present)
                const importsToAdd = [
                    `import node from '@astrojs/node';`,
                    `import clerk from '@clerk/astro';`,
                    `import tailwindcss from '@tailwindcss/vite';`,
                ];

                for (const imp of importsToAdd) {
                    if (!content.includes(imp)) {
                        content = content.replace(/(import .*from ['"]astro\/config['"];?)/, `$1\n${imp}`);
                    }
                }

                // ✅ Add clerk() in integrations if not already there
                content = content.replace(
                    /integrations:\s*\[([^\]]*)\]/,
                    (match, p1) => {
                        const integrations = p1.trim();
                        if (!integrations.includes("clerk()")) {
                            const updated = integrations
                                ? `${integrations.replace(/\s+$/, "")}, clerk()`
                                : "clerk()";
                            return `integrations: [${updated}]`;
                        }
                        return match; // already present
                    }
                );

                // ✅ Add adapter and output (before closing })
                if (!content.includes("adapter: node({ mode: 'standalone' })")) {
                    content = content.replace(
                        /export default defineConfig\(\{([\s\S]*?)\}\);?/,
                        (match, p1) => {
                            let updated = p1;
                            if (!updated.includes("adapter: node({ mode: 'standalone' })")) {
                                updated += `,\nadapter: node({ mode: 'standalone' }),`;
                            }
                            if (!updated.includes("output: 'server'")) {
                                updated += `\noutput: 'server',`;
                            }
                            return `export default defineConfig({${updated}\n});`;
                        }
                    );
                }

                // ✅ Ensure tailwindcss() exists in vite.plugins
                if (!content.match(/plugins:\s*\[.*tailwindcss\(\).*]/s)) {
                    content = content.replace(
                        /vite:\s*\{([\s\S]*?)\}/,
                        (match, p1) => {
                            if (p1.includes("plugins")) return match; // already exists
                            return `vite: {\n    plugins: [tailwindcss()],\n  }`;
                        }
                    );
                }

                fs.writeFileSync(configfilePath, content, "utf-8");
                console.log("✅ astro.config.mjs updated successfully!");
            } catch (err) {
                console.error("❌ Error updating astro.config.mjs:", err.message);
            }

            const homefilePath = path.join(srcDir, 'pages', "index.astro");; // Path to your file
            let homecontent = fs.readFileSync(homefilePath, "utf-8");

            // Clerk import statement
            const clerkImport = `import {\nSignedIn,SignedOut,UserButton,SignInButton,} from "@clerk/astro/components";\n\n`;

            // Add Clerk import at the top
            if (!homecontent.includes('@clerk/astro/components')) {
                if (homecontent.startsWith("---")) {
                    // File has Astro frontmatter
                    homecontent = homecontent.replace(/---\s*\n/, `---\n${clerkImport}`);
                } else {
                    // No frontmatter, just add at top
                    homecontent = clerkImport + homecontent;
                }
            }

            // Insert right after the <body> tag
            const updatedContent = homecontent.replace(
                /<body([^>]*)>/i,
                `<body$1>\n${clerkUI.trim()}`
            );

            // Write the updated content back to the file
            fs.writeFileSync(homefilePath, updatedContent, "utf-8");

            console.log("✅ Clerk UI added successfully to test.astro!");

            // Write middleware file
            const middlewareFile = path.join(srcDir, `middleware.${(language === "ts") ? `ts` : `js`}`);
            fs.writeFileSync(middlewareFile, AstromiddlewareContent.trim());

            console.log(chalk.green("✅ Middleware file created at:"), middlewareFile);

            const signinpageContent = SignInPage(useTailwind);
            const signuppageContent = SignUpPage(useTailwind);

            const signInPagePath = path.join(srcDir, "pages", "signin.astro");
            fs.writeFileSync(signInPagePath, signinpageContent);

            const signUpPagePath = path.join(srcDir, "pages", "signup.astro");
            fs.writeFileSync(signUpPagePath, signuppageContent);

        } catch (err) {
            console.error(chalk.red("✨ Error setting up Clerk for authentication"), err.message);
            console.log(chalk.yellow("You may need to finish clerk setup manually."));
        }

    } else if (framework === "nuxt") {
        try {
            console.log(chalk.blue(`Installing clerk package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/nuxt"], { cwd: rootDir, stdio: "inherit" });

            const { publishableKey } = await inquirer.prompt([
                {
                    type: "input",
                    name: "publishableKey",
                    message: "Enter your PUBLIC_CLERK_PUBLISHABLE_KEY :",
                },
            ]);

            const { secretkey } = await inquirer.prompt([
                {
                    type: "input",
                    name: "secretkey",
                    message: "Enter your CLERK_SECRET_KEY : "
                }
            ])

            const envFiles = [".env", ".env.example"];
            const clerkEnvVars = `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${publishableKey}\nNUXT_CLERK_SECRET_KEY=${secretkey}\n`.trim();

            for (const file of envFiles) {
                const envfilePath = path.resolve(file);
                try {
                    let envcontent = "";

                    // If file exists, read it; otherwise create a new one
                    if (fs.existsSync(envfilePath)) {
                        envcontent = fs.readFileSync(envfilePath, "utf-8");
                    }

                    // Prevent duplicate entries (idempotent)
                    if (!envcontent.includes("PUBLIC_CLERK_PUBLISHABLE_KEY")) {
                        envcontent += `\n\n${clerkEnvVars}`;
                        fs.writeFileSync(envfilePath, envcontent.trim() + "\n", "utf-8");
                        console.log(`✅ Clerk environment variables added to ${file}`);
                    } else {
                        console.log(`ℹ️  Clerk environment variables already exist in ${file}`);
                    }
                } catch (err) {
                    console.error(`❌ Error updating ${file}:`, err.message);
                }
            }

            const configPath = path.join(rootDir, "nuxt.config.ts");
            // Read the existing config file
            let config = fs.readFileSync(configPath, "utf-8");

            // Check if @clerk/nuxt is already added
            if (config.includes("'@clerk/nuxt'") || config.includes('"@clerk/nuxt"')) {
                console.log("✅ '@clerk/nuxt' is already present in modules.");
                return;
            }

            // Use regex to find the modules array and insert @clerk/nuxt before the closing bracket
            config = config.replace(
                /modules\s*:\s*\[([^\]]*)\]/,
                (match, inner) => {
                    // Trim and check for trailing commas
                    const cleanedInner = inner.trim();
                    return `modules: [${cleanedInner ? `${cleanedInner}, ` : ""}'@clerk/nuxt']`;
                }
            );

            // Write back the updated file
            fs.writeFileSync(configPath, config, "utf-8");

            console.log(chalk.blue("Creating sign-in and sign-up pages..."));

            const signIncontent = SignIn(useTailwind);
            const signinPagePath = path.join(rootDir, "app", "pages", "signin.vue");
            await fs.promises.mkdir(path.dirname(signinPagePath), { recursive: true });
            fs.writeFileSync(signinPagePath, signIncontent);

            const signUpcontent = SignUp(useTailwind);
            const signupPagePath = path.join(rootDir, "app", "pages", "signup.vue");
            await fs.promises.mkdir(path.dirname(signupPagePath), { recursive: true });
            fs.writeFileSync(signupPagePath, signUpcontent);

            const mwcontent = nuxtMiddlewareContent;
            const mwpath = path.join(rootDir, "app", "middleware", `auth.global.${language === "ts" ? 'ts' : 'js'}`);
            await fs.promises.mkdir(path.dirname(mwpath), { recursive: true });
            fs.writeFileSync(mwpath, mwcontent);

            const clerkImports = `
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nuxt/components";
`;

            // 2️⃣ Header HTML snippet
            const headerTemplate = `
<header class="absolute top-4 right-6 z-50">
  <SignedOut>
    <SignInButton class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" />
  </SignedOut>
  <SignedIn>
    <UserButton afterSignOutUrl="/signin"  />
  </SignedIn>
</header>
`;
            const homePagePath = path.join(rootDir, "app", "pages", "index.vue");
            // 3️⃣ Read existing page file
            let homecontent = fs.readFileSync(homePagePath, "utf8");
            // 1️⃣ Regex to detect <script setup> block (ts or js)
            const scriptSetupRegex = /<script\s+setup(?:\s+lang="(ts|js)")?\s*>([\s\S]*?)<\/script>/;

            // 2️⃣ The import line we want to add
            const clerkImportLine = `import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nuxt/components";`;

            // 3️⃣ Check if <script setup> exists
            if (scriptSetupRegex.test(homecontent)) {
                // Extract existing script content
                homecontent = homecontent.replace(scriptSetupRegex, (match, lang, innerContent) => {
                    // Avoid duplicate imports
                    if (!innerContent.includes("@clerk/nuxt/components")) {
                        innerContent = clerkImportLine + "\n" + innerContent.trim();
                        console.log(chalk.blue("✅ Clerk import added to existing <script setup>"));
                    } else {
                        console.log(chalk.green("ℹ️ Clerk import already present"));
                    }

                    // Reconstruct script setup block with original lang
                    return `<script setup${lang ? ` lang="${lang}"` : ""}>\n${innerContent}\n</script>`;
                });
            } else {
                // No <script setup> found — create one
                homecontent = `<script setup lang="ts">\n${clerkImportLine}\n</script>\n` + homecontent;
                console.log(chalk.yellow("⚠️ No <script setup> found — created new one with Clerk import"));
            }


            // 5️⃣ Insert header before closing </template> if template exists
            if (homecontent.includes("</template>")) {
                homecontent = homecontent.replace("</template>", `${headerTemplate}\n</template>`);
                console.log(chalk.green("✅ Header added to template"));
            } else {
                console.log(chalk.yellow("⚠️ No </template> found — adding header at end of file"));
                homecontent += `\n${headerTemplate}`;
            }

            // 6️⃣ Write back updated file
            fs.writeFileSync(homePagePath, homecontent, "utf8");

            console.log("🎉 Successfully added '@clerk/nuxt'");


        } catch (err) {
            console.error(chalk.red("✨ Error setting up Clerk for authentication"), err.message);
            console.log(chalk.yellow("You may need to finish clerk setup manually."));
        }
    } else {
        console.log(chalk.yellow(`⚠️ clerk setup for framework '${framework}' is not yet automated. Please refer to https://clerk.com/docs for manual setup instructions.`));
    }

}