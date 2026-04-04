import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { DaisyUIVue } from './ui/DaisyUIVue.js';
import { VuetifyVue } from './ui/VuetifyVue.js';
import { ShadcnVue } from './ui/ShadcnVue.js';
import { PrimeVueUI } from './ui/PrimeVueUI.js';
import { TailwindOnlyVue } from './ui/TailwindOnlyVue.js';
import { DefaultVue } from './ui/DefaultVue.js';

export class VueGenerator {
  static #UI_REGISTRY = new Map([
    ['daisyui', DaisyUIVue],
    ['vuetify', VuetifyVue],
    ['shadcn-vue', ShadcnVue],
    ['primevue', PrimeVueUI],
    ['tailwind-only', TailwindOnlyVue],
    ['twonly', TailwindOnlyVue],
    ['none', DefaultVue],
  ]);

  constructor({ projectName, language = 'js', styling = 'tailwind', uiLibrary = null }) {
    this.projectName = projectName;
    this.language = language;
    this.styling = styling;
    this.uiLibrary = uiLibrary;
  }

  async create() {
    await this.scaffold();
    await this.#applyUILibrary();
  }

  async scaffold() {
    const useTailwind = this.styling === 'tailwind';
    const createVueAppFlags = this.language === 'ts' ? ['--', '--ts'] : ['--', '--default'];

    console.log(chalk.blue(`\nCreating Vue project: ${this.projectName}`));
    console.log(this.language === 'ts' ? chalk.blue('Using TypeScript') : chalk.blue('Using JavaScript'));

    await execa('npm', ['create', 'vue@latest', this.projectName, ...createVueAppFlags], {
      stdio: 'ignore',
      shell: true,
    });

    console.log(chalk.yellow('Installing all the dependencies...'));
    process.chdir(this.projectName);

    await execa('npm', ['install'], { stdio: 'inherit' });

    if (useTailwind) {
      console.log(chalk.blue('Setting up Tailwind CSS...'));
      const projectPath = process.cwd();

      await execa('npm', ['install', 'tailwindcss@latest', '@tailwindcss/vite@latest'], { stdio: 'inherit' });

      const candidateFiles = ['vite.config.ts', 'vite.config.js'].map(f => path.join(projectPath, f));
      let configPath = null;
      let viteConfig = '';
      for (const p of candidateFiles) {
        if (fs.existsSync(p)) {
          configPath = p;
          viteConfig = fs.readFileSync(p, 'utf-8');
          break;
        }
      }
      if (!configPath) {
        configPath = path.join(projectPath, 'vite.config.js');
        viteConfig = '';
      }
      if (viteConfig && !viteConfig.includes('@tailwindcss/vite')) {
        viteConfig = `import tailwindcss from '@tailwindcss/vite'\n` + viteConfig;
      }
      if (viteConfig) {
        viteConfig = viteConfig.replace(
          /plugins:\s*\[\s*([\s\S]*?)\s*\]/,
          (match, plugins) => {
            if (plugins.includes('tailwindcss()')) return match;
            return `plugins: [\n    ${plugins.trim()}\n    tailwindcss()\n  ]`;
          }
        );
        fs.writeFileSync(configPath, viteConfig, 'utf-8');
      }

      const cssPath = path.join(projectPath, 'src', 'assets', 'main.css');
      const tailwindImport = `@import "tailwindcss";`;
      if (fs.existsSync(cssPath)) {
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        if (!cssContent.includes('@import "tailwindcss')) {
          fs.writeFileSync(cssPath, tailwindImport + '\n', 'utf-8');
        }
      } else {
        fs.mkdirSync(path.dirname(cssPath), { recursive: true });
        fs.writeFileSync(cssPath, tailwindImport, 'utf-8');
      }
      console.log(chalk.greenBright('\nTailwind CSS setup complete!'));
    }

    if (this.language === 'ts') {
      const envPath = path.join(process.cwd(), 'env.d.ts');
      const envContent = `/// <reference types="vite/client" />

declare module '*.vue' {
\timport type { DefineComponent } from 'vue'
\tconst component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
\texport default component
}
`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
    }

    console.log(chalk.green(`\n🎉 Vue project '${this.projectName}' created successfully!`));
  }

  async #applyUILibrary() {
    let libKey = this.uiLibrary;
    const useTailwind = this.styling === 'tailwind';

    if (libKey === null || libKey === undefined) {
      libKey = useTailwind ? 'tailwind-only' : 'none';
    }

    const aliasMap = { twonly: 'tailwind-only', 'tw-only': 'tailwind-only', tailwindonly: 'tailwind-only', plaincss: 'none' };
    if (aliasMap[libKey]) libKey = aliasMap[libKey];

    if (useTailwind && libKey === 'none') libKey = 'tailwind-only';

    const UIClass = VueGenerator.#UI_REGISTRY.get(libKey);
    if (!UIClass) {
      console.log(chalk.yellow(`UI library '${libKey}' not implemented for Vue.js.`));
      const defaultUI = new DefaultVue({ projectName: this.projectName, language: this.language, useTailwind });
      await defaultUI.setup();
      return;
    }

    const ui = new UIClass({ projectName: this.projectName, language: this.language, useTailwind });
    await ui.setup();

    // chdir back out after UI setup (VueGenerator called chdir into projectName during scaffold)
    process.chdir('..');
  }
}
