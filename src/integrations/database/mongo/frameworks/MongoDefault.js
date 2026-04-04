import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { packageJsonContent, dbConnectContent, indexContent, envExampleContent, tsConfigContent } from "../../../../../lib/backend/utils/utility.js";

export class MongoDefault {
  constructor({ projectName, language, mongoUri }) {
    this.projectName = projectName;
    this.language = language;
    this.mongoUri = mongoUri;
  }

  async setup() {
    try {
      // Get the root directory (one level above current script dir)
      const rootDir = path.resolve(process.cwd());
      const backendPath = path.join(rootDir, "backend");
      const srcPath = path.join(backendPath, "src");
      const libPath = path.join(srcPath, "lib");
      const modelPath = path.join(srcPath, "models");
      const routesPath = path.join(srcPath, "routes");
      const controllerPath = path.join(srcPath, "controller");
      const middlewarePath = path.join(srcPath, "middleware");

      // Create directories
      [
        backendPath,
        srcPath,
        libPath,
        modelPath,
        routesPath,
        controllerPath,
        middlewarePath,
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      // Create package.json
      const pkgJsonContent = packageJsonContent(this.language);
      fs.writeFileSync(
        path.join(backendPath, "package.json"),
        JSON.stringify(pkgJsonContent, null, 2)
      );

      // Create .env file
      fs.writeFileSync(
        path.join(backendPath, ".env"),
        `MONGO_URI=${this.mongoUri}\nPORT=5000\nNODE_ENV=development\n`
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(backendPath, ".env.example"),
        envExampleContent()
      );

      if (this.language === "ts") {
        fs.writeFileSync(
          path.join(backendPath, "tsconfig.json"),
          JSON.stringify(tsConfigContent, null, 2)
        );
      }
      // Create all source files
      const dbConnectContent2 = dbConnectContent(this.language);
      const indexContent2 = indexContent(this.language);
      fs.writeFileSync(path.join(libPath, `dbconnect.${this.language === "ts" ? 'ts' : 'js'}`), dbConnectContent2);
      fs.writeFileSync(path.join(srcPath, `index.${this.language === "ts" ? 'ts' : 'js'}`), indexContent2);

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: backendPath, stdio: "inherit" });

    } catch (error) {
      console.error(
        chalk.red("Error setting up MongoDB backend :)"),
        error.message
      );
      console.log(chalk.yellow("You may need to finish setup manually."));
      console.log(
        chalk.yellow(
          "Check the error above and ensure all dependencies are available."
        )
      );
    }
  }
}
