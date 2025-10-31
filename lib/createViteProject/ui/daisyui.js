import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupDaisyUI(projectName, languageChoice, opts = {}) {
  console.log(chalk.blue('Setting up daisyUI for Vite+React...'));

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

    await ensureTailwindIsInstalled();
    console.log(chalk.blue('Installing daisyUI...'));
    await execa('npm', ['install', 'daisyui', '--save-dev'], {
      stdio: 'inherit'
    });

    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], {
      stdio: 'inherit'
    });
    await configurePlugins(currentDir);

    await createWelcomeApp(languageChoice);

    await updateMainFile(languageChoice);

    await writeViteConfig(languageChoice);

    console.log(chalk.green('daisyUI setup for Vite+React completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up daisyUI for Vite+React:'), error.message);
    console.log(chalk.yellow('You may need to set up daisyUI manually after project creation.'));
  } finally {
    const currentDir = process.cwd();
    if (currentDir !== originalDir) {
      process.chdir(originalDir);
      console.log(`Returned to original directory: ${originalDir}`);
    }
  }
}

async function writeViteConfig(languageChoice) {
  const configFile = `vite.config.${languageChoice === 'ts' ? 'ts' : 'js'}`;
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
})`;

  try {
    await fs.writeFile(configFile, viteConfig, 'utf8');
    console.log(chalk.green(`✓ Created ${configFile}`));
  } catch (error) {
    console.error(chalk.red(`Error creating ${configFile}:`), error.message);
    throw error;
  }
}

async function ensureTailwindIsInstalled() {
  try {
    console.log(chalk.blue('Checking Tailwind CSS installation...'));

    const packageJsonContent = await fs.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    const hasTailwind = packageJson.dependencies?.tailwindcss ||
      packageJson.devDependencies?.tailwindcss;

    if (!hasTailwind) {
      console.log(chalk.yellow('Tailwind CSS not found in dependencies. Installing Tailwind CSS...'));
      await installTailwindCSS();
    } else {
      console.log(chalk.green('Tailwind CSS found in dependencies.'));
      try {
        await fs.access('tailwind.config.js');
        console.log(chalk.green('Tailwind config found.'));
      } catch (error) {
        console.log(chalk.yellow('Tailwind config not found. Creating it...'));
        await createTailwindConfig();
      }

      await updateCSSWithTailwindDirectives();
    }
  } catch (error) {
    console.error(chalk.red('Error checking Tailwind installation:'), error.message);
    await installTailwindCSS();
  }
}

async function installTailwindCSS() {
  console.log(chalk.blue('Installing Tailwind CSS v3 and dependencies...'));

  try {
    //   await execa('npm', ['install', '-D', 'tailwindcss@3', 'postcss', 'autoprefixer'], { 
    //     stdio: 'inherit' 
    //   });

    // await createTailwindConfig();
    await updateCSSWithTailwindDirectives();

    //   console.log(chalk.green('Tailwind CSS v3 installed successfully.'));
    // } catch (error) {
    //   console.error(chalk.red('Error installing Tailwind CSS:'), error.message);
    //   throw error;
    // }
    console.log(chalk.blue("Setting up Tailwind CSS..."));
    const projectPath = process.cwd();
    console.log(
      chalk.blue("Installing Tailwind CSS...")
    );

    await execa(
      "npm",
      [
        "install", "tailwindcss", "@tailwindcss/vite"
      ],
      { stdio: "inherit" }
    );
    const nuxtConfigPath = path.join(process.cwd(), "vite.config.ts");

    // Read existing file
    let nuxtConfig = await fs.readFile(nuxtConfigPath, "utf8");

    // Tailwind config snippet to insert
    const tailwindSnippet = `import tailwindcss from "@tailwindcss/vite";\n`;

    // If tailwindcss import not already there, add it
    if (!nuxtConfig.includes('@tailwindcss/vite')) {
      nuxtConfig = tailwindSnippet + nuxtConfig;
    }

    // Add css and vite config if not present
    if (!nuxtConfig.includes("tailwindcss()")) {
      // If plugins array already exists
      if (nuxtConfig.match(/plugins\s*:\s*\[/)) {
        // Add tailwindcss() inside the plugins array
        nuxtConfig = nuxtConfig.replace(
          /plugins\s*:\s*\[\s*([^\]]*)\]/,
          (match, p1) => {
            // Trim trailing commas and add tailwindcss()
            const hasComma = p1.trim().endsWith(",") || p1.trim() === "";
            return `plugins: [${p1.trim()}${hasComma ? "" : ","} tailwindcss()]`;
          }
        );
      } else {
        // If no plugins array exists, create one
        nuxtConfig = nuxtConfig.replace(
          /defineConfig\s*\(\s*\{\s*/,
          `defineConfig({ plugins: [tailwindcss()], `
        );
      }
    }
    // Write the updated config back
    await fs.writeFile(nuxtConfigPath, nuxtConfig, "utf8");

    const cssDir = path.join(process.cwd(), "src");
    const cssFilePath = path.join(cssDir, "index.css");

    // Make sure directory exists
    await fs.mkdir(cssDir, { recursive: true });

    // Tailwind import content
    const tailwindDirectives = `@import "tailwindcss";\n`;

    // Write the file (overwrites if exists)
    await fs.writeFile(cssFilePath, tailwindDirectives, "utf8");
  } catch (error) {
    console.error(chalk.red('Error installing Tailwind CSS:'), error.message);
    throw error;
  }
}

async function createTailwindConfig() {
  console.log(chalk.blue('Creating Tailwind config...'));

  try {
    await execa('npx', ['tailwindcss', 'init', '-p'], {
      stdio: 'inherit'
    });

    let configContent = await fs.readFile('tailwind.config.js', 'utf8');

    if (!configContent.includes('./src/**/*.{js,ts,jsx,tsx}')) {
      configContent = configContent.replace(
        'content: [],',
        `content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],`
      );

      await fs.writeFile('tailwind.config.js', configContent, 'utf8');
    }

    console.log(chalk.green('Tailwind config created and updated.'));
  } catch (error) {
    console.error(chalk.red('Error creating Tailwind config:'), error.message);
    throw error;
  }
}

async function updateCSSWithTailwindDirectives() {
  console.log(chalk.blue('Clearing CSS files and updating with Tailwind directives...'));

  try {
    await clearCSSFiles();

    let cssFile = 'src/index.css';
    try {
      await fs.access(cssFile);
    } catch {
      cssFile = 'src/App.css';
      try {
        await fs.access(cssFile);
      } catch {
        console.log(chalk.yellow('No CSS file found. Creating src/index.css...'));
        await fs.writeFile(cssFile, '', 'utf8');
      }
    }

    const tailwindDirectives = '@tailwind base;\n@tailwind components;\n@tailwind utilities;';
    await fs.writeFile(cssFile, tailwindDirectives, 'utf8');

    console.log(chalk.green(`Tailwind directives added to ${cssFile}`));
  } catch (error) {
    console.error(chalk.red('Error updating CSS with Tailwind directives:'), error.message);
    throw error;
  }
}

async function configurePlugins(projectPath) {
  console.log(chalk.blue('Adding daisyUI to Tailwind config...'));

  try {
    const stylesPath = path.join(projectPath, "src", "index.css");
    const daisyUiDirective = '@import "tailwindcss";\n@plugin "daisyui";';
    await fs.writeFile(stylesPath, daisyUiDirective, "utf8");
    console.log(chalk.green(`✓ Added '@plugin "daisyui";' to ${stylesPath}`));
  } catch (error) {
    console.error(chalk.red('Error configuring daisyUI plugin:'), error.message);
    throw error;
  }
}

async function createWelcomeApp(languageChoice) {
  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const appPath = `src/App.${fileExt}`;

  const appContent = languageChoice === 'ts' ?
    `import { toast } from "sonner";

export default function App() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed daisyUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="hero min-h-screen bg-gradient-to-b from-primary to-secondary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-primary-content">Welcome to <span className="text-accent">HackPack</span></h1>
          <p className="py-6 text-primary-content">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Vite, React, and daisyUI.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <button 
              onClick={handleClick}
              className="btn btn-primary"
            >
              Click me for a toast notification
            </button>
            
            <div className="mt-8 flex gap-4">
              <div className="badge badge-primary">daisyUI</div>
              <div className="badge badge-secondary">Vite</div>
              <div className="badge badge-accent">HackPack</div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <p className="text-sm opacity-70">
            Edit <code className="bg-base-300 px-1 rounded">src/App.tsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`
    :
    `import { toast } from "sonner";

export default function App() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed daisyUI with HackPack 🚀",
    });
  };
  
  return (
    <div className="hero min-h-screen bg-gradient-to-b from-primary to-secondary">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-primary-content">Welcome to <span className="text-accent">HackPack</span></h1>
          <p className="py-6 text-primary-content">
            Build Fast, Ship Faster! 🚀
            <br />
            This project is set up with Vite, React, and daisyUI.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <button 
              onClick={handleClick}
              className="btn btn-primary"
            >
              Click me for a toast notification
            </button>
            
            <div className="mt-8 flex gap-4">
              <div className="badge badge-primary">daisyUI</div>
              <div className="badge badge-secondary">Vite</div>
              <div className="badge badge-accent">HackPack</div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <p className="text-sm opacity-70">
            Edit <code className="bg-base-300 px-1 rounded">src/App.jsx</code> to get started
          </p>
        </div>
      </div>
    </div>
  );
}`;

  try {
    await fs.writeFile(appPath, appContent, 'utf8');
    console.log(chalk.blue('Created welcome page with daisyUI components.'));
  } catch (error) {
    console.error(chalk.yellow('Could not create welcome page:'), error.message);
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
