import { StateManager } from '../core/StateManager.js';
import { Logger } from '../core/Logger.js';

/**
 * Abstract base class for all CLI command handlers.
 *
 * Pattern: Command
 *   - Each subclass encapsulates one CLI command and its entire execution logic.
 *   - CommandRouter instantiates the right class and calls execute().
 *
 * SOLID:
 *   - SRP — one class, one command.
 *   - OCP — new commands are added by creating subclasses, not editing the router.
 *   - DIP — commands receive StateManager (abstraction) rather than importing
 *           lib/state.js functions directly.
 */
export class BaseCommand {
  /**
   * @param {string[]} args — process.argv arguments (index 0 is the command name)
   */
  constructor(args) {
    if (new.target === BaseCommand) {
      throw new Error('BaseCommand is abstract — extend it instead of instantiating directly.');
    }
    this.args = args;
    this.stateManager = StateManager.getInstance();
    this.logger = Logger;
  }

  /**
   * Run the command.  Must be implemented by every subclass.
   * @abstract
   * @returns {Promise<void>}
   */
  async execute() {
    throw new Error(`${this.constructor.name} must implement execute().`);
  }

  /**
   * Optional pre-execute validation hook.
   * Return { valid: false, message: '...' } to abort before execute() is called.
   * @returns {{ valid: boolean, message?: string }}
   */
  validate() {
    return { valid: true };
  }
}
