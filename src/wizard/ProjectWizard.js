import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';

import { StateManager } from '../core/StateManager.js';
import { Logger } from '../core/Logger.js';
import { FrameworkFactory } from '../factories/FrameworkFactory.js';
import { ProjectOrchestrator } from './ProjectOrchestrator.js';

/**
 * Interactive multi-step wizard for creating a new project.
 *
 * Pattern: Builder
 *   - Collects project configuration one field at a time via prompts.
 *   - Persists intermediate state so users can resume after interruption.
 *   - Delegates final creation to ProjectOrchestrator.
 *
 * Pattern: State Machine (embedded)
 *   - #runWizardLoop() iterates until all fields are collected.
 *   - Each step method mutates #state and calls #persist().
 *   - Back-navigation is achieved by clearing the relevant field(s);
 *     the loop naturally re-prompts for the cleared field.
 *
 * SOLID:
 *   - SRP  — wizard only collects config; ProjectOrchestrator does the work.
 *   - OCP  — framework/UI choices are read from factories, not hardcoded here.
 *   - DIP  — depends on StateManager and factory abstractions.
 */
export class ProjectWizard {
  /** @type {StateManager} */
  #stateManager = StateManager.getInstance();

  /** Accumulated project configuration. */
  #state = {
    framework: null,
    projectName: null,
    language: null,
    styling: null,
    uiLibrary: undefined,
    database: null,
    authentication: null,
    step: null,
  };

  /** Whether we are continuing from a previously saved project. */
  #resumeMode = false;

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Run the full wizard flow.
   * @param {{ resume?: boolean }} [options]
   */
  async run(options = {}) {
    this.#resumeMode = !!options.resume;
    this.#showBanner();
    this.#initState();

    if (!this.#resumeMode) {
      const active = this.#stateManager.load();
      if (active?.projectName && active?.framework) {
        Logger.warn(`Found activated project '${active.projectName}'.`);
        Logger.warn('To resume it, run: hp resume');
        Logger.warn('To activate a different project: hp projects use <name>');
      }
    }

    try {
      await this.#runWizardLoop();
      await this.#confirmAndCreate();
    } catch (error) {
      if (
        error?.name === 'ExitPromptError' ||
        /force closed/i.test(error?.message ?? '')
      ) {
        console.log(chalk.yellow('\n\n👋 Thanks for using hackpack! Goodbye!'));
        process.exit(0);
      }
      Logger.error('Unexpected error: ' + (error.message ?? error));
      process.exit(1);
    }
  }

  // ── Banner ─────────────────────────────────────────────────────────────────

  #showBanner() {
    const width = process.stdout.columns || 80;
    const banner = this.#buildBanner(width);
    console.log(chalk.red.bold(banner));
  }

  #buildBanner(terminalWidth) {
    const rocketLines = [
      '      |        ',
      '     / \\       ',
      '    / _ \\      ',
      '   |  H  |     ',
      '   |  P  |     ',
      " .'|  |  |'.   ",
      '/  |__|__|  \\  ',
      '|.- -- -- -.|  ',
    ];
    const rocket = rocketLines.map(l => chalk.redBright(l));

    if (terminalWidth < 40) {
      return `\n${chalk.red.bold('HACKPACK')}\n${chalk.gray(' Build Fast, Ship Faster')}`;
    }
    if (terminalWidth < 60) {
      return `${chalk.red.bold('HACKPACK')}\n${chalk.gray('Build Fast, Ship Faster')}`;
    }
    if (terminalWidth < 90) {
      const title = figlet.textSync('h a c k p a c k', { font: 'Small' });
      return `${title}\n${chalk.gray('             Build Fast, Ship Faster')}`;
    }

    const title = figlet.textSync('hackpack', { font: 'ANSI Shadow' });
    const titleLines = title.split('\n');
    const paddingTop = Math.max(
      0,
      Math.floor((rocket.length - titleLines.length) / 2) + 2
    );
    const emptyLine = ' '.repeat(titleLines[0]?.length ?? 0);
    const paddedTitle = [...Array(paddingTop).fill(emptyLine), ...titleLines];
    const maxLines = Math.max(rocket.length, paddedTitle.length);
    const merged = Array.from({ length: maxLines }, (_, i) => {
      const l = rocket[i] ?? ' '.repeat((rocket[0] ?? '').length);
      const r = paddedTitle[i] ?? '';
      return `${l}  ${chalk.red(r)}`;
    }).join('\n');

    return `${merged}\n${chalk.gray('                                   Build Fast, Ship Faster')}`;
  }

  // ── State Initialisation ───────────────────────────────────────────────────

  #initState() {
    if (this.#resumeMode) {
      const saved = this.#stateManager.load();
      this.#state = { ...this.#state, ...saved };
    }
  }

  #persist(patch = {}) {
    Object.assign(this.#state, patch);
    if (this.#state.uiLibrary === undefined) this.#state.uiLibrary = null;

    try {
      if (this.#resumeMode) {
        this.#stateManager.save({ ...this.#state });
      } else if (this.#state.projectName) {
        this.#stateManager.upsert({ ...this.#state });
      }
    } catch {
      // Persistence errors during interim saves are non-fatal.
    }
  }

  // ── Step Machine ───────────────────────────────────────────────────────────

  async #runWizardLoop() {
    while (true) {
      // Step 1 — Project name
      if (!this.#state.projectName) {
        await this.#collectProjectName();
        continue;
      }

      // Step 2 — Framework
      if (!this.#state.framework) {
        await this.#collectFramework();
        continue;
      }

      // Step 3 — Language (skipped for TS-only frameworks)
      if (!this.#state.language) {
        const meta = FrameworkFactory.getMeta(this.#state.framework);
        if (meta?.requiresTypeScript) {
          this.#state.language = 'ts';
          this.#persist({ step: 'language' });
          Logger.info(`TypeScript is automatically selected for ${meta.displayName} projects.`);
          continue;
        }
        await this.#collectLanguage();
        continue;
      }

      // Step 4 — Styling
      const STYLING_FRAMEWORKS = ['next', 'vite-react', 'svelte', 'vue', 'nuxt', 'astro', 'angular'];
      if (!this.#state.styling && STYLING_FRAMEWORKS.includes(this.#state.framework)) {
        await this.#collectStyling();
        continue;
      }

      // Step 5 — UI library
      if (
        !this.#state.uiLibrary ||
        ['styling', 'language', 'uiLibrary'].includes(this.#state.step)
      ) {
        await this.#collectUILibrary();
      }

      // Step 6 — Database
      if (!this.#state.database || this.#state.step === 'database') {
        await this.#collectDatabase();
      }

      // Step 7 — Authentication
      if (!this.#state.authentication || this.#state.step === 'authentication') {
        await this.#collectAuthentication();
      }

      break;
    }
  }

  // ── Step Handlers ──────────────────────────────────────────────────────────

  async #collectProjectName() {
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: input => {
          if (!input) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input))
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          return true;
        },
      },
    ]);

    this.#persist({ projectName, step: 'projectName' });
  }

  async #collectFramework() {
    const allMeta = FrameworkFactory.getAllMeta();
    const choices = [
      ...allMeta.map(m => ({ name: m.displayName, value: m.id })),
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { framework } = await inquirer.prompt([
      { type: 'list', name: 'framework', message: 'Which framework?', choices },
    ]);

    if (framework === 'exit') process.exit(0);
    if (framework === 'back') {
      this.#persist({ projectName: null, step: null });
      return;
    }

    // Nuxt always forces TypeScript — override any previously chosen JS
    const meta = FrameworkFactory.getMeta(framework);
    if (meta?.requiresTypeScript && this.#state.language === 'js') {
      this.#state.language = 'ts';
      Logger.info(`${meta.displayName} requires TypeScript — switching language to TypeScript.`);
    }

    this.#persist({ framework, step: 'framework' });
  }

  async #collectLanguage() {
    const choices = [
      { name: 'TypeScript', value: 'ts' },
      { name: 'JavaScript', value: 'js' },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { language } = await inquirer.prompt([
      { type: 'list', name: 'language', message: 'Which language?', choices },
    ]);

    if (language === 'exit') process.exit(0);
    if (language === 'back') {
      this.#persist({ framework: null, step: 'projectName' });
      return;
    }

    const meta = FrameworkFactory.getMeta(this.#state.framework);
    const resolvedLang = (meta?.requiresTypeScript && language === 'js') ? 'ts' : language;
    if (resolvedLang !== language) {
      Logger.info(`${meta.displayName} requires TypeScript — switching to TypeScript.`);
    }

    this.#persist({ language: resolvedLang, step: 'language' });
  }

  async #collectStyling() {
    const choices = [
      { name: 'Tailwind CSS', value: 'tailwind' },
      { name: 'Plain CSS', value: 'plain' },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { styling } = await inquirer.prompt([
      { type: 'list', name: 'styling', message: 'Which styling approach?', choices },
    ]);

    if (styling === 'exit') process.exit(0);
    if (styling === 'back') {
      this.#persist({ language: null, step: 'framework' });
      return;
    }

    this.#persist({ styling, step: 'styling' });
  }

  async #collectUILibrary() {
    const { framework, styling } = this.#state;
    const meta = FrameworkFactory.getMeta(framework);
    const useTailwind = styling === 'tailwind';

    let libraryChoices = [];
    if (meta?.uiLibraryOptions) {
      libraryChoices = useTailwind
        ? meta.uiLibraryOptions.tailwind
        : meta.uiLibraryOptions.nonTailwind;

      if (!useTailwind && meta.uiLibraryOptions.tailwind.length > 0) {
        Logger.warn('\nNote: Some UI libraries require Tailwind CSS.');
        Logger.warn('Select Tailwind CSS in the styling step to see those options.\n');
      }
    }

    const choices = [
      ...libraryChoices,
      { name: 'None', value: null },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { uiLibrary } = await inquirer.prompt([
      { type: 'list', name: 'uiLibrary', message: 'Which UI library?', choices },
    ]);

    if (uiLibrary === 'exit') process.exit(0);
    if (uiLibrary === 'back') {
      const STYLING_FRAMEWORKS = ['next', 'vite-react', 'svelte', 'vue', 'nuxt', 'astro', 'angular'];
      if (STYLING_FRAMEWORKS.includes(framework)) {
        this.#persist({ uiLibrary: null, styling: null, step: 'styling' });
      } else {
        this.#persist({ uiLibrary: null, language: null, step: 'language' });
      }
      return;
    }

    this.#persist({ uiLibrary, step: 'uiLibrary' });
  }

  async #collectDatabase() {
    const choices = [
      { name: 'PostgreSQL (beta)', value: 'postgresql' },
      { name: 'MongoDB', value: 'mongodb' },
      { name: 'None', value: null },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { database } = await inquirer.prompt([
      { type: 'list', name: 'database', message: 'Which database?', choices },
    ]);

    if (database === 'exit') process.exit(0);
    if (database === 'back') {
      this.#persist({ database: null, step: 'uiLibrary' });
      return;
    }

    this.#persist({ database, step: 'database' });
  }

  async #collectAuthentication() {
    const choices = [
      { name: 'Clerk', value: 'clerk' },
      { name: 'Auth.js (Next only)', value: 'authjs' },
      { name: 'Auth0 (Angular only)', value: 'authzero' },
      { name: 'None', value: null },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' },
    ];

    const { authProvider } = await inquirer.prompt([
      { type: 'list', name: 'authProvider', message: 'Which authentication provider?', choices },
    ]);

    if (authProvider === 'exit') process.exit(0);
    if (authProvider === 'back') {
      this.#persist({ authentication: null, step: 'database' });
      return;
    }

    this.#persist({ authentication: authProvider, step: 'authentication' });
  }

  // ── Confirmation & Creation ────────────────────────────────────────────────

  async #confirmAndCreate() {
    const summary = {
      framework: this.#state.framework,
      projectName: this.#state.projectName,
      language: this.#state.language,
      styling: this.#state.styling,
      uiLibrary: this.#state.uiLibrary,
      database: this.#state.database,
      authentication: this.#state.authentication,
    };

    Logger.info('\nChosen options:');
    Logger.json(summary);

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with these options and create the project?',
        default: true,
      },
    ]);

    if (!proceed) {
      Logger.warn('\nSetup cancelled. Run `hp resume` to continue later.');
      process.exit(0);
    }

    const targetDir = path.resolve(process.cwd(), this.#state.projectName);
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      Logger.error(`Directory '${this.#state.projectName}' already exists and is not empty.`);
      Logger.warn('Choose a different name or remove the existing directory.');
      process.exit(1);
    }

    Logger.success("\n Great! Let's create your project...");

    this.#state.fromWizard = true;
    const orchestrator = new ProjectOrchestrator();
    await orchestrator.run(this.#state);

    this.#state.step = 'complete';
    this.#stateManager.upsert(this.#state);

    Logger.success(`\n✨ Project ${this.#state.projectName} created successfully!`);

    const devCmd = this.#state.framework === 'angular' ? 'ng serve' : 'npm run dev';
    Logger.info(`  ${devCmd}`);
  }
}
