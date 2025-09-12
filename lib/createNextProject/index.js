import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { setupShadcnUI } from './ui/shadcn.js';
import { setupDaisyUI } from './ui/daisyui.js';
import { setupHeroUI } from './ui/heroui.js';
import { setupAceternityUI } from './ui/aceternityui.js';
import { setupTailwindOnly } from './ui/twonly.js';
import { setupChakraUI } from './ui/chakraui.js';
import { setupMaterialUI } from './ui/mui.js';
import { setupPlainCSS } from './ui/plaincss.js';

async function createNextProject({ projectName: initialProjectName, language, styling, uiLibrary }) {
  const projectName = initialProjectName || 'my-next-app';

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

  let stylingChoice = styling;
  if (!stylingChoice) {
    const styleAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'stylingChoice',
        message: 'Choose your styling approach:',
        choices: [
          { name: 'Tailwind CSS (recommended for most UI libraries)', value: 'tailwind' },
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
    { name: 'Aceternity UI', value: 'aceui' },
    { name: 'Tailwind CSS only (no component library)', value: 'tailwind-only' }
  ];
  
  const nonTailwindLibraries = [
    { name: 'Chakra UI', value: 'chakra' },
    { name: 'Material UI', value: 'mui' },
    { name: 'None (plain CSS)', value: 'none' }
  ];

  let uiLibraryChoice = uiLibrary;
  // Only prompt for UI library in interactive mode (uiLibrary === undefined)
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

  // Treat explicit null as 'none' (no UI library)
  if (uiLibraryChoice === null) uiLibraryChoice = 'none';

  if (!useTailwind && ['shadcn', 'daisyui', 'heroui', 'aceui'].includes(uiLibraryChoice)) {
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

  if (uiLibrary === undefined) { // Only ask confirmation in interactive mode
    const { confirmSetup } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSetup',
        message: 'Ready to create your Next.js project with these settings?',
        default: true
      }
    ]);
    if (!confirmSetup) {
      console.log(chalk.yellow('Project setup cancelled.'));
      return;
    }
  }

  console.log(chalk.blue(`\nCreating Next.js project: ${projectName}`));
  console.log(languageChoice === 'ts' ? chalk.blue('Using TypeScript') : chalk.blue('Using JavaScript'));  

  const createNextAppFlags = [];
  if (languageChoice === 'ts') {
    createNextAppFlags.push('--typescript');
    console.log(chalk.blue('TypeScript selected: Adding --typescript flag'));
  } else {
    createNextAppFlags.push('--no-typescript', '--js');
    console.log(chalk.blue('JavaScript selected: Adding --no-typescript and --js flags'));
  }
  
  if (useTailwind) {
    createNextAppFlags.push('--tailwind');
  } else {
    createNextAppFlags.push('--no-tailwind'); 
  }
  
  createNextAppFlags.push(
    '--eslint=true',
    '--app=true',
    '--src-dir=true',
    '--no-import-alias',
    '--use-npm',
    '--no-experimental-app'
  );
    const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', CI: 'true' };

  try {
    console.log(chalk.blue('Running create-next-app with your preferences (this may take a few minutes)...'));
    console.log(chalk.blue(`Command flags: ${createNextAppFlags.join(' ')}`));
    
    await execa('npx', ['create-next-app@latest', projectName, ...createNextAppFlags], { 
      stdio: 'inherit', 
      env 
    });    console.log(chalk.green(`\nNext.js project '${projectName}' created successfully!`));
    
    // Set up UI library if one was selected
    if (uiLibraryChoice !== 'none') {
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
            
        case 'aceui':
          await setupAceternityUI(projectName, languageChoice);
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
      }    }
    else{
      await setupPlainCSS(projectName, languageChoice);
    }

  } catch (error) {
    console.error(chalk.red('Failed to create Next.js project:'), error);
    process.exit(1);
  }
}

export default createNextProject;
