import fs from "fs";
import chalk from "chalk";
import { writeFile,readFile } from "fs/promises";
import path from "path";
import { execa } from "execa";
import { createWelcomePageCSS, createWelcomePageHTML, updateAppComponent } from "../utils/utility.js";

export async function setupAngularMaterial({projectName, useTailwind}) {
  console.log(chalk.blue("Setting up angular-material/ui..."));

  const projectPath = process.cwd();
  try {
    await execa("ng", ["add", "@angular/material"], {
      stdio: "inherit",
      shell: true,
    });

    await execa("npm",["install","ngx-sonner"],{
      stdio:"inherit",
      shell:true
    })
    console.log(chalk.blue("Creating a welcome page..."));

    const PageHTML = createWelcomePageHTML(useTailwind,true);
    const PageCSS = createWelcomePageCSS(useTailwind);
    await updateAppComponent(projectPath,true);
    const htmlPath = path.join(projectPath, "src/app/app.html");
    const cssPath = path.join(projectPath, "src/app/app.css");
    await writeFile(htmlPath, PageHTML); 
    await writeFile(cssPath, PageCSS);
    console.log(
      chalk.green("\n🎉angular-material/ui setup completed successfully!")
    );
  } catch (error) {
    console.error(
      chalk.red("Error setting up angular-material/ui:"),
      error.message
    );
    console.log(
      chalk.yellow(
        "You may need to set up angular-material manually after project creation."
      )
    );
  }
}


