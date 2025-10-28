import { nuxtMiddlewareContent, SignIn, SignUp } from "./utility.js";
import chalk from "chalk";
import fs from "fs";
import { execa } from "execa";
import path from "path";

import inquirer from 'inquirer';

export async function setupClerkNuxt(framework, projectName, language, styling,useTailwind) {
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
    
}