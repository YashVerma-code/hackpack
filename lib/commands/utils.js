import chalk from 'chalk';
import { getStateFilePathPublic } from '../state.js';

export function printHelp() {
  console.log(`\n${chalk.green('hackpack')} - Modern project scaffolding CLI\n`);
  console.log(chalk.bold('Usage:')); 
  console.log('  hp                                 Launch interactive wizard');
  console.log('  hp help                            Show this help');
  console.log('  hp reset                           Clear saved state and start fresh');
  console.log('  hp resume                          Resume from last saved state');
  console.log('  hp select fw <framework>           Set framework (next|vite-react|svelte|vue|angular|astro|nuxt)');
  console.log('  hp select lang <ts|js>             Set language preference');
  console.log('  hp select styling <tailwind|plain> Set styling preference');
  console.log('  hp name <project-name>             Set project name');
  console.log('  hp run                             Run full setup with current saved selections');
  console.log('  hp add tailwind                    Add Tailwind CSS (v4) to existing project (framework dependent)');
  console.log('  hp select ui <library>             Set UI library preference (stored only)');
  console.log('  hp add ui <library>                Apply UI library to existing project');
  console.log('  hp uninstall ui [library]          Remove UI library dependencies');
  console.log('  hp migrate ui <newLibrary>         (beta)Switch from current UI library to another');
  console.log('  hp state                           Print raw JSON state');
  console.log('  hp projects [list|use|rm]          Manage saved project states (list, use <name>, rm <name>)');
  console.log('\nExamples:');
  console.log('  hp select fw next');
  console.log('  hp name my-app');
  console.log('  hp setup');
  console.log('  hp resume');
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

export function getActivationScript(projectName, shell) {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    return `@echo off
set HP_ACTIVE_PROJECT=${projectName}
set HP_OLD_PROMPT=%PROMPT%
set PROMPT=(${projectName}) %PROMPT%
echo Activated hackpack project: ${projectName}
`;
  } else {
    return `export HP_ACTIVE_PROJECT="${projectName}"
export HP_OLD_PS1="$PS1"
export PS1="(${projectName}) $PS1"
echo "Activated hackpack project: ${projectName}"
`;
  }
}

export function getDeactivationScript(shell) {
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    return `@echo off
set PROMPT=%HP_OLD_PROMPT%
set HP_OLD_PROMPT=
set HP_ACTIVE_PROJECT=
echo Deactivated hackpack project
`;
  } else {
    return `export PS1="$HP_OLD_PS1"
unset HP_OLD_PS1
unset HP_ACTIVE_PROJECT
echo "Deactivated hackpack project"
`;
  }
}

export function printActivationInstructions(projectName) {
  const shellType = process.platform === 'win32' ? 'cmd' : 'sh';
  const scriptName = shellType === 'cmd' ? 'activate-hackpack.bat' : 'activate-hackpack.sh';
  console.log(chalk.green(`\nTo activate project environment for '${projectName}':`));
  console.log(chalk.cyan(`  Run: ${scriptName}`));
  console.log(chalk.green('Your prompt will show the active project.')); 
  console.log(chalk.yellow('To deactivate, run:') + chalk.cyan(shellType === 'cmd' ? ' deactivate-hackpack.bat' : ' deactivate-hackpack.sh'));
}
