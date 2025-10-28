import path from "path";
import { execa } from "execa";
import chalk from "chalk";
import fs, { unlink } from "fs/promises";
import { createToastMessage, createWelcomePageHTML } from "../utils/utility.js";

export async function setupShadcnUI(projectName, isTypeScript, useTailwind) {
  console.log(chalk.blue("Setting up shadcn/ui..."));
  const projectPath = process.cwd();

  try {
    await execa("npx", ["astro", "add", "react"], {
      stdio: "inherit",
      shell: true,
    });

    // const configFileName = `${isTypeScript ? "ts" : "js"}config.json`;
    // const configPath = path.join(projectPath, configFileName);
    const jsconfigPath = path.join(projectPath, "jsconfig.json");
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    try {
      console.log(chalk.blue(`Updating jsconfig.json and tsconfig.json file...`));

      let config = {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
      };

      let existingConfig = null;
      try {
        const existingPath = await fs
          .readFile(tsconfigPath, "utf-8")
          .catch(() => fs.readFile(jsconfigPath, "utf-8"));
        existingConfig = JSON.parse(existingPath);
      } catch {
        console.log(chalk.gray("No existing config found, creating fresh files."));
      }

      // Merge existing compilerOptions if any
      if (existingConfig) {
        config = {
          ...existingConfig,
          compilerOptions: {
            ...existingConfig.compilerOptions,
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"],
            },
          },
        };
      }

      // await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      await fs.writeFile(tsconfigPath, JSON.stringify(config, null, 2));
      await fs.writeFile(jsconfigPath, JSON.stringify(config, null, 2));

      console.log(
        chalk.yellow(
          `Successfully updated jsconfig.json and tsconfig.json} with import alias.`
        )
      );
    } catch (err) {
      console.error(
        chalk.red(`Failed to updatejsconfig.json and tsconfig.json :`),
        err.message
      );
    }

    await execa("npx", ["shadcn@latest", "init"], {
      stdio: "inherit",
      shell: true,
    });

    console.log(chalk.greenBright("\n🎉 shadcn setup completed!."));

    console.log(chalk.blue("Creating a welcome page..."));

    await execa("npm", ["install", "sonner"], {
      stdio: "inherit",
      shell: true,
    });
    await execa("npx", ["shadcn@latest", "add", "button"], {
      stdio: "inherit",
      shell: true,
    });

    const toastComponent = createToastMessage(useTailwind);
    await fs.writeFile(
      `src/components/ToastDemo.${isTypeScript ? "tsx" : "jsx"}`,
      toastComponent
    );

    const PageHTML = createWelcomePageHTML(useTailwind,false);
    const htmlPath = path.join(projectPath, "src", "pages", "index.astro");
    await fs.writeFile(htmlPath, PageHTML);

    const defaultWelcomePagePath = path.join(
      projectPath,
      "src",
      "components",
      "Welcome.astro"
    );

    try {
      await unlink(defaultWelcomePagePath);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    console.log(chalk.greenBright("\n🎉 Project setup completed!."));
  } catch (error) {
    console.error(chalk.red("Error setting up shadcn/ui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up shadcn/ui manually after project creation."
      )
    );
  }
}
