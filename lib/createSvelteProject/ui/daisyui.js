import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';

export async function setupDaisyUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up DaisyUI with Tailwind CSS 4...'));
  
  try {
    // Install Tailwind CSS 4
    console.log(chalk.blue('Installing Tailwind CSS 4...'));
    await execa('npm', ['install', '-D', 'tailwindcss@next', '@tailwindcss/vite'], { 
      stdio: 'inherit' 
    });

    // Install DaisyUI dependencies
    console.log(chalk.blue('Installing DaisyUI dependencies...'));
    await execa('npm', ['install', '-D', 'daisyui'], { 
      stdio: 'inherit' 
    });

    // Install svelte-sonner for toast notifications
    console.log(chalk.blue('Installing svelte-sonner for toast notifications...'));
    await execa('npm', ['install', 'svelte-sonner'], { 
      stdio: 'inherit' 
    });

    // Create Tailwind config for v4 with DaisyUI
    console.log(chalk.blue('Creating Tailwind CSS 4 configuration with DaisyUI...'));
    await setupTailwindConfig();

    // Setup app.css with Tailwind 4 and DaisyUI
    console.log(chalk.blue('Configuring Tailwind CSS 4 with DaisyUI...'));
    await createAppCSS();

    // Update Vite config for Tailwind 4 and svelte-sonner compatibility
    console.log(chalk.blue('Updating Vite configuration...'));
    await updateViteConfig();

    // Create welcome page
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);

    // Update app.html
    await updateAppHTML();

    console.log(chalk.green('DaisyUI with Tailwind CSS 4 setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up DaisyUI:'), error.message);
    throw error;
  }
}

async function setupTailwindConfig() {
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
}`;

  await fs.writeFile('tailwind.config.js', tailwindConfig);
}

async function createAppCSS() {
  const appCSS = `@import 'tailwindcss';
@plugin 'daisyui';

/* Custom styles */
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}`;

  await fs.writeFile('src/app.css', appCSS);
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
<html lang="en" data-theme="dark">
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
<main>
  <slot />
</main>` :
`<script>
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
</script>

<Toaster richColors position="top-right" />
<main>
  <slot />
</main>`;

  await fs.writeFile(`src/routes/+layout.svelte`, layoutContent);

  // Create page content
  const pageContent = languageChoice === 'ts' ?
`<script lang="ts">
  import { toast } from 'svelte-sonner';
  
  let count: number = 0;
  const handleClick = (): void => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've installed DaisyUI with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-[#1e1b4b] via-[#1e3a8a] to-[#111827] flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="card bg-transparent shadow-2xl">
      <div class="card-body text-center text-base-content">
        <h1 class="text-5xl font-bold mb-6">
          Welcome to <span class="text-primary">HackPack</span>
        </h1>
        
        <p class="text-lg mb-8 opacity-70">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with SvelteKit, DaisyUI, and Tailwind CSS 4.
        </p>
        
        <div class="flex flex-wrap gap-2 justify-center mb-8">
          <div class="badge badge-primary">SvelteKit</div>
          <div class="badge badge-secondary">DaisyUI</div>
          <div class="badge badge-ghost">TypeScript</div>
        </div>
        
        <div class="flex flex-col gap-4 items-center">
          <button class="btn btn-primary btn-lg" on:click={handleClick}>
            Click me for a toast: {count}
          </button>
        </div>
        
        <div class="divider">Get Started</div>
        <p class="text-sm opacity-60">
          Edit <code class="font-mono bg-base-200 p-1 rounded">src/routes/+page.svelte</code> to get started
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
      description: "You've installed DaisyUI with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>


<div class="min-h-screen bg-gradient-to-b from-[#1e1b4b] via-[#1e3a8a] to-[#111827] flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="card bg-transparent shadow-2xl">
      <div class="card-body text-center text-base-content">
        <h1 class="text-5xl font-bold mb-6">
          Welcome to <span class="text-primary">HackPack</span>
        </h1>
        
        <p class="text-lg mb-8 opacity-70">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with SvelteKit, DaisyUI, and Tailwind CSS 4.
        </p>
        
        <div class="flex flex-wrap gap-2 justify-center mb-8">
          <div class="badge badge-primary">SvelteKit</div>
          <div class="badge badge-secondary">DaisyUI</div>
          <div class="badge badge-ghost">JavaScript</div>
        </div>
        
        <div class="flex flex-col gap-4 items-center">
          <button class="btn btn-primary btn-lg" on:click={handleClick}>
            Click me for a toast: {count}
          </button>
        </div>
        
        <div class="divider">Get Started</div>
        <p class="text-sm opacity-60">
          Edit <code class="font-mono bg-base-200 p-1 rounded">src/routes/+page.svelte</code> to get started
        </p>
      </div>
    </div>
  </div>
</div>
`;

  await fs.writeFile('src/routes/+page.svelte', pageContent);
}
