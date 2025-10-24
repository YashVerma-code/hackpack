import fs from "fs";

import { writeFile, readFile } from "fs/promises";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import { createWelcomePageHTML } from "../utils/utility.js";

export async function setupDaisyUI(projectName, isTypescript, uilibrary) {
    console.log(chalk.blue("Setting up daisyui..."));
    const projectPath = process.cwd();

    try {
        await execa("npm", ["install", "daisyui@latest"], {
            stdio: "inherit",
            shell: true,
        });

        await execa("npx", ["nuxi", "module", "add", "nuxt-toast"], {
            stdio: "inherit",
            shell: true,
        })

        const stylesPath = path.join(projectPath, "assets", "css", "main.css");
        const daisyUiDirectives = `@import "tailwindcss";\n@plugin "daisyui";`.trim();

        await fs.promises.writeFile(stylesPath, daisyUiDirectives);

        console.log(chalk.greenBright("\n🎉 daisyui setup complete!."));

        console.log(chalk.blue("Creating a welcome page..."));
        const PageHTML = createWelcomePageHTML(true, isTypescript, uilibrary);
        const htmlPath = path.join(projectPath, "app", "pages", "index.vue");
        await fs.promises.mkdir(path.dirname(htmlPath), { recursive: true });
        await writeFile(htmlPath, PageHTML);

        const appPath = path.join(projectPath, "app", "app.vue");
        await fs.promises.mkdir(path.dirname(appPath), { recursive: true });
        await writeFile(appPath, `<template>\n\t<NuxtPage />\n</template>`);

        const middlewarePath=path.join(projectPath,"app","middleware",`auth.global.${isTypescript==="ts"?'ts':'js'}`);
        await fs.promises.mkdir(path.dirname(middlewarePath), { recursive: true });
        await writeFile(middlewarePath,`export default defineNuxtRouteMiddleware((to) => {\n\tif (to.path === '/') {\n\treturn navigateTo('/home')\n}\n});`)


        console.log(chalk.greenBright("\n🎉 Welcome page created!."));
    } catch (error) {
        console.error(chalk.red("Error setting up daisyui:"), error.message);
        console.log(
            chalk.yellow(
                "You may need to set up daisyui manually after project creation."
            )
        );
    }
}