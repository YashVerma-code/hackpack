import { Logger } from "../../../core/Logger.js";
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { getTemplatePath } from "../../../lib/templatePath.util.js";
import { BaseUILibrary } from "../../../ui/BaseUILibrary.js";

export class DaisyUIAngular extends BaseUILibrary {
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
            await execa("npm", ["install", "daisyui@latest"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            });

            const stylesPath = path.join(this.projectPath, "src", "styles.css");
            const daisyUiDirectives = `@import "tailwindcss";\n@plugin "daisyui";`.trim();

            await fs.writeFile(stylesPath, daisyUiDirectives);

            await execa("npm", ["install", "ngx-sonner"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            })
            Logger.info("Creating a welcome page...");

            const appTsSrc = getTemplatePath(
                "angular",
                "base",
                "app.ts"
            );
            const appTsDes = path.join(
                this.projectPath,
                "src/app/app.ts"
            );
            await fs.copyFile(appTsSrc, appTsDes);

            const templatePath = getTemplatePath(
                "angular",
                "ui",
                "tailwindcss",
                "daisyui",
                "app.daisyui.html"
            );
            const destPath = path.join(
                this.projectPath,
                "src/app/app.html"
            );

            await fs.copyFile(templatePath, destPath);
            Logger.success("\n🎉 daisyui setup completed!.");

        } catch (error) {
            Logger.error(`Error setting up daisyui: ${error.message}`);
            Logger.warn("You may need to set up daisyui manually after project creation.");
        }
    }
}