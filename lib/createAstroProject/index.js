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

  const isTypeScript = languageChoice === "ts";

  // styling
  let stylingChoice = styling || "plain";
  let useTailwind = stylingChoice === "tailwind";
  let uiLibraryChoice = uiLibrary || "none";

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

    if (useTailwind) {
      try {
        console.log(chalk.blue("\nInitialising Tailwind CSS..."));

        await execa("npx", ["astro", "add", "tailwind"], {
          stdio: "inherit",
          shell: true,
        });

        console.log(chalk.yellow("\nTailwind CSS is successfully set up."));
      } catch (tailwindError) {
        console.error(
          chalk.red("Failed to add Tailwind CSS to Astro project:"),
          tailwindError
        );
        process.exit(1);
      }
    }

    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "shadcn":
          await setupShadcnUI(projectName, isTypeScript, useTailwind);
          break;
        case "daisyui":
          await setupDaisyUi(projectName, isTypeScript, useTailwind);
          break;
        case "plaincss":
          await setupDefault(projectName, isTypeScript, useTailwind);
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
  } catch (error) {
    console.error(chalk.red("Failed to create Astro project:"), error);
    process.exit(1);
  }
}

export default createAstroProject;
