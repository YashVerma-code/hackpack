#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";

import createNextProject from "../lib/createNextProject/index.js";
import createViteProject from "../lib/createViteProject.js";
import createVueProject from "../lib/createVueProject/index.js";
import createAngularProject from "../lib/createAngularProject/index.js";
// import createSvelteProject from '../lib/createSvelteProject.js';
import createAstroProject from "../lib/createAstroProject/index.js";
import createNuxtProject from "../lib/createNuxtProject/index.js";
import { setupMongoDb, setupPostgreSQL } from "../lib/backend/index.js";


// Get terminal width for responsive display
const getTerminalWidth = () => {
  return process.stdout.columns || 80;
};

// Create responsive welcome message
const createResponsiveWelcome = (terminalWidth) => {
  if (terminalWidth < 40) {
    // For very small terminals, use simple text with line breaks
    return chalk.green.bold("\nWelcome\nto\nhackpack !");
  } else if (terminalWidth < 60) {
    // For small terminals, use simple text
    return chalk.green.bold("\nWelcome to hackpack !");
  } else if (terminalWidth < 80) {
    // For medium terminals, use smaller figlet font
    return figlet.textSync("Welcome to\nhackpack !", { font: "Standard" });
  } else {
    // For large terminals, use big figlet font
    return figlet.textSync("Welcome to hackpack !", { font: "Big" });
  }
};

async function runCli() {
  const terminalWidth = getTerminalWidth();
  const welcomeMessage = createResponsiveWelcome(terminalWidth);
  console.log(chalk.green.bold(welcomeMessage));

  const {frameworkChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "frameworkChoice",
      message: "Choose your framework:",
      choices: [
        { name: "Next.js", value: "next" },
        { name: "Vite (React)", value: "vite-react" },
        { name: "Remix", value: "remix" },
        { name: "Vue.js", value: "vue" },
        { name: "Angular (TS only)", value: "angular" },
        { name: "Svelte", value: "svelte" },
        { name: "Astro", value: "astro" },
        { name: "Nuxt.js", value: "nuxt" },
        { name: "None", value: "none" },
      ],
    },
  ]);
  if(frameworkChoice==="none"){
    return console.log(chalk.red("No framework selected. Exiting..."));
  }

  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter the name of your project:",
      default: `my-${frameworkChoice}-app`,
      validate: (input) => {
        if (!input) return "Project name cannot be empty";
        if (!/^[a-zA-Z0-9-_]+$/.test(input))
          return "Project name can only contain letters, numbers, dashes, and underscores";
        return true;
      },
      filter: (input) => input.toLowerCase(),
    },
  ]);

  try {
    switch (frameworkChoice) {
      case "next":
        await createNextProject({ projectName });
        break;

      case "vite-react":
        await createViteProject({ projectName });
        break;

      case "remix":
        console.log(`Scaffolding a Remix project for ${projectName}...`);
        // await createRemixProject({ projectName, typescript: ? });
        break;

      case "vue": 
        await createVueProject({ projectName });
        break;

      case "angular":
        await createAngularProject({ projectName });
        break;

      case "svelte":
        console.log(`Scaffolding a Svelte project for ${projectName}...`);
        // await createSvelteProject({ projectName, typescript: useTypeScript });
        break;

      case "astro":
        await createAstroProject({ projectName });
        break;

      case "nuxt":
        await createNuxtProject({ projectName });
        break;

      default:
        console.log(chalk.red("Invalid choice."));
        process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red("Error scaffolding project:"), error);
    process.exit(1);
  }
   const { databaseChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "databaseChoice",
        message: "Choose database you want :",
        choices: [
          {
            name: "mongoDB",
            value: "mongo-db",
          },
          { name: "postgreSQL", value: "postgre-sql" },
          {
            name:"None",value:"none"
          }
        ],
      },
    ]);
    if(databaseChoice==="none"){
      console.log(chalk.yellow("No database selected."));
    }

    try {
      switch(databaseChoice){
        case "mongo-db":
          await setupMongoDb(projectName);
          break;
        case "postgre-sql":
          await setupPostgreSQL(projectName);
          break;
        case "none":
          console.log(chalk.yellow("No database selected. Skipping database setup."));
          break;
        default:
          console.log(chalk.red("Invalid choice."));
          process.exit(1);
      }
    } catch (error) {
    console.error(chalk.red("Error setting Database and Server due to : "), error);
    process.exit(1);
  }
}

runCli().catch((err) => {
  if (err.message && err.message.includes('User force closed')) {
    console.log("\n👋 Thanks for using hackpack!");
    process.exit(0);
  } else {
    console.error(chalk.red("An error occurred:"), err);
    process.exit(1);
  }
});
