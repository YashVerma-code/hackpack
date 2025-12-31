#!/usr/bin/env node

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { loadState, clearState, listProjects } from '../lib/state.js';
import { handleResumeCommand, handleRunCommand } from '../lib/commands/setup.js';
import { handleSelectCommand, handleNameCommand, handleProjectsCommand } from '../lib/commands/select.js';
import { handleAddCommand, handleUninstallCommand } from '../lib/commands/uiLibrary.js';
import { printHelp, parseArgs } from '../lib/commands/utils.js';
import { runCli } from '../lib/interactive/wizard.js';
import { installAutocomplete, uninstallAutocomplete, handleCompletionRequest } from '../lib/autocomplete.js';
import { startTunnel } from '../lib/localXpose/utils.js';

const args = process.argv.slice(2);
if (args[0] === '--get-completions') {
  handleCompletionRequest(args.slice(1));
  process.exit(0);
}


// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n Thank you for using hackpack!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\nThank you for using hackpack!'));
  process.exit(0);
});

const VALID_COMMANDS = [
  'help', '--help', '-h',
  'reset',
  'resume',
  'state',
  'select',
  'projects',
  'name',
  'run',
  'add',
  'uninstall',
  'migrate',
  'autocomplete',
  'expose'
];

// ---- Command router ----
async function handleSubcommands() {
  const args = parseArgs();
  if (args.length === 0) {
    return false; // no subcommand, run interactive
  }

  const cmd = args[0];
  if (!VALID_COMMANDS.includes(cmd)) {
    console.log(chalk.red(`Error: Unknown command '${cmd}'`));
    console.log(chalk.yellow('Available commands:'));
    console.log(VALID_COMMANDS.filter(c => !c.startsWith('-')).map(c => `  ${c}`).join('\n'));
    console.log(chalk.yellow('\nRun "hp" for interactive mode.'));
    console.log(chalk.yellow('Run "hp -h" for detailed usage information.'));
    process.exit(1);
  }

  const state = loadState();

  switch (cmd) {
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);

    case 'reset':
      clearState();
      console.log(chalk.green('State cleared.'));
      process.exit(0);

    case 'resume':
      await handleResumeCommand();
      break;

    case 'state':
      try {
        const projects = listProjects();
        if (!projects.length) {
          console.log('No saved projects.');
          process.exit(0);
        }
        const active = state && state.projectName;
        console.log('Saved projects:');
        projects.forEach(p => {
          console.log(JSON.stringify(p, null, 2) + (p.projectName === active ? '  <-- active' : ''));
        });
      } catch (e) {
        console.error('Failed to read saved projects:', e?.message || e);
      }
      process.exit(0);

    case 'select':
      handleSelectCommand(args);
      break;

    case 'projects':
      handleProjectsCommand(args);
      break;

    case 'name':
      handleNameCommand(args);
      break;

    case 'run':
      await handleRunCommand();
      break;

    case 'add':
      await handleAddCommand(args);
      break;

    case 'uninstall':
      await handleUninstallCommand(args);
      break;

    case 'migrate':
      console.log(chalk.yellow('Migration Command Beta'));
      console.log(chalk.cyan('The project migration feature is currently in development.'));
      console.log(chalk.gray('\nFollow our releases for updates on this feature!'));
      process.exit(0);
    
    case 'expose':
      const target = args[1];
      if (!target) {
        console.log(chalk.yellow('Usage: hp expose <url(including port)>'));
        process.exit(1);
      }
      try {
        const localUrl = target.startsWith('http') ? target : `http://localhost:${target}`;
        console.log(chalk.cyan(`Setting up secure tunnel for ${localUrl}...`));
        
        const { url, process: tunnelProcess } = await startTunnel(localUrl);
        const boxWidth = 80;
        const contentWidth = boxWidth -2;

        console.log('\n' + chalk.green('┌' + '─'.repeat(boxWidth) + '┐'));
        console.log(chalk.green('│ ') + chalk.bold('Your project is live at:'.padEnd(contentWidth)) + chalk.green(' │'));
        console.log(chalk.green('│ ') + chalk.cyan(url.padEnd(contentWidth)) + chalk.green(' │'));
        console.log(chalk.green('└' + '─'.repeat(boxWidth) + '┘'));

        const cleanup = () => {
          if (tunnelProcess) tunnelProcess.kill('SIGINT');
          console.log(chalk.yellow('\nTunnel closed!'));``
          process.exit(0);
        };

        process.removeAllListeners('SIGINT');
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
      } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
        process.exit(1);
      }
      return true;

    case 'deactivate':
      const isWindows = process.platform === 'win32';
      const deactivateFileName = isWindows ? 'deactivate-hackpack.bat' : 'deactivate-hackpack.sh';
      const deactivateFile = path.join(process.cwd(), deactivateFileName);

      if (!fs.existsSync(deactivateFile)) {
        console.log(chalk.yellow('No active project environment found.'));
        console.log(chalk.gray('Run "hp projects use <name>" to activate a project.'));
        process.exit(1);
      }
      process.exit(0);

    case 'autocomplete':
       const subCmd = args[1];
      if (!subCmd) {
        console.log(chalk.yellow('Usage:'));
        console.log(chalk.cyan('  hp autocomplete install   ') + chalk.gray('- Show autocomplete setup instructions'));
        console.log(chalk.cyan('  hp autocomplete uninstall ') + chalk.gray('- Show autocomplete removal instructions'));
        process.exit(0);
      }
      
      if (subCmd === 'install') {
        await installAutocomplete();
      } else if (subCmd === 'uninstall') {
        await uninstallAutocomplete();
      } else {
        console.log(chalk.red(`Unknown autocomplete command: ${subCmd}`));
        console.log(chalk.yellow('Use: hp autocomplete install or hp autocomplete uninstall'));
      }
      process.exit(0);
  }
  return true;
}

// ---- Entry point ----
(async () => {
  try {
    const handled = await handleSubcommands();
    if (!handled) {
      await runCli();
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
