import fs from "fs";
import { writeFile, unlink } from "fs/promises";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import {
  createToastMessage,
  createWelcomePageHTML,
  toastStyle,
} from "../utils/utility.js";

export async function setupDefault(projectName, isTypeScript, useTailwind) {
  console.log(chalk.blue("\nCreating a welcome page..."));
  const projectPath = process.cwd();
  try {
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

    const toastComponent = createToastMessage(useTailwind);
    await fs.promises.writeFile(
      `src/components/ToastDemo.${isTypeScript ? "tsx" : "jsx"}`,
      toastComponent
    );

    const stylesDir = path.join("src", "styles");
    await fs.promises.mkdir(stylesDir, { recursive: true });

    if (!useTailwind) {
      const toastCSS = toastStyle();
      try {
        await writeFile(path.join(stylesDir, "toast.css"), toastCSS);
      } catch (err) {
        console.error(chalk.yellow("Error creating toast.css:", err));
      }
    }

    const stylesPath = path.join(stylesDir, "global.css");
    try {
      if(useTailwind){
        await writeFile(stylesPath, `@import "tailwindcss";`);
      }
    } catch (err) {
      console.error(chalk.yellow("Error creating global.css:", err));
    }

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
    console.log(chalk.greenBright("\n🎉 Setup completed!."));
  } catch (error) {
    console.error(chalk.red("Error creating Welcome Page:"), error.message);
  }
}
