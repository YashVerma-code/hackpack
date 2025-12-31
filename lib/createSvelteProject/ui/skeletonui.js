import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';

export async function setupSkeletonUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Skeleton UI with Tailwind CSS v4...'));
  
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
      console.log(chalk.green('✅ Tailwind CSS already installed, skipping installation'));
    }

    // Install Skeleton UI dependencies (following official docs)
    console.log(chalk.blue('Installing Skeleton UI dependencies...'));
    await execa('npm', ['install', '-D', '@skeletonlabs/skeleton', '@skeletonlabs/skeleton-svelte'], { 
      stdio: 'inherit' 
    });

    // Install svelte-sonner for toast notifications
    console.log(chalk.blue('Installing svelte-sonner for toast notifications...'));
    await execa('npm', ['install', 'svelte-sonner'], { 
      stdio: 'inherit'
    });

    // Update Vite config for Tailwind CSS v4
    console.log(chalk.blue('Updating Vite configuration for Tailwind CSS v4...'));
    await updateViteConfig();

    // Setup app.css with Tailwind v4 and Skeleton UI
    console.log(chalk.blue('Setting up app.css with Skeleton UI styles...'));
    await createAppCSS();

    // Create welcome page
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);

    // Update app.html
    await updateAppHTML();

    console.log(chalk.green('Skeleton UI with Tailwind CSS v4 setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Skeleton UI:'), error.message);
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

@import '@skeletonlabs/skeleton'; 
@import '@skeletonlabs/skeleton-svelte'; 
@import '@skeletonlabs/skeleton/themes/cerberus';

/* Custom styles */
html, body { @apply h-full overflow-hidden; }`;

  await fs.writeFile('src/app.css', appCSS);
}

async function updateAppHTML() {
  const appHTML = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HackPack Svelte - Build Fast, Ship Faster</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" data-theme="cerberus">
    <div style="display: contents" class="h-full overflow-hidden">%sveltekit.body%</div>
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
      description: "You've installed Skeleton UI with HackPack!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="card bg-transparent backdrop-blur-sm text-center space-y-6 shadow-2xl p-6 rounded-xl border border-white/10">
      <h1 class="h1 font-bold mb-6 bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent">
        Welcome to <span class="text-orange-400">HackPack</span>
      </h1>
      
      <p class="text-lg text-white/80">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit and Tailwind CSS v4.
      </p>
      
      <div class="flex flex-wrap gap-2 justify-center">
        <span class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">SvelteKit</span>
        <span class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">Skeleton UI</span>
        <span class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Tailwind CSS v4</span>
        <span class="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">TypeScript</span>
      </div>
      
      <button 
        type="button"
        class="btn preset-filled-primary-500 p-2"
        on:click={handleClick}
      >
        Click me for a toast (Count: {count})
      </button>
      
      <hr class="border-t-2 border-dashed border-white/30" />
      
      <div class="space-y-2">
        <p class="text-sm text-white/60">Get Started</p>
        <code class="bg-black/20 text-white/90 px-2 py-1 rounded font-mono text-sm">Edit src/routes/+page.svelte to get started</code>
      </div>
    </div>
  </div>
</div>` :
`<script lang="ts">
  import { toast } from 'svelte-sonner'
  
  let count: number = 0;
  
  const handleClick = (): void => {
    count++;
    toast.success(\`Button clicked \${count} time\${count === 1 ? '' : 's'}! 🚀\`, {
      description: "You've clicked the button in your HackPack app!"
    });
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
  <div class="max-w-4xl w-full">
    <div class="card bg-transparent backdrop-blur-sm text-center space-y-6 shadow-2xl p-6 rounded-xl border border-white/10">
      <h1 class="h1 font-bold mb-6 bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent">
        Welcome to <span class="text-orange-400">HackPack</span>
      </h1>
      
      <p class="text-lg text-white/80">
        Build Fast, Ship Faster! 🚀
        <br />
        This project is set up with SvelteKit and Tailwind CSS v4.
      </p>
      
      <div class="flex flex-wrap gap-2 justify-center">
        <span class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">SvelteKit</span>
        <span class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">Skeleton UI</span>
        <span class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Tailwind CSS v4</span>
        <span class="px-3 py-1 bg-gray-600 text-white rounded-full text-sm font-medium">TypeScript</span>
      </div>
      
      <button 
        type="button"
        class="btn preset-filled-primary-500 p-2"
        on:click={handleClick}
      >
        Click me for a toast (Count: {count})
      </button>
      
      <hr class="border-t-2 border-dashed border-white/30" />
      
      <div class="space-y-2">
        <p class="text-sm text-white/60">Get Started</p>
        <code class="bg-black/20 text-white/90 px-2 py-1 rounded font-mono text-sm">Edit src/routes/+page.svelte to get started</code>
      </div>
    </div>
  </div>
</div>`;

  await fs.writeFile('src/routes/+page.svelte', pageContent);
}
