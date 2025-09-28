import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";
import { appBarContent, authFileContent, clerkMiddlewareContent, isFrameworkSupported, middlewareContent } from "./utils/utility.js";


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
    const { framework, projectName, language } = state;

    console.log(chalk.blue(`🔐 Setting up clerk for ${framework} project: ${projectName} \n📝 Language: ${language}`));

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
            console.log(chalk.blue(`Installing clerk package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/clerk-react"], { cwd: rootDir, stdio: "inherit" });

            const envFilePath = path.join(rootDir, ".env");
            fs.writeFileSync(envFilePath, `VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key`);

            // Main.jsx/tsxx file setup
            const mainFilePath = path.join(rootDir, "src", `main.${language === 'ts' ? 'tsx' : 'jsx'}`);
            let content = fs.readFileSync(mainFilePath, "utf-8");

            let changed = false;

            // 1 Add the Clerk import if missing
            const clerkImport = `import { ClerkProvider } from '@clerk/clerk-react';\n`;
            if (!content.includes("@clerk/clerk-react")) {
                content = clerkImport + content;
                changed = true;
                console.log(chalk.green("✅ Added ClerkProvider import"));
            }

            // 2️ Add the PUBLISHABLE_KEY if missing
            const publishableKeySnippet = `const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY\n\nif (!PUBLISHABLE_KEY) {\n  throw new Error('Add your Clerk Publishable Key to the .env file')\n}\n\n`;
            if (!content.includes("VITE_CLERK_PUBLISHABLE_KEY")) {
                content = content.replace(/(import .*?;\n)(?!import)/s, match => match + publishableKeySnippet);
                changed = true;
                console.log(chalk.green("✅ Added PUBLISHABLE_KEY snippet"));
            }

            // 3️ Wrap <App /> with <ClerkProvider>
            const appRenderRegex = /<App\s*\/>/;
            if (appRenderRegex.test(content)) {
                content = content.replace(
                    appRenderRegex,
                    `<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>`
                );
                changed = true;
                console.log(chalk.green("✅ Wrapped <App /> with <ClerkProvider>"));
            }

            // 4️ Save changes
            if (changed) {
                fs.writeFileSync(mainFilePath, content, "utf-8");
                console.log(chalk.blue(`✍️  main.tsx updated successfully.`));
            } else {
                console.log(chalk.yellow("ℹ️  No changes made. Clerk already configured."));
            }

            // App.jsx/tsx setup 
            const appfilePath = path.join(rootDir, 'src', `App.${language === 'ts' ? 'tsx' : 'jsx'}`);
            let Appcontent = fs.readFileSync(appfilePath, "utf8");

            let Appchanged = false;

            // ✅ Add the Clerk import if missing
            const clerkImportLine =
                `import { RedirectToSignIn, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';\n`;

            if (!Appcontent.includes("from \"@clerk/clerk-react\"")) {
                if (Appcontent.startsWith('"use client"') || Appcontent.startsWith("'use client'")) {
                    const firstLineEnd = Appcontent.indexOf("\n") + 1;
                    Appcontent =
                        Appcontent.slice(0, firstLineEnd) + clerkImportLine + Appcontent.slice(firstLineEnd);
                } else {
                    // if no "use client"
                    Appcontent = clerkImportLine + Appcontent;
                }
                Appchanged = true;
                console.log(chalk.green("✅ Added Clerk import line to app/page.js"));
            }

            // Existing SignedOut/SignedIn wrapper logic...
            if (!Appcontent.includes("<SignedOut>")) {
                Appcontent = Appcontent.replace(
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

                Appcontent = Appcontent.replace(
                    /\)\s*;\s*(\n\s*\}?)?$/,
                    `      </SignedIn>\n</>\n);\n}`
                );

                Appchanged = true;
                console.log(chalk.green("✅ Wrapped return JSX with <SignedOut>/<SignedIn> block"));
            }

            if (Appchanged) {
                fs.writeFileSync(filePath, Appcontent, "utf8");
            }

            console.log(chalk.green.bold(`🎉✅ Clerk setup completed successfully! ✅🎉\nYour app is now configured with Clerk authentication.\nRemember to add your Publishable Key in the .env file:\nVITE_CLERK_PUBLISHABLE_KEY=your_key_here\n\nYou can now start your app and enjoy secure authentication! 🚀`));

        } catch (error) {
            console.error(chalk.red("Error setting up Clerk for authentication"), error.message);
            console.log(chalk.yellow("You may need to finish clerk setup manually."));
        }
    } else if (framework === 'astro') {

    } else {
        console.log(chalk.yellow(`⚠️ clerk setup for framework '${framework}' is not yet automated. Please refer to https://clerk.com/docs for manual setup instructions.`));
    }

}