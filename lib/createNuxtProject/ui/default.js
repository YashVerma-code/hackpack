import path from "node:path";
import { writeFile } from "fs/promises";
import chalk from "chalk";
import fs from "fs";
import { createWelcomePageHTML, CSScontent } from "../utils/utility.js";
import { execa } from "execa";
export async function setupDefault(projectName, useTailwind, language) {
    const projectPath = process.cwd();
    try {
        console.log(chalk.blue("Creating Welcome page..."));
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

        console.log(chalk.blue("Installing nuxt-toast...."));
        await execa("npx", ["nuxi", "module", "add", "nuxt-toast@1.4.0"], {
            stdio: "inherit",
            shell: true,
        })

        const cssDir = path.join(projectPath, "assets", "css");
        const cssFilePath = path.join(cssDir, "main.css");

        // Make sure directory exists
        fs.mkdirSync(cssDir, { recursive: true });

        const cssContent = CSScontent();
        // Write the file (overwrites if exists)
        fs.writeFileSync(cssFilePath, cssContent);

        const PageHTML = createWelcomePageHTML(useTailwind);
        const htmlPath = path.join(projectPath, "app", "pages", "index.vue");
        await fs.promises.mkdir(path.dirname(htmlPath), { recursive: true });
        await writeFile(htmlPath, PageHTML);

        const appPath = path.join(projectPath, "app", "app.vue");
        await fs.promises.mkdir(path.dirname(appPath), { recursive: true });
        await writeFile(appPath, `<template>\n\t<NuxtPage />\n</template>`);

        const middlewarePath = path.join(projectPath, "app", "middleware", `auth.global.${language === "ts" ? 'ts' : 'js'}`);
        await fs.promises.mkdir(path.dirname(middlewarePath), { recursive: true });
        await writeFile(middlewarePath, `export default defineNuxtRouteMiddleware((to) => {\n\tif (to.path === '/') {\n\treturn navigateTo('/home')\n}\n});`)

        console.log(chalk.greenBright("\n🎉 Welcome page created!."));
    } catch (error) {
        console.error(chalk.red("Error creating Welcome Page:"), error.message);
    }

}