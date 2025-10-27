import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { loadState, saveState, listProjects, getProject, addOrUpdateProject, removeProject } from '../state.js';
import { getActivationScript, getDeactivationScript } from './utils.js';

export function handleSelectCommand(args) {
  const state = loadState();
  const sub = args[1];

  if (sub === 'fw') {
    const fw = args[2];
    if (!fw) {
      console.log(chalk.red('Missing framework value.'));
      process.exit(1);
    }

    // Valid frameworks list
    const validFrameworks = ['next', 'vite', 'svelte', 'vue', 'angular', 'astro', 'nuxt'];
    if (!validFrameworks.includes(fw.toLowerCase())) {
      console.log(chalk.red(`Invalid framework. Supported frameworks: ${validFrameworks.join(', ')}`));
      process.exit(1);
    }

    // Framework Migration Intent Detection
    if (state.framework && state.framework !== fw) {
      console.log(chalk.blue('\nFramework Migration Notice:'));
      console.log(chalk.yellow(`Switching framework: ${state.framework} → ${fw}`));
      console.log(chalk.yellow('This will create a new project with the selected framework.'));
      console.log(chalk.cyan('\nNote: Smart cross-framework migrations are planned in future releases.'));
      console.log(chalk.gray('For now, back up your code before proceeding.\n'));
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

    // Map of supported UI libraries by framework
    const uiLibraries = {
      next: ['shadcn', 'daisyui', 'heroui', 'aceui', 'chakra', 'mui', 'none'],
      vite: ['shadcn', 'daisyui', 'heroui', 'chakra', 'mui', 'none'],
      svelte: ['daisyui', 'none'],
      vue: ['daisyui', 'inspiraui', 'vuetify', 'primevue', 'none'],
      angular: ['angular-material', 'primeng', 'daisyui', 'none'],
      astro: ['shadcn', 'daisyui', 'none'],
      nuxt: ['shadcn', 'daisyui', 'nuxt-ui', 'reka-ui', 'none']
    };

    // UI Library Migration Intent Detection
    if (state.uiLibrary && state.uiLibrary !== ui) {
      console.log(chalk.blue('UI Library Migration Notice:'));
      console.log(chalk.yellow(`Switching UI library: ${state.uiLibrary} → ${ui}`));
      console.log(chalk.yellow('This will create a new project with the selected UI library.'));
      console.log(chalk.cyan('Note: Smart UI library migrations are planned in future releases to preserve components.'));

      if (state.framework) {
        const supported = uiLibraries[state.framework] || [];
        if (!supported.includes(ui)) {
          console.log(chalk.yellow(`\n⚠️  ${ui} may not be fully supported with ${state.framework}.`));
          console.log(chalk.yellow(`Supported UI libraries: ${supported.join(', ')}`));
        }
      }

      console.log(chalk.gray('For now, back up your code before proceeding.\n'));

    }

    state.uiLibrary = ui;
    state.step = 'uiLibrary';
    saveState(state);
    console.log(chalk.green(`UI library set to ${ui}`));
    process.exit(0);
  }

  else if (sub === 'lang') {
    const lang = args[2];
    if (!lang || !['ts', 'js'].includes(lang)) {
      console.log(chalk.red('Language must be ts or js'));
      process.exit(1);
    }

    if (state.framework === 'angular' && lang === 'js') {
      console.log(chalk.red('Angular projects must use TypeScript.'));
      process.exit(1);
    }

    // Language Migration Intent Detection
    if (state.language && state.language !== lang) {
      const fromLang = state.language === 'ts' ? 'TypeScript' : 'JavaScript';
      const toLang = lang === 'ts' ? 'TypeScript' : 'JavaScript';
      console.log(chalk.blue('Language Migration Notice:'));
      console.log(chalk.yellow(`Switching language: ${fromLang} → ${toLang}`));
      console.log(chalk.yellow('This will create a new project with the selected language.'));
      console.log(chalk.cyan(`Note: Automated ${fromLang} ↔ ${toLang} migrations are planned in future releases.`));
      console.log(chalk.gray('For now, back up your code before proceeding.\n'));
    }

    state.language = lang;
    state.step = 'language';
    saveState(state);
    console.log(chalk.green(`Language set to ${lang}`));
    process.exit(0);
  }

  else if (sub === 'styling') {
    const styling = args[2];
    if (!styling || !['tailwind', 'plain'].includes(styling)) {
      console.log(chalk.red('Styling must be tailwind or plain'));
      process.exit(1);
    }

    // Styling Migration Intent Detection
    if (state.styling && state.styling !== styling) {
      const fromStyle = state.styling === 'tailwind' ? 'Tailwind CSS' : 'Plain CSS';
      const toStyle = styling === 'tailwind' ? 'Tailwind CSS' : 'Plain CSS';
      console.log(chalk.blue('Styling Migration Notice:'));
      console.log(chalk.yellow(`Switching styling: ${fromStyle} → ${toStyle}`));
      console.log(chalk.yellow('This will create a new project with the selected styling.'));
      console.log(chalk.cyan(`Note: Smart ${fromStyle} ↔ ${toStyle} migrations are planned in future releases.`));
      console.log(chalk.gray('For now, back up your code before proceeding.\n'));

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

// export function handleProjectsCommand(args) {
//   const sub = args[1];
//   if (!sub || sub === 'list') {
//     const projects = listProjects();
//     if (!projects.length) {
//       console.log(chalk.yellow('No projects saved yet.'));
//       process.exit(0);
//     }
//     console.log(chalk.green('Saved projects:'));
//     projects.forEach(p => {
//       console.log(`- ${p.projectName} ${p.updatedAt ? `(updated ${p.updatedAt})` : ''}`);
//     });
//     process.exit(0);
//   }

//   if (sub === 'use') {
//     const name = args[2];
//     if (!name) {
//       console.log(chalk.red('Project name required to use.'));
//       process.exit(1);
//     }
//     const proj = getProject(name);
//     if (!proj) {
//       console.log(chalk.red(`No saved project named '${name}'`));
//       process.exit(1);
//     }
//     // promote project to active by saving it
//     addOrUpdateProject(proj);

//     const isWindows = process.platform === 'win32';
//     const activateFileName = isWindows ? 'activate-hackpack.bat' : 'activate-hackpack.sh';
//     const deactivateFileName = isWindows ? 'deactivate-hackpack.bat' : 'deactivate-hackpack.sh';
//     const activateFile = path.join(process.cwd(), activateFileName);
//     const deactivateFile = path.join(process.cwd(), deactivateFileName);

//     // Check if scripts already exist
//     if (!fs.existsSync(activateFile) || !fs.existsSync(deactivateFile)) {
//       try {
//         const activateScript = getActivationScript(name);
//         const deactivateScript = getDeactivationScript();
        
//         // Write activation script
//         fs.writeFileSync(activateFile, activateScript);
        
//         // Write deactivation script
//         fs.writeFileSync(deactivateFile, deactivateScript);

//         // Make scripts executable on Unix
//         if (!isWindows) {
//           fs.chmodSync(activateFile, '755');
//           fs.chmodSync(deactivateFile, '755');
//         }

//         console.log(chalk.gray('\nCreated environment scripts for first use.'));
//       } catch (err) {
//         console.error(chalk.red('Failed to create environment scripts:'), err);
//         console.log(chalk.yellow('Project activated but environment scripts not created.'));
//         process.exit(1);
//       }
//     }

//     // Activate the project environment
//     try {
//       const activateCmd = isWindows ? activateFileName : `./${activateFileName}`;
//       execSync(activateCmd, { stdio: 'inherit' });
//       process.exit(0);
//     } catch (err) {
//       console.error(chalk.red('Failed to activate project environment:'), err);
//       console.log(chalk.yellow('\nTo manually activate, run:'));
//       console.log(chalk.cyan(`  ${isWindows ? '' : './'}${activateFileName}`));
//       process.exit(1);
//     }
//   }

//   if (sub === 'rm' || sub === 'remove') {
//     const name = args[2];
//     if (!name) {
//       console.log(chalk.red('Project name required to remove.'));
//       process.exit(1);
//     }
//     const proj = getProject(name);
//     if (!proj) {
//       console.log(chalk.red(`No saved project named '${name}'`));
//       process.exit(1);
//     }
//     // Remove from saved state
//     removeProject(name);

//     // Also attempt to delete a folder with the same name in the current working directory
//     try {
//       const targetPath = path.resolve(process.cwd(), name);
//       if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
//         // only remove if directory name exactly matches the project name segment
//         if (path.basename(targetPath) === name) {
//           fs.rmSync(targetPath, { recursive: true, force: true });
//           console.log(chalk.green(`Removed project folder '${targetPath}'.`));
//         }
//       }
//     } catch (e) {
//       console.log(chalk.yellow(`Failed to remove project folder automatically: ${e && e.message ? e.message : e}`));
//     }

//     console.log(chalk.green(`Removed project '${name}' from saved state.`));
//     process.exit(0);
//   }

//   console.log(chalk.red('Unknown projects command. Use: list | use <name> | rm <name>'));
//   process.exit(1);
// }

export function handleProjectsCommand(args) {
  const sub = args[1];

  if (!sub || sub === 'list') {
    const projects = listProjects();
    if (!projects.length) {
      console.log(chalk.yellow('No projects saved yet.'));
      process.exit(0);
    }
    console.log(chalk.green('Saved projects:'));
    projects.forEach(p => {
      console.log(`- ${p.projectName} ${p.updatedAt ? `(updated ${p.updatedAt})` : ''}`);
    });
    process.exit(0);
  }

  if (sub === 'use') {
    const name = args[2];
    if (!name) {
      console.log(chalk.red('Project name required to use.'));
      process.exit(1);
    }

    const proj = getProject(name);
    if (!proj) {
      console.log(chalk.red(`No saved project named '${name}'`));
      process.exit(1);
    }

    // promote project to active
    addOrUpdateProject(proj);

    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'sh';

    // Generate activation + deactivation scripts
    const activateScript = getActivationScript(name, shell);
    const deactivateScript = getDeactivationScript(shell);

    // Print activation instructions
    console.log(chalk.green(`\nProject '${name}' activated!`));
    console.log(chalk.cyan('\nTo activate the environment in your current shell, run:'));
    
    if (isWindows) {
      console.log(chalk.yellow(`  eval (hp projects use ${name} | out-string)`));
    } else {
      console.log(chalk.yellow(`  eval "$(hp projects use ${name})"`));
    }
    
    console.log(chalk.cyan('\nYour prompt will change to show the active project:'));
    console.log(chalk.yellow(`  (${name}) /current/directory/path$`));
    
    console.log(chalk.cyan('\nTo deactivate, run:'));
    console.log(chalk.yellow(`  hp projects deactivate`));
    
    // Print the scripts for eval
    console.log('\n' + activateScript);
    
    process.exit(0);
  }

  if (sub === 'rm' || sub === 'remove') {
    const name = args[2];
    if (!name) {
      console.log(chalk.red('Project name required to remove.'));
      process.exit(1);
    }

    if (process.env.HP_ACTIVE_PROJECT === name) {
      console.log(chalk.yellow(`Project '${name}' is currently active. Deactivating...`));
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd' : 'sh';
      const deactivateScript = getDeactivationScript(shell);
      console.log(deactivateScript);
    }

    const proj = getProject(name);
    if (!proj) {
      console.log(chalk.red(`No saved project named '${name}'`));
      process.exit(1);
    }

    removeProject(name);

    try {
      const targetPath = path.resolve(process.cwd(), name);
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        if (path.basename(targetPath) === name) {
          fs.rmSync(targetPath, { recursive: true, force: true });
          console.log(chalk.green(`Removed project folder '${targetPath}'.`));
        }
      }
    } catch (e) {
      console.log(chalk.yellow(`Failed to remove project folder automatically: ${e && e.message ? e.message : e}`));
    }

    console.log(chalk.green(`Removed project '${name}' from saved state.`));
    process.exit(0);
  }

  console.log(chalk.red('Unknown projects command. Use: list | use <name> | rm <name>'));
  process.exit(1);
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
