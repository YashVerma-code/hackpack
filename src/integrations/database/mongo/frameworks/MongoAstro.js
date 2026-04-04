import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { mongodbNextContent, envExampleContent } from "../../../../../lib/backend/utils/utility.js";

export class MongoAstro {
  constructor({ projectName, language }) {
    this.projectName = projectName;
    this.language = language;
  }

  async setup() {
    console.log(chalk.blue(`\nSetting up for mongodb connection for ${this.projectName} project...`));
    try {
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "src", "lib");
      const actionPath = path.join(libPath, "actions");
      const databasePath = path.join(libPath, "database");
      const nextmodelPath = path.join(databasePath, "models");

      [
        rootDir,
        libPath,
        actionPath,
        databasePath,
        nextmodelPath
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      const mongoNextContent = mongodbNextContent("astro", this.language);
      if (!mongoNextContent) {
        console.error("Missing mongodbNextContent definition.");
        return;
      }
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${this.language === 'ts' ? 'ts' : 'js'}`), mongoNextContent.trim()
      );

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env.local"),
        `MONGODB_URI=\nDB_NAME=\nPORT=5000\nNODE_ENV=development\n`.trim()
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        envExampleContent()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      if (this.language === "ts") {
        console.log(chalk.blue("Installing @types/mongoose as dev dependency..."));

        await execa("npm", ["install", "--save-dev", "@types/mongoose"], {
          cwd: rootDir,
          stdio: "inherit",
        });
      } else {
        console.log(chalk.blue("Installing mongoose..."));
        await execa("npm", ["install", "mongoose"], { cwd: rootDir, stdio: "inherit" });
      }
      console.log(chalk.green("\n✅ Astro MongoDB setup complete!\n"));

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
