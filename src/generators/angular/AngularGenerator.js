import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../../core/Logger.js';
import { DaisyUIAngular } from './ui/daisyui.angular.js';
import { TailwindOnlyAngular } from './ui/tailwindonly.next.js';
import { PlainCSSAngular } from './ui/plaincss.angular.js';
import { PrimeNGAngular } from './ui/primeng.angular.js';
import { MaterialUIAngular } from './ui/materialui.angular.js';

export class AngularGenerator {
    static #UI_REGISTRY = new Map([
        ['daisyui', DaisyUIAngular],
        ['primeng',PrimeNGAngular],
        ['angular-material',MaterialUIAngular],
        ['tailwind-only', TailwindOnlyAngular],
        ['twonly', TailwindOnlyAngular],
        ['tailwindonly', TailwindOnlyAngular],
        ['plain', PlainCSSAngular],
        ['plaincss', PlainCSSAngular],
        ['none', PlainCSSAngular],
    ]);

    constructor({ projectName, language = 'ts', styling = 'tailwind', uiLibrary = null }) {
        this.projectName = projectName;
        this.language = language;
        this.styling = styling;
        this.uiLibrary = uiLibrary;
        this.projectPath = path.resolve(projectName); 
    }

    async create() {
        await this.scaffold();
        await this.setupStyling();
        await this.#applyUILibrary();
    }

    async scaffold() {
        Logger.info("Installing Angular CLI...");
        try {
            // Try to check if Angular CLI is already installed
            await execa("ng", ["version"], { stdio: "ignore" });
            Logger.warn("Angular CLI is already installed.");
        } catch (error) {
            const cmd = "npm install -g @angular/cli";
            try {
                await execa(cmd, { stdio: "inherit", shell: true });
                Logger.success("Successfully installed the angular CLI.");
            } catch (error) {
                Logger.error(("Failed to create Angular project:"), error);
                process.exit(1);
            }
        }

        Logger.info(`\nCreating Angular project: ${this.projectName}`);
        const arg = `ng new ${this.projectName} --routing --style=css --defaults `;
        await execa(arg, { stdio: "inherit", shell: true });
        Logger.success(`🎉Angular project '${this.projectName}' created successfully!`);
    }

    async setupStyling() {
        if (this.styling !== "tailwind") return;
        try {
            Logger.info("Setting up Tailwind CSS...");

            await execa("npm", [
                "install",
                "tailwindcss",
                "@tailwindcss/postcss",
                "postcss"
            ], { stdio: "inherit", cwd: this.projectPath });

            await fs.writeFile(
                path.join(this.projectPath, ".postcssrc.json"),
                JSON.stringify({
                    plugins: { "@tailwindcss/postcss": {} }
                }, null, 2)
            );

            await fs.writeFile(
                path.join(this.projectPath, "src", "styles.css"),
                `@import "tailwindcss";`
            );

            Logger.success("Tailwind CSS setup complete");

        } catch (error) {
            Logger.error(`Styling failed: ${error.message}`);
            throw error;
        }
    }


    async #applyUILibrary() {
        let libKey = this.uiLibrary ?? (this.styling === 'tailwind' ? 'tailwind-only' : 'plain');
        if (libKey === null || libKey === 'none') {
            libKey = this.styling === 'tailwind' ? 'tailwind-only' : 'plain';
        }

        const UIClass = AngularGenerator.#UI_REGISTRY.get(libKey);
        if (!UIClass) {
            Logger.warn(`UI library '${libKey}' not implemented for Angular`);
            return;
        }
        const ui = new UIClass({ projectName: this.projectName, projectPath:this.projectPath,language: this.language });
        await ui.setup();
    }
}
