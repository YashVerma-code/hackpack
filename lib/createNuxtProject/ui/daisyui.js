import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createWelcomeDaisy } from '../utils/utility.js';

export async function setupDaisyUI(projectName, language, uilibrary) {
    const originalCwd = process.cwd();
    let changedDir = false;

    try {
        // change to project directory if not already there
        const currentBase = path.basename(originalCwd);
        if (currentBase !== projectName) {
            const targetDir = path.resolve(originalCwd, projectName);
            process.chdir(targetDir);
            changedDir = true;
        }

        const root = process.cwd();
        console.log(chalk.blue('Setting up daisyUI for Nuxt...'));

        // Step 1: Install Tailwind CSS and daisyUI
        await execa('npm', ['install', 'daisyui@latest'], {
            stdio: 'inherit',
        });
        await execa('npm', ['install', 'vue-sonner'], {
            stdio: 'inherit',
        });
        // Step 2: Add daisyui plugin
        const tailwindPath = path.join(root, 'app', 'assets', 'css', 'tailwind.css')

        let tailwindContent = await fs.readFile(tailwindPath, 'utf8');
        tailwindContent += '\n@plugin "daisyui";\n';
        await fs.writeFile(tailwindPath, tailwindContent, 'utf8');

        // Step 3: Create welcome page using utility function
        try {
            const pageHTML = createWelcomeDaisy();
            const pagesDir = path.join(root, 'app', 'pages');
            await fs.mkdir(pagesDir, { recursive: true });
            const indexPage = path.join(pagesDir, 'index.vue');
            await fs.writeFile(indexPage, pageHTML, 'utf8');

            const dir = path.join('app');
            await fs.mkdir(dir, { recursive: true });
            const appPath = path.join('app', 'app.vue');
            const content = `<template>
    <div>
        <NuxtPage />
    </div>
</template>
`;
            await fs.writeFile(appPath, content, 'utf8');
            
            
        } catch (err) {
            console.log(chalk.yellow('Could not create welcome page:'), err.message || err);
        }
        // Step 4: Over write nuxt config ts
        const nuxtConfigPath = path.join(root, 'nuxt.config.ts');
        let nuxtConfig = await fs.readFile(nuxtConfigPath, 'utf8');
        nuxtConfig = nuxtConfig.replace(
            /css:\s*\[([^\]]*)\],/,
            `css: ["../app/assets/css/tailwind.css"],`
        );
        await fs.writeFile(nuxtConfigPath, nuxtConfig, 'utf8');

        console.log(chalk.greenBright('\n🎉 daisyUI setup complete!'));
    } catch (error) {
        console.error(chalk.red('Error setting up daisyUI for Nuxt:'), error?.message || error);
        console.log(chalk.yellow('\nYou may need to set up daisyUI manually following these steps:'));
    } finally {
        if (changedDir) {
            process.chdir(originalCwd);
        }
    }
}