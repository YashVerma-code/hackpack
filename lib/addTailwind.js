import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';
import { setupTailwindOnly } from './createNextProject/ui/twonly.js';

async function readJSON(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}

function hasTailwindInPkg(pkg) {
  if (!pkg) return false;
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.keys(all || {}).some(k => k.startsWith('tailwindcss'));
}

export async function addTailwind({ framework, projectName }) {
  const projectPath = path.resolve(process.cwd(), projectName);
  if (!fsSync.existsSync(projectPath)) {
    console.log(chalk.red(`Project directory '${projectName}' not found.`));
    process.exit(1);
  }
  const pkg = await readJSON(path.join(projectPath, 'package.json'));
  if (hasTailwindInPkg(pkg)) {
    console.log(chalk.green('Tailwind already present. Skipping installation.'));
    return;
  }
  switch (framework) {
    case 'next':
      await addTailwindNext(projectPath);
      break;
    case 'vite-react':
      await addTailwindViteReact(projectPath);
      break;
    case 'svelte':
      await addTailwindSvelte(projectPath);
      break;
    default:
      console.log(chalk.yellow('Tailwind add not implemented for this framework yet.'));
  }
}

async function addTailwindNext(projectPath) {
  console.log(chalk.blue('Adding Tailwind CSS (v4) to Next.js project...'));
  await execa('npm', ['install', '-D', 'tailwindcss@^4.0.0', '@tailwindcss/postcss', 'postcss'], { cwd: projectPath, stdio: 'inherit' });
  const postcssPath = path.join(projectPath, 'postcss.config.mjs');
  if (!fsSync.existsSync(postcssPath)) {
    await fs.writeFile(postcssPath, `const config = { plugins: { '@tailwindcss/postcss': {}, } };
export default config;`);
  }
  const appDir = path.join(projectPath, 'app');
  const srcDir = path.join(projectPath, 'src');
  let globalCSSPath;
  if (fsSync.existsSync(path.join(srcDir, 'app', 'globals.css'))) {
    globalCSSPath = path.join(srcDir, 'app', 'globals.css');
  } else if (fsSync.existsSync(path.join(appDir, 'globals.css'))) {
    globalCSSPath = path.join(appDir, 'globals.css');
  } else {
    const targetDir = fsSync.existsSync(path.join(srcDir, 'app')) ? path.join(srcDir, 'app') : appDir;
    if (!fsSync.existsSync(targetDir)) fsSync.mkdirSync(targetDir, { recursive: true });
    globalCSSPath = path.join(targetDir, 'globals.css');
    await fs.writeFile(globalCSSPath, '@import "tailwindcss";\n');
  }
  let existing = await fs.readFile(globalCSSPath,'utf8');

  try {
    const starRuleRegex = /\*\s*\{[^}]*\}/g;
    existing = existing.replace(starRuleRegex, (match) => {
      const lower = match.toLowerCase();
      if (lower.includes('box-sizing') && lower.includes('border-box') && lower.includes('padding') && lower.includes('margin')) {
        return '';
      }
      return match;
    }).trimStart();
  } catch (e) {
    // on any unexpected regex failure, keep original content
    console.log(chalk.yellow('Warning: failed to sanitize globals.css:'), e.message);
  }

  // Ensure Tailwind import is present and write cleaned content back
  let cleaned = existing;
  if (!cleaned.includes('@import "tailwindcss"')) {
    cleaned = `@import "tailwindcss";\n${cleaned}`;
  }
  await fs.writeFile(globalCSSPath, cleaned, 'utf8');
  console.log(chalk.green('Tailwind CSS added to Next.js project.'));

  // if this looks like a HackPack-created project, replace welcome page with Tailwind welcome UI
  try {
    const srcAppDir = fsSync.existsSync(path.join(projectPath, 'src', 'app')) ? path.join(projectPath, 'src', 'app') : path.join(projectPath, 'app');
    const pageTsx = path.join(srcAppDir, 'page.tsx');
    const pageJs = path.join(srcAppDir, 'page.js');
    let pagePath = null;
    let fileExt = null;

    if (fsSync.existsSync(pageTsx)) { pagePath = pageTsx; fileExt = 'tsx'; }
    else if (fsSync.existsSync(pageJs)) { pagePath = pageJs; fileExt = 'js'; }

    if (pagePath) {
      const pageContent = await fs.readFile(pagePath, 'utf8');
      if (
        /hackpack/i.test(pageContent) ||
        /welcome to hackpack/i.test(pageContent) ||
        /welcome to .*hackpack/i.test(pageContent) ||
        /<h1[^>]*>\s*welcome to\s*<span[^>]*>hackpack<\/span>/i.test(pageContent) ||
        /<div[^>]*class[^>]*badge[^>]*>\s*hackpack\s*<\/div>/i.test(pageContent)
      ) {
        console.log(chalk.blue('Detected HackPack welcome page — writing Tailwind welcome UI...'));

        try {
          const projectName = path.basename(projectPath);
          const lang = fileExt === 'tsx' ? 'ts' : 'js';
          // setupTailwindOnly will change into the project dir and perform necessary writes
          await setupTailwindOnly(projectName, lang);
          console.log(chalk.green(`Applied Tailwind-only UI setup for ${projectName} (${lang}).`));
        } catch (innerErr) {
          console.log(chalk.red('Error while invoking Tailwind-only setup:'), innerErr.message);
        }
      } else {
        console.log(chalk.yellow('Smart AI based tailwind css implementation is in development and you will be able to shift Tailwind from existing plain CSS in a future release.'));
      }
    }
  } catch (e) {
    console.log(chalk.red('Error while attempting to update welcome page:'), e.message);
  }
}

async function removeTailwindNext(projectPath) {
  console.log(chalk.blue('Removing Tailwind CSS (v4) from Next.js project...'));

  // 1. uninstall dependencies
  await execa('npm', ['uninstall', 'tailwindcss', '@tailwindcss/postcss', 'postcss'], {
    cwd: projectPath,
    stdio: 'inherit'
  });

  // 2. remove postcss.config.mjs if it was created
  const postcssPath = path.join(projectPath, 'postcss.config.mjs');
  if (fsSync.existsSync(postcssPath)) {
    await fs.unlink(postcssPath);
    console.log(chalk.gray('Removed postcss.config.mjs'));
  }

  // 3. find global CSS file
  const appDir = path.join(projectPath, 'app');
  const srcDir = path.join(projectPath, 'src');
  let globalCSSPath;

  if (fsSync.existsSync(path.join(srcDir, 'app', 'globals.css'))) {
    globalCSSPath = path.join(srcDir, 'app', 'globals.css');
  } else if (fsSync.existsSync(path.join(appDir, 'globals.css'))) {
    globalCSSPath = path.join(appDir, 'globals.css');
  }

  // 4. remove @import "tailwindcss"; if present
  if (globalCSSPath && fsSync.existsSync(globalCSSPath)) {
    const existing = await fs.readFile(globalCSSPath, 'utf8');
    const cleaned = existing.replace(/@import\s+["']tailwindcss["'];?\n?/g, '');
    if (cleaned !== existing) {
      await fs.writeFile(globalCSSPath, cleaned.trimStart());
      console.log(chalk.gray('Removed @import "tailwindcss" from globals.css'));
    }
  }

  console.log(chalk.green('Tailwind CSS removed from Next.js project.'));
}

async function addTailwindViteReact(projectPath) {
  console.log(chalk.blue('Adding Tailwind CSS (v4) to Vite React project using the Vite plugin...'));

  // 02 - Install tailwindcss (v4) and the Vite plugin
  await execa('npm', ['install', '-D', 'tailwindcss@^4.0.0', '@tailwindcss/vite'], { cwd: projectPath, stdio: 'inherit' });

  // 03 - Configure the Vite plugin: add import and plugin() call
  const viteConfigCandidates = ['vite.config.ts', 'vite.config.js'];
  const viteConfigFile = viteConfigCandidates.find(f => fsSync.existsSync(path.join(projectPath, f)));
  if (viteConfigFile) {
    const full = path.join(projectPath, viteConfigFile);
    let content = await fs.readFile(full, 'utf8');
    if (!content.includes("@tailwindcss/vite")) {
      // Add the import after any existing 'from "vite"' import statements (best-effort)
      content = content.replace(/from\s+['\"]vite['\"]/g, match => `${match}\nimport tailwindcss from '@tailwindcss/vite'`);
    }
    if (!/tailwindcss\(\)/.test(content)) {
      // Insert the plugin into plugins: [ ... ]
      if (/plugins\s*:\s*\[/.test(content)) {
        content = content.replace(/plugins\s*:\s*\[/, match => `${match}\n    tailwindcss(),`);
      } else {
        // If plugins array not found, append a simple plugins array to the exported config (best-effort)
        content = content.replace(/export\s+default\s+defineConfig\(\{/, match => `${match}\n  plugins: [\n    tailwindcss(),\n  ],`);
      }
    }
    await fs.writeFile(full, content, 'utf8');
    console.log(chalk.green(`Updated ${viteConfigFile} to include @tailwindcss/vite plugin.`));
  } else {
    console.log(chalk.yellow('Could not find vite.config.js/ts — please add @tailwindcss/vite plugin to your Vite config manually.'));
  }

  // 04 - Import Tailwind CSS in the main stylesheet using the v4 plugin approach
  const srcDir = path.join(projectPath, 'src');
  const cssFile = path.join(srcDir, 'index.css');
  const importLine = '@import "tailwindcss";\n';
  if (fsSync.existsSync(cssFile)) {
    let css = await fs.readFile(cssFile, 'utf8');
    if (!css.includes('@import "tailwindcss"')) {
      css = `${importLine}${css}`;
      await fs.writeFile(cssFile, css, 'utf8');
    }
  } else {
    if (!fsSync.existsSync(srcDir)) fsSync.mkdirSync(srcDir, { recursive: true });
    await fs.writeFile(cssFile, importLine, 'utf8');
  }

  console.log(chalk.green('Tailwind CSS (v4) configured for Vite + React using @tailwindcss/vite plugin.'));
}

async function addTailwindSvelte(projectPath) {
  console.log(chalk.blue('Adding Tailwind CSS (v4) to SvelteKit project...'));
  await execa('npm', ['install', '-D', 'tailwindcss@^4.0.0', '@tailwindcss/vite'], { cwd: projectPath, stdio: 'inherit' });
  const viteConfig = path.join(projectPath, 'vite.config.js');
  if (fsSync.existsSync(viteConfig)) {
    let content = await fs.readFile(viteConfig, 'utf8');
    if (!content.includes('@tailwindcss/vite')) {
      content = content.replace(/from 'vite'/, `from 'vite'\nimport tailwindcss from '@tailwindcss/vite'`);
      content = content.replace(/plugins:\s*\[/, match => `${match}\n    tailwindcss(),`);
      await fs.writeFile(viteConfig, content, 'utf8');
    }
  }
  const appCSS = path.join(projectPath, 'src', 'app.css');
  if (fsSync.existsSync(appCSS)) {
    const css = await fs.readFile(appCSS, 'utf8');
    if (!css.includes('@import "tailwindcss"')) await fs.writeFile(appCSS, `@import "tailwindcss";\n${css}`);
  } else {
    const dir = path.dirname(appCSS);
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
    await fs.writeFile(appCSS, '@import "tailwindcss";\n');
  }
  const layout = path.join(projectPath, 'src', 'routes', '+layout.svelte');
  if (fsSync.existsSync(layout)) {
    const layoutContent = await fs.readFile(layout, 'utf8');
    if (!layoutContent.includes(`import '../app.css'`)) {
      const updated = layoutContent.replace('<script>', `<script>\n  import '../app.css';`);
      await fs.writeFile(layout, updated, 'utf8');
    }
  }
  console.log(chalk.green('Tailwind CSS added to SvelteKit project.'));
}
