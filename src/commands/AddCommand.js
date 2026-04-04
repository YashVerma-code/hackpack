import { BaseCommand } from './BaseCommand.js';
import { addTailwind } from '../../lib/addTailwind.js';
import { UILibraryFactory } from '../factories/UILibraryFactory.js';

/**
 * Adds Tailwind CSS or a UI library to an existing project.
 * Handles: `hp add tailwind` and `hp add ui <library>`
 */
export class AddCommand extends BaseCommand {
  async execute() {
    const target = this.args[1];
    const state = this.stateManager.load();

    if (target === 'tailwind') {
      return this.#addTailwind(state);
    }

    if (target === 'ui') {
      return this.#addUILibrary(state);
    }

    this.logger.error('Unknown add target. Use: hp add tailwind  OR  hp add ui <library>');
    process.exit(1);
  }

  async #addTailwind(state) {
    if (!state.framework) {
      this.logger.error('Set framework first: hp select fw <framework>');
      process.exit(1);
    }
    if (!state.projectName) {
      this.logger.error('Set project name first: hp name <projectName>');
      process.exit(1);
    }
    await addTailwind({ framework: state.framework, projectName: state.projectName });
    process.exit(0);
  }

  async #addUILibrary(state) {
    const lib = this.args[2];

    if (!lib) {
      this.logger.error('Specify a UI library: hp add ui <library>');
      process.exit(1);
    }
    if (!state.framework || !state.projectName) {
      this.logger.error('Set framework and project name first.');
      process.exit(1);
    }

    await UILibraryFactory.apply({
      framework: state.framework,
      projectName: state.projectName,
      language: state.language ?? 'ts',
      library: lib,
      state,
    });

    state.uiLibrary = UILibraryFactory.normalize(lib);
    this.stateManager.save(state);
    process.exit(0);
  }
}
