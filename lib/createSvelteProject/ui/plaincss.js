import chalk from 'chalk';
import fs from 'fs/promises';

export async function setupPlainCSS(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Plain CSS...'));
  
  try {
    // Install svelte-sonner for toast notifications
    console.log(chalk.blue('Installing svelte-sonner...'));
    
    // Check if package.json exists and parse it
    let packageExists = false;
    let currentDeps = {};
    
    try {
      const packageJson = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(packageJson);
      currentDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      packageExists = true;
    } catch {
      console.log(chalk.yellow('package.json not found, assuming new project'));
    }
    
    // Only install if not already present
    const depsToInstall = [];
    if (!currentDeps['svelte-sonner']) {
      depsToInstall.push('svelte-sonner');
    }
    
    if (depsToInstall.length > 0) {
      const { execa } = await import('execa');
      await execa('npm', ['install', ...depsToInstall], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } else {
      console.log(chalk.green('All dependencies already installed'));
    }

    // Create app.css with custom styles
    await createAppCSS();

    // Create welcome page
    console.log(chalk.blue('Creating welcome page...'));
    await createWelcomePage(languageChoice);

    // Update app.html
    await updateAppHTML();

    console.log(chalk.green('Plain CSS setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Plain CSS:'), error.message);
    throw error;
  }
}

async function createAppCSS() {
  const appCSS = `/* Modern CSS Reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Root Variables */
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-bg: #ffffff;
  --color-bg-alt: #f8fafc;
  --color-text: #1e293b;
  --color-text-light: #64748b;
  --color-border: #e2e8f0;
  --color-shadow: rgba(0, 0, 0, 0.1);
  
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  --font-size-5xl: 3rem;
  
  --border-radius: 0.5rem;
  --border-radius-lg: 0.75rem;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  --transition: all 0.2s ease-in-out;
}

/* Base Styles */
html {
  font-family: var(--font-family);
  line-height: 1.6;
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
  transition: var(--transition);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-5xl); }
h2 { font-size: var(--font-size-4xl); }
h3 { font-size: var(--font-size-3xl); }
h4 { font-size: var(--font-size-2xl); }
h5 { font-size: var(--font-size-xl); }
h6 { font-size: var(--font-size-lg); }

p {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-light);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  outline: none;
  min-width: 120px;
}

.btn:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  min-width: 150px;
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  min-width: 100px;
}

/* Card Styles */
.card {
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: 0 2px 8px var(--color-shadow);
  transition: var(--transition);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--color-shadow);
}

/* Badge Styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  border-radius: var(--border-radius);
  white-space: nowrap;
}

.badge-primary { background-color: var(--color-primary); color: white; }
.badge-secondary { background-color: var(--color-secondary); color: white; }
.badge-success { background-color: var(--color-success); color: white; }
.badge-warning { background-color: var(--color-warning); color: white; }
.badge-error { background-color: var(--color-error); color: white; }

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }

.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }
.mt-12 { margin-top: 3rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

.min-h-screen { min-height: 100vh; }
.w-full { width: 100%; }
.max-w-4xl { max-width: 56rem; }

/* Gradient */
.gradient-bg {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Code styles */
code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: var(--color-bg-alt);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  border: 1px solid var(--color-border);
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .card {
    padding: var(--spacing-lg);
  }
  
  h1 { font-size: var(--font-size-4xl); }
  h2 { font-size: var(--font-size-3xl); }
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
  const layoutContent = `<script>
  import '../app.css';
</script>

<main>
  <slot />
</main>`;

  await fs.writeFile(`src/routes/+layout.svelte`, layoutContent);

  // Create page content
  const pageContent = languageChoice === 'ts' ?
`<script lang="ts">
  import { toast } from 'svelte-sonner';
  
  const handleClick = (): void => {
    toast.success('🚀 You\'ve installed Plain CSS with HackPack!');
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center gradient-bg">
  <div class="container">
    <div class="max-w-4xl w-full">
      <div class="card text-center">
        <h1>
          Welcome to <span class="gradient-text">HackPack</span>
        </h1>
        
        <p style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-xl);">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with SvelteKit and custom CSS.
        </p>
        
        <div class="flex flex-wrap gap-4 justify-center mb-8">
          <span class="badge badge-primary">SvelteKit</span>
          <span class="badge badge-secondary">Custom CSS</span>
          <span class="badge badge-success">Responsive Design</span>
          <span class="badge badge-warning">TypeScript</span>
        </div>
        
        <div class="flex flex-col gap-6 items-center">
          <button class="btn btn-primary btn-lg" on:click={handleClick}>
            Click me for a toast notification
          </button>
          
          <button class="btn btn-outline" on:click={() => toast.info('Plain CSS is ready to use!')}>
            Test another notification
          </button>
        </div>
        
        <div style="margin-top: var(--spacing-2xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--color-border);">
          <p style="font-size: var(--font-size-sm); color: var(--color-text-light);">
            Edit <code>src/routes/+page.svelte</code> to get started
          </p>
        </div>
      </div>
    </div>
  </div>
</div>` :
`<script>
  import { toast } from 'svelte-sonner';
  
  const handleClick = () => {
    toast.success('🚀 You\'ve installed Plain CSS with HackPack!');
  };
</script>

<svelte:head>
  <title>HackPack Svelte - Build Fast, Ship Faster</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center gradient-bg">
  <div class="container">
    <div class="max-w-4xl w-full">
      <div class="card text-center">
        <h1>
          Welcome to <span class="gradient-text">HackPack</span>
        </h1>
        
        <p style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-xl);">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with SvelteKit and custom CSS.
        </p>
        
        <div class="flex flex-wrap gap-4 justify-center mb-8">
          <span class="badge badge-primary">SvelteKit</span>
          <span class="badge badge-secondary">Custom CSS</span>
          <span class="badge badge-success">Responsive Design</span>
          <span class="badge badge-warning">JavaScript</span>
        </div>
        
        <div class="flex flex-col gap-6 items-center">
          <button class="btn btn-primary btn-lg" on:click={handleClick}>
            Click me for a toast notification
          </button>
          
          <button class="btn btn-outline" on:click={() => toast.info('Plain CSS is ready to use!')}>
            Test another notification
          </button>
        </div>
        
        <div style="margin-top: var(--spacing-2xl); padding-top: var(--spacing-xl); border-top: 1px solid var(--color-border);">
          <p style="font-size: var(--font-size-sm); color: var(--color-text-light);">
            Edit <code>src/routes/+page.svelte</code> to get started
          </p>
        </div>
      </div>
    </div>
  </div>
</div>`;

  await fs.writeFile('src/routes/+page.svelte', pageContent);
}
