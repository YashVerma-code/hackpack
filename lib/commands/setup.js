import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { loadState, saveState } from '../state.js';
import { runSetupFromState } from './projectSetup.js';
import { runCli } from '../interactive/wizard.js';

export async function handleSetupCommand() {
  const state = loadState();
  
  if (!state.framework || !state.projectName) {
    console.log(chalk.red('Framework and project name must be set before setup.')); 
    process.exit(1);
  }
  
  // Auto-fill sensible defaults for unattended setup when missing
  // Assumptions: default language = TypeScript, default styling = tailwind
  if (!state.language) {
    state.language = 'ts';
    console.log(chalk.gray('No language set in state — defaulting to TypeScript'));
  }
  if (!state.styling) {
    // Only default to tailwind for frameworks that commonly use it
    if (['next','vite-react'].includes(state.framework)) {
      state.styling = 'tailwind';
      console.log(chalk.gray('No styling set in state — defaulting to Tailwind CSS'));
    } else {
      // For other frameworks, leave undefined (creators may detect or ask)
      state.styling = state.styling || null;
    }
  }
  // uiLibrary may be null; if present it will be applied post-creation
  saveState(state);
  
  // detect if directory already exists to avoid overwrite
  const targetDir = path.resolve(process.cwd(), state.projectName);
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    console.log(chalk.red(`Directory '${state.projectName}' already exists and is not empty.`));
    console.log(chalk.yellow('Rename the project or remove the directory before continuing.'));
    process.exit(1);
  }
  
  console.log(chalk.green('Running non-interactive setup using saved state...'));
  await runSetupFromState(state);
  state.step = 'complete';
  saveState(state);
  console.log(chalk.green('Project setup complete!'));
}

export async function handleResumeCommand() {
  const state = loadState();
  
  if (!state.projectName) {
    console.log(chalk.yellow('No project name yet. Launching wizard...'));
    await runCli({ resume: false });
    return true;
  }
  // launch interactive wizard in resume mode; it will persist progress as the
  // user advances and will continue from the saved `step` field.
  await runCli({ resume: true });
  return true;
}

export async function handleRunCommand() {
  const state = loadState();

  // If no projectName yet, fall back to launching the wizard
  if (!state.projectName) {
    console.log(chalk.yellow('No project name yet. Launching wizard...'));
    await runCli({ resume: false });
    return;
  }

  // Print a summary of collected options and ask for confirmation
  const summary = {
    framework: state.framework,
    projectName: state.projectName,
    language: state.language,
    styling: state.styling,
    uiLibrary: state.uiLibrary,
    database: state.database,
    authentication: state.authentication
  };
  console.log(chalk.blue('\nSaved options:'));
  console.log(JSON.stringify(summary, null, 2));

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Proceed with these options and run setup?',
      default: true
    }
  ]);

  if (!proceed) {
    console.log(chalk.yellow('Aborted. Run `hackpack resume` to continue or modify options.'));
    return;
  }

  // Delegate to existing setup flow
  await handleSetupCommand();
}
