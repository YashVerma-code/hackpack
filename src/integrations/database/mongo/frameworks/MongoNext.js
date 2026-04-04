import fs from "fs";
import path from "path";
import chalk from "chalk";
import { execa } from "execa";
import { mongodbNextContent, envExampleContent } from "../../../../../lib/backend/utils/utility.js";

export class MongoNext {
  constructor({ projectName, language, mongoUri, dbname }) {
    this.projectName = projectName;
    this.language = language;
    this.mongoUri = mongoUri;
    this.dbname = dbname;
  }

  async setup() {
    console.log(chalk.blue("\nSetting up for Next.js project..."));
    try {
      process.chdir(this.projectName);
      const rootDir = path.resolve(process.cwd());
      const libPath = path.join(rootDir, "lib");
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

      const mongoNextContent = mongodbNextContent("next", this.language);
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
        `MONGO_URI=${this.mongoUri}\nDB_NAME=${this.dbname}\nPORT=5000\nNODE_ENV=development # Set to 'production' in production environment\n`.trim()
      );

      // Create .env.example
      fs.writeFileSync(
        path.join(rootDir, ".env.example"),
        envExampleContent()
      );

      // Install dependencies
      console.log(chalk.blue("Installing dependencies..."));
      await execa("npm", ["install"], { cwd: rootDir, stdio: "inherit" });

      console.log(chalk.blue("Installing @types/mongoose as dev dependency..."));

      await execa("npm", ["install", "--save-dev", "@types/mongoose"], {
        cwd: rootDir,
        stdio: "inherit",
      });

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
