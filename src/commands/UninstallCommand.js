import path from 'path';
import fs from 'fs';
import { BaseCommand } from './BaseCommand.js';

/**
 * Removes UI library npm dependencies from an existing project.
 * Handles: `hp uninstall ui [library]`
 */
export class UninstallCommand extends BaseCommand {
  /** Maps canonical library ids to their npm package names. */
  static #dependencyMap = {
    shadcn: ['@radix-ui/react-*', 'class-variance-authority', 'tailwind-merge', 'lucide-react'],
    daisyui: ['daisyui'],
    heroui: ['@heroui/react'],
    aceternityui: [],
    'tailwind-only': [],
    chakraui: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
    chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
    mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
    plain: [],
    plaincss: [],
  };

  async execute() {
    const target = this.args[1];
    const state = this.stateManager.load();

    if (target !== 'ui') {
      this.logger.error('Usage: hp uninstall ui [library]');
      process.exit(1);
    }

    const lib = this.args[2] ?? state.uiLibrary;
    if (!lib) {
      this.logger.error('No UI library specified or stored in state.');
      process.exit(1);
    }
    if (!state.projectName) {
      this.logger.error('Project name required.');
      process.exit(1);
    }

    await this.#uninstall(state.projectName, lib);

    if (state.uiLibrary === lib) {
      state.uiLibrary = null;
      this.stateManager.save(state);
    }
    process.exit(0);
  }

  async #uninstall(projectName, library) {
    const projectPath = path.resolve(process.cwd(), projectName);
    if (!fs.existsSync(projectPath)) {
      this.logger.error('Project directory not found.');
      return;
    }

    const toRemove = (UninstallCommand.#dependencyMap[library] ?? [])
      .filter(d => !d.includes('*') && !d.includes('?'));

    if (!toRemove.length) {
      this.logger.warn(
        'No removable dependencies mapped for this UI library or it is purely config-based.'
      );
      return;
    }

    this.logger.info(`Removing UI library dependencies: ${toRemove.join(', ')}`);
    const { execa } = await import('execa');
    await execa('npm', ['remove', ...toRemove], { cwd: projectPath, stdio: 'inherit' });
    this.logger.success(
      'Uninstall complete (manual cleanup of config or components may still be required).'
    );
  }
}
