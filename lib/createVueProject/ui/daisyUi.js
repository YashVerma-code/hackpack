import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import fs from "fs";
import { createWelcomePage } from "../utils/utility.js";

export async function setupDaisyUi(projectName) {
  console.log(chalk.blue("Setting up daisyui..."));

  const projectPath = process.cwd();

  try {
    await execa("npm", ["install", "daisyui@latest"], {
      stdio: "inherit",
      shell: true,
    });

    const stylesPath = path.join(projectPath, "src", "assets", "main.css");
    const daisyUiDirectives =
      `@import "tailwindcss";\n@plugin "daisyui";`.trim();

    await fs.promises.writeFile(stylesPath, daisyUiDirectives);

    console.log(chalk.greenBright("\n🎉 daisyui setup complete!."));
    
    await execa("npm", ["install", "vue-sonner"], {
      stdio: "inherit",
      shell: true,
    });
    
    console.log(chalk.blue("Creating a welcome page..."));
    
    const Pagecontent = createWelcomePage(true);
    const constentPath = path.join(projectPath, "src/App.vue");
    await fs.promises.writeFile(constentPath, Pagecontent);
    
    
    
    // delete component folder created during vue installation.
    const pathToComponents=path.join(projectPath,"src","components");
    fs.rmSync(pathToComponents, { recursive: true, force: true });
    
    console.log(chalk.greenBright(`\n🚀 ${projectName} is ready to roll !.`));
  } catch (error) {
    console.error(chalk.red("Error setting up daisyui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up daisyui manually after project creation."
      )
    );
  }
}
