import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { setupShadcnUI } from '../createViteProject/ui/shadcn.js';
import { setupDaisyUI } from '../createViteProject/ui/daisyui.js';
import { setupHeroUI } from '../createViteProject/ui/heroui.js';
import { setupTailwindOnly } from '../createViteProject/ui/twonly.js';
import { setupChakraUI } from '../createViteProject/ui/chakraui.js';
import { setupMaterialUI } from '../createViteProject/ui/mui.js';
import { setupPlainCSS } from '../createViteProject/ui/plaincss.js';

async function createViteProject({ projectName: initialProjectName, language, styling, uiLibrary }) {
  const projectName = initialProjectName || 'my-vite-app';
  // lang
  let languageChoice = language;
  if (!languageChoice) {
    const langAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'languageChoice',
        message: 'Do you want to use JavaScript or TypeScript?',
        choices: [
          { name: 'TypeScript', value: 'ts' },
          { name: 'JavaScript', value: 'js' },
        ]
      }
    ]);
    languageChoice = langAns.languageChoice;
  }

  // styling
  let stylingChoice = styling;
  if (!stylingChoice) {
    const styleAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'stylingChoice',
        message: 'Choose your styling approach:',
        choices: [
          { name: 'Tailwind CSS (recommended)', value: 'tailwind' },
          { name: 'Plain CSS (no Tailwind)', value: 'plain' },
        ]
      }
    ]);
    stylingChoice = styleAns.stylingChoice;
  }

  let useTailwind = stylingChoice === 'tailwind';

  const tailwindLibraries = [
    { name: 'shadcn/ui (Radix + Tailwind)', value: 'shadcn' },
    { name: 'daisyUI (Tailwind plugin)', value: 'daisyui' },
    { name: 'HeroUI', value: 'heroui' },
    { name: 'Tailwind CSS only (no component library)', value: 'tailwind-only' }
  ];

  const nonTailwindLibraries = [
    { name: 'Chakra UI', value: 'chakra' },
    { name: 'Material UI', value: 'mui' },
    { name: 'None (plain CSS)', value: 'none' }
  ];

  let uiLibraryChoice = uiLibrary;
  // Only prompt for UI library in interactive mode
  if (uiLibraryChoice === undefined) {
    const uiAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'uiLibraryChoice',
        message: 'Choose a UI library:',
        choices: useTailwind ? tailwindLibraries : nonTailwindLibraries
      }
    ]);
    uiLibraryChoice = uiAns.uiLibraryChoice;
  }
  if (uiLibraryChoice === null) uiLibraryChoice = 'none';

  // Normalize aliases (wizard may emit 'twonly' or 'plaincss')
  const uiAliasMap = {
    twonly: 'tailwind-only',
    'tw-only': 'tailwind-only',
    tailwindonly: 'tailwind-only',
    plaincss: 'none',
    noe: 'none',
    plain: 'none',
    'plain-css': 'none',
    none: 'none'
  };

  // Normalize library choice into a predictable canonical value (lowercase keys)
  if (uiLibraryChoice != null) {
    const key = String(uiLibraryChoice).toLowerCase();
    if (uiAliasMap[key]) uiLibraryChoice = uiAliasMap[key];
    else uiLibraryChoice = key;
  }

  // If the user picked Tailwind for styling but no UI library ('none'),
  // interpret that as "Tailwind CSS only" so we set up Tailwind instead of plain CSS.
  if (useTailwind && uiLibraryChoice === 'none') {
    uiLibraryChoice = 'tailwind-only';
  }

  // Decide explicitly whether we should run the plain CSS setup.
  // True when user chose plain styling and selected 'none' for UI library (or equivalent aliases).
  const shouldUsePlainCSS = !useTailwind && uiLibraryChoice === 'none';

  if (!useTailwind && ['shadcn', 'daisyui', 'heroui'].includes(uiLibraryChoice)) {
    console.log(chalk.yellow(`\nWarning: ${uiLibraryChoice} requires Tailwind CSS!`));
    const { confirmTailwind } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmTailwind',
        message: 'Would you like to enable Tailwind CSS to use this UI library?',
        default: true
      }
    ]);

    if (confirmTailwind) {
      console.log(chalk.blue('Enabling Tailwind CSS to support your UI library choice.'));
      useTailwind = true;
    } else {
      console.log(chalk.blue('Please select a different UI library that does not require Tailwind.'));
      const { newUiLibraryChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'newUiLibraryChoice',
          message: 'Choose a UI library compatible with plain CSS:',
          choices: nonTailwindLibraries
        }
      ]);
      uiLibraryChoice = newUiLibraryChoice;
    }
  }

  console.log(chalk.blue('\nProject configuration:'));
  console.log(`- Project name: ${chalk.green(projectName)}`);
  console.log(`- Language: ${chalk.green(languageChoice === 'ts' ? 'TypeScript' : 'JavaScript')}`);
  console.log(`- Styling: ${chalk.green(useTailwind ? 'Tailwind CSS' : 'Plain CSS')}`);
  console.log(`- UI Library: ${chalk.green(uiLibraryChoice)}`);

  if (uiLibrary === undefined) { // only confirm in interactive mode
    const { confirmSetup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSetup',
        message: 'Ready to create your Vite + React project with these settings?',
        default: true
      }
    ]);
    if (!confirmSetup) {
      console.log(chalk.yellow('Project setup cancelled.'));
      return;
    }
  }

  try {
    // 1. Create Vite project
    const template = languageChoice === 'ts' ? 'react-ts' : 'react';
    console.log(chalk.blue(`\nCreating Vite + React project: ${projectName}`));

    const initArgs = ['create', 'vite@latest', projectName, '--', '--template', template,'--no-interactive'];
    await execa('npm', initArgs, { stdio: 'inherit' });

    process.chdir(projectName);

    console.log(chalk.yellow('Running npm install with --ignore-scripts to prevent accidental dev server start...'));
    await execa('npm', ['install', '--ignore-scripts'], { stdio: 'inherit' });

    console.log(chalk.gray('If you need lifecycle scripts to run, re-run `npm install` manually inside the project.'));

    // 2. Set up UI library / styling helpers
    if (shouldUsePlainCSS) {
      await setupPlainCSS(projectName, languageChoice);
    } else if (uiLibraryChoice !== 'none') {
      switch (uiLibraryChoice) {
        case 'shadcn':
          await setupShadcnUI(projectName, languageChoice);
          break;
        case 'daisyui':
          await setupDaisyUI(projectName, languageChoice);
          break;
        case 'heroui':
          await setupHeroUI(projectName, languageChoice);
          break;
        case 'tailwind-only':
          await setupTailwindOnly(projectName, languageChoice);
          break;
        case 'chakra':
          await setupChakraUI(projectName, languageChoice);
          break;
        case 'mui':
          await setupMaterialUI(projectName, languageChoice);
          break;
        default:
          console.log(chalk.yellow(`Support for ${uiLibraryChoice} is not implemented yet.`));
      }
    } else {
      await setupPlainCSS(projectName, languageChoice);
    }

    console.log(chalk.green(`\nVite + React project '${projectName}' created successfully!`));
    console.log(chalk.green('Next steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev'));
  } catch (err) {
    console.error(chalk.red('\nFailed to create Vite project:'));
    console.error(chalk.red(err && err.stack ? err.stack : String(err)));
    throw err;
  }
}

export default createViteProject;
