import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import fs from 'fs';
import path from 'path';
import { loadState, saveState, addOrUpdateProject } from '../state.js';
import { runSetupFromState } from '../commands/projectSetup.js';


const getTerminalWidth = () => {
  return process.stdout.columns || 80;
};

const createResponsiveWelcome = (terminalWidth) => {
  const rocketLines = [
    "      |        ",
    "     / \\       ",
    "    / _ \\      ",
    "   |  H  |     ",
    "   |  P  |     ",
    " .'|  |  |'.   ",
    "/  |__|__|  \\  ",
    "|.- -- -- -.|  "
  ];

  const rocket = rocketLines.map(line => chalk.redBright(line));

  const mergeSideBySide = (left, right, verticalOffset = 0) => {
    const leftLines = left;
    let rightLines = right.split('\n');
    const paddingTop = Math.max(0, Math.floor((leftLines.length - rightLines.length) / 2) + verticalOffset);
    const emptyLine = ' '.repeat(rightLines[0]?.length || 0);
    rightLines = Array(paddingTop).fill(emptyLine).concat(rightLines);

    const maxLines = Math.max(leftLines.length, rightLines.length);
    const paddedLines = [];

    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i] || ' '.repeat(left[0].length);
      const rightLine = rightLines[i] || '';
      paddedLines.push(`${leftLine}  ${chalk.red(rightLine)}`);
    }

    return paddedLines.join('\n');
  };

  if (terminalWidth < 40) {
    return `\n${chalk.red.bold('HACKPACK')}\n${chalk.gray(' Build Fast, Ship Faster')}`;
  } else if (terminalWidth < 60) {
    const title = 'HACKPACK';
    return `${chalk.red.bold(title)}\n${chalk.gray('Build Fast, Ship Faster')}`;
  } else if (terminalWidth < 90) {
    const title = figlet.textSync("h a c k p a c k", { font: "Small" });
    return `${title}\n${chalk.gray('             Build Fast, Ship Faster')}`;
  } else {
    const title = figlet.textSync("hackpack", { font: "ANSI Shadow" });
    return `${mergeSideBySide(rocket, title, 2)}\n${chalk.gray('                                   Build Fast, Ship Faster')}`;
  }
};


export async function runCli(options = {}) {
  try {
    const terminalWidth = getTerminalWidth();
    const welcomeMessage = createResponsiveWelcome(terminalWidth);
    console.log(chalk.red.bold(welcomeMessage));
    const activeState = loadState();

    const resumeMode = !!options.resume;

    // If resumeMode is requested, seed the wizard with the active project's state
    // and persist changes to disk as the user progresses. Otherwise, run a fresh
    // in-memory wizard and avoid overwriting the activated project until completion.
    const useTemp = !resumeMode;
    const sessionState = resumeMode
      ? Object.assign({}, activeState)
      : {
        framework: null,
        projectName: null,
        language: null,
        styling: null,
        uiLibrary: undefined,
        database: null,
        authentication: null,
        step: null
      };

    if (!resumeMode && activeState && activeState.projectName && activeState.framework) {
      console.log(chalk.yellow(`Found activated project '${activeState.projectName}'.`));
      console.log(chalk.yellow('To resume it, run: hackpack resume'));
      console.log(chalk.yellow('To activate a different saved project: hackpack projects use <name>'));
    }

    let state = sessionState;

    // Helper to persist state during wizard
    function persistState(s) {
      // update in-memory session
      Object.assign(sessionState, s);
      // Ensure the uiLibrary key exists (explicit null) so interim saves preserve it
      if (sessionState.uiLibrary === undefined) sessionState.uiLibrary = null;
      try {
        if (resumeMode) {
          // persist to the active project's saved state as the user progresses
          saveState(Object.assign({}, sessionState));
        } else if (sessionState.projectName) {
          // persist interim new project so the user can resume later
          addOrUpdateProject(Object.assign({}, sessionState));
        }
      } catch (e) {
        // ignore persistence errors for interim saves
      }
    }

    while (true) {
      // Step 1: Project Name
      if (!state.projectName) {
        const projectName = await askProjectName();
        if (projectName === 'exit') return;
        state.projectName = projectName;
        state.step = 'projectName';
        persistState(state);
        continue;
      }

      // Step 2: Framework Selection
      if (!state.framework) {
        const framework = await askFramework();
        if (framework === 'exit') return;
        if (framework === 'back') {
          state.projectName = null;
          state.step = null;
          persistState(state);
          continue;
        }
        state.framework = framework;
        state.step = 'framework';
        persistState(state);
        continue;
      }

      // Step 3: Language Selection (skipping for Angular-ts )
      if (!state.language) {
        if (state.framework === 'angular') {
          state.language = 'ts';
          state.step = 'language';
          persistState(state);
          console.log(chalk.blue('TypeScript is automatically selected for Angular projects.'));
          continue;
        }
        const language = await askLanguage();
        if (language === 'exit') process.exit(0);
        if (language === 'back') {
          state.framework = null;
          state.step = 'projectName';
          persistState(state);
          continue;
        }
        state.language = language;
        state.step = 'language';
        persistState(state);
        continue;
      }

      // Step 4: Styling Selection (only for frameworks that need it)
      if (!state.styling && ['next', 'vite-react', 'svelte', 'vue', 'nuxt', 'astro', 'angular'].includes(state.framework)) {
        const styling = await askStyling(state.framework);
        if (styling === 'exit') return;
        if (styling === 'back') {
          state.language = null;
          state.step = 'framework';
          persistState(state);
          continue;
        }
        state.styling = styling;
        state.step = 'styling';
        persistState(state);
        continue;
      }

      // Step 5: UI Library Selection
      // treat undefined or null as not-yet-chosen so resume prompts the user
      if (!state.uiLibrary || ['styling', 'language', 'uiLibrary'].includes(state.step)) {
        const uiLibrary = await askUILibrary(state.framework, state.styling);
        if (uiLibrary === 'exit') return;
        if (uiLibrary === 'back') {
          // Go back to the most recent prior step that was shown to the user.
          // If the current framework uses a styling step, go back to styling.
          const frameworksWithStyling = ['next', 'vite-react', 'svelte', 'vue', 'nuxt', 'astro', 'angular'];
          if (frameworksWithStyling.includes(state.framework)) {
            state.uiLibrary = null;
            state.styling = null;
            state.step = 'styling';
          } else if (state.language) {
            // If language was explicit (not auto-selected), go back to language
            state.uiLibrary = null;
            state.language = null;
            state.step = 'language';
          } else {
            // Fallback: go back to framework selection
            state.uiLibrary = null;
            state.framework = null;
            state.step = 'framework';
          }
          persistState(state);
          continue;
        }
        state.uiLibrary = uiLibrary;
        state.step = 'uiLibrary';
        persistState(state);
      }

      // Step 6: Database Selection (optional, can be skipped)
      if (!state.database || state.step == 'database') { // explicitly checking undefined to allow null
        const database = await askDatabase(state.framework);
        if (database === 'exit') return;
        if (database === 'back') {
          state.database = null;
          state.step = 'uiLibrary';
          persistState(state);
          continue;
        }
        state.database = database;
        state.step = 'database';
        persistState(state);
      }

      // Step 7: Authenication Selection (optional can be skipped)
      if (!state.authentication || state.step == 'authentication') { // explicitly checking undefined to allow null
        const authProvider = await askAuthentication();
        if (authProvider === 'exit') return;
        if (authProvider === 'back') {
          state.authentication = null;
          state.step = 'database';
          persistState(state);
          continue;
        }
        state.authentication = authProvider;
        state.step = 'authentication';
        persistState(state);
      }
      // All steps completed

      break;
    }

    // confirm choices before actually setting up
    const summary = {
      framework: state.framework,
      projectName: state.projectName,
      language: state.language,
      styling: state.styling,
      uiLibrary: state.uiLibrary,
      database: state.database,
      authentication: state.authentication
    };
    console.log(chalk.blue('\nChosen options:'));
    console.log(JSON.stringify(summary, null, 2));
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with these options and create the project?',
        default: true
      }
    ]);
    if (!proceed) {
      console.log(chalk.yellow('\nSetup cancelled. You can run `hackpack resume` to continue later.'));
      process.exit(0);
    }
    console.log(chalk.green('\n🎉 Great! Let\'s create your project...'));

    // if directory already exists
    const targetDir = path.resolve(process.cwd(), state.projectName);
    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
      console.log(chalk.red(`Directory '${state.projectName}' already exists and is not empty.`));
      console.log(chalk.yellow('Please choose a different name or remove the existing directory.'));
      process.exit(1);
    }
    state.fromWizard = true;
    await runSetupFromState(state);

    state.step = 'complete';
    // Persist completed project into projects list and set it active
    addOrUpdateProject(state);

    console.log(chalk.green(`\n✨ Project ${state.projectName} created successfully!`));
    console.log(chalk.blue(`\nTo get started:`));
    console.log(chalk.blue(`  cd ${state.projectName}`));

    if (state.framework === 'next') {
      console.log(chalk.blue(`  npm run dev`));
    } else if (state.framework === 'vite-react') {
      console.log(chalk.blue(`  npm run dev`));
    } else if (state.framework === 'svelte') {
      console.log(chalk.blue(`  npm run dev`));
    } else if (state.framework === 'angular') {
      console.log(chalk.blue(`  ng serve`));
    }

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
      { name: 'Next.js', value: 'next' },
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

async function askUILibrary(framework, currentStyling) {
  try {
    // Define UI libraries with their Tailwind dependency
    const uiLibraries = {
      next: {
        tailwind: [
          { name: 'shadcn/ui', value: 'shadcn' },
          { name: 'DaisyUI', value: 'daisyui' },
          { name: 'NextUI (HeroUI)', value: 'heroui' },
          { name: 'Aceternity UI', value: 'aceternityui' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          // To do
          { name: 'Chakra UI ( beta )', value: 'chakraui' },
          { name: 'Material UI', value: 'mui' }
        ]
      },
      'vite-react': {
        tailwind: [
          { name: 'shadcn/ui', value: 'shadcn' },
          { name: 'DaisyUI', value: 'daisyui' },
          { name: 'NextUI (HeroUI)', value: 'heroui' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          // To -do
          { name: 'Chakra UI ( beta )', value: 'chakra' },
          { name: 'Material UI ( beta )', value: 'mui' },
          { name: 'Plain CSS', value: 'plaincss' }
        ]
      },
      svelte: {
        tailwind: [
          { name: 'DaisyUI', value: 'daisyui' },
          { name: 'Skeleton UI ( beta )', value: 'skeletonui' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          { name: 'Plain CSS', value: 'plaincss' }
        ]
      },
      vue: {
        tailwind: [
          { name: 'DaisyUI', value: 'daisyui' },
          { name: 'Shadcn/vue', value: 'shadcn-vue' },
          { name: 'PrimeVue ( beta )', value: 'primevue' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          { name: 'Vuetify ( beta )', value: 'vuetify' },
          { name: 'None (plain CSS)', value: 'plaincss' }
        ]
      },
      nuxt: {
        tailwind: [
          { name: 'shadcn/ui ( beta ) ', value: 'shadcn' },
          { name: 'DaisyUI ( beta ) ', value: 'daisyui' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          { name: 'None (plain CSS)', value: 'plaincss' }
        ]
      },
      astro: {
        tailwind: [
          { name: 'shadcn/ui', value: 'shadcn' },
          { name: 'DaisyUI', value: 'daisyui' },
          { name: 'Tailwind CSS only', value: 'twonly' }
        ],
        nonTailwind: [
          { name: 'None (plain CSS)', value: 'plaincss' }
        ]
      },
      angular: {
        tailwind: [
          { name: 'Tailwind CSS only', value: 'twonly' },
          { name: 'DaisyUI', value: "daisyui" },
          { name: "PrimeNg", value: 'primeng' },
          { name: 'Angular Material', value: 'angular-material' }

        ],
        nonTailwind: [
          { name: 'None (plain CSS) ( beta )', value: 'plaincss' }
        ]
      }
    };

    let choices = [];
    const persisted = loadState();
    const useTailwind = (typeof currentStyling !== 'undefined' && currentStyling !== null)
      ? currentStyling === 'tailwind'
      : (persisted && persisted.styling === 'tailwind');

    if (uiLibraries[framework]) {
      // Filter choices based on whether Tailwind is selected
      choices = [
        ...(useTailwind ? uiLibraries[framework].tailwind : uiLibraries[framework].nonTailwind),
        { name: 'None', value: null }
      ];

      // If no Tailwind is selected, explain why Tailwind-based options are hidden
      if (!useTailwind && uiLibraries[framework].tailwind.length > 0) {
        console.log(chalk.yellow('\nNote: Some UI libraries (like shadcn/ui, DaisyUI) require Tailwind CSS.'));
        console.log(chalk.yellow('Select Tailwind CSS in the styling step to see these options.\n'));
      }
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
      { name: 'PostgreSQL (beta)', value: 'postgresql' },
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
      { name: 'Auth.js (Next only)', value: 'authjs' },
      // { name: 'Lucia', value: 'lucia' },
      { name: 'Auth0 (Angular only)', value: 'authzero' },
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