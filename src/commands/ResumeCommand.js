import { BaseCommand } from './BaseCommand.js';
import { ProjectWizard } from '../wizard/ProjectWizard.js';

/**
 * Resumes the interactive wizard from the last saved step.
 * Handles: `hp resume`
 */
export class ResumeCommand extends BaseCommand {
  async execute() {
    const state = this.stateManager.load();

    if (!state.projectName) {
      this.logger.warn('No project name yet. Launching wizard...');
      const wizard = new ProjectWizard();
      await wizard.run({ resume: false });
      return;
    }

    const wizard = new ProjectWizard();
    await wizard.run({ resume: true });
  }
}
