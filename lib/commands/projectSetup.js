import chalk from 'chalk';
import createNextProject from '../createNextProject/index.js';
import createViteProject from '../createViteProject/index.js';
import createSvelteProject from '../createSvelteProject/index.js';
import createAngularProject from '../createAngularProject/index.js';
import createAstroProject from '../createAstroProject/index.js';
import createNuxtProject from '../createNuxtProject/index.js';
import createVueProject from '../createVueProject/index.js';
import { applyUILibrary } from './uiLibrary.js';

export async function runSetupFromState(state) {
  const { framework, projectName } = state;
  console.log(chalk.blue(`Running setup for framework=${framework} project=${projectName}`));
  
  try {
    switch (framework) {
      case 'next':
        await createNextProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'vite-react':
        await createViteProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'svelte':
        await createSvelteProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'vue':
        await createVueProject({})
      case 'angular':
      case 'astro':
      case 'nuxt':
      default:
        console.log(chalk.red('Unknown framework in saved state.')); 
        break;
    }
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      console.log(chalk.yellow('\n\n👋 Cancelled. Goodbye!'));
      process.exit(0);
    }
    console.error(chalk.red('Setup error:'), error.message || error);
    process.exit(1);
  }
  
  // Apply UI library if stored and supported
  if (state.uiLibrary && ['next','svelte','vite-react'].includes(state.framework)) {
    console.log(chalk.blue(`Applying stored UI library: ${state.uiLibrary}`));
    try {
      await applyUILibrary({ 
        framework: state.framework, 
        projectName: state.projectName, 
        language: state.language || 'js', 
        library: state.uiLibrary, 
        state 
      });
    } catch (e) {
      console.log(chalk.red(`Failed to apply UI library '${state.uiLibrary}':`), e.message);
    }
  }
}
