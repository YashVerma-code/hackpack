import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs/promises';

export async function setupShadcnUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up shadcn/ui for Vite + React...'));
  
  try {
    console.log(chalk.blue('Installing Tailwind CSS v4...'));
    await execa('npm', ['add', 'tailwindcss', '@tailwindcss/vite'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Installing @types/node...'));
    await execa('npm', ['add', '-D', '@types/node'], { 
      stdio: 'inherit' 
    });
      console.log(chalk.blue('Updating index.css...'));
    const indexCssPath = 'src/index.css';
    const tailwindCssContent = '@import "tailwindcss";\n';
    await fs.writeFile(indexCssPath, tailwindCssContent);
    
    console.log(chalk.blue('Setting up path aliases...'));
    await setupPathAliases(languageChoice);
    
    console.log(chalk.blue('Updating vite.config...'));
    await updateViteConfig(languageChoice);
    
    console.log(chalk.blue('Initializing shadcn/ui...'));
    await execa('npx', ['shadcn@latest', 'init'], { 
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    
    console.log(chalk.blue('Adding Button component...'));
    await execa('npx', ['shadcn@latest', 'add', 'button'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Adding Toast component...'));
    await execa('npx', ['shadcn@latest', 'add', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);
    
    console.log(chalk.blue('Adding Toaster to main file...'));
    await updateMainFile(languageChoice);
    
    console.log(chalk.green('shadcn/ui setup completed successfully!'));
    console.log(chalk.yellow('Run "npm dev" to start your development server.'));
  } catch (error) {
    console.error(chalk.red('Error setting up shadcn/ui:'), error.message);
    console.log(chalk.yellow('You may need to set up shadcn/ui manually after project creation.'));
  }
  
  process.chdir('..');
}

async function setupPathAliases(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  
  if (isTypeScript) {
    await updateTsConfig();
    await updateTsAppConfig();
    await ensureTsConfigNode();
  } else {
    console.log(chalk.blue('Creating jsconfig.json for JavaScript project...'));
    
    const jsconfig = {
      "compilerOptions": {
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    };
    
    await fs.writeFile('jsconfig.json', JSON.stringify(jsconfig, null, 2));
    console.log(chalk.green('Created jsconfig.json'));
  }
}

async function updateTsConfig() {
  try {
    const tsconfigPath = 'tsconfig.json';
    let tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
    
    tsconfigContent = tsconfigContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const tsconfig = JSON.parse(tsconfigContent);
    
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    tsconfig.compilerOptions.baseUrl = ".";
    tsconfig.compilerOptions.paths = {
      "@/*": ["./src/*"]
    };
      await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update tsconfig.json: ${error.message}`));
    await createFallbackTsConfig();
  }
}

async function updateTsAppConfig() {
  try {
    const tsconfigAppPath = 'tsconfig.app.json';
    
    try {
      await fs.access(tsconfigAppPath);
    } catch {
      console.warn(chalk.yellow('tsconfig.app.json not found, skipping...'));
      return;
    }
    
    let tsconfigAppContent = await fs.readFile(tsconfigAppPath, 'utf8');
    
    tsconfigAppContent = tsconfigAppContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const tsconfigApp = JSON.parse(tsconfigAppContent);
    
    if (!tsconfigApp.compilerOptions) {
      tsconfigApp.compilerOptions = {};
    }
    
    tsconfigApp.compilerOptions.baseUrl = ".";
    tsconfigApp.compilerOptions.paths = {
      "@/*": ["./src/*"]
    };
    
    await fs.writeFile(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update tsconfig.app.json: ${error.message}`));
  }
}

async function ensureTsConfigNode() {
  try {
    const tsconfigNodePath = 'tsconfig.node.json';
    
    try {
      await fs.access(tsconfigNodePath);
      console.log(chalk.green('tsconfig.node.json already exists'));
      return;
    } catch {
      const tsconfigNode = {
        "compilerOptions": {
          "target": "ES2022",
          "lib": ["ES2023"],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "isolatedModules": true,
          "moduleDetection": "force",
          "noEmit": true,
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true,
          "noUncheckedSideEffectImports": true
        },
        "include": ["vite.config.ts"]
      };
      
      await fs.writeFile(tsconfigNodePath, JSON.stringify(tsconfigNode, null, 2));
      console.log(chalk.green('Created tsconfig.node.json'));
    }
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not create tsconfig.node.json: ${error.message}`));
  }
}

async function createFallbackTsConfig() {
  const fallbackTsConfig = {
    "files": [],
    "references": [
      {
        "path": "./tsconfig.app.json"
      },
      {
        "path": "./tsconfig.node.json"
      }
    ],
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  };
  
  await fs.writeFile('tsconfig.json', JSON.stringify(fallbackTsConfig, null, 2));
  console.log(chalk.green('Created fallback tsconfig.json'));
}

async function updateViteConfig(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  const configFile = isTypeScript ? 'vite.config.ts' : 'vite.config.js';
  
  const viteConfigContent = `import { fileURLToPath, URL } from 'node:url'
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

`;
  
  await fs.writeFile(configFile, viteConfigContent);
}

async function createWelcomePage(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  const appFile = isTypeScript ? 'src/App.tsx' : 'src/App.jsx';
  
  const appContent = `import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function App() {
  const handleClick = () => {
    toast.success("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've installed shadcn/ui with HackPack 🚀
        </span>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>
        
        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and shadcn/ui.
        </p>
        
        <Button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification
        </Button>
        
        <p className="mt-12 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.${isTypeScript ? 'tsx' : 'jsx'}</code> to get started
        </p>
      </div>
    </div>
  )
}

export default App
`;
  
  await fs.writeFile(appFile, appContent);
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
        '<App />',
        '<>\n    <App />\n    <Toaster />\n  </>'
      );
    }
    
    await fs.writeFile(mainFile, mainContent);
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not update main file with Toaster'));
  }
}