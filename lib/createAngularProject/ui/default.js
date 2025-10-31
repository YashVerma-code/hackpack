import { writeFile } from "fs/promises";
import fs from "fs";
import chalk from "chalk";
import path from "path";
import { execa } from "execa";
import {
  createWelcomePageCSS,
  createWelcomePageHTML,
  updateAppComponent,
} from "../utils/utility.js";

export async function setupDefault(projectName, useTailwind) {
  console.log(chalk.blue("\nCreating a welcome page..."));
  const projectPath = process.cwd();
  try {
    await execa("npm", ["install", "ngx-sonner"], {
      stdio: "inherit",
      shell: true,
    });

    const PageHTML = createWelcomePageHTML(useTailwind);
    const PageCSS = createWelcomePageCSS(useTailwind);
    await updateAppComponent(projectPath);
    const htmlPath = path.join(projectPath, "src/app/app.html");
    const cssPath = path.join(projectPath, "src/app/app.css");
    const globalStylePath=path.join(projectPath,"src","styles.css");
    fs.appendFileSync(globalStylePath,"body{margin:0;padding:0;}")
    await writeFile(htmlPath, PageHTML);
    await writeFile(cssPath, PageCSS);

    console.log(chalk.greenBright("\n🎉 Setup completed!."));
  } catch (error) {
    console.error(chalk.red("Error creating Welcome Page:"), error.message);
  }
}
