import chalk from 'chalk';
import createNextProject from '../createNextProject/index.js';
import createViteProject from '../createViteProject/index.js';
import createSvelteProject from '../createSvelteProject/index.js';
import createAngularProject from '../createAngularProject/index.js';
import createAstroProject from '../createAstroProject/index.js';
import createNuxtProject from '../createNuxtProject/index.js';
import createVueProject from '../createVueProject/index.js';
import { applyUILibrary } from './uiLibrary.js';
import { setupMongoDb, setupPostgreSQL } from '../backend/index.js';
import { setupAuthjs, setupClerk, setupAuth0 } from '../authentication/index.js';

export async function runSetupFromState(state) {
  const { framework, projectName, database, authentication } = state;
  console.log(chalk.blue(`Running setup for framework=${framework} project=${projectName} with database=${database || 'none'}`));

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
        await createVueProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'angular':
        await createAngularProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'astro':
        await createAstroProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      case 'nuxt':
        await createNuxtProject({ projectName, language: state.language, styling: state.styling, uiLibrary: state.uiLibrary });
        break;
      default:
        console.log(chalk.red('Unknown framework in saved state.'));
        break;
    }

    // apply uiLibrary separately only if NOT running from wizard and if a uiLibrary is specified
    if (!state.fromWizard && state.uiLibrary && ['next', 'svelte', 'vite-react', 'vue', 'angular', 'astro', 'nuxt'].includes(framework)) {
      console.log(chalk.blue(`Applying stored UI library: ${state.uiLibrary}`));
      try {
        await applyUILibrary({ 
          framework: state.framework, 
          projectName: state.projectName, 
          language: state.language || 'ts', 
          library: state.uiLibrary, 
          state 
        });
      } catch (e) {
        console.log(chalk.red(`Failed to apply UI library '${state.uiLibrary}':`, e.message));
      }
    }

    if (database) {
      console.log(chalk.blue(`Setting up database: ${database} ...`));
      switch (database) {
        case 'mongodb':
          await setupMongoDb(projectName, framework, state.language);
          break;
        case 'postgresql':
          await setupPostgreSQL(projectName, framework, state.language);
          break;
        case 'mysql': // To be done in future
        case 'sqlite': // To be done in future
        default:
          console.log(chalk.red('Unknown or unsupported database in saved state.'));

      }
    }
    if (authentication) {
      console.log(chalk.blue(`Setting up authentication: ${authentication} ...`));
      switch (authentication) {
        case 'authjs':
          await setupAuthjs(state);
          break;
        case 'clerk':
          await setupClerk(state);
          break;
        case 'authzero':
          await setupAuth0(state);
          break;
        case 'lucia':
          // To be done
          await setupLuciaAuth(state);
          break;
        default:
          console.log(chalk.red('Unknown or unsupported authentication method in saved state.'));
      }

    }

  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      console.log(chalk.yellow('\n\n👋 Cancelled. Goodbye!'));
      process.exit(0);
    }
    console.error(chalk.red('Setup error:'), error.message || error);
    process.exit(1);
  }
}
