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

    const configFileName = `${isTypeScript ? "ts" : "js"}config.json`;
    const configPath = path.join(projectPath, configFileName);

    try {
      console.log(chalk.blue(`Updating ${configFileName} file...`));

      let config = {
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"],
          },
        },
      };

      // If file exists, read and modify it
      try {
        const raw = await fs.readFile(configPath, "utf-8");
        const existing = JSON.parse(raw);

        config = {
          ...existing,
          compilerOptions: {
            ...existing.compilerOptions,
            baseUrl: ".",
            paths: {
              "@/*": ["./src/*"],
            },
          },
        };
      } catch (readErr) {
        console.log(chalk.gray(`${configFileName} not found, creating new.`));
      }

      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(
        chalk.yellow(
          `Successfully updated ${configFileName} with import alias.`
        )
      );
    } catch (err) {
      console.error(
        chalk.red(`Failed to update ${configFileName}:`),
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

    const PageHTML = createWelcomePageHTML(useTailwind);
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
