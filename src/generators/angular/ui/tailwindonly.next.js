import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';
import { Logger } from '../../../core/Logger.js';

export class TailwindOnlyAngular extends BaseUILibrary {
  static id = 'tailwind-only';
  static displayName = 'Tailwind CSS only';
  static requiresTailwind = true;

  constructor({ projectName, projectPath, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.projectPath = projectPath;
    this.language = language;
  }

  getDependencies() {
    return ['sonner'];
  }

  async setup() {

    Logger.info(`Setting up Tailwind-only project...`);
    try {
      Logger.info('Installing toast component...');
      await execa('npm', ['install', 'sonner'], { stdio: 'inherit', shell: true, cwd: this.projectPath });

      const appHtmlSrc = getTemplatePath(
        "angular",
        "ui",
        "tailwindcss",
        "app.twonly.html"
      );
      const appHtmlDes = path.join(
        this.projectPath,
        "src/app/app.html"
      );
      await fs.copyFile(appHtmlSrc, appHtmlDes);


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

      const globalStylePath = path.join(projectPath, "src", "styles.css");
      fs.appendFile(globalStylePath, "body{margin:0;padding:0;}")

      Logger.success("\n🎉 Setup completed!.");

    } catch (error) {
      Logger.error(`Error setting up tailwindcss: ${error.message}`);
      Logger.warn(`You may need to setup project manually. `)
    }
  }

}
