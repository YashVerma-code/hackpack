import chalk from 'chalk';
import { FrameworkFactory } from '../factories/FrameworkFactory.js';
import { UILibraryFactory } from '../factories/UILibraryFactory.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';
import { AuthProviderFactory } from '../factories/AuthProviderFactory.js';
import { Logger } from '../core/Logger.js';

/**
 * Coordinates the full project-creation pipeline.
 * Replaces the procedural `runSetupFromState()` from lib/commands/projectSetup.js.
 *
 * Pipeline:
 *   1. Scaffold the framework project (create-next-app, npm create vite, etc.)
 *   2. Apply the UI library (only if not already applied by the scaffold step)
 *   3. Set up the database integration (optional)
 *   4. Set up the authentication provider (optional)
 *
 * Pattern: Facade / Orchestrator
 *   - Delegates each step to the appropriate factory-created object.
 *   - Callers (RunCommand, ProjectWizard) only call orchestrator.run(state).
 *
 * SOLID:
 *   - SRP  — coordination only; each step is owned by its specialist class.
 *   - DIP  — depends on factory abstractions, not concrete framework/auth/db classes.
 *   - OCP  — adding a new framework/auth/db requires zero changes here.
 */
export class ProjectOrchestrator {
  /**
   * Execute the full creation pipeline for the given project state.
   *
   * @param {object} state
   * @param {string} state.framework
   * @param {string} state.projectName
   * @param {string} state.language
   * @param {string} state.styling
   * @param {string|null} state.uiLibrary
   * @param {string|null} state.database
   * @param {string|null} state.authentication
   * @param {boolean} [state.fromWizard]  When true the scaffold step already
   *                                       applied the UI library internally.
   */
  async run(state) {
    const { framework, projectName, database, authentication } = state;

    Logger.info(
      `Setting up ${framework} project '${projectName}'` +
      (database ? ` with ${database}` : '') +
      (authentication ? ` and ${authentication}` : '')
    );

    try {
      // ── Step 1: Scaffold ────────────────────────────────────────────────
      const fw = FrameworkFactory.create(framework, state);
      await fw.create();

      // ── Step 2: UI Library (post-scaffold, non-wizard flows only) ───────
      // When the wizard calls this orchestrator, the framework's createXProject()
      // function has already applied the UI library internally during scaffolding.
      // Only apply it here for `hp run` / `hp resume` non-wizard flows.
      if (!state.fromWizard && state.uiLibrary) {
        const supportedFrameworks = ['next', 'svelte', 'vite-react', 'vue', 'angular', 'astro', 'nuxt'];
        if (supportedFrameworks.includes(framework)) {
          Logger.info(`Applying stored UI library: ${state.uiLibrary}`);
          try {
            await UILibraryFactory.apply({
              framework,
              projectName,
              language: state.language ?? 'ts',
              library: state.uiLibrary,
              state,
            });
          } catch (e) {
            Logger.error(`Failed to apply UI library '${state.uiLibrary}': ${e.message}`);
          }
        }
      }

      // ── Step 3: Database ────────────────────────────────────────────────
      if (database) {
        Logger.info(`Setting up database: ${database} ...`);
        const db = DatabaseFactory.create(database);
        await db.setup(projectName, framework, state.language);
      }

      // ── Step 4: Authentication ──────────────────────────────────────────
      if (authentication) {
        Logger.info(`Setting up authentication: ${authentication} ...`);
        const auth = AuthProviderFactory.create(authentication);
        await auth.setup(state);
      }
    } catch (error) {
      if (error?.name === 'ExitPromptError' || /force closed/i.test(error?.message ?? '')) {
        console.log(chalk.yellow('\n\n👋 Cancelled. Goodbye!'));
        process.exit(0);
      }
      Logger.error(`Setup error: ${error.message ?? error}`);
      process.exit(1);
    }
  }
}
