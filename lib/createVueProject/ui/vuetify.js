import fs from "fs";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import {
  createWelcomePage,
  vuetifyBaseCSS,
  vuetifyMainJsContent,
} from "../utils/utility.js";

export async function setupVuetify(projectName, useTailwind) {
  console.log(chalk.blue("\nSetting up vuetify..."));
  const projectPath = process.cwd();

  try {
    await execa("npm", ["install", "vuetify"], {
      stdio: "inherit",
      shell: true,
    });
    const pathToMainJS = path.join(projectPath, "main.js");
    const mainjsContent = vuetifyMainJsContent();

    await fs.promises.writeFile(pathToMainJS, mainjsContent);
    console.log(chalk.greenBright("\n🎉 Vuetify setup completed!."));

    await execa("npm", ["install", "vue-sonner"], {
      stdio: "inherit",
      shell: true,
    });
    console.log(chalk.blue("Creating a welcome page..."));

    const Pagecontent = createWelcomePage(useTailwind);
    const constentPath = path.join(projectPath, "src/App.vue");
    await fs.promises.writeFile(constentPath, Pagecontent);

    let clearCssFilePath = path.join(projectPath, "src", "assets", "main.css");
    await fs.promises.writeFile(
      clearCssFilePath,
      `${useTailwind?(`@import "tailwindcss";\n@import './base.css';\n`):(`@import './base.css';`)}`
    );

    const baseCssContent = vuetifyBaseCSS(useTailwind);
    clearCssFilePath = path.join(projectPath, "src", "assets", "base.css");
    await fs.promises.writeFile(clearCssFilePath, baseCssContent);

    // delete component folder created during vue installation.
    const pathToComponents = path.join(projectPath, "src", "components");
    fs.rmSync(pathToComponents, { recursive: true, force: true });

    console.log(chalk.greenBright(`\n🚀 ${projectName} is ready to roll !`));
  } catch (error) {
    console.error(chalk.red("Error setting up vuetify:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up vuetify manually after project creation."
      )
    );
  }
}
