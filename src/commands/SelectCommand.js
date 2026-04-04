import { BaseCommand } from './BaseCommand.js';

/**
 * Sets individual project preferences in state.
 * Handles: `hp select fw|lang|styling|ui <value>`
 *
 * Sub-command dispatch is handled here directly, keeping all
 * "select" validation logic in one place.
 */
export class SelectCommand extends BaseCommand {
  async execute() {
    const sub = this.args[1];
    const state = this.stateManager.load();

    switch (sub) {
      case 'fw':
        this.#setFramework(state);
        break;
      case 'lang':
        this.#setLanguage(state);
        break;
      case 'styling':
        this.#setStyling(state);
        break;
      case 'ui':
        this.#setUILibrary(state);
        break;
      default:
        this.logger.error('Unknown select target. Use: fw | lang | styling | ui');
        process.exit(1);
    }
  }

  #setFramework(state) {
    const fw = this.args[2];
    const valid = ['next', 'vite', 'vite-react', 'svelte', 'vue', 'angular', 'astro', 'nuxt'];

    if (!fw) {
      this.logger.error('Missing framework value.');
      process.exit(1);
    }
    if (!valid.includes(fw.toLowerCase())) {
      this.logger.error(`Invalid framework. Supported: ${valid.join(', ')}`);
      process.exit(1);
    }

    if (state.framework && state.framework !== fw) {
      this.logger.info('\nFramework Migration Notice:');
      this.logger.warn(`Switching framework: ${state.framework} → ${fw}`);
      this.logger.warn('This will create a new project with the selected framework.');
      this.logger.info('Note: Smart cross-framework migrations are planned in future releases.');
      this.logger.dim('Back up your code before proceeding.\n');
    }

    state.framework = fw;
    state.step = state.projectName ? 'ready' : 'framework';
    this.stateManager.save(state);
    this.logger.success(`Framework set to ${fw}`);
    process.exit(0);
  }

  #setLanguage(state) {
    const lang = this.args[2];

    if (!lang || !['ts', 'js'].includes(lang)) {
      this.logger.error('Language must be ts or js');
      process.exit(1);
    }
    if (state.framework === 'angular' && lang === 'js') {
      this.logger.error('Angular projects must use TypeScript.');
      process.exit(1);
    }

    if (state.language && state.language !== lang) {
      const from = state.language === 'ts' ? 'TypeScript' : 'JavaScript';
      const to = lang === 'ts' ? 'TypeScript' : 'JavaScript';
      this.logger.info('Language Migration Notice:');
      this.logger.warn(`Switching language: ${from} → ${to}`);
      this.logger.warn('This will create a new project with the selected language.');
      this.logger.info(`Note: Automated ${from} ↔ ${to} migrations are planned.`);
      this.logger.dim('Back up your code before proceeding.\n');
    }

    state.language = lang;
    state.step = 'language';
    this.stateManager.save(state);
    this.logger.success(`Language set to ${lang}`);
    process.exit(0);
  }

  #setStyling(state) {
    const styling = this.args[2];

    if (!styling || !['tailwind', 'plain'].includes(styling)) {
      this.logger.error('Styling must be tailwind or plain');
      process.exit(1);
    }

    if (state.styling && state.styling !== styling) {
      const from = state.styling === 'tailwind' ? 'Tailwind CSS' : 'Plain CSS';
      const to = styling === 'tailwind' ? 'Tailwind CSS' : 'Plain CSS';
      this.logger.info('Styling Migration Notice:');
      this.logger.warn(`Switching styling: ${from} → ${to}`);
      this.logger.info(`Note: Smart ${from} ↔ ${to} migrations are planned.`);
      this.logger.dim('Back up your code before proceeding.\n');
    }

    state.styling = styling;
    state.step = 'styling';
    this.stateManager.save(state);
    this.logger.success(`Styling set to ${styling}`);
    process.exit(0);
  }

  #setUILibrary(state) {
    const ui = this.args[2];

    if (!ui) {
      this.logger.error('Missing UI library value.');
      process.exit(1);
    }

    if (state.uiLibrary && state.uiLibrary !== ui) {
      this.logger.info('UI Library Migration Notice:');
      this.logger.warn(`Switching UI library: ${state.uiLibrary} → ${ui}`);
      this.logger.warn('This will create a new project with the selected UI library.');
      this.logger.info('Note: Smart UI library migrations are planned in future releases.');
      this.logger.dim('Back up your code before proceeding.\n');
    }

    state.uiLibrary = ui;
    state.step = 'uiLibrary';
    this.stateManager.save(state);
    this.logger.success(`UI library set to ${ui}`);
    process.exit(0);
  }
}
