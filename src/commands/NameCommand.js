import { BaseCommand } from './BaseCommand.js';

/**
 * Sets the project name in state.
 * Handles: `hp name <project-name>`
 */
export class NameCommand extends BaseCommand {
  async execute() {
    const name = this.args[1];
    const state = this.stateManager.load();

    if (!name) {
      this.logger.error('Project name required.');
      process.exit(1);
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      this.logger.error('Invalid project name. Use only letters, numbers, hyphens, and underscores.');
      process.exit(1);
    }

    state.projectName = name;
    state.step = state.framework ? 'ready' : 'projectName';
    this.stateManager.save(state);
    this.logger.success(`Project name set to ${name}`);
    process.exit(0);
  }
}
