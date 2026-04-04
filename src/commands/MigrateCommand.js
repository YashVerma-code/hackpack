import { BaseCommand } from './BaseCommand.js';

/**
 * Placeholder for UI library migration (planned feature).
 * Handles: `hp migrate ui <newLibrary>`
 */
export class MigrateCommand extends BaseCommand {
  async execute() {
    this.logger.warn('Migration Command Beta');
    this.logger.info('The project migration feature is currently in development.');
    this.logger.dim('\nFollow our releases for updates on this feature!');
    process.exit(0);
  }
}
