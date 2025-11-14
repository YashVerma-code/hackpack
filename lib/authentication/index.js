import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";
import { setupVueClerk } from './utils/clerkvue.js';
import { setupSvelteClerk } from './utils/clerksvelte.js';
import { setupAuth0Angular } from './utils/auth0angular.js';
import { appBarContent, authFileContent, isFrameworkSupported, middlewareContent,  } from "./utils/utility.js";
import { setupNextClerk } from "./utils/clerknext.js";
import { setupViteReactClerk } from "./utils/clerkreact.js";
import { setupClerkAstro } from "./utils/clerkastro.js";
import { setupClerkNuxt } from "./utils/clerknuxt.js";

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
        console.log(chalk.red(`Framework '${framework}' is not supported for Auth.js setup.`));
        console.log(chalk.yellow('Supported frameworks: next, svelte, vue, vite-react, astro, nuxt, react'));
        return;
    }
    if (framework === 'next') {
        await setupNextClerk(framework, projectName, language, styling,useTailwind);
        return;
    } else if (framework === 'vue') {
        // Delegate Vue-specific Clerk setup to helper
        await setupVueClerk(state);
        return;

    } else if (framework === 'svelte') {
        await setupSvelteClerk(state);
        return;

    } else if (framework === 'vite-react') {
        await setupViteReactClerk(framework, projectName, language, styling,useTailwind, state.uiLibrary);
        return;
    } else if (framework === 'astro') {
        await setupClerkAstro(state);
        return;
    } else if (framework === "nuxt") {
        await setupClerkNuxt(state);
        return;
    } else {
        console.log(chalk.yellow(`clerk setup for framework '${framework}' is not yet automated. Please refer to https://clerk.com/docs for manual setup instructions.`));
    }

}

export async function setupAuth0(state) {
    const { framework, projectName, language } = state;

    console.log(chalk.blue(`Setting up Auth0 for ${framework} project: ${projectName} \n📝 Language: ${language}`));

    // Validate framework support
    if (!isFrameworkSupported(framework)) {
        console.log(chalk.red(`Framework '${framework}' is not supported for Auth.js setup.`));
        console.log(chalk.yellow('Supported frameworks: next, svelte, vue, vite-react, astro, nuxt'));
        return;
    }
    if (framework === 'angular') {
        await setupAuth0Angular(state);
        return;
    } else {
        console.log(chalk.yellow(`⚠️ Auth0 setup for framework '${framework}' is not yet automated. Please refer to https://auth0.com/docs/quickstart/spa/angular for manual setup instructions.`));
    }
}