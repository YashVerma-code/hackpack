import fs from "fs";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import { createWelcomePage } from "../utils/utility.js";

export async function setupDefault(projectName, useTailwind) {
  console.log(chalk.blue("\nCreating a welcome page..."));
  const projectPath = process.cwd();

  try {
    await execa("npm", ["install", "vue-sonner"], {
      stdio: "inherit",
      shell: true,
    });
    console.log(chalk.blue("Creating a welcome page..."));

    // Clear main.css and base.css
    let clearCssFilePath;
    
    if(!useTailwind){
      clearCssFilePath = path.join(projectPath, "src", "assets", "main.css");
      await fs.promises.writeFile(
        clearCssFilePath,
        `* {\n  margin: 0;\n  padding: 0;\n}`
      );
    }
    clearCssFilePath = path.join(projectPath, "src", "assets", "base.css");
    fs.truncateSync(clearCssFilePath);

    // delete component folder created during vue installation.
    const pathToComponents = path.join(projectPath, "src", "components");
    fs.rmSync(pathToComponents, { recursive: true, force: true });

    const Pagecontent = createWelcomePage(useTailwind);
    const constentPath = path.join(projectPath, "src/App.vue");
    await fs.promises.writeFile(constentPath, Pagecontent);

    console.log(chalk.greenBright(`\n🚀 ${projectName} is ready to roll !.`));
  } catch (error) {
    console.error(chalk.red("Error creating Welcome Page:"), error.message);
  }
}
