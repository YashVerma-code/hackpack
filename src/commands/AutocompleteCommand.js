import { BaseCommand } from './BaseCommand.js';
import {
  installAutocomplete,
  uninstallAutocomplete,
} from '../../lib/autocomplete.js';

/**
 * Manages shell tab-completion setup.
 * Handles: `hp autocomplete install|uninstall`
 */
export class AutocompleteCommand extends BaseCommand {
  async execute() {
    const subCmd = this.args[1];

    if (!subCmd) {
      this.logger.warn('Usage:');
      this.logger.info('  hp autocomplete install   - Show autocomplete setup instructions');
      this.logger.info('  hp autocomplete uninstall - Show autocomplete removal instructions');
      process.exit(0);
    }

    if (subCmd === 'install') {
      await installAutocomplete();
    } else if (subCmd === 'uninstall') {
      await uninstallAutocomplete();
    } else {
      this.logger.error(`Unknown autocomplete command: ${subCmd}`);
      this.logger.warn('Use: hp autocomplete install  OR  hp autocomplete uninstall');
    }

    process.exit(0);
  }
}
