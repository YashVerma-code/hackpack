import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';

async function readJSON(file) {
  try { return JSON.parse(await fs.readFile(file,'utf8')); } catch { return null; }
}

function hasTailwindInPkg(pkg) {
  if (!pkg) return false;
  const all = { ...pkg.dependencies, ...pkg.devDependencies };
  return Object.keys(all||{}).some(k => k.startsWith('tailwindcss'));
}

export async function addTailwind({ framework, projectName }) {
  const projectPath = path.resolve(process.cwd(), projectName);
  if (!fsSync.existsSync(projectPath)) {
    console.log(chalk.red(`Project directory '${projectName}' not found.`));
    process.exit(1);
  }
  const pkg = await readJSON(path.join(projectPath,'package.json'));
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
  await execa('npm',['install','-D','tailwindcss@next','@tailwindcss/postcss'],{cwd:projectPath,stdio:'inherit'});
  const postcssPath = path.join(projectPath,'postcss.config.js');
  if (!fsSync.existsSync(postcssPath)) {
    await fs.writeFile(postcssPath, `export default { plugins: { 'tailwindcss': {}, } };\n`);
  }
  const appDir = path.join(projectPath,'app');
  const srcDir = path.join(projectPath,'src');
  let globalCSSPath;
  if (fsSync.existsSync(path.join(srcDir,'app','globals.css'))) {
    globalCSSPath = path.join(srcDir,'app','globals.css');
  } else if (fsSync.existsSync(path.join(appDir,'globals.css'))) {
    globalCSSPath = path.join(appDir,'globals.css');
  } else {
    const targetDir = fsSync.existsSync(path.join(srcDir,'app')) ? path.join(srcDir,'app') : appDir;
    if (!fsSync.existsSync(targetDir)) fsSync.mkdirSync(targetDir,{recursive:true});
    globalCSSPath = path.join(targetDir,'globals.css');
    await fs.writeFile(globalCSSPath,'@import "tailwindcss";\n');
  }
  const existing = await fs.readFile(globalCSSPath,'utf8');
  if (!existing.includes('@import "tailwindcss"')) {
    await fs.writeFile(globalCSSPath, `@import "tailwindcss";\n${existing}`);
  }
  console.log(chalk.green('Tailwind CSS added to Next.js project.'));
}

async function addTailwindViteReact(projectPath) {
  console.log(chalk.blue('Adding Tailwind CSS (v4) to Vite React project...'));
  await execa('npm',['install','-D','tailwindcss@next','@tailwindcss/vite'],{cwd:projectPath,stdio:'inherit'});
  const viteConfigCandidates = ['vite.config.ts','vite.config.js'];
  let viteConfigFile = viteConfigCandidates.find(f=>fsSync.existsSync(path.join(projectPath,f)));
  if (viteConfigFile) {
    const full = path.join(projectPath,viteConfigFile);
    let content = await fs.readFile(full,'utf8');
    if (!content.includes('@tailwindcss/vite')) {
      content = content.replace(/from 'vite'/, `from 'vite'\nimport tailwindcss from '@tailwindcss/vite'`);
      content = content.replace(/plugins:\s*\[/, match => `${match}\n    tailwindcss(),`);
      await fs.writeFile(full, content,'utf8');
    }
  }
  const srcDir = path.join(projectPath,'src');
  const cssFile = path.join(srcDir,'index.css');
  if (fsSync.existsSync(cssFile)) {
    const css = await fs.readFile(cssFile,'utf8');
    if (!css.includes('@import "tailwindcss"')) await fs.writeFile(cssFile, `@import "tailwindcss";\n${css}`);
  } else {
    await fs.writeFile(cssFile,'@import "tailwindcss";\n');
  }
  console.log(chalk.green('Tailwind CSS added to Vite React project.'));
}

async function addTailwindSvelte(projectPath) {
  console.log(chalk.blue('Adding Tailwind CSS (v4) to SvelteKit project...'));
  await execa('npm',['install','-D','tailwindcss@next','@tailwindcss/vite'],{cwd:projectPath,stdio:'inherit'});
  const viteConfig = path.join(projectPath,'vite.config.js');
  if (fsSync.existsSync(viteConfig)) {
    let content = await fs.readFile(viteConfig,'utf8');
    if (!content.includes('@tailwindcss/vite')) {
      content = content.replace(/from 'vite'/, `from 'vite'\nimport tailwindcss from '@tailwindcss/vite'`);
      content = content.replace(/plugins:\s*\[/, match => `${match}\n    tailwindcss(),`);
      await fs.writeFile(viteConfig, content,'utf8');
    }
  }
  const appCSS = path.join(projectPath,'src','app.css');
  if (fsSync.existsSync(appCSS)) {
    const css = await fs.readFile(appCSS,'utf8');
    if (!css.includes('@import "tailwindcss"')) await fs.writeFile(appCSS, `@import "tailwindcss";\n${css}`);
  } else {
    const dir = path.dirname(appCSS);
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir,{recursive:true});
    await fs.writeFile(appCSS,'@import "tailwindcss";\n');
  }
  const layout = path.join(projectPath,'src','routes','+layout.svelte');
  if (fsSync.existsSync(layout)) {
    const layoutContent = await fs.readFile(layout,'utf8');
    if (!layoutContent.includes(`import '../app.css'`)) {
      const updated = layoutContent.replace('<script>', `<script>\n  import '../app.css';`);
      await fs.writeFile(layout, updated,'utf8');
    }
  }
  console.log(chalk.green('Tailwind CSS added to SvelteKit project.'));
}
