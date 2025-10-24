import { execa } from "execa";
import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { setupDaisyUi } from "./ui/daisyUi.js";
import { setupDefault } from "./ui/default.js";
import { setupVuetify } from "./ui/vuetify.js";
import { setupInspiraUi } from "./ui/inspiraUi.js";
import { setupPrimeVue } from "./ui/primeVue.js";

// import { setupElementPlus } from "./ui/elementplus.js";
// import { setupNaiveUI } from "./ui/naiveui.js";
// import { setupUnoCSS } from "./ui/unoCss.js";

async function createVueProject({ projectName: initialProjectName, language, styling, uiLibrary }) {
  const projectName = initialProjectName || "my-vue-app";
  let languageChoice = language;
  
  let stylingChoice = styling;
  if (!stylingChoice) { 
    const styleAns = await inquirer.prompt([
      {
        type: "list",
        name: "stylingChoice",
        message: "Choose your styling approach:",
        choices: [
          {
          name: "Tailwind CSS (recommended for most UI libraries)",
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
    { name: "DaisyUi", value: "daisyui" },
    { name: "Inspira Ui", value: "inspiraui" },
    {
      name: "Tailwind CSS only (no component library)",
      value: "tailwind-only",
    },
  ];

  const nonTailwindLibraries = [
    { name: "Vuetify", value: "vuetify" },
    { name: "PrimeVue", value: "primevue" },
    { name: "None (plain CSS)", value: "none" },
  ];

  let uiLibraryChoice = uiLibrary;
  if (uiLibraryChoice === undefined) {
    const uiAns = await inquirer.prompt([
    {
      type: "list",
      name: "uiLibraryChoice",
      message: "Choose a UI library:",
      choices: useTailwind
        ? tailwindLibraries : nonTailwindLibraries,
      },
    ]);
    uiLibraryChoice = uiAns.uiLibraryChoice;
  }
  if (uiLibraryChoice === null) uiLibraryChoice = 'none';

  // If user chose tailwind styling but explicitly chose 'none', treat as tailwind-only
  if (useTailwind && uiLibraryChoice === 'none') {
    uiLibraryChoice = 'tailwind-only';
  }

  // Normalize aliases (wizard may emit 'twonly')
  const uiAliasMap = { twonly: 'tailwind-only', 'tw-only': 'tailwind-only', tailwindonly: 'tailwind-only', plaincss: 'none' };
  if (uiLibraryChoice && uiAliasMap[uiLibraryChoice]) uiLibraryChoice = uiAliasMap[uiLibraryChoice];


  if (!useTailwind && ["daisyui","inspiraui"].includes(uiLibraryChoice)) {
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
      languageChoice === "ts" ? "TypeScript" : "JavaScript"
    )}`
  );
  console.log(
    `- Styling: ${chalk.green(
      useTailwind ? "Utility CSS (Tailwindcss)" : "Plain CSS"
    )}`
  );
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)}`);
  if (uiLibrary === undefined) { // only confirm in interactive mode
    const { confirmSetup } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmSetup",
        message: "Ready to create your Vue project with these settings?",
        default: true,
      },
    ]);
  
    if (!confirmSetup) {
      console.log(chalk.red("Project setup cancelled."));
      return;
    }
  }

  let createVueAppFlags = ["--", "--default"];

  try {
    console.log(chalk.blue(`\nCreating Vue project: ${projectName}`));
    console.log(
      languageChoice === "ts"
        ? chalk.blue("Using TypeScript")
        : chalk.blue("Using JavaScript")
    );

    if (languageChoice === "ts") {
      createVueAppFlags.push("vue-ts");
      console.log(chalk.blue("TypeScript selected: Adding vue-ts template"));
    } else {
      console.log(chalk.blue("JavaScript selected: Adding vue template"));
    }

    console.log(
      chalk.cyanBright("npm create vue@latest", ...createVueAppFlags)
    );

    await execa(
      "npm",
      ["create", "vue@latest", projectName, ...createVueAppFlags],
      {
        stdio: "ignore",
        shell: true,
      }
    );

    console.log(chalk.yellow("Installing all the dependencies..."));
    process.chdir(projectName);

    await execa("npm", ["install"], {
      stdio: "inherit",
    });

    if (useTailwind) {
      console.log(chalk.blue("Setting up Tailwind CSS..."));
      const projectPath = process.cwd();
      console.log(
        chalk.blue("Installing Tailwind CSS, PostCSS, and Autoprefixer...")
      );

      await execa(
        "npm",
        ["install", "tailwindcss@latest", "@tailwindcss/vite@latest"],
        { stdio: "inherit" }
      );

      const configPath = path.join(projectPath, "vite.config.js");
      let viteConfig = fs.readFileSync(configPath, "utf-8");

      // Inject the import line if not already present
      if (!viteConfig.includes("@tailwindcss/vite")) {
        viteConfig =
          `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
      }

      // Inject tailwindcss() into the plugins array
      viteConfig = viteConfig.replace(
        /plugins:\s*\[\s*([\s\S]*?)\s*\]/,
        (match, plugins) => {
          if (plugins.includes("tailwindcss()")) return match; // Already present
          return `plugins: [\n    ${plugins.trim()}\n    tailwindcss()\n  ]`;
        }
      );

      // Save updated config
      fs.writeFileSync(configPath, viteConfig, "utf-8");

      console.log("✅ vite.config.js updated to include Tailwind Vite plugin!");

      const cssPath = path.join(projectPath, "src", "assets", "main.css");
      const tailwindImport = `@import "tailwindcss";`.trim();

      if (fs.existsSync(cssPath)) {
        // const cssContent = fs.readFileSync(cssPath, "utf-8");
        if (!cssContent.includes('@import "tailwindcss')) {
          fs.writeFileSync(
            cssPath,
            tailwindImport + "\n",
            "utf-8"
          );
          console.log("✅ main.css updated with Tailwind imports.");
        } else {
          console.log("ℹ️ Tailwind imports already present in main.css.");
        }
      } else {
        // Create file if it doesn't exist
        fs.mkdirSync(path.dirname(cssPath), { recursive: true });
        fs.writeFileSync(cssPath, tailwindImport, "utf-8");
        console.log("✅ main.css created with Tailwind imports.");
      }

      console.log(chalk.green("Injected Tailwind directives into main.css"));

      console.log(chalk.greenBright("\n🎉 Tailwind CSS setup complete!."));
    }

    console.log(
      chalk.green(`\n🎉Vue project '${projectName}' created successfully!`)
    );

    // Setup selected UI Library
    if (uiLibraryChoice !== "none" && uiLibraryChoice !== "tailwind-only") {
      switch (uiLibraryChoice) {
        case "daisyui":
          await setupDaisyUi(projectName);
          break;
        case "vuetify":
          await setupVuetify(projectName, useTailwind);
          break;
        case "inspiraui":
          await setupInspiraUi(projectName);
          break;
        case "primevue":
            await setupPrimeVue(projectName, useTailwind);
          break;
        case "unocss":
          //   await setupUnoCSS(projectName, languageChoice);
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

    await execa("npm", ["run", "dev"], {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(chalk.red("Failed to create Vue project:"), error);
    process.exit(1);
  }
}

export default createVueProject;
