import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';

export async function setupTailwindOnly(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Tailwind CSS only...'));
  
  try {
    // Check if Tailwind CSS is already installed
    let tailwindInstalled = false;
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      tailwindInstalled = !!(packageJson.devDependencies?.tailwindcss || packageJson.dependencies?.tailwindcss);
    } catch (error) {
      console.log(chalk.yellow('Could not read package.json, assuming Tailwind CSS is not installed'));
    }

    // Install Tailwind CSS v4 only if not already installed
    if (!tailwindInstalled) {
      console.log(chalk.blue('Installing Tailwind CSS v4...'));
      await execa('npm', ['install', '-D', 'tailwindcss@next', '@tailwindcss/vite'], { 
        stdio: 'inherit' 
      });
    } else {
      console.log(chalk.green('Tailwind CSS already installed, skipping installation'));
    }

    // Install svelte-sonner for toast notifications
    console.log(chalk.blue('Installing svelte-sonner for toast notifications...'));
    await execa('npm', ['install', 'svelte-sonner'], { 
      stdio: 'inherit' 
    });

    // Update Vite config for Tailwind CSS v4
    console.log(chalk.blue('Updating Vite configuration for Tailwind CSS v4...'));
    await updateViteConfig();

    // Setup app.css with Tailwind v4
    console.log(chalk.blue('Setting up app.css with Tailwind CSS v4...'));
    await createAppCSS();

    // Create welcome page
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);

    // Update app.html
    await updateAppHTML();

    console.log(chalk.green('Tailwind CSS v4 setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Tailwind-only:'), error.message);
    throw error;
  }
}

async function updateViteConfig() {
  const viteConfig = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  optimizeDeps: {
    include: ['svelte-sonner']
  },
  ssr: {
    noExternal: ['svelte-sonner']
  }
});`;

  await fs.writeFile('vite.config.ts', viteConfig);
}

async function createAppCSS() {
  // For Tailwind CSS v4, no config file needed, just CSS imports
  const appCSS = `@import 'tailwindcss';

/* Custom styles */
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}`;

  await fs.writeFile('src/app.css', appCSS);
}

async function updateAppHTML() {
  const appHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HackPack Svelte - Build Fast, Ship Faster</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`;

  await fs.writeFile('src/app.html', appHTML);
}

async function createWelcomePage(languageChoice) {
  // Create layout file
  const layoutContent = languageChoice === 'ts' ? 
`<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster richColors position="top-right" />
<slot />` :
`<script>
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster richColors position="top-right" />
<slot />`;

  await fs.writeFile(`src/routes/+layout.svelte`, layoutContent);

  // Create page content
  const pageContent = languageChoice === 'ts' ?
`<script lang="ts">
  import { toast } from 'svelte-sonner';
  
  let count: number = 0;
  
  const handleClick = (): void => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've installed Tailwind CSS with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="bg-white rounded-xl shadow-2xl p-8 text-center">
      <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to <span class="text-orange-500">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-gray-600">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit and Tailwind CSS v4.
      </p>
      
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">SvelteKit</span>
        <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Tailwind CSS v4</span>
        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Utility-First</span>
        <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">TypeScript</span>
      </div>
      
      <button 
        class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
        on:click={handleClick}
      >
        Click me for a toast (Count: {count})
      </button>
      
      <div class="mt-12 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Edit <code class="bg-gray-100 px-2 py-1 rounded font-mono text-xs">src/routes/+page.svelte</code> to get started
        </p>
      </div>
    </div>
  </div>
</div>` :
`<script>
  import { toast } from 'svelte-sonner';
  
  let count = 0;
  
  const handleClick = () => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've installed Tailwind CSS with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="bg-white rounded-xl shadow-2xl p-8 text-center">
      <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to <span class="text-orange-500">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-gray-600">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit and Tailwind CSS v4.
      </p>
      
      <div class="flex flex-wrap gap-2 justify-center mb-8">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">SvelteKit</span>
        <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Tailwind CSS v4</span>
        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Utility-First</span>
        <span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">JavaScript</span>
      </div>
      
      <button 
        class="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
        on:click={handleClick}
      >
        Click me for a toast (Count: {count})
      </button>
      
      <div class="mt-12 pt-6 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Edit <code class="bg-gray-100 px-2 py-1 rounded font-mono text-xs">src/routes/+page.svelte</code> to get started
        </p>
      </div>
    </div>
  </div>
</div>`;

  await fs.writeFile('src/routes/+page.svelte', pageContent);
}
