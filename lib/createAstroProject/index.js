import { execa } from "execa";
import chalk from "chalk";
import inquirer from "inquirer";
import { setupDaisyUi } from "./ui/daisyui.js";
import { setupShadcnUI } from "./ui/shadcn.js";
import { setupDefault } from "./ui/default.js";
// import { setupMongoDb } from "./database/mongodb.js";
// import { setupPostgreSQL } from "./database/postgresql.js";
// import { setupClerk } from "./database/clerk.js";

async function createAstroProject({ projectName: initialProjectName, language, styling, uiLibrary }) {
  const projectName = initialProjectName || "my-astro-app";
  // lang
  let languageChoice = language;
  if (!languageChoice) {
    const langAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'languageChoice',
        message: 'Do you want to use JavaScript or TypeScript?',
        choices: [
          { name: 'TypeScript', value: 'ts' },
          { name: 'JavaScript', value: 'js' },
        ]
      }
    ]);
    languageChoice = langAns.languageChoice;
  }
  const isTypeScript = languageChoice === "ts";

  // styling
  let stylingChoice = styling;
  if (!stylingChoice) {
    const styleAns = await inquirer.prompt([
    {
      type: "list",
      name: "stylingChoice",
      message: "Choose your styling approach:",
      choices: [
        { name: 'Tailwind CSS (recommended)', value: 'tailwind' },
        { name: "Plain CSS (no Tailwind)", value: "plain" },
      ],
    },
  ]);
  stylingChoice = styleAns.stylingChoice;
  }

  let useTailwind = stylingChoice === "tailwind";

  const tailwindLibraries = [
    { name: "shadcn/ui (Radix + Tailwind)", value: "shadcn" },
    { name: "daisyUI (Tailwind plugin)", value: "daisyui" },
    {
      name: "Tailwind CSS only (no component library)",
      value: "tailwind-only",
    },
  ];

  const nonTailwindLibraries = [{ name: "None (plain CSS)", value: "none" }];

  let uiLibraryChoice = uiLibrary;
  // Only prompt for UI library in interactive mode
  if ( uiLibraryChoice === undefined) {
    const uiAns = await inquirer.prompt([
      {
        type: "list",
        name: "uiLibraryChoice",
        message: "Choose a UI library:",
        choices: useTailwind ? tailwindLibraries : nonTailwindLibraries
      },
    ]);
    uiLibraryChoice = uiAns.uiLibraryChoice;
  }
  if (uiLibraryChoice === null) uiLibraryChoice = 'none';

  // If the user picked Tailwind for styling but no UI library (none/null),
  // interpret that as Tailwind-only so Tailwind setup runs instead of plain CSS.
  if (useTailwind && uiLibraryChoice === 'none') {
    uiLibraryChoice = 'tailwind-only';
  }

  if (!useTailwind && ["shadcn", "daisyui"].includes(uiLibraryChoice)) {
    console.log(
      chalk.yellow(`\nWarning: ${uiLibraryChoice} requires Tailwind CSS!`)
    );
    const { confirmTailwind } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmTailwind",
        message:
          "Would you like to enable Tailwind CSS to use this UI library?",
        default: true,
      },
    ]);

    if (confirmTailwind) {
      console.log(
        chalk.blue("Enabling Tailwind CSS to support your UI library choice.")
      );
      useTailwind = true;
    } else {
      console.log(
        chalk.blue(
          "Please select a different UI library that does not require Tailwind."
        )
      );
      const { newUiLibraryChoice } = await inquirer.prompt([
        {
          type: "list",
          name: "newUiLibraryChoice",
          message: "Choose a UI library compatible with plain CSS:",
          choices: nonTailwindLibraries,
        },
      ]);
      uiLibraryChoice = newUiLibraryChoice;
    }
  }

  console.log(chalk.blue("\nProject configuration:"));
  console.log(`- Project name: ${chalk.green(projectName)}`);
  console.log(
    `- Language: ${chalk.green(
      languageChoice === "ts" ? "TypeScript (strict)" : "JavaScript"
    )}`
  );
  console.log(
    `- Styling: ${chalk.green(useTailwind ? "Tailwind CSS" : "Plain CSS")}`
  );
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)}`);

  if (uiLibrary === undefined) {
    const { confirmSetup } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmSetup",
        message: "Ready to create your Astro project with these settings?",
        default: true,
      },
    ]);

    if (!confirmSetup) {
      console.log(chalk.yellow("Project setup cancelled."));
      return;
    }
  }

  try {
    console.log(chalk.blue(`\nCreating Astro project: ${projectName}`));

    await execa(
      "npm",
      [
        "create",
        "astro@latest",
        projectName,
        "--",
        "--template",
        "basics",
        "--install",
        "--git",
        "--typescript",
        languageChoice == "ts" ? "strict" : "disable",
      ],
      {
        stdio: "inherit",
        shell: true,
      }
    );

    process.chdir(projectName);

    console.log(
      chalk.green(`\n🎉Astro project '${projectName}' created successfully!`)
    );

    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "shadcn":
          await setupShadcnUI(projectName, isTypeScript, useTailwind);
          break;
        case "daisyui":
          await setupDaisyUi(projectName, isTypeScript, useTailwind);
          break;
        default:
          console.log(
            chalk.yellow(
              `Support for ${uiLibraryChoice} is not implemented yet.`
            )
          );
      }
    } else {
      await setupDefault(projectName, isTypeScript, useTailwind);
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
            name: "clerk",
            value: "clerk",
          },
          {
            name: "None",
            value: "none",
          },
        ],
      },
    ]);

    await execa("npm", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
    });
  } catch (error) {
    console.error(chalk.red("Failed to create Astro project:"), error);
    process.exit(1);
  }
}

export default createAstroProject;
