import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { exists } from '../utils/utility.js';

export async function setupShadcnUI(projectName, languageChoice) {
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
        await execa('npx', ['nuxi@latest', 'module', 'add', 'shadcn-nuxt'], { stdio: 'inherit' });

        console.log(chalk.blue('Initializing shadcn-vue for Nuxt...'));
        // execute this - npx nuxi prepare
        await execa('npx', ['nuxi@latest', 'prepare'], { stdio: 'inherit' });
        
        await execa('npx', ['shadcn-vue@latest', 'init'], {
            stdio: 'inherit',
            env: { ...process.env, CI: 'true' },
        });

        await execa('npx', ['shadcn-vue@latest', 'add', 'button'], { stdio: 'inherit' });

        await execa('npx', ['shadcn-vue@latest', 'add', 'sonner'], { stdio: 'inherit' });
        
        await writeNuxtApp();

        // Always write Nuxt pages as TypeScript for Nuxt projects
        await writeNuxtPage('ts');

        // Always create TS plugins for Nuxt setup
        await writeSsrWidthPlugin('ts');

        await updateNuxtConfig();

    } catch (error) {
        console.error(chalk.red('Error setting up shadcn for Nuxt:'), error && error.message ? error.message : error);
        console.log(chalk.yellow('You may need to finish shadcn setup manually after project creation.'));
    } finally {
        try {
            if (changedDir) process.chdir(originalCwd);
        } catch (err) {
            console.log(chalk.yellow(`Warning: could not restore working directory: ${err.message}`));
        }
    }
}
async function writeNuxtApp() {
    try{
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
    }
    catch(err){
        console.log(chalk.yellow('Could not write Nuxt app.vue:'), err.message || err);
    }
}

async function writeNuxtPage(fileExt) {
    try {
        const dir = path.join('app', 'pages');
        await fs.mkdir(dir, { recursive: true });
        const pagePath = path.join('app', 'pages', `index.vue`);
        const langAttr = fileExt === 'ts' ? ' lang="ts"' : '';

        const content = `<script setup${langAttr}>
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import 'vue-sonner/style.css'

const handleClick = () => {
  toast('Success!', {
    description: "You've installed shadcn-vue with HackPack 🚀",
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
        This project is set up with Nuxt and shadcn-vue.
      </p>
      <Button @click="handleClick" variant="outline" class='bg-transparent'>Click me for a toast notification</Button>
      <p class="mt-12 text-sm text-slate-400">Edit <code class="text-black bg-gray-400 p-0.5 rounded-sm">src/App.vue</code> or <code class="text-black bg-gray-400 p-0.5 rounded-sm">app/page.vue</code> to get started</p>
    </div>
    <Toaster />
  </main>
</template>
`;

        await fs.writeFile(pagePath, content, 'utf8');
    } catch (err) {
        console.log(chalk.yellow('Could not write Nuxt page:'), err.message || err);
    }
}

async function writeSsrWidthPlugin(language) {
    try {
        const ext = 'ts';
        const pluginDir = path.join('app', 'plugins');
        await fs.mkdir(pluginDir, { recursive: true });

        const pluginPath = path.join('app', 'plugins', `ssr-width.${ext}`);
       const pluginContent =
  language === 'ts'
    ? `import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
`
    : `import { provideSSRWidth } from '@vueuse/core'

export default defineNuxtPlugin((nuxtApp) => {
  provideSSRWidth(1024, nuxtApp.vueApp)
})
`;

        await fs.writeFile(pluginPath, pluginContent, 'utf8');
    } catch (err) {
        console.log(chalk.yellow('Could not write ssr-width plugin:'), err.message || err);
    }
}

async function updateNuxtConfig() {
    try {
        const tsPath = 'nuxt.config.ts';
        const jsPath = 'nuxt.config.js';

        if (await exists(tsPath)) {
            let content = await fs.readFile(tsPath, 'utf8');
            if (!content.includes("shadcn-nuxt")) {
                // Try to insert into modules array if present
                const modulesRegex = /modules\s*:\s*\[([\s\S]*?)\]/m;
                if (modulesRegex.test(content)) {
                    content = content.replace(modulesRegex, (m, inner) => {
                        const already = inner.includes("'shadcn-nuxt'") || inner.includes('"shadcn-nuxt"');
                        if (already) return m;
                        const newInner = inner.trim().length ? inner.trim() + `, 'shadcn-nuxt'` : ` 'shadcn-nuxt'`;
                        return `modules: [${newInner}]`;
                    });
                } else {
                    content = content.replace(/export\s+default\s+defineNuxtConfig\(\{/, "export default defineNuxtConfig({\n  modules: ['shadcn-nuxt'],");
                }

                if (!content.includes('shadcn:')) {
                    content = content.replace(/export\s+default\s+defineNuxtConfig\(\{/, "export default defineNuxtConfig({\n  shadcn: {\n    prefix: '',\n    componentDir: '@/components/ui'\n  },");
                }

                await fs.writeFile(tsPath, content, 'utf8');
            }
            return;
        }

        if (await exists(jsPath)) {
            let content = await fs.readFile(jsPath, 'utf8');
            if (!content.includes("shadcn-nuxt")) {
                const modulesRegex = /modules\s*:\s*\[([\s\S]*?)\]/m;
                if (modulesRegex.test(content)) {
                    content = content.replace(modulesRegex, (m, inner) => {
                        const already = inner.includes("'shadcn-nuxt'") || inner.includes('"shadcn-nuxt"');
                        if (already) return m;
                        const newInner = inner.trim().length ? inner.trim() + `, 'shadcn-nuxt'` : ` 'shadcn-nuxt'`;
                        return `modules: [${newInner}]`;
                    });
                } else {
                    content = content.replace(/module\.exports\s*=\s*\{/, "module.exports = {\n  modules: ['shadcn-nuxt'],");
                }

                if (!content.includes('shadcn:')) {
                    content = content.replace(/(module\.exports\s*=\s*\{)/, `$1\n  shadcn: {\n    prefix: '',\n    componentDir: '@/components/ui'\n  },`);
                }

                await fs.writeFile(jsPath, content, 'utf8');
            }
            return;
        }

        // If no config exists, create a minimal nuxt.config.ts
        const minimal = `import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // ...
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})

`;
        await fs.writeFile(tsPath, minimal, 'utf8');
    } catch (err) {
        console.log(chalk.yellow('Could not update nuxt.config. You may need to add shadcn-nuxt module manually.'), err.message || err);
    }
}