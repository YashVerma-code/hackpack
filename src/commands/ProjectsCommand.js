import path from 'path';
import fs from 'fs';
import { BaseCommand } from './BaseCommand.js';
import { getActivationScript, getDeactivationScript } from '../../lib/commands/utils.js';

/**
 * Manages saved project states: list, use, rm.
 * Handles: `hp projects [list|use <name>|rm <name>]`
 */
export class ProjectsCommand extends BaseCommand {
  async execute() {
    const sub = this.args[1];

    if (!sub || sub === 'list') {
      return this.#list();
    }
    if (sub === 'use') {
      return this.#use();
    }
    if (sub === 'rm' || sub === 'remove') {
      return this.#remove();
    }

    this.logger.error('Unknown projects command. Use: list | use <name> | rm <name>');
    process.exit(1);
  }

  #list() {
    const projects = this.stateManager.list();
    if (!projects.length) {
      this.logger.warn('No projects saved yet.');
      process.exit(0);
    }
    this.logger.success('Saved projects:');
    projects.forEach(p => {
      this.logger.log(`- ${p.projectName} ${p.updatedAt ? `(updated ${p.updatedAt})` : ''}`);
    });
    process.exit(0);
  }

  #use() {
    const name = this.args[2];
    if (!name) {
      this.logger.error('Project name required to use.');
      process.exit(1);
    }

    const proj = this.stateManager.get(name);
    if (!proj) {
      this.logger.error(`No saved project named '${name}'`);
      process.exit(1);
    }

    this.stateManager.upsert(proj);

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'sh';
    const activateScript = getActivationScript(name, shell);

    this.logger.success(`\nProject '${name}' activated!`);
    this.logger.info('\nTo activate the environment in your current shell, run:');
    if (isWindows) {
      this.logger.warn(`  eval (hp projects use ${name} | out-string)`);
    } else {
      this.logger.warn(`  eval "$(hp projects use ${name})"`);
    }
    this.logger.info('\nYour prompt will change to show the active project:');
    this.logger.warn(`  (${name}) /current/directory/path$`);
    this.logger.info('\nTo deactivate, run:');
    this.logger.warn('  hp projects deactivate');

    // Print the script for eval
    this.logger.log('\n' + activateScript);
    process.exit(0);
  }

  #remove() {
    const name = this.args[2];
    if (!name) {
      this.logger.error('Project name required to remove.');
      process.exit(1);
    }

    if (process.env.HP_ACTIVE_PROJECT === name) {
      this.logger.warn(`Project '${name}' is currently active. Deactivating...`);
      const isWindows = process.platform === 'win32';
      const deactivateScript = getDeactivationScript(isWindows ? 'cmd' : 'sh');
      this.logger.log(deactivateScript);
    }

    const proj = this.stateManager.get(name);
    if (!proj) {
      this.logger.error(`No saved project named '${name}'`);
      process.exit(1);
    }

    this.stateManager.remove(name);

    try {
      const targetPath = path.resolve(process.cwd(), name);
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        if (path.basename(targetPath) === name) {
          fs.rmSync(targetPath, { recursive: true, force: true });
          this.logger.success(`Removed project folder '${targetPath}'.`);
        }
      }
    } catch (e) {
      this.logger.warn(`Failed to remove project folder automatically: ${e?.message ?? e}`);
    }

    this.logger.success(`Removed project '${name}' from saved state.`);
    process.exit(0);
  }
}
