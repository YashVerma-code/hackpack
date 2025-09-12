import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import fs from "fs";
import {
  createWelcomePage,
  inspiraMainCSSContent,
  utilContent,
} from "../utils/utility.js";

export async function setupInspiraUi(projectName) {
  console.log(chalk.blue("Setting up inspiraui..."));
  const projectPath = process.cwd();
  
  try {
    await execa(
      "npm",
      [
        "install",
        "-D",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
        "tw-animate-css",
      ],
      {
        stdio: "inherit",
        shell: true,
      }
    );
    
    await execa("npm", ["install", "@vueuse/core", "motion-v"], {
      stdio: "inherit",
      shell: true,
    });
    
    await execa("npm", ["install", "vue-sonner"], {
      stdio: "inherit",
      shell: true,
    });
    const maincss = inspiraMainCSSContent();
    const pathToMainCSS = path.join(projectPath, "src", "assets", "main.css");
    
    fs.writeFileSync(pathToMainCSS, maincss);
    
    const clearCssFilePath = path.join(
      projectPath,
      "src",
      "assets",
      "base.css"
    );
    fs.truncateSync(clearCssFilePath);
    
    const utilsPath = path.join(process.cwd(), "lib", "utils.js");
    
    // Ensure the "lib" directory exists
    if (!fs.existsSync(path.dirname(utilsPath))) {
      fs.mkdirSync(path.dirname(utilsPath), { recursive: true });
    }
    
    const content = utilContent();
    fs.writeFileSync(utilsPath, content);
    console.log("✅ lib/utils.js file created successfully!");
    console.log(chalk.greenBright("\n🎉 Inspira ui setup completed!."));

    console.log(chalk.blue("Creating a welcome page..."));
    
    const Pagecontent = createWelcomePage(true, true);
    const constentPath = path.join(projectPath, "src/App.vue");
    await fs.promises.writeFile(constentPath, Pagecontent);

    console.log(chalk.greenBright(`\n🚀 ${projectName} is ready to roll !.`));
  } catch (error) {
    console.error(chalk.red("Error setting up inspira ui:"), error.message);
    console.log(
      chalk.yellow(
        "You may need to set up inspiraUi manually after project creation."
      )
    );
  }
}
