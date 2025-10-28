import { newStyles, nextMiddleware, nextsignInCss, nextSignInPage, nextsignUpCss, nextSignUpPage } from "./utility.js";
import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";

export async function setupNextClerk(framework, projectName, language, styling,useTailwind) {
        try {
            const targetDir = path.resolve(projectName);
            const currentDir = process.cwd();
            if (currentDir !== targetDir) {
                if (fs.existsSync(targetDir)) {
                    process.chdir(targetDir);
                    console.log(chalk.blue(`Changed working directory to project: ${projectName}`));
                } else {
                    console.error(chalk.red(`Directory "${projectName}" does not exist.`));
                }
            }
            console.log(chalk.blue(`Installing clerk package...`));
            const rootDir = path.resolve(process.cwd());
            await execa("npm", ["install", "@clerk/nextjs"], { cwd: rootDir, stdio: "inherit" });

            console.log(chalk.green(`clerk package installed successfully.`));
            console.log(chalk.blue(`Configuring Next.js project for Auth.js...`));

            [rootDir].forEach((dir) => {
                fs.mkdirSync(dir, { recursive: true });
            });

            const srcDir = path.join(rootDir, 'src');
            if (fs.existsSync(srcDir)) {
                const srcDir = path.join(rootDir, "src");
                const appDir = path.join(srcDir, "app");
                if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir);
                if (!fs.existsSync(appDir)) fs.mkdirSync(appDir);


                // Sign-In page setup
                const signInDir = path.join(appDir, "sign-in", "[[...sign-in]]");
                fs.mkdirSync(signInDir, { recursive: true });

                const signinPagePath = path.join(signInDir, `page.${language === 'ts' ? 'tsx' : 'jsx'}`);
                const signincontent = nextSignInPage(useTailwind);
                fs.writeFileSync(signinPagePath, signincontent);
                if (!useTailwind) {
                    const signinCssPath = path.join(signInDir, "signin.css");
                    const signinCssContent = nextsignInCss;
                    fs.writeFileSync(signinCssPath, signinCssContent);
                }

                // Sign-Up page setup
                const signUpDir = path.join(appDir, "sign-up", "[[...sign-up]]");
                fs.mkdirSync(signUpDir, { recursive: true });

                const signupPagePath = path.join(signUpDir, `page.${language === 'ts' ? 'tsx' : 'jsx'}`);
                const signupcontent = nextSignUpPage(useTailwind);
                fs.writeFileSync(signupPagePath, signupcontent);
                if (!useTailwind) {
                    const signupCssPath = path.join(signInDir, "signin.css");
                    const signupCssContent = nextsignUpCss;
                    fs.writeFileSync(signupCssPath, signupCssContent);
                }

                const middlewareContent = nextMiddleware;
                const middlewareFilePath = path.join(srcDir, `middleware.${language === 'ts' ? 'ts' : 'js'}`);
                fs.writeFileSync(middlewareFilePath, middlewareContent);

                const envPath = path.join(rootDir, ".env.local");

                // Content you want to ensure exists
                const newEnvContent = `
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
`;

                // Read existing content if file exists
                let existing = "";
                if (fs.existsSync(envPath)) {
                    existing = fs.readFileSync(envPath, "utf-8");
                }

                // Filter out only new lines that don't already exist
                const linesToAdd = newEnvContent
                    .trim()
                    .split("\n")
                    .filter(line => line && !existing.includes(line))
                    .join("\n");

                // Append only new lines
                if (linesToAdd) {
                    fs.appendFileSync(envPath, `\n${linesToAdd}\n`, "utf-8");
                    console.log("✅ Added missing env variables to .env.local successfully!");
                } else {
                    console.log("ℹ️ All Clerk environment variables already exist in .env.local.");
                }
                const filePath = path.join(srcDir, `app`, `page.${language === 'ts' ? 'tsx' : 'js'}`);
                let content = fs.readFileSync(filePath, "utf8");

                let changed = false;

                // Add the Clerk import if missing
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
                    console.log(chalk.green("Added Clerk import line to app/page.js"));
                }

                // Existing SignedOut/SignedIn wrapper logic...
                if (!content.includes("<SignedOut>")) {
                    content = content.replace(
                        /\breturn\b\s*\(\s*(?:<>)?/, (useTailwind ? `return (
                        <>
                        <div className="absolute top-4 right-6 z-50">
                            <SignedIn>
                            <UserButton />
                            </SignedIn>
                            <SignedOut>
                            <SignInButton>
                                <button className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
                                Sign In
                                </button>
                            </SignInButton>
                            </SignedOut>
                        </div>`: `return (
                        <>\n<div className="user-auth-container">
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                            <SignedOut>
                                <SignInButton>
                                <button className="sign-in-btn">Sign In</button>
                                </SignInButton>
                            </SignedOut>
                            </div>
                            `)
                    );
                    if (!useTailwind) {
                        const globalsPath = path.join(appDir, "globals.css");
                        const globalPath = path.join(appDir, "global.css");
                        const styleClerkUi = newStyles.trimStart();

                        // pick whichever file exists, otherwise create globals.css
                        let targetPath = globalsPath;
                        if (!fs.existsSync(globalsPath) && fs.existsSync(globalPath)) {
                            targetPath = globalPath;
                        }

                        let existingCss = "";
                        if (fs.existsSync(targetPath)) {
                            existingCss = fs.readFileSync(targetPath, "utf-8");
                        }

                        if (!existingCss.includes(styleClerkUi)) {
                            fs.appendFileSync(targetPath, `\n${styleClerkUi}\n`, "utf-8");
                            console.log(`✅ Added user auth button styles to ${path.basename(targetPath)} successfully!`);
                        } else {
                            console.log(`ℹ️ User auth button styles already exist in ${path.basename(targetPath)}, skipped adding again.`);
                        }
                    }

                    changed = true;
                    console.log(chalk.green("Wrapped return JSX with <SignedOut>/<SignedIn> block"));
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
                console.log(chalk.yellow('src folder not found, skipping app/api creation.'));
            }

            console.log(chalk.green.bold(`Clerk setup completed successfully!\nYour app is now configured with Clerk authentication.\nRemember to add your Publishable Key in the .env file:\nVITE_CLERK_PUBLISHABLE_KEY=your_key_here\n\nYou can now start your app and enjoy secure authentication! 🚀`));
            console.log(chalk.yellow(
                "🛠️ First-time setup:\n" +
                "1. Sign in to your Clerk dashboard.\n" +
                "2. Create a new application.\n" +
                "3. Copy your 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY' and 'CLERK_SECRET_KEY' into your .env.local file."
            ));

        } catch (error) {
            console.error(chalk.red("Error setting up Clerk for authentication"), error.message);
            console.log(chalk.yellow("You may need to finish Clerk setup manually."));
        }
    
}