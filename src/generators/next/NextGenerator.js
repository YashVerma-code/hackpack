import { execa } from 'execa';
import chalk from 'chalk';
import { ShadcnUINext } from './ui/ShadcnUINext.js';
import { DaisyUINext } from './ui/DaisyUINext.js';
import { HeroUINext } from './ui/HeroUINext.js';
import { AceternityUINext } from './ui/AceternityUINext.js';
import { TailwindOnlyNext } from './ui/TailwindOnlyNext.js';
import { ChakraUINext } from './ui/ChakraUINext.js';
import { MaterialUINext } from './ui/MaterialUINext.js';
import { PlainCSSNext } from './ui/PlainCSSNext.js';

export class NextGenerator {
  static #UI_REGISTRY = new Map([
    ['shadcn', ShadcnUINext],
    ['daisyui', DaisyUINext],
    ['heroui', HeroUINext],
    ['aceternityui', AceternityUINext],
    ['aceui', AceternityUINext],
    ['tailwind-only', TailwindOnlyNext],
    ['twonly', TailwindOnlyNext],
    ['tailwindonly', TailwindOnlyNext],
    ['chakraui', ChakraUINext],
    ['chakra', ChakraUINext],
    ['mui', MaterialUINext],
    ['plain', PlainCSSNext],
    ['plaincss', PlainCSSNext],
    ['none', PlainCSSNext],
  ]);

  constructor({ projectName, language = 'ts', styling = 'tailwind', uiLibrary = null }) {
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
    const flags = this.#buildFlags();
    const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: 'true' };
    console.log(chalk.blue(`Creating Next.js project: ${this.projectName}`));
    await execa('npx', ['create-next-app@latest', this.projectName, ...flags], { stdio: 'inherit', env });
    console.log(chalk.green(`Next.js project '${this.projectName}' created!`));
  }

  #buildFlags() {
    const flags = [];
    if (this.language === 'ts') {
      flags.push('--typescript');
    } else {
      flags.push('--no-typescript', '--js');
    }
    flags.push(this.styling === 'tailwind' ? '--tailwind' : '--no-tailwind');
    flags.push('--eslint=true', '--app=true', '--src-dir=true', '--no-import-alias', '--use-npm', '--no-experimental-app');
    return flags;
  }

  async #applyUILibrary() {
    let libKey = this.uiLibrary ?? (this.styling === 'tailwind' ? 'tailwind-only' : 'plain');
    if (libKey === null || libKey === 'none') {
      libKey = this.styling === 'tailwind' ? 'tailwind-only' : 'plain';
    }

    const UIClass = NextGenerator.#UI_REGISTRY.get(libKey);
    if (!UIClass) {
      console.log(chalk.yellow(`UI library '${libKey}' not implemented for Next.js.`));
      return;
    }
    const ui = new UIClass({ projectName: this.projectName, language: this.language });
    await ui.setup();
  }
}
