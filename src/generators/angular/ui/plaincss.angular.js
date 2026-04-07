import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';
import { Logger } from '../../../core/Logger.js';
import { getTemplatePath } from '../../../lib/templatePath.util.js';

export class PlainCSSAngular extends BaseUILibrary {
  static id = 'plain';
  static displayName = 'Plain CSS';
  static requiresTailwind = false;

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
    Logger.info("\nCreating a welcome page...");

    try {
      await execa("npm", ["install", "ngx-sonner"], {
        stdio: "inherit",
        shell: true,
        cwd: this.projectPath
      });

      const appHtmlSrc = getTemplatePath(
        "angular",
        "ui",
        "plaincss",
        "app.plaincss.html"
      );

      const appHtmlDes = path.join(
        this.projectPath,
        "src/app/app.html"
      );
      await fs.copyFile(appHtmlSrc, appHtmlDes);

      const appCssSrc = getTemplatePath(
        "angular",
        "ui",
        "plaincss",
        "app.plaincss.css"
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

      const globalStylePath = path.join(this.projectPath, "src", "styles.css");
      await fs.appendFile(globalStylePath, "body{margin:0;padding:0;}");

      Logger.success("\n🎉 Setup completed!.");
    } catch (error) {
      Logger.error(`Error setting up plaincss: ${error.message}`);
      Logger.warn("You may need to set up project manually.");
    }
  }
}
