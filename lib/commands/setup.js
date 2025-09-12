import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { loadState, saveState } from '../state.js';
import { runSetupFromState } from './projectSetup.js';

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
  console.log(chalk.green('✅ Project setup complete!'));
}

export async function handleResumeCommand() {
  const state = loadState();
  
  if (!state.projectName) {
    console.log(chalk.yellow('No project name yet. Launching wizard...'));
    return false;
  }
  if (!state.framework) {
    console.log(chalk.yellow('Framework not selected yet. Launching wizard...'));
    return false;
  }
  
  // Auto-fill defaults like setup command does
  if (!state.language) {
    state.language = 'ts';
    console.log(chalk.gray('No language set in state — defaulting to TypeScript'));
  }
  if (!state.styling && ['next','vite-react'].includes(state.framework)) {
    state.styling = 'tailwind';
    console.log(chalk.gray('No styling set in state — defaulting to Tailwind CSS'));
  }
  saveState(state);
  console.log(chalk.green('Resuming and completing setup with saved state...'));
  await runSetupFromState(state);
  process.exit(0);
}
