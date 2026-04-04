import chalk from 'chalk';
import { BaseCommand } from './BaseCommand.js';
import { startTunnel } from '../../lib/localXpose/utils.js';

/**
 * Creates a Cloudflare Quick Tunnel to expose a local dev server.
 * Handles: `hp expose <port|url>`
 */
export class ExposeCommand extends BaseCommand {
  async execute() {
    const target = this.args[1];

    if (!target) {
      this.logger.warn('Usage: hp expose <url(including port)>');
      process.exit(1);
    }

    const localUrl = target.startsWith('http') ? target : `http://localhost:${target}`;
    this.logger.info(`Setting up secure tunnel for ${localUrl}...`);

    try {
      const { url, process: tunnelProcess } = await startTunnel(localUrl);
      const boxWidth = 80;
      const contentWidth = boxWidth - 2;

      console.log('\n' + chalk.green('┌' + '─'.repeat(boxWidth) + '┐'));
      console.log(chalk.green('│ ') + chalk.bold('Your project is live at:'.padEnd(contentWidth)) + chalk.green(' │'));
      console.log(chalk.green('│ ') + chalk.cyan(url.padEnd(contentWidth)) + chalk.green(' │'));
      console.log(chalk.green('└' + '─'.repeat(boxWidth) + '┘'));

      const cleanup = () => {
        if (tunnelProcess) tunnelProcess.kill('SIGINT');
        this.logger.warn('\nTunnel closed!');
        process.exit(0);
      };

      // Replace the global signal handlers set by App so the tunnel
      // can perform its own graceful cleanup on SIGINT/SIGTERM.
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('SIGTERM');
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    } catch (error) {
      this.logger.error(`\nError: ${error.message}`);
      process.exit(1);
    }
  }
}
