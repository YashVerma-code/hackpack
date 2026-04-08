import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';
import { Logger } from '../../../core/Logger.js';
import { getTemplatePath } from '../../../lib/templatePath.util.js';

export class ShadcnAstro extends BaseUILibrary {
  static id = 'shadcn';
  static displayName = 'Shadcn';
  static requiresTailwind = true;

  constructor({ projectName, projectPath, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.language = language;
  }

  async setup() {
    Logger.info("Setting up shadcn/ui...");

    try {
      const projectPath = this.projectPath;
      const isTS = this.language === "ts";
      const langFolder = isTS ? "ts" : "js";

      await execa("npx", ["astro", "add", "react"], {
        stdio: "inherit",
        shell: true,
        cwd: projectPath
      });

      await this.#updateAliasConfig(projectPath);

      await execa("npx", ["shadcn@latest", "init"], {
        stdio: "inherit",
        shell: true,
        cwd: projectPath
      });

      await execa("npx", ["shadcn@latest", "add", "button"], {
        stdio: "inherit",
        shell: true,
        cwd: projectPath
      });

      await execa("npm", ["install", "sonner"], {
        stdio: "inherit",
        shell: true,
        cwd: projectPath
      });

      Logger.info("Creating welcome page...");

      const toastSrc = getTemplatePath(
        "astro",
        "ui",
        "tailwindcss",
        "shadcn",
        langFolder,
        `ToastDemo.${isTS ? "tsx" : "jsx"}`
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

      const defaultPath = path.join(
        projectPath,
        "src/components/Welcome.astro"
      );

      try {
        await fs.unlink(defaultPath);
      } catch { }

      Logger.success("shadcn setup completed!");

    } catch (error) {
      Logger.error(`Error setting up shadcn: ${error.message}`);
      throw error;
    }
  }

  async #updateAliasConfig(projectPath) {
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    const jsconfigPath = path.join(projectPath, "jsconfig.json");

    let config = {
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      }
    };

    try {
      const existing = await fs
        .readFile(tsconfigPath, "utf-8")
        .catch(() => fs.readFile(jsconfigPath, "utf-8"));

      const parsed = JSON.parse(existing);

      config = {
        ...parsed,
        compilerOptions: {
          ...parsed.compilerOptions,
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"]
          }
        }
      };
    } catch { }

    await fs.writeFile(tsconfigPath, JSON.stringify(config, null, 2));
    await fs.writeFile(jsconfigPath, JSON.stringify(config, null, 2));
  }
}