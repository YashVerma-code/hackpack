import chalk from 'chalk';
import { CommandRouter } from './CommandRouter.js';
import { StateManager } from './StateManager.js';
import { handleCompletionRequest } from '../../lib/autocomplete.js';
import { parseArgs } from '../../lib/commands/utils.js';

/**
 * Root application class — the single entry point for the CLI.
 *
 * Responsibilities:
 *   1. Register OS signal handlers (SIGINT / SIGTERM).
 *   2. Handle the `--get-completions` early-exit path.
 *   3. Dispatch subcommands via CommandRouter.
 *   4. Fall through to the interactive ProjectWizard when no subcommand is given.
 *
 * Pattern: Facade / Bootstrap
 *   - Hides the multi-step startup sequence behind a single run() call.
 *   - bin/index.js becomes a two-liner: `new App().run()`.
 *
 * SOLID:
 *   - SRP — orchestrates startup only; execution lives in Command classes.
 *   - DIP — depends on CommandRouter and StateManager abstractions.
 */
export class App {
  #router;

  constructor() {
    // Obtain (or create) the singleton StateManager so it's warmed up.
    StateManager.getInstance();
    this.#router = new CommandRouter();
    this.#registerSignalHandlers();
  }

  /**
   * Start the application.
   * Parses process.argv, dispatches the command, or launches the wizard.
   */
  async run() {
    const args = parseArgs();

    // Shell completion request must exit immediately before any other processing.
    if (args[0] === '--get-completions') {
      handleCompletionRequest(args.slice(1));
      process.exit(0);
    }

    const handled = await this.#router.dispatch(args);
    if (!handled) {
      // No subcommand — launch the interactive wizard.
      // Dynamic import keeps wizard code out of the startup critical path.
      const { ProjectWizard } = await import('../wizard/ProjectWizard.js');
      const wizard = new ProjectWizard();
      await wizard.run();
    }
  }

  #registerSignalHandlers() {
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nThank you for using hackpack!'));
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n\nThank you for using hackpack!'));
      process.exit(0);
    });
  }
}
