import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupHeroUI(projectName, languageChoice) {
  process.chdir(projectName);

  console.log(chalk.blue(`Setting up HeroUI with ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}...`));

  try {
    console.log(chalk.blue('Updating package.json to use ES modules...'));
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    packageJson.type = 'module';
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(chalk.green('Updated package.json with "type": "module"'));

    // Step 1: Install Tailwind CSSv4 dependencies
    console.log(chalk.blue('Installing Tailwind CSS and dependencies...'));
    await execa('npm', ['install', '-D', 'tailwindcss', '@tailwindcss/postcss', 'postcss'], {
      stdio: 'inherit'
    });

    // Step 2: Add Tailwind CSS to your PostCSS config.mjs file
    const postcssConfigPath = path.join(process.cwd(), 'postcss.config.mjs');
    const postcssConfigContent = `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;`
    await fs.writeFile(postcssConfigPath, postcssConfigContent, 'utf8');
    console.log(chalk.green('Updated postcss.config.mjs with Tailwind CSS plugin'));

    // Step 3: Install HeroUI and its dependencies
    console.log(chalk.blue('Installing HeroUI and its dependencies...'));
    await execa('npm', ['install', '@heroui/react', 'framer-motion'], {
      stdio: 'inherit'
    });

    // Step 4: Install sonner for toast notifications (to maintain consistency with other UI libraries)
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], {
      stdio: 'inherit'
    });

    // Step 5: Creating hero.ts/js

    console.log(chalk.blue(`Creating hero.${languageChoice}...`));
    const heroPath = path.join(process.cwd(), 'src', 'app', `hero.${languageChoice}`);
    const heroContent = `import { heroui } from "@heroui/react";
export default heroui();`;
    await fs.writeFile(heroPath, heroContent, 'utf8');

    // Step 6: Create global CSS file with Tailwind + heroui directives
    const globalCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');
    const tailwindDirectives = `@import "tailwindcss";
@plugin './hero.${languageChoice}';
@source '../../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}';
@custom-variant dark (&:is(.dark *));
`;
    try {
      await fs.writeFile(globalCssPath, tailwindDirectives, 'utf8');
    } catch (error) {
      // If file doesn't exist, create it with Tailwind 4 directives
      await fs.writeFile(globalCssPath, tailwindDirectives, 'utf8');
      console.log(chalk.green('Created globals.css with Tailwind 3 directives'));
    }

    // Step 7: Create providers file
    console.log(chalk.blue('Creating HeroUI provider component...'));
    const providersDir = path.join(process.cwd(), 'src', 'app');
    const providersExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const providersPath = path.join(providersDir, `providers.${providersExt}`);
    // Use the appropriate Providers content based on language choice
    const providersContent = languageChoice === 'ts'
      ? `"use client";

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      {children}
      <Toaster />
    </HeroUIProvider>
  );
}
`
      : `"use client";

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }) {
  return (
    <HeroUIProvider>
      {children}
      <Toaster />
    </HeroUIProvider>
  );
}
`;

    await fs.writeFile(providersPath, providersContent, 'utf8');

    // Step 8: Create toast component
    console.log(chalk.blue('Creating toast component...'));
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    try {
      await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Components directory already exists or could not be created.'));
    }

    const toastComponentDir = path.join(componentsDir, 'ui');
    try {
      await fs.mkdir(toastComponentDir, { recursive: true });
    } catch (error) {
    }

    const toasterExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const toasterComponentPath = path.join(toastComponentDir, `toaster.${toasterExt}`);
    await fs.writeFile(toasterComponentPath,
      `"use client";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="bottom-right" 
      richColors 
      closeButton
      className="z-50"
    />
  );
}
`, 'utf8');

    // Step 9: Modify layout file to include providers and theme
    console.log(chalk.blue('Updating layout file with HeroUI provider...'));

    const fileExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const layoutPath = `src/app/layout.${fileExt}`;
    const pagePath = `src/app/page.${fileExt}`;

    console.log(chalk.blue(`Using file extension: .${fileExt} for ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}`));

    let layoutContent = await fs.readFile(layoutPath, 'utf8');

    if (layoutContent) {
      console.log(chalk.blue('Modifying layout file...'));

      if (!layoutContent.includes('import { Providers }')) {
        // Find the last import statement
        const importRegex = /^import .+?;/gm;
        let match;
        let lastImportIndex = 0;

        while ((match = importRegex.exec(layoutContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }

        const providerImport = '\nimport { Providers } from "./providers";';

        if (lastImportIndex > 0) {
          layoutContent =
            layoutContent.substring(0, lastImportIndex) +
            providerImport +
            layoutContent.substring(lastImportIndex);
        } else {
          layoutContent = providerImport + '\n' + layoutContent;
        }
      }

      layoutContent = updatePageTitle(layoutContent);

      if (layoutContent.includes('<html lang="en">')) {
        layoutContent = layoutContent.replace(
          '<html lang="en">',
          '<html lang="en" className="light">'
        );
      }

      if (!layoutContent.includes('<Providers>')) {
        console.log(chalk.blue('Adding Providers wrapper...'));

        const bodyStartTagRegex = /<body[^>]*>/;
        const bodyEndTagRegex = /<\/body>/;

        if (bodyStartTagRegex.test(layoutContent) && bodyEndTagRegex.test(layoutContent)) {
          const bodyStartMatch = bodyStartTagRegex.exec(layoutContent);
          const bodyEndMatch = bodyEndTagRegex.exec(layoutContent);

          if (bodyStartMatch && bodyEndMatch) {
            const bodyStartTag = bodyStartMatch[0];
            const bodyStartIndex = bodyStartMatch.index + bodyStartTag.length;
            const bodyEndIndex = bodyEndMatch.index;

            const beforeBody = layoutContent.substring(0, bodyStartIndex);
            const bodyContent = layoutContent.substring(bodyStartIndex, bodyEndIndex);
            const afterBody = layoutContent.substring(bodyEndIndex);

            layoutContent = beforeBody +
              '\n        <Providers>\n' +
              bodyContent.trim() +
              '\n        </Providers>\n      ' +
              afterBody;

            console.log(chalk.green('Successfully wrapped content with Providers'));
          }
        }
      }

      await fs.writeFile(layoutPath, layoutContent);
      console.log(chalk.green('Layout file updated successfully'));
    }

    // Create a new page with a welcome message and toast example
    const pageContent = createWelcomePage(fileExt);
    await fs.writeFile(pagePath, pageContent);

    console.log(chalk.green('HeroUI setup completed successfully!'));

  } catch (error) {
    console.error(chalk.red('Error setting up HeroUI:'), error.message);
    console.log(chalk.yellow('You may need to set up HeroUI manually after project creation.'));
  }

  process.chdir('..');
}

function updatePageTitle(layoutContent) {
  if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
    layoutContent = layoutContent.replace('title: "Create Next App"', 'title: "HackPack Turbo — Build Fast, Ship Faster"');

    if (layoutContent.includes('description:')) {
      layoutContent = layoutContent.replace("description: 'Generated by create next app'", 'description: "Web application created with HackPack"');
    }
  }

  return layoutContent;
}

function createWelcomePage(fileExt) {
  // For JavaScript
  if (fileExt === 'js' || fileExt === 'jsx') {
    return `"use client"

import { useState } from "react";
import { Button } from "@heroui/react";
import { toast } from "sonner";
import { Divider } from "@heroui/react";

export default function Home() {
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
        <h1 className="text-5xl font-bold mb-4 text-gray-400">
          Welcome to <span className="text-blue-600 dark:text-blue-400">HackPack</span>
        </h1>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Next.js and HeroUI.
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
            <p className="text-2xl font-semibold text-gray-400">Count: {count}</p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              HeroUI
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium">
              Next.js
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium">
              HackPack
            </span>
          </div>
        </div>
        <Divider className="bg-gray-700 mt-4"/>
        <div className="mt-4 opacity-70">
          <p className="text-lg text-gray-400">
            Edit <code className="bg-gray-500 dark:bg-gray-800 px-1 rounded">src/app/page.js</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
  }
  // For TypeScript
  else {
    return `"use client"

import { useState } from "react";
import { Button } from "@heroui/react";
import { toast } from "sonner";
import { Divider } from "@heroui/react";

export default function Home() {
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
        <h1 className="text-5xl font-bold mb-4 text-gray-400">
          Welcome to <span className="text-blue-600 dark:text-blue-400">HackPack</span>
        </h1>
        <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Next.js and HeroUI.
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
            <p className="text-2xl font-semibold text-gray-400">Count: {count}</p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              HeroUI
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-xs font-medium">
              Next.js
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium">
              HackPack
            </span>
          </div>
        </div>
        <Divider className="bg-gray-700 mt-4"/>
        <div className="mt-4 opacity-70">
          <p className="text-lg text-gray-400">
            Edit <code className="bg-gray-500 dark:bg-gray-800 px-1 rounded">src/app/page.tsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
  }
}