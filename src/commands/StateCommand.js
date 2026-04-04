import { BaseCommand } from './BaseCommand.js';

/**
 * Prints all saved projects as JSON.
 * Handles: `hp state`
 */
export class StateCommand extends BaseCommand {
  async execute() {
    try {
      const projects = this.stateManager.list();
      if (!projects.length) {
        this.logger.log('No saved projects.');
        process.exit(0);
      }
      const active = this.stateManager.load();
      const activeName = active?.projectName;
      this.logger.log('Saved projects:');
      projects.forEach(p => {
        const marker = p.projectName === activeName ? '  <-- active' : '';
        this.logger.log(JSON.stringify(p, null, 2) + marker);
      });
    } catch (e) {
      this.logger.error('Failed to read saved projects: ' + (e?.message ?? e));
    }
    process.exit(0);
  }
}
