import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupTailwindOnly(projectName, languageChoice, opts = {}) {
  console.log(chalk.blue('Setting up Tailwind-only project for Vite+React...'));
  
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
    }    // Step 1: Install Tailwind CSS as a Vite plugin (following official docs)
    console.log(chalk.blue('Installing Tailwind CSS and Vite plugin...'));
    await execa('npm', ['install', 'tailwindcss', '@tailwindcss/vite'], {
      stdio: 'inherit'
    });
      // Step 2: Install sonner for toast notifications
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });

    // Step 3: Clear CSS files and setup Tailwind directives
    await clearCSSFiles();
    await setupTailwindCSS();
    
    // Step 4: Configure Vite with Tailwind plugin
    await configureViteForTailwind(languageChoice);
      // Step 5: Create components directory structure
    await createComponentStructure();
    
    // Step 6: Create simple button component
    await createButtonComponent(languageChoice);
    
    // Step 7: Create toaster component
    await createToasterComponent(languageChoice);
    
    // Step 8: Create welcome page
    await createWelcomeApp(languageChoice);
    
    // Step 9: Update main file with Toaster component
    await updateMainFile(languageChoice);
    
    console.log(chalk.green('Tailwind-only setup for Vite+React completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Tailwind-only for Vite+React:'), error.message);
    console.log(chalk.yellow('You may need to set up Tailwind manually after project creation.'));
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
  console.log(chalk.blue('Setting up Tailwind CSS import...'));
  
  try {
    const tailwindImport = `@import "tailwindcss";`;
    
    await fs.writeFile('src/index.css', tailwindImport, 'utf8');
    console.log(chalk.green('✓ Added Tailwind import to src/index.css'));
  } catch (error) {
    console.error(chalk.red('Error setting up Tailwind CSS:'), error.message);
    throw error;
  }
}

async function configureViteForTailwind(languageChoice) {
  console.log(chalk.blue('Configuring Vite with Tailwind plugin...'));
  
  try {
    const isTypeScript = languageChoice === 'ts';
    const configFile = isTypeScript ? 'vite.config.ts' : 'vite.config.js';
    
    const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})`;
    
    await fs.writeFile(configFile, viteConfig, 'utf8');
    console.log(chalk.green('✓ Configured Vite with Tailwind plugin'));
  } catch (error) {
    console.error(chalk.red('Error configuring Vite with Tailwind:'), error.message);
    throw error;
  }
}

async function createComponentStructure() {
  console.log(chalk.blue('Setting up component structure...'));
  
  try {
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    await fs.mkdir(componentsDir, { recursive: true });
    
    const uiComponentDir = path.join(componentsDir, 'ui');
    await fs.mkdir(uiComponentDir, { recursive: true });
    
    console.log(chalk.green('✓ Created component directories'));
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not create component directories'));
  }
}

async function createButtonComponent(languageChoice) {
  console.log(chalk.blue('Creating button component...'));
  
  try {
    const buttonComponent = languageChoice === 'ts' 
      ? `// Simple button component for Tailwind-only setup
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  // Define the base styles for each variant
  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500'
  };
  
  // Define size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6'
  };
  
  // Combine classes
  const buttonClass = \`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}`
      : `// Simple button component for Tailwind-only setup
import React from 'react';

export function Button({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  ...props
}) {
  // Define the base styles for each variant
  const variantClasses = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500'
  };
  
  // Define size classes
  const sizeClasses = {
    sm: 'text-sm py-1 px-2',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-6'
  };
  
  // Combine classes
  const buttonClass = \`rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
}`;
    
    const buttonPath = `src/components/ui/button.${languageChoice === 'ts' ? 'tsx' : 'jsx'}`;
    await fs.writeFile(buttonPath, buttonComponent, 'utf8');
    console.log(chalk.green('✓ Created button component'));
  } catch (error) {
    console.error(chalk.red('Error creating button component:'), error.message);
    throw error;
  }
}

async function createToasterComponent(languageChoice) {
  console.log(chalk.blue('Creating toaster component...'));
  
  try {
    const toasterComponent = languageChoice === 'ts' 
      ? `// Toaster component using sonner
import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
    />
  );
}

export { toast };`
      : `// Toaster component using sonner
import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
    />
  );
}

export { toast };`;
    
    const toasterPath = `src/components/ui/toaster.${languageChoice === 'ts' ? 'tsx' : 'jsx'}`;
    await fs.writeFile(toasterPath, toasterComponent, 'utf8');
    console.log(chalk.green('✓ Created toaster component'));
  } catch (error) {
    console.error(chalk.red('Error creating toaster component:'), error.message);
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
      
      const toasterImport = 'import { Toaster } from "./components/ui/toaster";';
      
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
        '<App />',
        '<>\n    <App />\n    <Toaster />\n  </>'
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
  
  // Create app content based on language choice
  const appContent = languageChoice === 'ts' ?
  `import { Button } from "./components/ui/button";
import { toast } from "./components/ui/toaster";
import {useState} from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    toast("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've set up a Tailwind-only project with HackPack 🚀
        </span>
      ),
    });
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>
        
        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and Tailwind CSS.
        </p>
        
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification: {count}
        </Button>
        
        <div className="border-t border-gray-700 mt-4 w-1/2 mx-auto"></div>
        
        <h3 className="inline-flex text-xs font-medium text-sky-600 mt-4 px-2.5 py-0.5 rounded-full bg-sky-700/20 border border-sky-200">
          Styling with Tailwind
        </h3>
        
        <p className="mt-4 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.tsx</code> to get started
        </p>
      </div>
    </main>
  );
}`
  : 
  `import { Button } from "./components/ui/button";
import { toast } from "./components/ui/toaster";

export default function App() {
  
  const handleClick = () => {
    toast("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've set up a Tailwind-only project with HackPack 🚀
        </span>
      ),
    });
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>
        
        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and Tailwind CSS.
        </p>
        
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification
        </Button>
        
        <div className="border-t border-gray-700 mt-4 w-1/2 mx-auto"></div>
        
        <h3 className="inline-flex text-xs font-medium text-sky-600 mt-4 px-2.5 py-0.5 rounded-full bg-sky-700/20 border border-sky-200">
          Styling with Tailwind
        </h3>
        
        <p className="mt-4 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
    </main>
  );
}`;  

  try {
    await fs.writeFile(appPath, appContent, 'utf8');
    console.log(chalk.blue('Created welcome page with Tailwind components.'));
  } catch (error) {
    console.error(chalk.yellow('Could not create welcome page:'), error.message);
  }
}
