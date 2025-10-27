import fs from "fs";
import { writeFile, unlink } from "fs/promises";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import { createToastMessage, createWelcomePageHTML } from "../utils/utility.js";

export async function setupDaisyUi(projectName, isTypeScript, useTailwind) {
  console.log(chalk.blue("Setting up daisyui..."));

  const projectPath = process.cwd();
  try {
    await execa("npm", ["install", "daisyui@latest"], {
      stdio: "inherit",
      shell: true,
    });

    const stylesPath = path.join(projectPath, "src", "styles", "global.css");
    const daisyUiDirectives = `@import "tailwindcss";\n@plugin "daisyui";`.trim();

    await fs.promises.writeFile(stylesPath, daisyUiDirectives);

    console.log(chalk.blue("Installing react , react-dom and sonner..."));
    await execa("npm", ["install", "react", "react-dom", "sonner"], {
      stdio: "inherit",
      shell: true,
    });

    await execa("npx", ["astro", "add", "react"], {
      stdio: "inherit",
      shell: true,
    });

    await execa("npm", ["install", "ngx-sonner"], {
      stdio: "inherit",
      shell: true,
    });

    console.log(chalk.blue("Creating a welcome page..."));

    const toastComponent = createToastMessage(useTailwind);
    await fs.promises.writeFile(
      `src/components/ToastDemo.${isTypeScript ? "tsx" : "jsx"}`,
      toastComponent
    );

    const PageHTML = createWelcomePageHTML(useTailwind);
    const htmlPath = path.join(projectPath, "src", "pages", "index.astro");
    await writeFile(htmlPath, PageHTML);

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
    console.log(chalk.greenBright("\n🎉 daisyui setup completed!."));
  } catch (error) {
    console.error(chalk.red("Error setting up daisyui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up daisyui manually after project creation."
      )
    );
  }
}
