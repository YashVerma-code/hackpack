import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupHeroUI(projectName, languageChoice, opts = {}) {
  console.log(chalk.blue('Setting up HeroUI for Vite+React...'));
  
  const originalDir = process.cwd();
  const projectPath = path.resolve(originalDir, projectName);
  
  try {
    const currentDir = process.cwd();
    const isAlreadyInProjectDir = currentDir === projectPath || 
                                  currentDir.endsWith(projectName);
    
    if (!isAlreadyInProjectDir) {
      console.log(`Changing to project directory: ${projectPath}`);
      process.chdir(projectPath);
    } else {
      console.log(`Already in project directory: ${currentDir}`);
    }

    // Step 1: Install Tailwind CSS (v3 as per HeroUI docs)
    console.log(chalk.blue('Installing Tailwind CSS and dependencies...'));
    await execa('npm', ['install', '-D', 'tailwindcss@3', 'postcss', 'autoprefixer'], {
      stdio: 'inherit'
    });
    
    // Step 2: Initialize Tailwind CSS config
    console.log(chalk.blue('Initializing Tailwind CSS configuration...'));
    await execa('npx', ['tailwindcss', 'init', '-p'], {
      stdio: 'inherit'
    });
    
    // Step 3: Install HeroUI and its dependencies
    console.log(chalk.blue('Installing HeroUI and its dependencies...'));
    await execa('npm', ['install', '@heroui/react', 'framer-motion'], { 
      stdio: 'inherit'
    });
    
    // Step 4: Install sonner for toast notifications
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    // Step 5: Clear CSS files and setup Tailwind directives
    await clearCSSFiles();
    await setupTailwindCSS();
    
    // Step 6: Configure Tailwind CSS for HeroUI
    await configureTailwindForHeroUI();
    
    // Step 7: Setup HeroUI Provider in main file
    await setupHeroUIProvider(languageChoice);
    
    // Step 8: Create welcome page
    await createWelcomeApp(languageChoice);
    
    // Step 9: Update main file with Toaster component
    await updateMainFile(languageChoice);
    
    console.log(chalk.green('HeroUI setup for Vite+React completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up HeroUI for Vite+React:'), error.message);
    console.log(chalk.yellow('You may need to set up HeroUI manually after project creation.'));
  } finally {
    const currentDir = process.cwd();
    if (currentDir !== originalDir) {
      process.chdir(originalDir);
      console.log(`Returned to original directory: ${originalDir}`);
    }
  }
}

async function clearCSSFiles() {
  try {
    const appCssPath = 'src/App.css';
    try {
      await fs.writeFile(appCssPath, '', 'utf8');
      console.log(chalk.green('✓ Cleared App.css'));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not clear App.css'));
    }
    
    const indexCssPath = 'src/index.css';
    try {
      await fs.writeFile(indexCssPath, '', 'utf8');
      console.log(chalk.green('✓ Cleared index.css'));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not clear index.css'));
    }
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not clear CSS files'));
  }
}

async function setupTailwindCSS() {
  console.log(chalk.blue('Setting up Tailwind CSS directives...'));
  
  try {
    const tailwindDirectives = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
    
    await fs.writeFile('src/index.css', tailwindDirectives, 'utf8');
    console.log(chalk.green('✓ Added Tailwind directives to src/index.css'));
  } catch (error) {
    console.error(chalk.red('Error setting up Tailwind CSS:'), error.message);
    throw error;
  }
}

async function configureTailwindForHeroUI() {
  console.log(chalk.blue('Configuring Tailwind CSS for HeroUI...'));
  
  try {
    const tailwindConfig = `import { heroui } from '@heroui/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/*/dist/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui()],
}`;
    
    await fs.writeFile('tailwind.config.js', tailwindConfig, 'utf8');
    console.log(chalk.green('✓ Configured Tailwind CSS with HeroUI'));
  } catch (error) {
    console.error(chalk.red('Error configuring Tailwind for HeroUI:'), error.message);
    throw error;
  }
}

async function setupHeroUIProvider(languageChoice) {
  console.log(chalk.blue('Setting up HeroUI Provider...'));
  
  try {
    const isTypeScript = languageChoice === 'ts';
    const mainFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
    
    let mainContent = await fs.readFile(mainFile, 'utf8');
    
    if (!mainContent.includes('HeroUIProvider')) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const heroUIImport = `import { HeroUIProvider } from '@heroui/react';`;
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + heroUIImport + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = heroUIImport + '\n' + mainContent;
      }
    }
    
    if (!mainContent.includes('<HeroUIProvider>')) {
      mainContent = mainContent.replace(
        '<App />',
        '<HeroUIProvider>\n    <App />\n  </HeroUIProvider>'
      );
    }
    
    await fs.writeFile(mainFile, mainContent, 'utf8');
    console.log(chalk.green('✓ Added HeroUI Provider to main file'));
  } catch (error) {
    console.error(chalk.red('Error setting up HeroUI Provider:'), error.message);
    throw error;
  }
}

async function updateMainFile(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  const mainFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
  
  try {
    let mainContent = await fs.readFile(mainFile, 'utf8');
    
    if (!mainContent.includes('import { Toaster }')) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const toasterImport = 'import { Toaster } from "sonner";';
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + toasterImport + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = toasterImport + '\n' + mainContent;
      }
    }
    
    if (!mainContent.includes('<Toaster />')) {
      mainContent = mainContent.replace(
        '<HeroUIProvider>\n    <App />\n  </HeroUIProvider>',
        '<HeroUIProvider>\n    <App />\n    <Toaster />\n  </HeroUIProvider>'
      );
    }
    
    await fs.writeFile(mainFile, mainContent);
    console.log(chalk.green('✓ Added Toaster component to main file'));
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not update main file with Toaster'));
  }
}

async function createWelcomeApp(languageChoice) {
  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const appPath = `src/App.${fileExt}`;
  
  const appContent = languageChoice === 'ts' ?
  `import { useState } from "react";
import { Button, Divider } from "@heroui/react";
import { toast } from "sonner";

export default function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed HeroUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Welcome to <span className="text-blue-600 dark:text-blue-400">HackPack</span>
        </h1>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and HeroUI.
        </p>
        
        <div className="flex flex-col gap-6 items-center">
          <Button 
            color="success" 
            size="lg" 
            onPress={handleClick}
          >
            Click me for a toast notification
          </Button>
          
          <div className="mt-2 flex items-center justify-center">
            <p className="text-2xl font-semibold text-white">Count: {count}</p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              HeroUI
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium">
              Vite
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium">
              HackPack
            </span>
          </div>
        </div>
        <Divider className="bg-gray-700 mt-4"/>
        <div className="mt-4 opacity-70">
          <p className="text-lg text-gray-200">
            Edit <code className="bg-gray-500 dark:bg-gray-800 px-1 rounded">src/App.tsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
  : 
  `import { useState } from "react";
import { Button, Divider } from "@heroui/react";
import { toast } from "sonner";

export default function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed HeroUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold mb-4 text-white">
          Welcome to <span className="text-blue-600 dark:text-blue-400">HackPack</span>
        </h1>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and HeroUI.
        </p>
        
        <div className="flex flex-col gap-6 items-center">
          <Button 
            color="success" 
            size="lg" 
            onPress={handleClick}
          >
            Click me for a toast notification
          </Button>
          
          <div className="mt-2 flex items-center justify-center">
            <p className="text-2xl font-semibold text-white">Count: {count}</p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              HeroUI
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium">
              Vite
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium">
              HackPack
            </span>
          </div>
        </div>
        <Divider className="bg-gray-700 mt-4"/>
        <div className="mt-4 opacity-70">
          <p className="text-lg text-gray-200">
            Edit <code className="bg-gray-500 dark:bg-gray-800 px-1 rounded">src/App.jsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`;  

  try {
    await fs.writeFile(appPath, appContent, 'utf8');
    console.log(chalk.blue('Created welcome page with HeroUI components.'));
  } catch (error) {
    console.error(chalk.yellow('Could not create welcome page:'), error.message);
  }
}
