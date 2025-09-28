import { execa } from "execa";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import inquirer from "inquirer";
import { setupDaisyUI } from "./ui/daisyui.js";
import { setupShadcnUI } from "./ui/shadcn.js";
import { setupDefault } from "./ui/default.js";

async function createNuxtProject({ projectName: initialProjectName, language, styling, uiLibrary }) {
  const projectName = initialProjectName || "my-nuxt-app";

  let languageChoice = language; 
  if (!languageChoice) {
    const langAns = await inquirer.prompt([
    {
      type: "list",
      name: "languageChoice",
      message: "Choose your language:",
      choices: [
        { name: "TypeScript (strict)", value: "ts" },
        {
          name: "JavaScript-only",
          value: "js",
        },
      ],
    },
  ]);
  languageChoice = langAns.languageChoice;
  }

  let stylingChoice = styling;
  if (!stylingChoice) {
    const styleAns = await inquirer.prompt([
    {
      type: "list",
      name: "stylingChoice",
      message: "Choose your styling approach:",
      choices: [
        {
          name: "Tailwind CSS ",
          value: "tailwind",
        },
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
    { name: "nuxt ui", value: "nuxt-ui" },
    {name:"reka-ui",value:"reka-ui"},
    {
      name: "Tailwind CSS only (no component library)",
      value: "tailwind-only",
    },
  ];

  const nonTailwindLibraries = [{ name: "None (plain CSS)", value: "none" }];

  let uiLibraryChoice = uiLibrary;
  if (uiLibraryChoice === undefined) {
    const uiAns = await inquirer.prompt([
      {
        type: "list",
        name: "uiLibraryChoice",
        message: "Choose a UI library:",
        choices: [...tailwindLibraries, ...nonTailwindLibraries],
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

  if (!useTailwind && ["shadcn", "daisyui", "nuxt-ui", "reka-ui"].includes(uiLibraryChoice)) {
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
      console.log(chalk.blue("Enabling Tailwind CSS to support your UI library choice."));
      useTailwind = true;
    } else {
      console.log(chalk.blue("Please select a different UI library that does not require Tailwind."));
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
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)} \n${uiLibraryChoice === "nuxt-ui" ? chalk.yellow("Please select nuxt ui it terminal when asked again !") : ""}`);

 if (uiLibrary === undefined) {// only confirm in interactive mode
    const { confirmSetup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSetup',
        message: 'Ready to create your Nuxt project with these settings?',
        default: true
      }
    ]);
    if (!confirmSetup) {
      console.log(chalk.yellow('Project setup cancelled.'));
      return;
    }
  }

  try {
    console.log(chalk.blue(`\nCreating Nuxt project: ${projectName}`));
    await execa("npx", ["nuxi@latest", "init", projectName], {
      stdio: "inherit",
      shell: true
    })

    process.chdir(projectName);

    if (useTailwind) {
      console.log(chalk.blue("Setting up Tailwind CSS..."));
      const projectPath = process.cwd();
      console.log(
        chalk.blue("Installing Tailwind CSS, PostCSS, and Autoprefixer...")
      );

      await execa(
        "npm",
        [
          "install", "tailwindcss", "@tailwindcss/vite"
        ],
        { stdio: "inherit" }
      );
      const nuxtConfigPath = path.join(process.cwd(), "nuxt.config.ts");

      // Read existing file
      let nuxtConfig = fs.readFileSync(nuxtConfigPath, "utf8");

      // Tailwind config snippet to insert
      const tailwindSnippet = `import tailwindcss from "@tailwindcss/vite";\n`;

      // If tailwindcss import not already there, add it
      if (!nuxtConfig.includes('@tailwindcss/vite')) {
        nuxtConfig = tailwindSnippet + nuxtConfig;
      }

      // Add css and vite config if not present
      if (!nuxtConfig.includes("vite: {")) {
        // Insert vite block inside defineNuxtConfig
        nuxtConfig = nuxtConfig.replace(
          /defineNuxtConfig\(\{\n/,
          `defineNuxtConfig({
              css: ["../assets/css/main.css"],
              vite: {
                plugins: [tailwindcss()],
              },
          `
        );
      } else {
        // If vite exists, try to insert tailwindcss plugin
        nuxtConfig = nuxtConfig.replace(
          /vite:\s*\{([\s\S]*?)\}/,
          (match, content) => {
            if (!content.includes("tailwindcss()")) {
              return `vite: {\n${content.trimEnd()}\nplugins: [tailwindcss()],\n}`;
            }
            return match;
          }
        );
      }

      // Write the updated config back
      fs.writeFileSync(nuxtConfigPath, nuxtConfig, "utf8");

      const cssDir = path.join(process.cwd(), "assets", "css");
      const cssFilePath = path.join(cssDir, "main.css");

      // Make sure directory exists
      fs.mkdirSync(cssDir, { recursive: true });

      // Tailwind import content
      const tailwindDirectives = `@import "tailwindcss";\n`;

      // Write the file (overwrites if exists)
      fs.writeFileSync(cssFilePath, tailwindDirectives, "utf8");

      console.log("✅ nuxt.config.ts updated with TailwindCSS config");
      console.log(chalk.greenBright("\n🎉 Tailwind CSS setup complete!."));
    }

    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "shadcn":
          await setupShadcnUI(projectName, useTailwind);
          break;
        case "daisyui":
          await setupDaisyUI(projectName);
          break
          case "reka-ui":
            await setupRekaUI(projectName);  
            break;
        default:
          console.log(
            chalk.yellow(
              `Support for ${uiLibraryChoice} is not implemented yet.`
            )
          );
      }
    } else {
      await setupDefault(projectName, useTailwind);
    }

    console.log(
      chalk.green(`\n🎉Nuxt project '${projectName}' created successfully!`)
    );

    await execa("npm", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
    });
  } catch (error) {
    console.error(chalk.red("Failed to create Nuxt project:"), error);
    process.exit(1);
  }
}

export default createNuxtProject;
