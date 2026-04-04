import { BaseCommand } from './BaseCommand.js';

/**
 * Clears the saved state file and exits.
 * Handles: `hp reset`
 */
export class ResetCommand extends BaseCommand {
  async execute() {
    this.stateManager.clear();
    this.logger.success('State cleared.');
    process.exit(0);
  }
}
