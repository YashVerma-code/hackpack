import inquirer from 'inquirer';
import { BaseCommand } from './BaseCommand.js';
import { ProjectWizard } from '../wizard/ProjectWizard.js';
import { ProjectOrchestrator } from '../wizard/ProjectOrchestrator.js';

/**
 * Confirms saved options with the user, then runs the full setup pipeline.
 * Handles: `hp run`
 */
export class RunCommand extends BaseCommand {
  async execute() {
    const state = this.stateManager.load();

    if (!state.projectName) {
      this.logger.warn('No project name yet. Launching wizard...');
      const wizard = new ProjectWizard();
      await wizard.run({ resume: false });
      return;
    }

    const summary = {
      framework: state.framework,
      projectName: state.projectName,
      language: state.language,
      styling: state.styling,
      uiLibrary: state.uiLibrary,
      database: state.database,
      authentication: state.authentication,
    };

    this.logger.info('\nSaved options:');
    this.logger.json(summary);

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with these options and run setup?',
        default: true,
      },
    ]);

    if (!proceed) {
      this.logger.warn('Aborted. Run `hp resume` to continue or modify options.');
      return;
    }

    if (!state.framework) {
      this.logger.error('Framework must be set before running setup.');
      process.exit(1);
    }

    // Apply defaults for unattended setup
    if (!state.language) {
      state.language = 'ts';
      this.logger.dim('No language set — defaulting to TypeScript');
    }
    if (!state.styling && ['next', 'vite-react'].includes(state.framework)) {
      state.styling = 'tailwind';
      this.logger.dim('No styling set — defaulting to Tailwind CSS');
    }

    this.stateManager.save(state);

    this.logger.success('Running setup using saved state...');
    const orchestrator = new ProjectOrchestrator();
    await orchestrator.run(state);

    state.step = 'complete';
    this.stateManager.save(state);
    this.logger.success('Project setup complete!');
  }
}
