import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';

export async function setupFlowbite(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Flowbite Svelte with Tailwind CSS 4...'));
  
  try {
    // Install Tailwind CSS 4 
    console.log(chalk.blue('Installing Tailwind CSS 4...'));
    await execa('npm', ['install', '-D', 'tailwindcss@next', '@tailwindcss/vite'], { 
      stdio: 'inherit' 
    });

    // Install Flowbite Svelte dependencies (latest version)
    console.log(chalk.blue('Installing Flowbite Svelte dependencies...'));
    await execa('npm', ['install', '-D', 'flowbite-svelte', 'flowbite', 'flowbite-svelte-icons'], { 
      stdio: 'inherit' 
    });

    // Install svelte-sonner for toast notifications
    console.log(chalk.blue('Installing svelte-sonner for toast notifications...'));
    await execa('npm', ['install', 'svelte-sonner'], { 
      stdio: 'inherit' 
    });

    // Create Tailwind config for v4
    console.log(chalk.blue('Creating Tailwind CSS 4 configuration...'));
    await createTailwindConfig();

    // Setup app.css with Tailwind 4 and Flowbite
    console.log(chalk.blue('Configuring Tailwind CSS 4 with Flowbite...'));
    await createAppCSS();

    // Update Vite config for Tailwind 4 and svelte-sonner compatibility
    console.log(chalk.blue('Updating Vite configuration...'));
    await updateViteConfig();

    // Create welcome page
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);

    // Update app.html
    await updateAppHTML();

    console.log(chalk.green('Flowbite Svelte with Tailwind CSS setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Flowbite Svelte:'), error.message);
    throw error;
  }
}

async function createAppCSS() {
  const appCSS = `@import 'tailwindcss';
@plugin 'flowbite/plugin';

@source "../node_modules/flowbite-svelte/dist";`;

  await fs.writeFile('src/app.css', appCSS);
}

async function createTailwindConfig() {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}']
};`;

  await fs.writeFile('tailwind.config.js', tailwindConfig);
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

async function updateAppHTML() {
  const appHTML = `<!DOCTYPE html>
<html lang="en" class="%sveltekit.theme%">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HackPack Svelte - Build Fast, Ship Faster</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="bg-white dark:bg-gray-900">
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
  import { Card, Badge } from 'flowbite-svelte';
  import { toast } from 'svelte-sonner';
  
  let count: number = 0;
  
  const handleClick = (): void => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've installed Flowbite Svelte with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen w-full bg-gradient-to-b from-blue-900 to-teal-700 flex items-center justify-center p-4">
  <Card class="text-center shadow-xl max-w-3xl border-0 !bg-transparent">
    <div class="p-8">
      <h1 class="text-5xl font-bold mb-6 text-gray-900">
        Welcome to <span class="text-teal-600">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-gray-400">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit, Flowbite Svelte, and Tailwind CSS 4.
      </p>
      
      <div class="flex flex-wrap gap-4 justify-center mb-8">
        <Badge color="blue">SvelteKit</Badge>
        <Badge color="green">Flowbite Svelte</Badge>
        <Badge color="yellow">TypeScript</Badge>
      </div>
      
      <button 
        on:click={handleClick}
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
      >
        Click me for a toast (Count: {count})
      </button>
      
      <p class="mt-12 text-sm text-gray-300 border-t border-gray-400 pt-6">
        Edit <code class="font-mono bg-gray-700 p-1 rounded">src/routes/+page.svelte</code> to get started
      </p>
    </div>
  </Card>
</div>` :
`<script>
  import { Card, Badge, Button } from 'flowbite-svelte';
  import { toast } from 'svelte-sonner';
  
  let count = 0;
  
  const handleClick = () => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've installed Flowbite Svelte with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen w-full bg-gradient-to-b from-blue-900 to-teal-700 flex items-center justify-center p-4">
  <Card class="text-center shadow-xl max-w-3xl border-0 !bg-transparent">
    <div class="p-8">
      <h1 class="text-5xl font-bold mb-6 text-gray-900">
        Welcome to <span class="text-teal-600">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-gray-400">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit, Flowbite Svelte, and Tailwind CSS 4.
      </p>
      
      <div class="flex flex-wrap gap-4 justify-center mb-8">
        <Badge color="blue">SvelteKit</Badge>
        <Badge color="green">Flowbite Svelte</Badge>
        <Badge color="yellow">TypeScript</Badge>
      </div>
      
      <button 
        on:click={handleClick}
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
      >
        Click me for a toast (Count: {count})
      </button>
      
      <p class="mt-12 text-sm text-gray-300 border-t border-gray-400 pt-6">
        Edit <code class="font-mono bg-gray-700 p-1 rounded">src/routes/+page.svelte</code> to get started
      </p>
    </div>
  </Card>
</div>`;

  await fs.writeFile('src/routes/+page.svelte', pageContent);
}