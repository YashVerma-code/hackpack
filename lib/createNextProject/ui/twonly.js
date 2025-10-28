import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupTailwindOnly(projectName, languageChoice) {
  process.chdir(projectName);
  
  console.log(chalk.blue(`Setting up Tailwind-only project with ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}...`));
  
  try {
    // Step 1: Install sonner for toast notifications (similar to shadcn/ui)
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });

    // Step 2: Create components directory structure
    console.log(chalk.blue('Setting up component structure...'));
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    try {
      await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Components directory already exists.'));
    }
    
    const uiComponentDir = path.join(componentsDir, 'ui');
    try {
      await fs.mkdir(uiComponentDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: UI component directory already exists.'));
    }

    // Step 3: Create a simple button component
    console.log(chalk.blue('Creating button component...'));
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
}
`
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
}
`;

    const buttonComponentPath = path.join(uiComponentDir, `button.${languageChoice === 'ts' ? 'tsx' : 'jsx'}`);
    await fs.writeFile(buttonComponentPath, buttonComponent, 'utf8');

    // Step 4: Create a toast component similar to shadcn/ui's approach
    console.log(chalk.blue('Creating toast component...'));
    const toastComponent = languageChoice === 'ts' 
      ? `// Re-export sonner for the Tailwind-only setup
import { Toaster as SonnerToaster, toast } from 'sonner';

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    />
  );
}
`
      : `// Re-export sonner for the Tailwind-only setup
import { Toaster as SonnerToaster, toast } from 'sonner';

export { toast };

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    />
  );
}
`;

    const toastComponentPath = path.join(uiComponentDir, `toaster.${languageChoice === 'ts' ? 'tsx' : 'jsx'}`);
    await fs.writeFile(toastComponentPath, toastComponent, 'utf8');

    // Step 5: Update the layout file to include the Toaster component
    console.log(chalk.blue('Updating layout file...'));
    const fileExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const layoutPath = `src/app/layout.${fileExt}`;
    
    try {
      const layoutContent = await fs.readFile(layoutPath, 'utf8');
      let updatedLayoutContent = addToasterToLayout(layoutContent, fileExt);
      
      // Update page title
      updatedLayoutContent = updatePageTitle(updatedLayoutContent);
      
      await fs.writeFile(layoutPath, updatedLayoutContent);
    } catch (error) {
      console.error(chalk.red('Error updating layout file:'), error.message);
    }

    // Step 6: Create a welcome page
    console.log(chalk.blue('Creating a welcome page...'));
    const pagePath = `src/app/page.${fileExt}`;
    const pageContent = createWelcomePage(fileExt);
    await fs.writeFile(pagePath, pageContent);
    
    console.log(chalk.green('Tailwind-only setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Tailwind-only project:'), error.message);
  }
  
  process.chdir('..');
}

function addToasterToLayout(layoutContent, fileExt) {
  if (!layoutContent.includes("import { Toaster }")) {
    const importRegex = /^import .+?;/gm;
    let match;
    let lastImportIndex = 0;
    
    // Find the position of the last import
    while ((match = importRegex.exec(layoutContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const toasterComponent = 'import { Toaster } from "@/components/ui/toaster";';
    
    if (lastImportIndex > 0) {
      layoutContent = 
        layoutContent.substring(0, lastImportIndex) + 
        '\n' + toasterComponent + 
        layoutContent.substring(lastImportIndex);
    } else {
      layoutContent = toasterComponent + '\n' + layoutContent;
    }
  }
  
  if (!layoutContent.includes("<Toaster />")) {
    if (layoutContent.includes("{children}")) {
      layoutContent = layoutContent.replace(
        "{children}",
        "{children}\n        <Toaster />"
      );
    } else {
      layoutContent = layoutContent.replace(
        "</body>",
        "        <Toaster />\n      </body>"
      );
    }
  }
  
  return layoutContent;
}

function updatePageTitle(layoutContent) {
  if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
    layoutContent = layoutContent.replace(
      /title: ["']Create Next App["']/,
      'title: "HackPack Turbo — Build Fast, Ship Faster"'
    );
    
    if (layoutContent.includes('description:')) {
      layoutContent = layoutContent.replace(
        /description: ["']Generated by create next app["']/,
        'description: "Web application created with HackPack"'
      );
    }
  }
  
  return layoutContent;
}

function createWelcomePage(fileExt) {
  // For JavaScript
  if (fileExt === 'js') {
    return `"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toaster"

export default function Home() {
  
  const handleClick = () => {
    toast("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You&apos;ve set up a Tailwind-only project with HackPack 🚀
        </span>
      ),
    })
  }
  
   return (
   <>
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>
        
        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster!🚀
          <br />
          This project is set up with Next.js and Tailwind CSS.
        </p>
        
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification
        </Button>
        <div className="border-t border-gray-700 mt-4 w-1/2 mx-auto"></div>
        <h3 className="inline-flex text-xs font-medium text-sky-600 mt-4 px-2.5 py-0.5 rounded-full bg-sky-700/20 border border-sky-200">Styling with Tailwind</h3>
        <p className="mt-4 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/app/page.tsx</code> to get started
        </p>
      </div>
    </main>
    </>
  )
}`
  } 
  // For TypeScript
  else {
    return `"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toaster"

export default function Home() {
  
  const handleClick = () => {
    toast("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You&apos;ve set up a Tailwind-only project with HackPack 🚀
        </span>
      ),
    })
  }
  
   return (
   <>
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>
        
        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster!🚀
          <br />
          This project is set up with Next.js and Tailwind CSS.
        </p>
        
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification
        </Button>
        <div className="border-t border-gray-700 mt-4 w-1/2 mx-auto"></div>
        <h3 className="inline-flex text-xs font-medium text-sky-600 mt-4 px-2.5 py-0.5 rounded-full bg-sky-700/20 border border-sky-200">Styling with Tailwind</h3>
        <p className="mt-4 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/app/page.tsx</code> to get started
        </p>
      </div>
    </main>
    </>
  )
}`
  }
}