import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { loadState, saveState } from '../state.js';
import { addTailwind } from '../addTailwind.js';

// UI setup functions (Next.js)
import { setupShadcnUI } from '../createNextProject/ui/shadcn.js';
import { setupDaisyUI as setupDaisyUINext } from '../createNextProject/ui/daisyui.js';
import { setupHeroUI as setupHeroUINext } from '../createNextProject/ui/heroui.js';
import { setupAceternityUI } from '../createNextProject/ui/aceternityui.js';
import { setupTailwindOnly as setupTailwindOnlyNext } from '../createNextProject/ui/twonly.js';
import { setupChakraUI as setupChakraUINext } from '../createNextProject/ui/chakraui.js';
import { setupMaterialUI as setupMaterialUINext } from '../createNextProject/ui/mui.js';
import { setupPlainCSS as setupPlainCSSNext } from '../createNextProject/ui/plaincss.js';

// UI setup functions (SvelteKit)
import { setupDaisyUI as setupDaisyUISvelte } from '../createSvelteProject/ui/daisyui.js';
// import { setupSkeletonUI } from '../createSvelteProject/ui/skeletonui.js';
import { setupTailwindOnly as setupTailwindOnlySvelte } from '../createSvelteProject/ui/twonly.js';
import { setupPlainCSS as setupPlainCSSSvelte } from '../createSvelteProject/ui/plaincss.js';

// UI setup functions (Vite + React)
import { setupShadcnUI as setupShadcnVite } from '../createViteProject/ui/shadcn.js';
import { setupDaisyUI as setupDaisyUIVite } from '../createViteProject/ui/daisyui.js';
import { setupHeroUI as setupHeroUVite } from '../createViteProject/ui/heroui.js';
import { setupTailwindOnly as setupTailwindOnlyVite } from '../createViteProject/ui/twonly.js';
import { setupChakraUI as setupChakraVite } from '../createViteProject/ui/chakraui.js';
import { setupMaterialUI as setupMaterialVite } from '../createViteProject/ui/mui.js';
import { setupPlainCSS as setupPlainCSSVite } from '../createViteProject/ui/plaincss.js';

export async function handleAddCommand(args) {
  const state = loadState();
  const target = args[1];
  
  if (target === 'tailwind') {
    if (!state.framework) { 
      console.log(chalk.red('Set framework first: hackpack select fw <framework>')); 
      process.exit(1);
    } 
    if (!state.projectName) { 
      console.log(chalk.red('Set project name first: hackpack name <projectName>')); 
      process.exit(1);
    } 
    await addTailwind({ framework: state.framework, projectName: state.projectName });
    process.exit(0);
  } 
  
  else if (target === 'ui') {
    const lib = args[2];
    if (!lib) { 
      console.log(chalk.red('Specify a UI library.')); 
      process.exit(1);
    } 
    if (!state.framework || !state.projectName) { 
      console.log(chalk.red('Set framework and project name first.')); 
      process.exit(1);
    } 
    await applyUILibrary({ 
      framework: state.framework, 
      projectName: state.projectName, 
      language: state.language || 'ts', 
      library: lib, 
      state 
    });
    state.uiLibrary = lib;
    saveState(state);
    process.exit(0);
  } 
  
  else {
    console.log(chalk.red('Unknown add target.')); 
    process.exit(1);
  }
}

export async function applyUILibrary({ framework, projectName, language, library, state }) {
  const cwd = process.cwd();
  // Normalize aliases so commands like `hackpack add ui twonly` work
  const libAliasMap = { twonly: 'tailwind-only', 'tw-only': 'tailwind-only', tailwindonly: 'tailwind-only', plaincss: 'plain', plain: 'plain' };
  if (library && libAliasMap[library]) library = libAliasMap[library];
  
  if (framework === 'next') {
    switch (library) {
      case 'shadcn':
        await setupShadcnUI(projectName, language);
        break;
      case 'daisyui':
        await setupDaisyUINext(projectName, language);
        break;
      case 'heroui':
        await setupHeroUINext(projectName, language);
        break;
      case 'aceui':
        await setupAceternityUI(projectName, language);
        break;
      case 'tailwind-only':
        await setupTailwindOnlyNext(projectName, language);
        break;
      case 'chakra':
        await setupChakraUINext(projectName, language);
        break;
      case 'mui':
        await setupMaterialUINext(projectName, language);
        break;
      case 'plain':
        await setupPlainCSSNext(projectName, language);
        break;
      default:
        console.log(chalk.red('Unknown UI library for Next.js.'));
    }
  } else if (framework === 'svelte') {
    switch (library) {
      case 'daisyui':
        await setupDaisyUISvelte(projectName, language);
        break;
      // case 'skeletonui':
      //   await setupSkeletonUI(projectName, language);
      //   break;
      case 'tailwind-only':
        await setupTailwindOnlySvelte(projectName, language);
        break;
      case 'plain':
        await setupPlainCSSSvelte(projectName, language);
        break;
      default:
        console.log(chalk.red('Unknown UI library for SvelteKit.'));
    }
  } else {
    if (framework === 'vite-react') {
      switch (library) {
        case 'shadcn':
          await setupShadcnVite(projectName, language);
          break;
        case 'daisyui':
          await setupDaisyUIVite(projectName, language);
          break;
        case 'heroui':
          await setupHeroUVite(projectName, language);
          break;
        case 'tailwind-only':
          await setupTailwindOnlyVite(projectName, language);
          break;
        case 'chakra':
          await setupChakraVite(projectName, language);
          break;
        case 'mui':
          await setupMaterialVite(projectName, language);
          break;
        case 'plain':
          await setupPlainCSSVite(projectName, language);
          break;
        default:
          console.log(chalk.red('Unknown UI library for Vite + React.'));
      }
    } else {
      console.log(chalk.yellow('UI library application not implemented for this framework.'));
    }
  }
  
  process.chdir(cwd); // return to original cwd
}

export async function handleUninstallCommand(args) {
  const state = loadState();
  const target = args[1];
  
  if (target !== 'ui') { 
    console.log(chalk.red('Usage: hackpack uninstall ui [library]')); 
    process.exit(1);
  } 
  
  const lib = args[2] || state.uiLibrary;
  if (!lib) { 
    console.log(chalk.red('No UI library specified or stored in state.')); 
    process.exit(1);
  } 
  if (!state.projectName) { 
    console.log(chalk.red('Project name required.')); 
    process.exit(1);
  } 
  
  await uninstallUILibrary({ projectName: state.projectName, library: lib });
  if (state.uiLibrary === lib) { 
    state.uiLibrary = null; 
    saveState(state); 
  }
  process.exit(0);
}

export async function handleMigrateCommand(args) {
  const state = loadState();
  const target = args[1];
  
  if (target !== 'ui') { 
    console.log(chalk.red('Usage: hackpack migrate ui <newLibrary>')); 
    process.exit(1);
  } 
  
  const newLib = args[2];
  if (!newLib) { 
    console.log(chalk.red('Specify new library.')); 
    process.exit(1);
  } 
  if (!state.projectName || !state.framework) { 
    console.log(chalk.red('Set framework and project name first.')); 
    process.exit(1);
  } 
  
  if (state.uiLibrary) {
    await uninstallUILibrary({ projectName: state.projectName, library: state.uiLibrary });
  }
  await applyUILibrary({ 
    framework: state.framework, 
    projectName: state.projectName, 
    language: state.language || 'ts', 
    library: newLib, 
    state 
  });
  state.uiLibrary = newLib; 
  saveState(state);
  process.exit(0);
}

async function uninstallUILibrary({ projectName, library }) {
  const projectPath = path.resolve(process.cwd(), projectName);
  if (!fs.existsSync(projectPath)) {
    console.log(chalk.red('Project directory not found.'));
    return;
  }
  
  const uiDependencyMap = {
    shadcn: ['@radix-ui/react-*','class-variance-authority','tailwind-merge','lucide-react'],
    daisyui: ['daisyui'],
    heroui: ['@heroui/react'],
    aceui: ['aceternity?'],
    'tailwind-only': [],
    chakra: ['@chakra-ui/react','@emotion/react','@emotion/styled','framer-motion'],
    mui: ['@mui/material','@emotion/react','@emotion/styled'],
    // skeletonui: ['@skeletonlabs/skeleton','@skeletonlabs/skeleton-svelte'],
    plain: []
  };
  
  const toRemove = uiDependencyMap[library] || [];
  if (!toRemove.length) {
    console.log(chalk.yellow('No removable dependencies mapped for this UI library or it is purely config-based.'));
    return;
  }
  
  console.log(chalk.blue(`Removing UI library dependencies: ${toRemove.join(', ')}`));
  
  // Use npm remove (ignore wildcards gracefully)
  const concrete = toRemove.filter(d=>!d.includes('*') && !d.includes('?'));
  if (concrete.length) {
    const { execa } = await import('execa');
    await execa('npm',['remove',...concrete],{cwd:projectPath,stdio:'inherit'});
  }
  console.log(chalk.green('Uninstall attempt complete (manual cleanup of config or components may still be required).'));
}
