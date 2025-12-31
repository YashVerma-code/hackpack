import fs from "fs";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import { createWelcomePage, primeVueMainJsContent } from "../utils/utility.js";

export async function setupPrimeVue(projectName, useTailwind) {
  console.log(chalk.blue("Setting up primevue..."));
  const projectPath = process.cwd();

  try {
    await execa("npm", ["install", "primevue", "@primeuix/themes"], {
      stdio: "inherit",
      shell: true,
    });
    const mainJsContent = primeVueMainJsContent();
    const pathToMainJs = path.join(projectPath, "src", "main.js");
    await fs.promises.writeFile(pathToMainJs, mainJsContent);

    console.log(chalk.greenBright("\n🎉 PrimeVue setup completed!."));

    await execa("npm", ["install", "vue-sonner"], {
      stdio: "inherit",
      shell: true,
    });

    console.log(chalk.blue("Creating a welcome page..."));

    const Pagecontent = createWelcomePage(useTailwind, false, true);
    const constentPath = path.join(projectPath, "src/App.vue");
    await fs.promises.writeFile(constentPath, Pagecontent);

    let clearCssFilePath;
    if(!useTailwind){
      clearCssFilePath = path.join(projectPath, "src", "assets", "main.css");
      await fs.promises.writeFile(
        clearCssFilePath,
        `* {\n  margin: 0;\n  padding: 0;\n}`
      );
    }else{
      clearCssFilePath = path.join(projectPath, "src", "assets", "main.css");
      await fs.promises.writeFile(
        clearCssFilePath,
        `@import "tailwindcss";\n@import './base.css';`
      );
    }
    clearCssFilePath = path.join(projectPath, "src", "assets", "base.css");
    fs.truncateSync(clearCssFilePath);

    // delete component folder created during vue installation.
    const pathToComponents = path.join(projectPath, "src", "components");
    fs.rmSync(pathToComponents, { recursive: true, force: true });

    console.log(chalk.greenBright(`\n🚀 ${projectName} is ready to roll !`));
  } catch (error) {
    console.error(chalk.red("Error setting up primeVue:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up PrimeVue manually after project creation."
      )
    );
  }
}
