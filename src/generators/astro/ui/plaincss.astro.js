import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';
import { Logger } from '../../../core/Logger.js';
import { getTemplatePath } from '../../../lib/templatePath.util.js';

export class PlainCSSAstro extends BaseUILibrary {
  static id = 'plain';
  static displayName = 'Plain CSS';
  static requiresTailwind = false;

  constructor({ projectName, projectPath, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.language = language;
  }

  async setup() {
    Logger.info("Setting up Plain CSS for Astro...");

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

      Logger.info("Creating welcome page...");

      const toastSrc = getTemplatePath(
        "astro",
        "ui",
        "plaincss",
        langFolder,
        `ToastDemo.plaincss.${isTS ? "tsx" : "jsx"}`
      );

      const toastDest = path.join(
        projectPath,
        `src/components/ToastDemo.${isTS ? "tsx" : "jsx"}`
      );

      await fs.copyFile(toastSrc, toastDest);

      const pageSrc = getTemplatePath(
        "astro",
        "ui",
        "plaincss",
        "base",
        "Welcome.plaincss.astro"
      );

      const pageDest = path.join(projectPath, "src/pages/index.astro");

      await fs.copyFile(pageSrc, pageDest);

      const cssSrc = getTemplatePath(
        "astro",
        "ui",
        "plaincss",
        "base",
        "toast.plaincss.css"
      );

      const cssDest = path.join(projectPath, "src/styles/global.css");

      try {
        await fs.copyFile(cssSrc, cssDest);
      } catch {
        // optional file
      }

      // remove default astro welcome
      const defaultPath = path.join(
        projectPath,
        "src/components/Welcome.astro"
      );

      try {
        await fs.unlink(defaultPath);
      } catch {}

      Logger.success("Plain CSS setup completed!");

    } catch (error) {
      Logger.error(`Error setting up plaincss: ${error.message}`);
      throw error;
    }
  }
}