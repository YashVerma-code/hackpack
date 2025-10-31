import { execa } from "execa";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { createWelcomePageCSS, createWelcomePageHTML, updateAppComponent } from "../utils/utility.js";

export async function setupPrimeNg(projectName, useTailwind) {
  console.log(chalk.blue("Setting up primeNG/ui..."));
  const projectPath = process.cwd();

  try {
    await execa("npm", ["install", "primeng", "@primeng/themes", "--force"], {
      stdio: "inherit",
      shell: true
    })

    await execa("npm", ["install", "ngx-sonner", "--force"], {
      stdio: "inherit",
      shell: true
    })
    const filePath = path.join(projectPath, 'src/app/app.config.ts');
    await modifyAppConfig(filePath);

    console.log(chalk.blue("\nCreating a welcome page..."));

    const PageHTML = createWelcomePageHTML(useTailwind, false, false, true);
    const PageCSS = createWelcomePageCSS(useTailwind);
    await updateAppComponent(projectPath, false, true);
    const htmlPath = path.join(projectPath, "src/app/app.html");
    const cssPath = path.join(projectPath, "src/app/app.css");
    await fs.writeFile(htmlPath, PageHTML);
    await fs.writeFile(cssPath, PageCSS);
  } catch (error) {
    console.error(
      chalk.red("\nError setting up primeNG/ui:"),
      error.message
    );
    console.log(
      chalk.yellow(
        "You may need to set up primeNG manually after project creation."
      )
    );
  }
}

async function modifyAppConfig(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');

  // Imports to inject if missing
  const importLines = [
    `import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';`,
    `import { providePrimeNG } from 'primeng/config';`,
    `import Aura from '@primeng/themes/aura';`
  ];


  for (const importLine of importLines) {
    if (!content.includes(importLine)) {
      content = importLine + '\n' + content;
    }
  }

  // Modify providers array
  content = content.replace(
    /providers:\s*\[(.*?)\]/s,
    (match, inner) => {
      const newProviders = `
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })`;

      // Avoid duplicates
      if (inner.includes('providePrimeNG')) return match;

      return `providers: [${inner.trim() ? inner.trim() + ',' : ''}${newProviders}]`;
    }
  );

  await fs.writeFile(filePath, content, 'utf-8');
  console.log(chalk.green('\n✅ app.config.ts updated successfully!'));
}


