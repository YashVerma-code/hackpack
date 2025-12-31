import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupShadcnVue(projectName, languageChoice) {
  console.log(chalk.blue('Setting up shadcn-vue...'));
  
  // Remember original working directory and change to project directory only if needed
  const originalCwd = process.cwd();
  let changedDir = false;
  try {
    const currentBase = path.basename(originalCwd);
    if (currentBase !== projectName) {
      const targetDir = path.resolve(originalCwd, projectName);
      process.chdir(targetDir);
      changedDir = true;
    }
  } catch (err) {
    console.error(chalk.red(`Unable to change directory to project '${projectName}': ${err.message}`));
    throw err;
  }
  
  try {
    console.log(chalk.blue('Initializing shadcn-vue...'));

    // Ensure project has an import alias (@/* -> src/*) so shadcn-vue's
    // preflight validation for import aliases succeeds.
    try {
      await ensureImportAlias();
    } catch (err) {
      console.log(chalk.yellow('Could not ensure import alias in tsconfig/jsconfig:'), err.message);
    }
    await execa('npx', ['shadcn-vue@latest', 'init'], { 
      stdio: 'inherit',
      env: { ...process.env, CI: 'true' }
    });
    
    // Add button component
    console.log(chalk.blue('Adding Button component...'));
    await execa('npx', ['shadcn-vue@latest', 'add', 'button'], { 
      stdio: 'inherit' 
    });
    
    // Add toast component (sonner for Vue)
    console.log(chalk.blue('Adding Toast component...'));
    await execa('npx', ['shadcn-vue@latest', 'add', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Creating a welcome page...'));
    
    const fileExt = languageChoice === 'ts' ? 'ts' : 'js';
    const appPath = `src/App.vue`;
    const mainPath = `src/main.${fileExt}`;
    
    try {
      await writeMainFile(fileExt);
    } catch (err) {
      // If writing fails, fallback to trying to patch existing main file
      try {
        const mainContent = await fs.readFile(mainPath, 'utf8');
        if (mainContent) {
          const updatedMainContent = addToasterToMain(mainContent);
          await fs.writeFile(mainPath, updatedMainContent);
        }
      } catch (e) {
        // ignore
      }
    }
    
    const appContent = createWelcomePage();
    await fs.writeFile(appPath, appContent);
    
    // Update index.html title
    await updateIndexHtml();
    
    console.log(chalk.green('shadcn-vue setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up shadcn-vue:'), error.message);
    console.log(chalk.yellow('You may need to set up shadcn-vue manually after project creation.'));
  }
  
  // Restore original working directory if we changed it
  try {
    if (changedDir) process.chdir(originalCwd);
  } catch (err) {
    // best-effort restore; log and continue
    console.log(chalk.yellow(`Warning: could not restore working directory: ${err.message}`));
  }
}

function addToasterToMain(mainContent) {
  // Check if Toaster is already imported
  if (!mainContent.includes("import { Toaster }")) {
    const importRegex = /^import .+?;/gm;
    let match;
    let lastImportIndex = 0;
    
    // Find the position of the last import
    while ((match = importRegex.exec(mainContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const toasterImport = 'import { Toaster } from "./components/ui/sonner";';
    
    if (lastImportIndex > 0) {
      mainContent = 
        mainContent.substring(0, lastImportIndex) + 
        '\n' + toasterImport + 
        mainContent.substring(lastImportIndex);
    } else {
      mainContent = toasterImport + '\n' + mainContent;
    }
  }
  
  return mainContent;
}

async function updateIndexHtml() {
  try {
    const indexPath = 'index.html';
    let indexContent = await fs.readFile(indexPath, 'utf8');
    
    indexContent = indexContent.replace(
      /<title>.*?<\/title>/,
      '<title>HackPack Turbo — Build Fast, Ship Faster</title>'
    );
    
    if (indexContent.includes('name="description"')) {
      indexContent = indexContent.replace(
        /<meta name="description" content=".*?">/,
        '<meta name="description" content="Web application created with HackPack">'
      );
    } else {
      indexContent = indexContent.replace(
        '</head>',
        '    <meta name="description" content="Web application created with HackPack">\n  </head>'
      );
    }
    
    await fs.writeFile(indexPath, indexContent);
  } catch (error) {
    console.log(chalk.yellow('Could not update index.html'));
  }
}

function createWelcomePage() {
  return `<script setup lang="ts">
import { Button } from "./components/ui/button"
import { toast } from "vue-sonner"
import 'vue-sonner/style.css'

const handleClick = () => {
  toast("Success!", {
    description: "You've installed shadcn-vue with HackPack 🚀"
  })
}
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center p-24 bg-linear-to-b from-slate-900 to-slate-800">
    <div class="z-10 max-w-5xl w-full items-center justify-center text-center">
      <h1 class="text-5xl font-bold mb-6 text-white">
        Welcome to <span class="text-blue-400">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-slate-300">
        Build Fast, Ship Faster!🚀
        <br />
        This project is set up with Vue.js and shadcn-vue.
      </p>
      
      <Button 
        @click="handleClick"
        variant="outline"
      >
        Click me for a toast notification
      </Button>
      <p class="mt-12 text-sm text-slate-400">
        Edit <code class="font-mono bg-slate-700 p-1 rounded">src/App.vue</code> to get started
      </p>
    </div>
    
    <Toaster />
  </main>
</template>
`
}

async function writeMainFile(fileExt) {
  const mainPath = `src/main.${fileExt}`;
  const content = `import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { Toaster } from './components/ui/sonner/'

const app = createApp(App)
app.component('Toaster', Toaster)
app.mount('#app')
`;
  await fs.writeFile(mainPath, content, 'utf8');
}

async function ensureImportAlias() {
  const tsPath = path.resolve(process.cwd(), 'tsconfig.json');
  const jsPath = path.resolve(process.cwd(), 'jsconfig.json');
  let cfgPath = null;

  if (await exists(tsPath)) cfgPath = tsPath;
  else if (await exists(jsPath)) cfgPath = jsPath;
  if (!cfgPath) return; // nothing to do

  try {
    let content = await fs.readFile(cfgPath, 'utf8');
    // strip simple JS/JSON comments for JSONC
    const stripped = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    let json = {};
    try {
      json = JSON.parse(stripped);
    } catch (e) {
      // fallback: try parsing original (may still fail)
      try { json = JSON.parse(content); } catch (_) { return; }
    }

    json.compilerOptions = json.compilerOptions || {};
    if (!json.compilerOptions.baseUrl) json.compilerOptions.baseUrl = ".";
    json.compilerOptions.paths = json.compilerOptions.paths || {};
    if (!json.compilerOptions.paths['@/*']) {
      json.compilerOptions.paths['@/*'] = ['src/*'];
    }

    await fs.writeFile(cfgPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(chalk.green(`Wrote import alias to ${path.basename(cfgPath)}`));
  } catch (err) {
    // don't fail the whole setup if we can't write
    console.log(chalk.yellow('Failed to update tsconfig/jsconfig for import alias:'), err.message);
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}