import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';
import { Logger } from '../../../core/Logger.js';
import { getTemplatePath } from '../../../lib/templatePath.util.js';

export class TailwindOnlyAstro extends BaseUILibrary {
  static id = 'tailwind-only';
  static displayName = 'Tailwind CSS only';
  static requiresTailwind = true;

  constructor({ projectName, projectPath, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.language = language;
  }

  async setup() {
    Logger.info("Setting up Tailwind-only Astro...");

    try {
      const projectPath = this.projectPath;
      const isTS = this.language === "ts";
      const langFolder = isTS ? "ts" : "js";

      await execa("npm", ["install", "react", "react-dom", "sonner"], {
        stdio: "inherit",
        shell:true,
        cwd: projectPath
      });

      await execa("npx", ["astro", "add", "react"], {
        stdio: "inherit",
        shell:true,
        cwd: projectPath
      });

      const stylesPath = path.join(projectPath, "src/styles/global.css");

      await fs.writeFile(
        stylesPath,
        `@import "tailwindcss";`
      );

      Logger.info("Creating welcome page...");

      const toastSrc = getTemplatePath(
        "astro",
        "ui",
        "tailwindcss",
        "base",
        langFolder,
        `ToastDemo.twonly.${isTS ? "tsx" : "jsx"}`
      );

      const toastDest = path.join(
        projectPath,
        `src/components/ToastDemo.${isTS ? "tsx" : "jsx"}`
      );

      await fs.copyFile(toastSrc, toastDest);

      const pageSrc = getTemplatePath(
        "astro",
        "ui",
        "tailwindcss",
        "base",
        "Welcome.astro"
      );

      const pageDest = path.join(projectPath, "src/pages/index.astro");

      await fs.copyFile(pageSrc, pageDest);

      // Remove default Astro welcome
      const defaultPath = path.join(
        projectPath,
        "src/components/Welcome.astro"
      );

      try {
        await fs.unlink(defaultPath);
      } catch {}

      Logger.success("Tailwind-only setup completed!");

    } catch (error) {
      Logger.error(`Error setting up tailwind-only: ${error.message}`);
      throw error;
    }
  }
}