import chalk from 'chalk';
import { getStateFilePathPublic } from '../state.js';

export function printHelp() {
  console.log(`\n${chalk.green('hackpack')} - Modern project scaffolding CLI\n`);
  console.log(chalk.bold('Usage:')); 
  console.log('  hackpack                                Launch interactive wizard');
  console.log('  hackpack help                           Show this help');
  console.log('  hackpack reset                          Clear saved state and start fresh');
  console.log('  hackpack resume                         Resume from last saved state');
  console.log('  hackpack select fw <framework>          Set framework (next|vite-react|svelte|vue|angular|astro|nuxt)');
  console.log('  hackpack select lang <ts|js>            Set language preference');
  console.log('  hackpack select styling <tailwind|plain> Set styling preference');
  console.log('  hackpack name <project-name>            Set project name');
  console.log('  hackpack setup                          Run full setup with current saved selections');
  console.log('  hackpack add tailwindcss                Add Tailwind CSS (v4) to existing project (framework dependent)');
  console.log('  hackpack select ui <library>            Set UI library preference (stored only)');
  console.log('  hackpack add ui <library>               Apply UI library to existing project');
  console.log('  hackpack uninstall ui [library]         Remove UI library dependencies');
  console.log('  hackpack migrate ui <newLibrary>        Switch from current UI library to another');
  console.log('  hackpack state                          Print raw JSON state');
  console.log('\nExamples:');
  console.log('  hackpack select fw next');
  console.log('  hackpack name my-app');
  console.log('  hackpack setup');
  console.log('  hackpack resume');
  console.log('\nState file: ' + getStateFilePathPublic());
}

export function parseArgs() {
  const [, , ...rest] = process.argv;
  return rest;
}

export function getFrameworkDisplayName(value) {
  const frameworks = {
    'next': 'Next.js',
    'vite-react': 'Vite (React)',
    'vue': 'Vue.js',
    'angular': 'Angular (TS only)',
    'svelte': 'Svelte',
    'astro': 'Astro',
    'nuxt': 'Nuxt.js'
  };
  return frameworks[value] || value;
}
