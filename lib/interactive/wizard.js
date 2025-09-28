import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { loadState, saveState } from '../state.js';
import { runSetupFromState } from '../commands/projectSetup.js';


const getTerminalWidth = () => {
  return process.stdout.columns || 80;
};

// Create responsive welcome message
const createResponsiveWelcome = (terminalWidth) => {
  if (terminalWidth < 40) {
    // For very small terminals, use simple text with line breaks
    return chalk.green.bold("\nWelcome\nto\nhackpack !");
  } else if (terminalWidth < 60) {
    // For small terminals, use simple text
    return chalk.green.bold("\nWelcome to hackpack !");
  } else if (terminalWidth < 80) {
    // For medium terminals, use smaller figlet font
    return figlet.textSync("Welcome to\nhackpack !", { font: "Standard" });
  } else {
    // For large terminals, use big figlet font
    return figlet.textSync("Welcome to hackpack !", { font: "Big" });
  }
};

export async function runCli() {
  try {
    const state = loadState();

    const terminalWidth = getTerminalWidth();
    const welcomeMessage = createResponsiveWelcome(terminalWidth);
    console.log(chalk.red.bold(welcomeMessage));
    // console.log(chalk.green('Welcome to hackpack! 🚀\n'));

    // Minimal requirements: projectName, framework, language (default js)
    if (state.projectName && state.framework && (state.language || true)) {
      // If language is missing, default to js
      if (!state.language) {
        state.language = 'js';
        state.step = 'language';
        saveState(state);
      }
      // Directly setup project, skip further prompts
      console.log(chalk.green('\n🎉 Minimal requirements met. Setting up your project...'));
      const targetDir = path.resolve(process.cwd(), state.projectName);
      if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        console.log(chalk.red(`Directory '${state.projectName}' already exists and is not empty.`));
        console.log(chalk.yellow('Please choose a different name or remove the existing directory.'));
        process.exit(1);
      }
      await runSetupFromState(state);
      state.step = 'complete';
      saveState(state);
      console.log(chalk.green(`\n✨ Project ${state.projectName} created successfully!`));
      console.log(chalk.blue(`\nTo get started:`));
      console.log(chalk.blue(`  cd ${state.projectName}`));
      console.log(chalk.blue(`  npm run dev`));
      return;
    }
    while (true) {
      // Step 1: Project Name
      if (!state.projectName) {
        const projectName = await askProjectName();
        if (projectName === 'exit') return;
        state.projectName = projectName;
        state.step = 'projectName';
        saveState(state);
        continue;
      }

      // Step 2: Framework Selection
      if (!state.framework) {
        const framework = await askFramework();
        if (framework === 'exit') return;
        if (framework === 'back') {
          state.projectName = null;
          state.step = null;
          saveState(state);
          continue;
        }
        state.framework = framework;
        state.step = 'framework';
        saveState(state);
        continue;
      }

      // Step 3: Language Selection
      if (!state.language) {
        const language = await askLanguage();
        if (language === 'exit') return;
        if (language === 'back') {
          state.framework = null;
          state.step = 'projectName';
          saveState(state);
          continue;
        }
        state.language = language;
        state.step = 'language';
        saveState(state);
        continue;
      }

      // Step 4: Styling Selection (only for frameworks that need it)
      if (!state.styling && ['next', 'vite-react'].includes(state.framework)) {
        const styling = await askStyling(state.framework);
        if (styling === 'exit') return;
        if (styling === 'back') {
          state.language = null;
          state.step = 'framework';
          saveState(state);
          continue;
        }
        state.styling = styling;
        state.step = 'styling';
        saveState(state);
        continue;
      }

      // Step 5: UI Library Selection
      if (!state.uiLibrary|| state.step=='uiLibrary') { // explicitly checking undefined to allow null
        const uiLibrary = await askUILibrary(state.framework);
        if (uiLibrary === 'exit') return;
        if (uiLibrary === 'back') {
          if (['next', 'vite-react'].includes(state.framework)) {
            state.styling = null;
            state.step = 'language';
          } else {
            state.language = null;
            state.step = 'framework';
          }
          saveState(state);
          continue;
        }
        state.uiLibrary = uiLibrary;
        state.step = 'uiLibrary';
        saveState(state);
      }

      // Step 6: Database Selection (optional, can be skipped)
      if (!state.database || state.step=='database') { // explicitly checking undefined to allow null
        const database = await askDatabase(state.framework);
        if (database === 'exit') return;
        if (database === 'back') {
          state.database = null;
          state.step = 'uiLibrary';
          saveState(state);
          continue;
        }
        state.database = database;
        state.step = 'database';
        saveState(state);
      }

      // Step 7: Authenication Selection (optional can be skipped)
      if(!state.authentication || state.step=='authentication') { // explicitly checking undefined to allow null
        const authProvider = await askAuthentication();
        if (authProvider === 'exit') return;
        if (authProvider === 'back') {
          state.authentication = null;
          state.step = 'database';
          saveState(state);
          continue;
        }
        state.authentication = authProvider;
        state.step = 'authentication';
        saveState(state);
      }
      // All steps completed
      
      break;
    }

    // Final Setup
    console.log(chalk.green('\n🎉 Great! Let\'s create your project...'));

    // if directory already exists
    const targetDir = path.resolve(process.cwd(), state.projectName);
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.log(chalk.red(`Directory '${state.projectName}' already exists and is not empty.`));
      console.log(chalk.yellow('Please choose a different name or remove the existing directory.'));
      process.exit(1);
    }

    await runSetupFromState(state);

    state.step = 'complete';
    saveState(state);

    console.log(chalk.green(`\n✨ Project ${state.projectName} created successfully!`));
    console.log(chalk.blue(`\nTo get started:`));
    console.log(chalk.blue(`  cd ${state.projectName}`));

    if (state.framework === 'next') {
      console.log(chalk.blue(`  npm run dev`));
    } else if (state.framework === 'vite-react') {
      console.log(chalk.blue(`  npm run dev`));
    } else if (state.framework === 'svelte') {
      console.log(chalk.blue(`  npm run dev`));
    }
    console.log(chalk.blue('\nHappy coding! 🚀'));

  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      console.log(chalk.yellow('\n\n👋 Thanks for using hackpack! Goodbye!'));
      process.exit(0);
    }
    console.error(chalk.red('\nUnexpected error:'), error.message || error);
    process.exit(1);
  }
}

async function askProjectName() {
  try {
    const { projectName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input) => {
          if (!input) return 'Project name is required';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      }
    ]);

    return projectName;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askFramework() {
  try {
    const choices = [
      { name: 'Next.js (React)', value: 'next' },
      { name: 'Vite (React)', value: 'vite-react' },
      { name: 'SvelteKit', value: 'svelte' },
      { name: 'Vue.js', value: 'vue' },
      { name: 'Angular', value: 'angular' },
      { name: 'Astro', value: 'astro' },
      { name: 'Nuxt.js', value: 'nuxt' },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    ];

    const { framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which framework would you like to use?',
        choices
      }
    ]);

    return framework;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askLanguage() {
  try {
    const choices = [
      { name: 'TypeScript', value: 'ts' },
      { name: 'JavaScript', value: 'js' },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    ];

    const { language } = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: 'Which language would you like to use?',
        choices
      }
    ]);

    return language;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askStyling(framework) {
  try {
    const choices = [
      { name: 'Tailwind CSS', value: 'tailwind' },
      { name: 'Plain CSS', value: 'plain' },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    ];

    const { styling } = await inquirer.prompt([
      {
        type: 'list',
        name: 'styling',
        message: 'Which styling approach would you like?',
        choices
      }
    ]);

    return styling;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askUILibrary(framework) {
  try {
    let choices = [];

    if (framework === 'next') {
      choices = [
        { name: 'shadcn/ui', value: 'shadcn' },
        { name: 'DaisyUI', value: 'daisyui' },
        { name: 'NextUI (HeroUI)', value: 'heroui' },
        { name: 'Aceternity UI', value: 'aceternityui' },
        { name: 'Tailwind CSS only', value: 'twonly' },
        { name: 'Chakra UI', value: 'chakraui' },
        { name: 'Material UI', value: 'mui' },
        { name: 'None', value: null }
      ];
    } else if (framework === 'vite-react') {
      choices = [
        { name: 'shadcn/ui', value: 'shadcn' },
        { name: 'DaisyUI', value: 'daisyui' },
        { name: 'NextUI (HeroUI)', value: 'heroui' },
        { name: 'Tailwind CSS only', value: 'twonly' },
        { name: 'Chakra UI', value: 'chakraui' },
        { name: 'Material UI', value: 'mui' },
        { name: 'Plain CSS', value: 'plaincss' },
        { name: 'None', value: null }
      ];
    } else if (framework === 'svelte') {
      choices = [
        { name: 'DaisyUI', value: 'daisyui' },
        { name: 'Flowbite Svelte', value: 'flowbite' },
        { name: 'Skeleton UI', value: 'skeletonui' },
        { name: 'Tailwind CSS only', value: 'twonly' },
        { name: 'Plain CSS', value: 'plaincss' },
        { name: 'None', value: null }
      ];
    } else {
      choices = [
        { name: 'None', value: null }
      ];
    }

    choices.push(
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    );

    const { uiLibrary } = await inquirer.prompt([
      {
        type: 'list',
        name: 'uiLibrary',
        message: 'Which UI library would you like?',
        choices
      }
    ]);

    return uiLibrary;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askDatabase() {
  try {
    const choices = [
      // { name: 'SQLite', value: 'sqlite' },
      { name: 'PostgreSQL', value: 'postgresql' },
      // { name: 'MySQL', value: 'mysql' },
      { name: 'MongoDB', value: 'mongodb' },
      { name: 'None', value: null },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    ];
    const { database } = await inquirer.prompt([
      {
        type: 'list',
        name: 'database',
        message: 'Which database would you like to use?',
        choices
      }
    ]);
    return database;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}

async function askAuthentication() {
  try {
    const choices = [
      { name: 'Clerk', value: 'clerk' },
      { name: 'Auth.js', value: 'authjs' },
      { name: 'Lucia', value: 'lucia' },
      { name: 'None', value: null },
      new inquirer.Separator(),
      { name: '← Back', value: 'back' },
      { name: '✕ Exit', value: 'exit' }
    ];
    const { authProvider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'authProvider',
        message: 'Which authentication would you like to use?',
        choices
      }
    ]);
    return authProvider;
  } catch (error) {
    if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message))) {
      return 'exit';
    }
    throw error;
  }
}