import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { Logger } from '../../core/Logger.js';
import { DaisyUIAstro } from './ui/daisyui.astro.js';
import { TailwindOnlyAstro } from './ui/tailwindonly.astro.js';
import { PlainCSSAstro } from './ui/plaincss.astro.js';
import { ShadcnAstro } from './ui/shadcn.astro.js';

export class AstroGenerator {
    static #UI_REGISTRY = new Map([
        ['daisyui', DaisyUIAstro],
        ['shadcn', ShadcnAstro],
        ['tailwind-only', TailwindOnlyAstro],
        ['twonly', TailwindOnlyAstro],
        ['tailwindonly', TailwindOnlyAstro],
        ['plain', PlainCSSAstro],
        ['plaincss', PlainCSSAstro],
        ['none', PlainCSSAstro],
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
        Logger.info(`\nCreating Astro project: ${this.projectName}`);
        await execa(
            "npm",
            [
                "create",
                "astro@latest",
                this.projectName,
                "--",
                "--template",
                "basics",
                "--install",
                "--git",
                "--typescript",
                this.language == "ts" ? "strict" : "disable",
            ],
            {
                stdio: "inherit",
                shell: true,
            }
        );
        Logger.success(`🎉Astro project '${this.projectName}' created successfully!`);
    }

    async setupStyling() {
        if (this.styling !== "tailwind") return;
        try {
            Logger.info("Setting up Tailwind CSS...");

            await execa("npx", ["astro", "add", "tailwind"], {
                stdio: "inherit",
                shell: true,
                cwd: this.projectPath
            });

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

        const UIClass = AstroGenerator.#UI_REGISTRY.get(libKey);
        if (!UIClass) {
            Logger.warn(`UI library '${libKey}' not implemented for Angular`);
            return;
        }
        const ui = new UIClass({ projectName: this.projectName, projectPath: this.projectPath, language: this.language });
        await ui.setup();
    }
}
