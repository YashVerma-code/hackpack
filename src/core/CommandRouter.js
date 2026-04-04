import { Logger } from './Logger.js';
import { HelpCommand } from '../commands/HelpCommand.js';
import { ResetCommand } from '../commands/ResetCommand.js';
import { StateCommand } from '../commands/StateCommand.js';
import { ResumeCommand } from '../commands/ResumeCommand.js';
import { RunCommand } from '../commands/RunCommand.js';
import { SelectCommand } from '../commands/SelectCommand.js';
import { NameCommand } from '../commands/NameCommand.js';
import { ProjectsCommand } from '../commands/ProjectsCommand.js';
import { AddCommand } from '../commands/AddCommand.js';
import { UninstallCommand } from '../commands/UninstallCommand.js';
import { MigrateCommand } from '../commands/MigrateCommand.js';
import { AutocompleteCommand } from '../commands/AutocompleteCommand.js';
import { ExposeCommand } from '../commands/ExposeCommand.js';

/**
 * Maps CLI command names to their Command class and dispatches execution.
 *
 * Pattern: Registry + Command
 *   - Each entry in the route map is a command class implementing BaseCommand.
 *   - New commands are added by calling register() — no switch-case needed.
 *   - dispatch() returns false when no subcommand is found so App.run() can
 *     fall through to the interactive wizard.
 *
 * SOLID:
 *   - OCP  — add new commands by registering them; the router never changes.
 *   - SRP  — routing only; execution is the command's responsibility.
 *   - DIP  — depends on BaseCommand interface, not concrete implementations.
 */
export class CommandRouter {
  /** @type {Map<string, typeof import('../commands/BaseCommand.js').BaseCommand>} */
  #routes = new Map();

  constructor() {
    this.#registerDefaultRoutes();
  }

  /**
   * Register a command class under one or more route names.
   * @param {string|string[]} names
   * @param {typeof import('../commands/BaseCommand.js').BaseCommand} CommandClass
   */
  register(names, CommandClass) {
    const keys = Array.isArray(names) ? names : [names];
    keys.forEach(name => this.#routes.set(name, CommandClass));
  }

  /**
   * Dispatch to the matching command.
   *
   * @param {string[]} args  - Parsed process.argv (without node & script path)
   * @returns {Promise<boolean>} true if handled, false if no subcommand was given
   */
  async dispatch(args) {
    if (!args.length) return false;

    const cmd = args[0];
    const CommandClass = this.#routes.get(cmd);

    if (!CommandClass) {
      const publicRoutes = [...this.#routes.keys()].filter(k => !k.startsWith('-'));
      Logger.error(`Unknown command '${cmd}'`);
      Logger.warn(`Available commands: ${publicRoutes.join(', ')}`);
      Logger.warn('Run "hp" for interactive mode or "hp -h" for help.');
      process.exit(1);
    }

    const command = new CommandClass(args);

    const validation = command.validate();
    if (!validation.valid) {
      Logger.error(validation.message ?? 'Command validation failed.');
      process.exit(1);
    }

    await command.execute();
    return true;
  }

  /** All registered route names (for help / error messages). */
  getRouteNames() {
    return [...this.#routes.keys()];
  }

  #registerDefaultRoutes() {
    this.register(['help', '--help', '-h'], HelpCommand);
    this.register('reset', ResetCommand);
    this.register('state', StateCommand);
    this.register('resume', ResumeCommand);
    this.register('run', RunCommand);
    this.register('select', SelectCommand);
    this.register('name', NameCommand);
    this.register('projects', ProjectsCommand);
    this.register('add', AddCommand);
    this.register('uninstall', UninstallCommand);
    this.register('migrate', MigrateCommand);
    this.register('autocomplete', AutocompleteCommand);
    this.register('expose', ExposeCommand);
  }
}
