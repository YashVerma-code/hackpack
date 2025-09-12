import path from "node:path";
import { writeFile } from "fs/promises";
import chalk from "chalk";
import fs from "fs";
import { createWelcomePageHTML, CSScontent } from "../utils/utility.js";
export async function setupDefault(projectName, useTailwind) {
    const projectPath = process.cwd();
    try {
        console.log(chalk.blue("Setting up daisyui..."));
        const nuxtConfigPath = path.join(process.cwd(), "nuxt.config.ts");
        let nuxtConfig = fs.readFileSync(nuxtConfigPath, "utf8");

        nuxtConfig = nuxtConfig.replace(
            /defineNuxtConfig\(\{\n/,
            `defineNuxtConfig({
                css: ["../assets/css/main.css"],
                  `.trim()
        );
        // Write the updated config back
        fs.writeFileSync(nuxtConfigPath, nuxtConfig, "utf8");

        const cssDir = path.join(projectPath, "assets", "css");
        const cssFilePath = path.join(cssDir, "main.css");

        // Make sure directory exists
        fs.mkdirSync(cssDir, { recursive: true });

        const cssContent = CSScontent();
        // Write the file (overwrites if exists)
        fs.writeFileSync(cssFilePath, cssContent);

        const PageHTML = createWelcomePageHTML(useTailwind);
        const htmlPath = path.join(projectPath, "app", "app.vue");
        await writeFile(htmlPath, PageHTML);

        console.log(chalk.greenBright("\n🎉 Welcome page created!."));
    } catch (error) {
        console.error(chalk.red("Error creating Welcome Page:"), error.message);
    }

}