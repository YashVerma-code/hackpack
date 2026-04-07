import { Logger } from "../../../core/Logger.js";
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { getTemplatePath } from "../../../lib/templatePath.util.js";
import { BaseUILibrary } from "../../../ui/BaseUILibrary.js";

export class MaterialUIAngular extends BaseUILibrary {
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
        Logger.info("Setting up MaterialUI ...");

        try {
            await execa("ng", ["add", "@angular/material"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            });

            await execa("npm", ["install", "ngx-sonner"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            })
            Logger.info("Creating a welcome page...");

            const appTsSrc = getTemplatePath(
                "angular",
                "ui",
                "materialui",
                "app.materialui.ts"
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
                "materialui",
                "app.materialui.html"
            );
            const destPath = path.join(
                this.projectPath,
                "src/app/app.html"
            );

            await fs.copyFile(templatePath, destPath);
            Logger.success("\n🎉 Materialui setup complete!.");

        } catch (error) {
            Logger.error(`Error setting up daisyui: ${error.message}`);
            Logger.warn("You may need to set up daisyui manually after project creation.");
        }
    }
}