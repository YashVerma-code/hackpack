import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';

export class DaisyUINext extends BaseUILibrary {
  static id = 'daisyui';
  static displayName = 'daisyUI';
  static requiresTailwind = true;

  constructor({ projectName, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.language = language;
  }

  getDependencies() {
    return ['daisyui', 'sonner', 'tailwindcss', '@tailwindcss/postcss'];
  }

  async setup() {
    process.chdir(this.projectName);

    console.log(chalk.blue(`Setting up daisyUI with ${this.language === 'ts' ? 'TypeScript' : 'JavaScript'}...`));

    try {
      console.log(chalk.blue('Installing Tailwind CSS and dependencies...'));
      await execa('npm', ['install', '-D', 'tailwindcss', '@tailwindcss/postcss'], { stdio: 'inherit' });

      const postcssConfigPath = path.join(process.cwd(), 'postcss.config.mjs');
      const postcssConfigContent = `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
`;
      await fs.writeFile(postcssConfigPath, postcssConfigContent, 'utf8');
      console.log(chalk.green('Updated postcss.config.mjs with Tailwind CSS plugin'));

      console.log(chalk.blue('Installing daisyUI...'));
      await execa('npm', ['install', 'daisyui@latest'], { stdio: 'inherit' });

      console.log(chalk.blue('Installing toast component...'));
      await execa('npm', ['install', 'sonner'], { stdio: 'inherit' });

      const globalCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
      const tailwindDirectives = `@import "tailwindcss";\n@plugin "daisyui";`;
      await fs.writeFile(globalCssPath, tailwindDirectives, 'utf8');

      const componentsDir = path.join(process.cwd(), 'src', 'components');
      await fs.mkdir(componentsDir, { recursive: true });

      const toastComponentDir = path.join(componentsDir, 'ui');
      await fs.mkdir(toastComponentDir, { recursive: true });

      console.log(chalk.blue('Creating toast component...'));
      const toasterExt = this.language === 'ts' ? 'tsx' : 'js';
      const toasterComponentPath = path.join(toastComponentDir, `toaster.${toasterExt}`);
      await fs.writeFile(toasterComponentPath,
        `"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      className="z-50"
    />
  );
}
`, 'utf8');

      console.log(chalk.blue('Creating a welcome page...'));

      const fileExt = this.language === 'ts' ? 'tsx' : 'js';
      const layoutPath = `src/app/layout.${fileExt}`;
      const pagePath = `src/app/page.${fileExt}`;

      const layoutContent = await fs.readFile(layoutPath, 'utf8');
      if (layoutContent) {
        let updatedLayoutContent = this.#addToasterToLayout(layoutContent, fileExt);
        updatedLayoutContent = this.#updatePageTitle(updatedLayoutContent);
        updatedLayoutContent = updatedLayoutContent.replace(
          '<html lang="en">',
          '<html lang="en" data-theme="corporate">'
        );
        await fs.writeFile(layoutPath, updatedLayoutContent);
      }

      const pageContent = this.#createWelcomePage(fileExt);
      await fs.writeFile(pagePath, pageContent);

      console.log(chalk.green('daisyUI setup completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Error setting up daisyUI:'), error.message);
      console.log(chalk.yellow('You may need to set up daisyUI manually after project creation.'));
    }

    process.chdir('..');
  }

  #addToasterToLayout(layoutContent, fileExt) {
    if (!layoutContent.includes("import { Toaster }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      while ((match = importRegex.exec(layoutContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      const toasterComponent = 'import { Toaster } from "@/components/ui/toaster";';
      if (lastImportIndex > 0) {
        layoutContent =
          layoutContent.substring(0, lastImportIndex) +
          '\n' + toasterComponent +
          layoutContent.substring(lastImportIndex);
      } else {
        layoutContent = toasterComponent + '\n' + layoutContent;
      }
    }
    if (!layoutContent.includes("<Toaster />")) {
      if (layoutContent.includes("{children}")) {
        layoutContent = layoutContent.replace("{children}", "{children}\n        <Toaster />");
      } else {
        layoutContent = layoutContent.replace("</body>", "        <Toaster />\n      </body>");
      }
    }
    return layoutContent;
  }

  #updatePageTitle(layoutContent) {
    if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
      layoutContent = layoutContent.replace("title: 'Create Next App'", 'title: "HackPack Turbo — Build Fast, Ship Faster"');
      if (layoutContent.includes('description:')) {
        layoutContent = layoutContent.replace("description: 'Generated by create next app'", 'description: "Web application created with HackPack"');
      }
    }
    return layoutContent;
  }

  #createWelcomePage(fileExt) {
    const editFile = fileExt === 'js' ? 'page.js' : 'page.tsx';
    return `"use client"

import { toast } from "sonner";

export default function Home() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed daisyUI with HackPack 🚀",
    });
  };

  return (
  <>
    <div className="hero min-h-screen bg-gradient-to-b from-primary to-secondary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary-content">Welcome to <span className="text-accent">HackPack</span></h1>
          <p className="py-6 text-primary-content">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Next.js and daisyUI.
          </p>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={handleClick}
              className="btn btn-primary"
            >
              Click me for a toast notification
            </button>

            <div className="mt-8 flex gap-4">
              <div className="badge badge-primary">daisyUI</div>
              <div className="badge badge-secondary">Next.js</div>
              <div className="badge badge-accent">HackPack</div>
            </div>
          </div>

          <div className="divider"></div>

          <p className="text-sm opacity-70">
            Edit <code className="bg-base-300 px-1 rounded">src/app/${editFile}</code> to get started
          </p>
        </div>
      </div>
    </div>
    </>
  );
}`;
  }
}
