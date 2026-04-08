import { Logger } from "../../../core/Logger.js";
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { getTemplatePath } from "../../../lib/templatePath.util.js";
import { BaseUILibrary } from "../../../ui/BaseUILibrary.js";

export class DaisyUIAstro extends BaseUILibrary {
    static id = 'daisyui';
    static displayName = 'daisyUI';
    static requiresTailwind = true;


    constructor({ projectName, projectPath, language = 'ts' }) {
        super();
        this.projectName = projectName;
        this.projectPath = projectPath;
        this.language = language;
    }


    async setup() {
        Logger.info("Setting up daisyui...");

        try {
            const projectPath = this.projectPath;
            const isTS = this.language === "ts";
            const langFolder = isTS ? "ts" : "js";

            await execa("npm", ["install", "daisyui"], {
                stdio: "inherit",
                cwd: projectPath
            });

            await execa("npm", ["install", "react", "react-dom", "sonner"], {
                stdio: "inherit",
                cwd: projectPath
            });

            await execa("npx", ["astro", "add", "react"], {
                stdio: "inherit",
                cwd: projectPath
            });

            const stylesPath = path.join(projectPath, "src", "styles", "global.css");

            await fs.writeFile(
                stylesPath,
                `@import "tailwindcss";\n@plugin "daisyui";`
            );

            Logger.info("Creating a welcome page...");

            const toastComponentSrc = getTemplatePath(
                "astro",
                "ui",
                "tailwindcss",
                "daisyui",
                langFolder,
                "base",
                `ToastDemo.${isTS ? "tsx" : "jsx"}`
            );

            const toastComponentDes = path.join(
                projectPath,
                `src/components/ToastDemo.${isTS ? "tsx" : "jsx"}`
            );

            await fs.copyFile(toastComponentSrc, toastComponentDes);

            const welcomePageSrc = getTemplatePath(
                "astro",
                "ui",
                "tailwindcss",
                "base",
                "Welcome.astro"
            );

            const welcomePageDes = path.join(
                projectPath,
                "src/pages/index.astro"
            );

            await fs.copyFile(welcomePageSrc, welcomePageDes);

            const defaultWelcomePagePath = path.join(
                projectPath,
                "src",
                "components",
                "Welcome.astro"
            );

            try {
                await fs.unlink(defaultWelcomePagePath);
            } catch {
                // ignore if file doesn't exist
            }

            Logger.success("daisyui setup completed!");

        } catch (error) {
            Logger.error(`Error setting up daisyui: ${error.message}`);
            throw error;
        }
    }
}