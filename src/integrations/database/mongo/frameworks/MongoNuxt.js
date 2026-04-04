import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { dbConnectContentNuxt } from "../../../../../lib/backend/utils/utility.js";

export class MongoNuxt {
  constructor({ projectName, language, mongoUri, dbname }) {
    this.projectName = projectName;
    this.language = language;
    this.mongoUri = mongoUri;
    this.dbname = dbname;
  }

  async setup() {
    console.log(chalk.blue(`\nSetting up for mongodb connection for ${this.projectName} nuxt project...`));
    try {
      const rootDir = path.resolve(process.cwd());
      const serverPath = path.join(rootDir, "server");
      const apiPath = path.join(serverPath, "api");
      const databasePath = path.join(serverPath, "database");
      const modelPath = path.join(databasePath, "models");

      [
        rootDir,
        serverPath,
        apiPath,
        databasePath,
        modelPath
      ].forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
      });

      const mongodbContent = dbConnectContentNuxt(this.language);
      if (!mongodbContent) {
        console.error("Missing mongodbNuxtContent definition.");
        return;
      }
      fs.writeFileSync(
        path.join(databasePath, `mongoose.${this.language === 'ts' ? 'ts' : 'js'}`), mongodbContent.trim()
      );

      // Create .env file
      fs.writeFileSync(
        path.join(rootDir, ".env"),
        `MONGODB_URI=${this.mongoUri}\nDB_NAME=${this.dbname}\nNODE_ENV=development\n`.trim()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      await execa("npm", ["i", "--save-dev", "@types/node"], {
        cwd: rootDir, stdio: "inherit"
      });

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
