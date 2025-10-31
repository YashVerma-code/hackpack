import { AstromiddlewareContent, clerkUI, SignInPage, SignUpPage } from "./utility.js";
import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";
import inquirer from 'inquirer';

export async function setupClerkAstro(framework, projectName, language, styling, useTailwind) {
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

        console.log(chalk.blue(`Installing clerk package...`));
        const rootDir = path.resolve(process.cwd());
        await execa("npm", ["install", "@clerk/astro"], { cwd: rootDir, stdio: "inherit" });
        await execa("npm", ["install", "@astrojs/node"], { cwd: rootDir, stdio: "inherit" });

        const envFiles = [".env.local", ".env.example"];
        const clerkEnvVars = `PUBLIC_CLERK_PUBLISHABLE_KEY=\nCLERK_SECRET_KEY=\n`.trim();

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
                `${useTailwind ? `import tailwindcss from '@tailwindcss/vite';` : ``}`,
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
            if (useTailwind) {
                if (!content.match(/plugins:\s*\[.*tailwindcss\(\).*]/s)) {
                    content = content.replace(
                        /vite:\s*\{([\s\S]*?)\}/,
                        (match, p1) => {
                            if (p1.includes("plugins")) return match; // already exists
                            return `vite: {\n    plugins: [tailwindcss()],\n  }`;
                        }
                    );
                }
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


        console.log(chalk.green.bold('\n🎉 Astro Clerk setup completed!'));
        console.log(chalk.yellow('Update your PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local'));
        console.log(chalk.yellow('Get your api by accessing official page of clerk.'));

    } catch (err) {
        console.error(chalk.red("✨ Error setting up Clerk for authentication"), err.message);
        console.log(chalk.yellow("You may need to finish clerk setup manually."));
    }

}