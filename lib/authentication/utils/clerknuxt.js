import { clerkUserController, clerkUserModel, clerkWebhookRoute, nuxtMiddlewareContent, SignIn, SignUp } from "./utility.js";
import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";

import inquirer from 'inquirer';

export async function setupClerkNuxt(state) {
    try {
        const { framework, projectName, language, styling, uiLibrary, database } = state
        const useTailwind = (styling === "tailwind");
        console.log(chalk.blue(`Installing clerk package...`));
        const rootDir = path.resolve(process.cwd());
        await execa("npm", ["install", "@clerk/nuxt"], { cwd: rootDir, stdio: "inherit" });


        const envFiles = [".env", ".env.example"];
        const clerkEnvVars = `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\nNUXT_CLERK_SECRET_KEY=\n`.trim();

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
                    console.log(`Clerk environment variables added to ${file}`);
                } else {
                    console.log(`Clerk environment variables already exist in ${file}`);
                }
            } catch (err) {
                console.error(`Error updating ${file}:`, err.message);
            }
        }

        const configPath = path.join(rootDir, "nuxt.config.ts");
        // Read the existing config file
        let config = fs.readFileSync(configPath, "utf-8");

        // Check if @clerk/nuxt is already added
        if (config.includes("'@clerk/nuxt'") || config.includes('"@clerk/nuxt"')) {
            console.log("'@clerk/nuxt' is already present in modules.");
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
                    console.log(chalk.blue(" Clerk import added to existing <script setup>"));
                } else {
                    console.log(chalk.green(" Clerk import already present"));
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
            console.log(chalk.green("Header added to template"));
        } else {
            console.log(chalk.yellow("No </template> found — adding header at end of file"));
            homecontent += `\n${headerTemplate}`;
        }

        // 6️⃣ Write back updated file
        fs.writeFileSync(homePagePath, homecontent, "utf8");

       if (database === "mongodb") {
            console.log(chalk.yellow("Setting up Syncing clerk data with database...."));
            const clerkSecretVars = "CLERK_WEBHOOK_SIGNING_SECRET=";
            for (const file of envFiles) {
                const envfilePath = path.resolve(file);
                try {
                    let envcontent = "";

                    // If file exists, read it; otherwise create a new one
                    if (fs.existsSync(envfilePath)) {
                        envcontent = fs.readFileSync(envfilePath, "utf-8");
                    }

                    // Prevent duplicate entries (idempotent)
                    if (!envcontent.includes("CLERK_WEBHOOK_SIGNING_SECRET")) {
                        envcontent += `\n\n${clerkSecretVars}`;
                        fs.writeFileSync(envfilePath, envcontent.trim() + "\n", "utf-8");
                        console.log(` Clerk environment variables added to ${file}`);
                    } else {
                        console.log(`Clerk environment variables already exist in ${file}`);
                    }
                } catch (err) {
                    console.error(` Error updating ${file}:`, err.message);
                }


                const webhookDir = path.join(srcDir, "pages", "api", "webhook");
                fs.mkdirSync(webhookDir, { recursive: true }); // ✅ creates folder if missing

                const webhookPath = path.join(webhookDir, `clerk.${language === "ts" ? "ts" : "js"}`);
                const webhookContent = clerkWebhookRoute(framework, language);
                fs.writeFileSync(webhookPath, webhookContent);

                const userModelDir = path.join(srcDir, "lib", "database", "models");
                fs.mkdirSync(userModelDir, { recursive: true }); // ✅ ensure folder exists
                const userModelPath = path.join(userModelDir, `user.model.${language === "ts" ? "ts" : "js"}`);
                const clerkModelContent = clerkUserModel(language);
                fs.writeFileSync(userModelPath, clerkModelContent);

                const actionDir = path.join(srcDir, "lib", "actions");
                fs.mkdirSync(actionDir, { recursive: true }); // ✅ ensure folder exists
                const actionControllerPath = path.join(actionDir, `user.action.${language === "ts" ? "ts" : "js"}`);
                const actionControllerContent = clerkUserController(framework, language);
                fs.writeFileSync(actionControllerPath, actionControllerContent);
                
                console.log(chalk.green("Successfully setup syncing data setup for clerk data with database!"));
            }
        }


        console.log(chalk.green("🎉 Successfully added '@clerk/nuxt'"));
        console.log(chalk.yellow('Update your NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NUXT_CLERK_SECRET_KEY in .env.local'));
        console.log(chalk.yellow('Get your api by accessing official page of clerk.'));


    } catch (err) {
        console.error(chalk.red("✨ Error setting up Clerk for authentication"), err.message);
        console.log(chalk.yellow("You may need to finish clerk setup manually."));
    }

}