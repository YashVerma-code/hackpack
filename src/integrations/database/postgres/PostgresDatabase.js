import chalk from "chalk";
import inquirer from "inquirer";
import { BaseDatabase } from "../BaseDatabase.js";
import { PostgresNext } from "./frameworks/PostgresNext.js";
import { PostgresSvelte } from "./frameworks/PostgresSvelte.js";
import { PostgresDefault } from "./frameworks/PostgresDefault.js";

export class PostgresDatabase extends BaseDatabase {
  static id = 'postgresql';
  static displayName = 'PostgreSQL';
  static supportedFrameworks = ['next', 'svelte'];

  // Private registry: frameworkId → framework-specific class
  static #registry = new Map([
    ['next',   PostgresNext],
    ['svelte', PostgresSvelte],
  ]);

  async setup(projectName, frameworkId, language) {
    console.log(chalk.blue("\nSetting up PostgreSQL backend with Prisma + Express..."));

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Enter your PostgreSQL username:",
        default: "postgres",
      },
      {
        type: "password",
        name: "password",
        message: "Enter your PostgreSQL password:",
        mask: "*",
      },
      {
        type: "input",
        name: "host",
        message: "Enter your PostgreSQL host:",
        default: "localhost",
      },
      {
        type: "input",
        name: "port",
        message: "Enter your PostgreSQL port:",
        default: "5432",
        validate: (input) => (/^\d+$/.test(input) ? true : "Port must be a number"),
      },
      {
        type: "input",
        name: "database",
        message: "Enter your PostgreSQL database name:",
        default: "testdb",
      },
    ]);

    const FrameworkClass = PostgresDatabase.#registry.get(frameworkId) ?? PostgresDefault;
    await new FrameworkClass({ projectName, answers }).setup();
  }
}
