import { BaseCommand } from './BaseCommand.js';
import { printHelp } from '../../lib/commands/utils.js';

/**
 * Displays the full usage/help text and exits.
 * Handles: `hp help`, `hp --help`, `hp -h`
 */
export class HelpCommand extends BaseCommand {
  async execute() {
    printHelp();
    process.exit(0);
  }
}
