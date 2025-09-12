import { execa } from 'execa';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs/promises';
import { setupFlowbite } from './ui/flowbite.js';
import { setupDaisyUI } from './ui/daisyui.js';
import { setupSkeletonUI } from './ui/skeletonui.js';
import { setupTailwindOnly } from './ui/twonly.js';
import { setupPlainCSS } from './ui/plaincss.js';

async function createSvelteProject({ projectName: initialProjectName, language, uiLibrary }) {
  const projectName = initialProjectName || 'my-svelte-app';
  let languageChoice = language;
  if (!languageChoice) {
    const langAns = await inquirer.prompt([
      {
        type: 'list',
        name: 'languageChoice',
        message: 'Do you want to use JavaScript or TypeScript?',
        choices: [
          { name: 'TypeScript', value: 'ts' },
          { name: 'JavaScript', value: 'jsdoc' },
        ]
      }
    ]);
    languageChoice = langAns.languageChoice;
  }

  console.log(chalk.blue('\nProject configuration:'));
  console.log(`- Project name: ${chalk.green(projectName)}`);
  console.log(`- Language: ${chalk.green(languageChoice === 'ts' ? 'TypeScript' : 'JavaScript')}`);

  const { confirmSetup } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmSetup',
      message: 'Ready to create your SvelteKit project? (You\'ll be able to choose Tailwind and other options during creation)',
      default: true
    }
  ]);

  if (!confirmSetup) {
    console.log(chalk.yellow('Project setup cancelled.'));
    return;
  }

  console.log(chalk.blue(`\nCreating SvelteKit project: ${projectName}`));
  console.log(languageChoice === 'ts' ? chalk.blue('Using TypeScript') : chalk.blue('Using JavaScript'));

  try {
    // Create SvelteKit project with interactive setup
    console.log(chalk.blue('Creating SvelteKit project...'));
    console.log(chalk.yellow('Note: The sv create command will ask you about Tailwind CSS and other add-ons.'));
    const useTailwind = await createSvelteKitProject(projectName, languageChoice);

    console.log(chalk.green(`\nSvelteKit project '${projectName}' created successfully!`));
    
    // Now ask for UI library based on whether Tailwind was selected
    const tailwindLibraries = [
      { name: 'Flowbite Svelte (Modern components)', value: 'flowbite' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'Skeleton UI (Full-featured toolkit)', value: 'skeletonui' },
      { name: 'Tailwind CSS only', value: 'tailwind-only' }
    ];
    
    const nonTailwindLibraries = [
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

    // Set up UI library if one was selected
  if (uiLibraryChoice && uiLibraryChoice !== 'none') {
      switch (uiLibraryChoice) {
        case 'flowbite':
          await setupFlowbite(projectName, languageChoice);
          break;
        
        case 'daisyui':
          await setupDaisyUI(projectName, languageChoice);
          break;
          
        case 'skeletonui':
          await setupSkeletonUI(projectName, languageChoice);
          break;
            
        case 'tailwind-only':
          await setupTailwindOnly(projectName, languageChoice);
          break;
        
        default:
          console.log(chalk.yellow(`Support for ${uiLibraryChoice} is not implemented yet.`));
      }
    } else {
      await setupPlainCSS(projectName, languageChoice);
    }

    console.log(chalk.green('\n🎉 SvelteKit project created successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.yellow(`  cd ${projectName}`));
    console.log(chalk.yellow('  npm run dev'));
    console.log(chalk.yellow('\n  Open http://localhost:5173 in your browser'));
    
  } catch (error) {
    console.error(chalk.red('Failed to create SvelteKit project:'), error);
    process.exit(1);
  }
}

async function createSvelteKitProject(projectName, languageChoice) {
  console.log(chalk.blue('Creating SvelteKit project with interactive setup...'));
  console.log(chalk.yellow('\nInstructions for the upcoming prompts:'));
  console.log(chalk.yellow('1. Template: Select "minimal" (should be default)'));
  console.log(chalk.yellow('2. Type checking: Choose your preference'));
  console.log(chalk.yellow('3. Add-ons: Use SPACE to select Tailwind CSS if you want it, then ENTER'));
  console.log(chalk.yellow('4. Package manager: Choose npm'));
  
  try {
    const createArgs = [
      'sv',
      'create',
      projectName,
      '--template',
      'minimal',
      '--types',
      languageChoice
    ];

    console.log(chalk.blue(`\nRunning: npx ${createArgs.join(' ')}`));
    console.log(chalk.yellow('Follow the interactive prompts that appear...\n'));

    await execa('npx', createArgs, { 
      stdio: 'inherit'
    });

    console.log(chalk.green('\nSvelteKit base project created!'));
    
    // Check if Tailwind was installed by looking at package.json or tailwind.config.js
    process.chdir(projectName);
    
    let useTailwind = false;
    try {
      await fs.access('tailwind.config.js');
      useTailwind = true;
      console.log(chalk.green('✅ Tailwind CSS detected in project'));
    } catch {
      try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        if (packageJson.devDependencies && packageJson.devDependencies.tailwindcss) {
          useTailwind = true;
          console.log(chalk.green('✅ Tailwind CSS detected in package.json'));
        } else {
          console.log(chalk.blue('ℹ️  Plain CSS setup detected'));
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not detect Tailwind CSS status, assuming plain CSS'));
      }
    }
    
    return useTailwind;
    
  } catch (error) {
    console.error(chalk.red('Error during project creation:'), error.message);
    throw error;
  }
}

export default createSvelteProject;