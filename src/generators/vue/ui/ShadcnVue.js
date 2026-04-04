import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';

export class ShadcnVue extends BaseUILibrary {
  static id = 'shadcn-vue';
  static displayName = 'shadcn/vue';
  static requiresTailwind = true;

  constructor({ projectName, language = 'js', useTailwind = true }) {
    super();
    this.projectName = projectName;
    this.language = language;
    this.useTailwind = useTailwind;
  }

  getDependencies() {
    return ['shadcn-vue'];
  }

  async setup() {
    console.log(chalk.blue('Setting up shadcn-vue...'));

    const originalCwd = process.cwd();
    let changedDir = false;
    try {
      const currentBase = path.basename(originalCwd);
      if (currentBase !== this.projectName) {
        const targetDir = path.resolve(originalCwd, this.projectName);
        process.chdir(targetDir);
        changedDir = true;
      }
    } catch (err) {
      console.error(chalk.red(`Unable to change directory to project '${this.projectName}': ${err.message}`));
      throw err;
    }

    try {
      console.log(chalk.blue('Initializing shadcn-vue...'));

      try {
        await this.#ensureImportAlias();
      } catch (err) {
        console.log(chalk.yellow('Could not ensure import alias in tsconfig/jsconfig:'), err.message);
      }

      await execa('npx', ['shadcn-vue@latest', 'init'], {
        stdio: 'inherit',
        env: { ...process.env, CI: 'true' }
      });

      console.log(chalk.blue('Adding Button component...'));
      await execa('npx', ['shadcn-vue@latest', 'add', 'button'], { stdio: 'inherit' });

      console.log(chalk.blue('Adding Toast component...'));
      await execa('npx', ['shadcn-vue@latest', 'add', 'sonner'], { stdio: 'inherit' });

      console.log(chalk.blue('Creating a welcome page...'));

      const fileExt = this.language === 'ts' ? 'ts' : 'js';
      const appPath = `src/App.vue`;
      const mainPath = `src/main.${fileExt}`;

      try {
        await this.#writeMainFile(fileExt);
      } catch (err) {
        try {
          const mainContent = await fs.readFile(mainPath, 'utf8');
          if (mainContent) {
            const updatedMainContent = this.#addToasterToMain(mainContent);
            await fs.writeFile(mainPath, updatedMainContent);
          }
        } catch (e) {
          // ignore
        }
      }

      const appContent = this.#createWelcomePage();
      await fs.writeFile(appPath, appContent);

      await this.#updateIndexHtml();

      console.log(chalk.green('shadcn-vue setup completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Error setting up shadcn-vue:'), error.message);
      console.log(chalk.yellow('You may need to set up shadcn-vue manually after project creation.'));
    }

    try {
      if (changedDir) process.chdir(originalCwd);
    } catch (err) {
      console.log(chalk.yellow(`Warning: could not restore working directory: ${err.message}`));
    }
  }

  #addToasterToMain(mainContent) {
    if (!mainContent.includes("import { Toaster }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      const toasterImport = 'import { Toaster } from "./components/ui/sonner";';
      if (lastImportIndex > 0) {
        mainContent =
          mainContent.substring(0, lastImportIndex) +
          '\n' + toasterImport +
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = toasterImport + '\n' + mainContent;
      }
    }
    return mainContent;
  }

  async #updateIndexHtml() {
    try {
      const indexPath = 'index.html';
      let indexContent = await fs.readFile(indexPath, 'utf8');
      indexContent = indexContent.replace(
        /<title>.*?<\/title>/,
        '<title>HackPack Turbo — Build Fast, Ship Faster</title>'
      );
      if (indexContent.includes('name="description"')) {
        indexContent = indexContent.replace(
          /<meta name="description" content=".*?">/,
          '<meta name="description" content="Web application created with HackPack">'
        );
      } else {
        indexContent = indexContent.replace(
          '</head>',
          '    <meta name="description" content="Web application created with HackPack">\n  </head>'
        );
      }
      await fs.writeFile(indexPath, indexContent);
    } catch (error) {
      console.log(chalk.yellow('Could not update index.html'));
    }
  }

  #createWelcomePage() {
    return `<script setup lang="ts">
import { Button } from "./components/ui/button"
import { toast } from "vue-sonner"
import 'vue-sonner/style.css'

const handleClick = () => {
  toast("Success!", {
    description: "You've installed shadcn-vue with HackPack 🚀"
  })
}
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center p-24 bg-linear-to-b from-slate-900 to-slate-800">
    <div class="z-10 max-w-5xl w-full items-center justify-center text-center">
      <h1 class="text-5xl font-bold mb-6 text-white">
        Welcome to <span class="text-blue-400">HackPack</span>
      </h1>

      <p class="text-lg mb-8 text-slate-300">
        Build Fast, Ship Faster!🚀
        <br />
        This project is set up with Vue.js and shadcn-vue.
      </p>

      <Button
        @click="handleClick"
        variant="outline"
      >
        Click me for a toast notification
      </Button>
      <p class="mt-12 text-sm text-slate-400">
        Edit <code class="font-mono bg-slate-700 p-1 rounded">src/App.vue</code> to get started
      </p>
    </div>

    <Toaster />
  </main>
</template>
`;
  }

  async #writeMainFile(fileExt) {
    const mainPath = `src/main.${fileExt}`;
    const content = `import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { Toaster } from './components/ui/sonner/'

const app = createApp(App)
app.component('Toaster', Toaster)
app.mount('#app')
`;
    await fs.writeFile(mainPath, content, 'utf8');
  }

  async #ensureImportAlias() {
    const tsPath = path.resolve(process.cwd(), 'tsconfig.json');
    const jsPath = path.resolve(process.cwd(), 'jsconfig.json');
    let cfgPath = null;

    if (await this.#exists(tsPath)) cfgPath = tsPath;
    else if (await this.#exists(jsPath)) cfgPath = jsPath;
    if (!cfgPath) return;

    try {
      let content = await fs.readFile(cfgPath, 'utf8');
      const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      let json = {};
      try {
        json = JSON.parse(stripped);
      } catch (e) {
        try { json = JSON.parse(content); } catch (_) { return; }
      }
      json.compilerOptions = json.compilerOptions || {};
      if (!json.compilerOptions.baseUrl) json.compilerOptions.baseUrl = '.';
      json.compilerOptions.paths = json.compilerOptions.paths || {};
      if (!json.compilerOptions.paths['@/*']) {
        json.compilerOptions.paths['@/*'] = ['src/*'];
      }
      await fs.writeFile(cfgPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(chalk.green(`Wrote import alias to ${path.basename(cfgPath)}`));
    } catch (err) {
      console.log(chalk.yellow('Failed to update tsconfig/jsconfig for import alias:'), err.message);
    }
  }

  async #exists(p) {
    try {
      await fs.access(p);
      return true;
    } catch (e) {
      return false;
    }
  }
}
