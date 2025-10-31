import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupAceternityUI(projectName, languageChoice) {
  process.chdir(projectName);
  
  console.log(chalk.blue(`Setting up Aceternity UI with ${languageChoice === 'ts' ? 'TypeScript' : 'JavaScript'}...`));
  
  try {
    // Step 1: Install Tailwind CSS dependencies (using Tailwind 3)
    console.log(chalk.blue('Installing Tailwind CSS and dependencies...'));
    await execa('npm', ['install', '-D', 'tailwindcss@3', 'postcss', 'autoprefixer'], {
      stdio: 'inherit'
    });
    
    // Step 2: Initialize Tailwind CSS config
    console.log(chalk.blue('Initializing Tailwind CSS configuration...'));
    await execa('npx', ['tailwindcss', 'init', '-p'], {
      stdio: 'inherit'
    });
    
    // Step 3: Install Aceternity UI dependencies
    console.log(chalk.blue('Installing Aceternity UI and its dependencies...'));
    await execa('npm', ['install', 'framer-motion', 'motion', 'clsx', 'tailwind-merge', '@tabler/icons-react'], { 
      stdio: 'inherit'
    });
    
    // Step 4: Install sonner for toast notifications (to maintain consistency with other UI libraries)
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    // Step 5: Create global CSS file with Tailwind directives
    const globalCssPath = path.join(process.cwd(), 'src', 'app', 'globals.css');    const tailwindDirectives = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .text-stroke-sm {
    -webkit-text-stroke: 1px rgba(0, 0, 0, 0.2);
  }
  
  .text-stroke-md {
    -webkit-text-stroke: 2px rgba(0, 0, 0, 0.2);
  }
  
  .mask-gradient {
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
  }

  .moving-border {
    --duration: 2;
    --border-size: 2px;
    --border-bg-size: 200px;
    --border-radius: 0.75rem;
    --border-color: white;
    position: relative;
    border-radius: var(--border-radius);
    background: linear-gradient(60deg, var(--border-color), #88f, var(--border-color), #88f) 0 0 / var(--border-bg-size) 100%;
    animation: border-beam calc(var(--duration) * 1s) infinite linear;
    -webkit-mask:
      linear-gradient(#000, #000) content-box content-box,
      linear-gradient(#000, #000);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    padding: var(--border-size);
  }
}
`;
    
    try {
      const existingCss = await fs.readFile(globalCssPath, 'utf8');
      
      // Remove Tailwind 4 directive if present, while keeping Tailwind 3 directives
      let updatedCss = existingCss;
      
      // Remove the Tailwind 4 directive
      if (updatedCss.includes('@import "tailwindcss";')) {
        updatedCss = updatedCss.replace('@import "tailwindcss";', '');
        console.log(chalk.green('Removed Tailwind 4 directive (@import "tailwindcss")'));
      }
      
      // Ensure Tailwind 3 directives exist
      if (!updatedCss.includes('@tailwind base;')) {
        // Add Tailwind 3 directives to the top of the file
        updatedCss = tailwindDirectives + updatedCss;
        console.log(chalk.green('Added Tailwind 3 directives (@tailwind base/components/utilities)'));
      }
      
      // Write the updated CSS back to file
      await fs.writeFile(globalCssPath, updatedCss, 'utf8');
      
    } catch (error) {
      // If file doesn't exist, create it with Tailwind 3 directives
      await fs.writeFile(globalCssPath, tailwindDirectives, 'utf8');
      console.log(chalk.green('Created globals.css with Tailwind 3 directives'));
    }
    
    // Step 6: Update tailwind.config.js for Aceternity UI
    console.log(chalk.blue('Configuring Tailwind CSS for Aceternity UI...'));
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
      // Create a proper tailwind config for Aceternity UI
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shimmer: {
          from: {
            backgroundPosition: "0 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
        "border-beam": {
          "0%": {
            backgroundPosition: "0% 0%",
          },
          "100%": {
            backgroundPosition: "-200% 100%",
          },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
`;
    
    try {
      // Write the complete tailwind config
      await fs.writeFile(tailwindConfigPath, tailwindConfig, 'utf8');
      console.log(chalk.green('Successfully configured Tailwind CSS for Aceternity UI'));
    } catch (error) {
      console.error(chalk.red('Error updating tailwind.config.js:'), error.message);
    }
    
    // Step 7: Create utils directory and cn utility
    console.log(chalk.blue('Creating utility functions...'));
    const utilsDir = path.join(process.cwd(), 'src', 'utils');
    try {
      await fs.mkdir(utilsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Utils directory already exists or could not be created.'));
    }
    
    const cnUtilPath = path.join(utilsDir, 'cn.js');
    await fs.writeFile(cnUtilPath, 
      `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`, 'utf8');
    
    // Step 8: Create components directory and add the main components
    console.log(chalk.blue('Creating Aceternity UI components...'));
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    try {
      await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Components directory already exists or could not be created.'));
    }
    
    // Create ui directory for components
    const uiComponentDir = path.join(componentsDir, 'ui');
    try {
      await fs.mkdir(uiComponentDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: UI component directory already exists or could not be created.'));
    }
    
    // Create Aceternity UI components
    const fileExt = languageChoice === 'ts' ? 'tsx' : 'js';
    
    // Create toaster component
    const toasterComponentPath = path.join(uiComponentDir, `toaster.${fileExt}`);
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
      // Create moving-border component
    const transform = 'useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`';
    const movingBorderComponentPath = path.join(uiComponentDir, `moving-border.${fileExt}`);
    const movingBorderContent = languageChoice === 'ts' 
  ? `"use client";

import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/utils/cn";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <Component
      className={cn(
        "relative h-16 w-64 overflow-hidden bg-transparent py-[2px] text-xl",
        containerClassName,
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: "calc(" + borderRadius + " * 0.96)" }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]",
              borderClassName,
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl",
          className,
        )}
        style={{
          borderRadius: "calc(" + borderRadius + " * 0.96)",
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: unknown;
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x ?? 0,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y ?? 0,
  );

  const transform = ${transform}

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};`
  : `"use client";

import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/utils/cn";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}) {
  return (
    <Component
      className={cn(
        "relative h-16 w-64 overflow-hidden bg-transparent py-[2px] text-xl",
        containerClassName,
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: "calc(" + borderRadius + " * 0.96)" }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]",
              borderClassName,
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl",
          className,
        )}
        style={{
          borderRadius: "calc(" + borderRadius + " * 0.96)",
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}) => {
  const pathRef = useRef(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const transform = ${transform}
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
}`;
    
    await fs.writeFile(movingBorderComponentPath, movingBorderContent, 'utf8');
    
      // Step 9: Update layout file to include the toaster
    console.log(chalk.blue('Updating layout file with Aceternity UI components...'));
    
    const layoutPath = `src/app/layout.${fileExt}`;
    let layoutContent = await fs.readFile(layoutPath, 'utf8');
    
    if (layoutContent) {
      console.log(chalk.blue('Modifying layout file...'));
      
      // Add import for Toaster
      if (!layoutContent.includes('import { Toaster }')) {
        const importRegex = /^import .+?;/gm;
        let match;
        let lastImportIndex = 0;
        
        while ((match = importRegex.exec(layoutContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        
        const toasterImport = '\nimport { Toaster } from "@/components/ui/toaster";';
        
        if (lastImportIndex > 0) {
          layoutContent = 
            layoutContent.substring(0, lastImportIndex) + 
            toasterImport +
            layoutContent.substring(lastImportIndex);
        } else {
          layoutContent = toasterImport + '\n' + layoutContent;
        }
      }
      
      // Update page title
      layoutContent = updatePageTitle(layoutContent);
      
      // Add dark mode class to html element
      if (layoutContent.includes('<html lang="en">')) {
        layoutContent = layoutContent.replace(
          '<html lang="en">',
          '<html lang="en" className="dark">'
        );
      }
      
      // Add toaster to body
      if (!layoutContent.includes('<Toaster />')) {
        const bodyEndTagIndex = layoutContent.indexOf('</body>');
        
        if (bodyEndTagIndex !== -1) {
          const toasterComponent = `        <Toaster />
`;
          
          layoutContent = 
            layoutContent.substring(0, bodyEndTagIndex) + 
            toasterComponent + 
            layoutContent.substring(bodyEndTagIndex);
        }
      }
      
      await fs.writeFile(layoutPath, layoutContent);
      console.log(chalk.green('Layout file updated successfully'));
    }
    
    // Step 10: Create a welcome page with Aceternity UI components
    console.log(chalk.blue('Creating a welcome page...'));
    const pagePath = `src/app/page.${fileExt}`;
    const pageContent = createWelcomePage(fileExt);
    await fs.writeFile(pagePath, pageContent);
      
    console.log(chalk.green('Aceternity UI setup completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Error setting up Aceternity UI:'), error.message);
    console.log(chalk.yellow('You may need to set up Aceternity UI manually after project creation.'));
  }
  
  process.chdir('..');
}

function updatePageTitle(layoutContent) {
  if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
    layoutContent = layoutContent.replace(
      /(title: ["'])Create Next App(["'])/,
      '$1HackPack Turbo — Build Fast, Ship Faster$2'
    );
    
    if (layoutContent.includes('description:')) {
      layoutContent = layoutContent.replace(
        /(description: ["'])Generated by create next app(["'])/,
        '$1Web application created with HackPack$2'
      );
    }
  }
  
  return layoutContent;
}

function createWelcomePage(fileExt) {
  // For JavaScript
  if (fileExt === 'js' || fileExt === 'jsx') {
    return `"use client"

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/moving-border";;

export default function Home() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Aceternity UI with HackPack 🚀",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-800">
      <div className="max-w-4xl w-full mx-auto text-center p-8 shadow-xl">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Welcome to HackPack
          </h1>

          <p className="text-xl text-gray-300">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Next.js and Aceternity UI.
          </p>

          <div className="flex flex-col gap-4 items-center pt-4">
            <Button
              borderRadius="0.8rem"
              className="text-white text-base border-neutral-200 w-64"
              onClick={handleClick}
            >
              Click me for a toast notification: {count}
            </Button>

            <div className="mt-8 flex gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 text-xs font-medium border border-blue-800">
                Aceternity UI
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-xs font-medium border border-gray-700">
                Next.js
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 text-xs font-medium border border-purple-800">
                HackPack
              </span>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6">
            <p className="text-gray-400 text-sm mt-4">
              Edit{" "}
              <code className="bg-gray-900 p-1 rounded">src/app/page.tsx</code>{" "}
              to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}`;
  } 
  // For TypeScript
  else {
    return `"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/moving-border";

export default function Home() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Aceternity UI with HackPack 🚀",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-950 to-slate-800">
      <div className="max-w-4xl w-full mx-auto text-center p-8 shadow-xl">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Welcome to HackPack
          </h1>

          <p className="text-xl text-gray-300">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Next.js and Aceternity UI.
          </p>

          <div className="flex flex-col gap-4 items-center pt-4">
            <Button
              borderRadius="0.8rem"
              className="text-white text-base border-neutral-200 w-64"
              onClick={handleClick}
            >
              Click me for a toast notification: {count}
            </Button>

            <div className="mt-8 flex gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-900/60 text-blue-200 text-xs font-medium border border-blue-800">
                Aceternity UI
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-200 text-xs font-medium border border-gray-700">
                Next.js
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-900/60 text-purple-200 text-xs font-medium border border-purple-800">
                HackPack
              </span>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6">
            <p className="text-gray-400 text-sm mt-4">
              Edit{" "}
              <code className="bg-gray-900 p-1 rounded">src/app/page.tsx</code>{" "}
              to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;
  }
}