import chalk from 'chalk';
import { loadState, saveState } from '../state.js';

export function handleSelectCommand(args) {
  const state = loadState();
  const sub = args[1];
  
  if (sub === 'fw') {
    const fw = args[2];
    if (!fw) {
      console.log(chalk.red('Missing framework value.')); 
      process.exit(1);
    }
    state.framework = fw;
    state.step = state.projectName ? 'ready' : 'framework';
    saveState(state);
    console.log(chalk.green(`Framework set to ${fw}`));
    process.exit(0);
  } 
  
  else if (sub === 'ui') {
    const ui = args[2];
    if (!ui) { 
      console.log(chalk.red('Missing UI library value.')); 
      process.exit(1);
    } 
    state.uiLibrary = ui;
    state.step = 'uiLibrary';
    saveState(state);
    console.log(chalk.green(`UI library set to ${ui}`));
    process.exit(0);
  } 
  
  else if (sub === 'lang') {
    const lang = args[2];
    if (!lang || !['ts','js'].includes(lang)) { 
      console.log(chalk.red('Language must be ts or js')); 
      process.exit(1);
    } 
    state.language = lang;
    state.step = 'language';
    saveState(state);
    console.log(chalk.green(`Language set to ${lang}`));
    process.exit(0);
  } 
  
  else if (sub === 'styling') {
    const styling = args[2];
    if (!styling || !['tailwind','plain'].includes(styling)) { 
      console.log(chalk.red('Styling must be tailwind or plain')); 
      process.exit(1);
    } 
    state.styling = styling;
    state.step = 'styling';
    saveState(state);
    console.log(chalk.green(`Styling set to ${styling}`));
    process.exit(0);
  } 
  
  else {
    console.log(chalk.red('Unknown select target. Use fw | ui | lang | styling'));
    process.exit(1);
  }
}

export function handleNameCommand(args) {
  const state = loadState();
  const name = args[1];
  
  if (!name) { 
    console.log(chalk.red('Project name required.')); 
    process.exit(1);
  } 
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) { 
    console.log(chalk.red('Invalid project name.')); 
    process.exit(1);
  } 
  
  state.projectName = name;
  state.step = state.framework ? 'ready' : 'projectName';
  saveState(state);
  console.log(chalk.green(`Project name set to ${name}`));
  process.exit(0);
}
