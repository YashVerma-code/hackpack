import chalk from "chalk";
import inquirer from "inquirer";
import { BaseDatabase } from "../BaseDatabase.js";
import { MongoNext } from "./frameworks/MongoNext.js";
import { MongoSvelte } from "./frameworks/MongoSvelte.js";
import { MongoAstro } from "./frameworks/MongoAstro.js";
import { MongoNuxt } from "./frameworks/MongoNuxt.js";
import { MongoDefault } from "./frameworks/MongoDefault.js";

export class MongoDatabase extends BaseDatabase {
  static id = 'mongodb';
  static displayName = 'MongoDB';
  static supportedFrameworks = ['next', 'svelte', 'astro', 'nuxt'];

  // Private registry: frameworkId → framework-specific class
  static #registry = new Map([
    ['next',   MongoNext],
    ['svelte', MongoSvelte],
    ['astro',  MongoAstro],
    ['nuxt',   MongoNuxt],
  ]);

  async setup(projectName, frameworkId, language) {
    console.log(
      chalk.blue("\nSetting up MongoDB backend ...")
    );

    const { uri: mongoUri } = await inquirer.prompt([
      {
        type: "input",
        name: "uri",
        message: "Enter your MongoDB connection URI:",
        default: "mongodb://localhost:27017/test",
        validate: (input) =>
          input.startsWith("mongodb")
            ? true
            : "Please enter a valid MongoDB URI",
      },
    ]);
    const { dbname } = await inquirer.prompt([
      {
        type: "input",
        name: "dbname",
        message: "Enter your database name:"
      }
    ]);

    if (!mongoUri) {
      console.log(chalk.red("MongoDB URI is not provided."));
      return;
    }

    const FrameworkClass = MongoDatabase.#registry.get(frameworkId) ?? MongoDefault;
    await new FrameworkClass({ projectName, language, mongoUri, dbname }).setup();
  }
}
