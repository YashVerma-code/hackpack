import { execa } from "execa";
import { Logger } from "../../../core/Logger.js";
import { getTemplatePath } from "../../../lib/templatePath.util.js";
import { BaseUILibrary } from "../../../ui/BaseUILibrary.js";
import fs from "fs/promises";
import path from "path";

export class PrimeNGAngular extends BaseUILibrary {
    static id = 'primengui';
    static displayName = 'primeng';
    static requiresTailwind = true;


    constructor({ projectName, projectPath, language = 'ts' }) {
        super();
        this.projectName = projectName;
        this.projectPath = projectPath;
        this.language = language;
    }


    async setup() {
        Logger.info("Setting up primeng...");

        try {
            await execa("npm", ["install", "primeng", "@primeng/themes", "--force"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            })

            await execa("npm", ["install", "ngx-sonner", "--force"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            })

            const appConfigTsSrc = getTemplatePath(
                "angular",
                "ui",
                "tailwindcss",
                "primeng",
                "app.config.ts"
            );
            const appConfigTsDes = path.join(
                this.projectPath,
                "src/app/app.config.ts"
            );
            await fs.copyFile(appConfigTsSrc, appConfigTsDes);

            Logger.info("\nCreating a welcome page...");

            const appTsSrc = getTemplatePath(
                "angular",
                "ui",
                "tailwindcss",
                "primeng",
                "app.primeng.html"
            );
            const appTsDes = path.join(
                this.projectPath,
                "src/app/app.html"
            );

            await fs.copyFile(appTsSrc, appTsDes);

            const appCssSrc = getTemplatePath(
                "angular",
                "ui",
                "tailwindcss",
                "app.twonly.css"
            );
            const appCssDes = path.join(
                this.projectPath,
                "src/app/app.css"
            );

            await fs.copyFile(appCssSrc, appCssDes);
            Logger.success(`\n🎉primeng setup is completed `);

        } catch (error) {
            Logger.error(`Error setting up primeng: ${error.message}`);
            Logger.warn("You may need to set up primeng manually after project creation.");
        }
    }
};