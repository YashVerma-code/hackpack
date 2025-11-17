import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';
import { actions, clerkUserModel, webhooksRoute, SIGNIN_COMPONENT, SIGNUP_COMPONENT, ROUTER_CONFIG_TS, ROUTER_CONFIG_JS, HOME_VIEW_CONTENT } from './utility.js';

export async function setupVueClerk(state) {
  const daisy = state.uiLibrary === "daisyui";
  const { projectName, language, database } = state;
  console.log(chalk.blue(`Setting up Clerk for Vue project: ${projectName} (lang=${language})`));

  const rootDir = path.isAbsolute(projectName)
    ? projectName
    : process.cwd();

  const srcDir = path.join(rootDir, 'src');
  const componentsDir = path.join(srcDir, 'components');
  const viewsDir = path.join(srcDir, 'views');

  try {
    if (!fs.existsSync(rootDir)) {
      return;
    }

    [componentsDir, viewsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create SignIn component in components directory
    const componentSignInPath = path.join(componentsDir, 'SignIn.vue');
    if (!fs.existsSync(componentSignInPath)) {
      fs.writeFileSync(componentSignInPath, SIGNIN_COMPONENT(language));
      console.log(chalk.green(`Created SignIn component at ${componentSignInPath}`));
    }

    // Create SignUp component in components directory
    const componentSignUpPath = path.join(componentsDir, 'SignUp.vue');
    if (!fs.existsSync(componentSignUpPath)) {
      fs.writeFileSync(componentSignUpPath, SIGNUP_COMPONENT(language));
      console.log(chalk.green(`Created SignUp component at ${componentSignUpPath}`));
    }

    // Create or update router configuration
    const routerDir = path.join(srcDir, 'router');
    if (!fs.existsSync(routerDir)) {
      fs.mkdirSync(routerDir, { recursive: true });
    }
    if (language === 'js') {
      const routerPath = path.join(routerDir, 'index.js');
      if (!fs.existsSync(routerPath)) {
        fs.writeFileSync(routerPath, ROUTER_CONFIG_JS());
        console.log(chalk.green(`Created router configuration with auth guards at ${routerPath}`));
      } else {
        console.log(chalk.yellow(`Router config already exists at ${routerPath}. Please add auth routes manually.`));
      }
    }
    else if (language === 'ts') {
      const routerPath = path.join(routerDir, 'index.ts');
      if (!fs.existsSync(routerPath)) {
        fs.writeFileSync(routerPath, ROUTER_CONFIG_TS());
        console.log(chalk.green(`Created router configuration with auth guards at ${routerPath}`));
      } else {
        console.log(chalk.yellow(`Router config already exists at ${routerPath}. Please add auth routes manually.`));
      }
    }

    await execa('npm', ['install', 'vue-router'], { cwd: rootDir, stdio: 'inherit' });
    await execa('npm', ['install', '@clerk/vue'], { cwd: rootDir, stdio: 'inherit' });
    await execa('npm', ['install', '@clerk/clerk-js'], { cwd: rootDir, stdio: 'inherit' });
    await execa('npm', ['install', '@vitejs/plugin-vue'], { cwd: rootDir, stdio: 'inherit' });
    if (language === 'ts') {
      await execa('npm', ['install', '--save-dev', '@types/node'], { cwd: rootDir, stdio: 'inherit' });
    }

    // Add .env placeholder
    const envPath = path.join(rootDir, '.env');
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, 'VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here\n');
    } else {
      console.log(chalk.yellow('.env already exists, skipping .env creation'));
    }

    //  main.js support only for now, .ts not yet
    const mainJsPath = path.join(srcDir, 'main.js');
    const defaultMainContentJS = `import { clerkPlugin } from '@clerk/vue'
import './assets/main.css'
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined. Add it to your environment variables.')
}
const app = createApp(App)
app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })
app.use(router)
app.mount('#app')
`;
    // if language is ts, delete main.js and create main.ts
    const defaultMainContentTS = `import { clerkPlugin } from '@clerk/vue';
import './assets/main.css';
import router from './router';

import { createApp } from 'vue';
import App from './App.vue';

// Type-safe environment variable
const PUBLISHABLE_KEY: string | undefined = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined. Add it to your environment variables.');
}

const app = createApp(App);
app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY });
app.use(router);
app.mount('#app');
`
    try {
      if (language === 'ts') {
        // delete main.js
        if (fs.existsSync(mainJsPath)) {
          fs.unlinkSync(mainJsPath);
        }
        const mainTsPath = path.join(srcDir, 'main.ts');
        fs.writeFileSync(mainTsPath, defaultMainContentTS, 'utf8');
      }
      else {
        fs.writeFileSync(mainJsPath, defaultMainContentJS, 'utf8');
      }
    } catch (err) {
      console.error(chalk.red(`Error creating main.js: ${err.message}`));
    }

    const headerPath = path.join(componentsDir, 'ClerkHeader.vue');
    if (!fs.existsSync(headerPath)) {
      const headerContent = `<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/vue'
</script>

<template>
  <span class="clerk-chip-inline" aria-hidden="false">
    <SignedOut>
      <SignInButton class="chip" mode= 'modal'/>
    </SignedOut>

    <SignedIn>
      <UserButton class="chip-user" afterSignOutUrl = '/sign-in' />
    </SignedIn>
  </span>
</template>

<style scoped>
.clerk-chip-inline {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  gap: 0.375rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(255,255,255,0.98);
  color: #0f172a;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.08);
  border: 1px solid rgba(15,23,42,0.06);
  cursor: pointer;
  line-height: 1;
}
.chip:focus,
.chip:active {
  transform: translateY(0.5px);
}
.chip-user {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  overflow: hidden;
}
</style>
`;
      fs.writeFileSync(headerPath, headerContent, 'utf8');
    } else {
      console.log(chalk.yellow(`${headerPath} already exists, skipping creation`));
    }

    // Create SignIn and SignUp views
    const signInPath = path.join(viewsDir, 'SignIn.vue');
    if (!fs.existsSync(signInPath)) {
      const signInContent = `<script setup lang="ts">\nimport { SignIn } from '@clerk/vue'\n</script>\n\n<template>\n  <SignIn signUpUrl='/sign-up' />\n</template>\n`;
      fs.writeFileSync(signInPath, signInContent, 'utf8');
    }

    const signUpPath = path.join(viewsDir, 'SignUp.vue');
    if (!fs.existsSync(signUpPath)) {
      const signUpContent = `<script setup lang="ts">\nimport { SignUp } from '@clerk/vue'\n</script>\n\n<template>\n  <SignUp signInUrl='/sign-in' />\n</template>\n`;
      fs.writeFileSync(signUpPath, signUpContent, 'utf8');
    }

    // Create Home view
    const homeViewPath = path.join(viewsDir, 'Home.vue');
    if (!fs.existsSync(homeViewPath)) {
      fs.writeFileSync(homeViewPath, HOME_VIEW_CONTENT(language, daisy), 'utf8');
    }

    // Setup App.vue
    const appVuePath = path.join(srcDir, 'App.vue');
    const defaultAppContent = `<template>
  <div>
    <div
      class="min-h-screen bg-gradient-to-tr from-indigo-600 to-sky-400 text-white overflow-hidden relative flex items-center justify-center"
    >
      <div class="absolute top-4 left-4 z-20">
        <!-- <ClerkHeader /> -->
      </div>
      <Toaster position="bottom-right" />
      <ClerkLoaded>
        <router-view />
      </ClerkLoaded>
      <ClerkLoading>Loading...</ClerkLoading>
    </div>
  </div>
</template>

<script setup>
import { SignedIn, SignedOut, ClerkLoaded, ClerkLoading } from '@clerk/vue'
import ClerkHeader from './components/ClerkHeader.vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
`;

    try {
      fs.writeFileSync(appVuePath, defaultAppContent, 'utf8');
    } catch (err) {
      console.error(chalk.red(`Error creating App.vue: ${err.message}`));
    }
    // also create tsconfig.json and tsconfig.node.json if language is ts
    if (language === 'ts') {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json');
      const tsconfigNodePath = path.join(rootDir, 'tsconfig.node.json');
      if (!fs.existsSync(tsconfigPath)) {
        const tsconfigContent = `{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "node"],
    "useDefineForClassFields": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue", "vite.config.*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
        fs.writeFileSync(tsconfigPath, tsconfigContent, 'utf8');
      }
      if (!fs.existsSync(tsconfigNodePath)) {
        const tsconfigNodeContent = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`;
        fs.writeFileSync(tsconfigNodePath, tsconfigNodeContent, 'utf8');
      }
    }

    // also create env.d.ts if language is ts
    if (language === 'ts') {
      const envDtsPath = path.join(srcDir, 'env.d.ts');
      if (!fs.existsSync(envDtsPath)) {
        const envDtsContent = `declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Allow alias imports for @/
declare module '@/*'
`;
        fs.writeFileSync(envDtsPath, envDtsContent, 'utf8');
      }
    }

    // also create vite.config.ts if language is ts
    if (language === 'ts') {
      const viteConfigPath = path.join(rootDir, 'vite.config.ts');
      if (!fs.existsSync(viteConfigPath)) {
        const viteConfigContent = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})`;
        fs.writeFileSync(viteConfigPath, viteConfigContent, 'utf8');
      } else {
        console.log(chalk.yellow(`${viteConfigPath} already exists, skipping creation`));
      }
    }

    console.log(chalk.green.bold('Vue Clerk setup completed (best-effort). Please verify the main file, App.vue and .env value.'));
    console.log(chalk.green('The `ClerkHeader.vue` component created in src/components can be used as a compact auth button/chip anywhere in your app.'));
    // If the user selected MongoDB, scaffold a minimal backend webhook handler
    if (database === 'mongodb') {
      try {
        const backendDir = path.join(rootDir, 'backend');
        // backend dir exists
        try {
          await execa('npm', ['install', '@clerk/express'], { cwd: backendDir, stdio: 'inherit' });
        } catch (e) {
          console.log(chalk.yellow('Could not install @clerk/express in backend:'), e.message);
        }
        const backendSrc = path.join(backendDir, 'src');
        fs.mkdirSync(backendSrc, { recursive: true });

        // actions/user.actions.js/ts
        const actionsDir = path.join(backendSrc, 'actions');
        fs.mkdirSync(actionsDir, { recursive: true });
        const actionsExt = language === 'ts' ? 'ts' : 'js';
        const actionsPath = path.join(actionsDir, `user.actions.${actionsExt}`);
        if (!fs.existsSync(actionsPath)) fs.writeFileSync(actionsPath, actions(language), 'utf8');

        // models/user.model.js/ts
        const modelsDir = path.join(backendSrc, 'models');
        fs.mkdirSync(modelsDir, { recursive: true });
        const modelExt = language === 'ts' ? 'ts' : 'js';
        const modelPath = path.join(modelsDir, `user.model.${modelExt}`);
        if (!fs.existsSync(modelPath)) fs.writeFileSync(modelPath, clerkUserModel(language), 'utf8');

        // routes/webhooks.route.js/ts
        const routesDir = path.join(backendSrc, 'routes');
        fs.mkdirSync(routesDir, { recursive: true });
        const routeExt = language === 'ts' ? 'ts' : 'js';
        const routePath = path.join(routesDir, `webhooks.route.${routeExt}`);
        if (!fs.existsSync(routePath)) fs.writeFileSync(routePath, webhooksRoute(language), 'utf8');

        // backend/src/index.js/ts - create or patch
        const indexPath = path.join(backendSrc, `index.${language === 'ts' ? 'ts' : 'js'}`);
        if (fs.existsSync(indexPath)) {
          let indexContent = fs.readFileSync(indexPath, "utf8");
          const importRegex = /(import connectDB[^\n]*\n)/;

          if (!/import\s+webhooksRoute/.test(indexContent)) {
            indexContent = indexContent.replace(
              importRegex,
              `$1import webhooksRoute from "./routes/webhooks.route.${language === "ts" ? 'ts' : 'js'}";\n`
            );
          }
          // for js
          let expressRegex;
          if (language === 'ts') {
            expressRegex = /const app: express.Application = express()\(\);/;
          }
          else {
            expressRegex = /const app = express\(\);/;
          }

          if (!/app\.use\(\s*['"]\/api\/webhooks/.test(indexContent)) {
            indexContent = indexContent.replace(
              expressRegex,
              language === 'ts'
                ? `const app: express.Application = express();
app.use('/api/webhooks', webhooksRoute);`
                : `const app = express();
app.use('/api/webhooks', webhooksRoute);`
            );
          }

          fs.writeFileSync(indexPath, indexContent, "utf8");
          console.log(`index.${language} updated successfully`);
        } else {
          const indexLines = [
            "import express from 'express';",
            "import dotenv from 'dotenv';",
            "import webhooksRoute from './routes/webhooks.route.js';",
            "",
            "dotenv.config();",
            "const app = express();",
            "app.use('/api/webhooks', webhooksRoute);",
            "app.use(express.json());",
            "",
            "const PORT = process.env.PORT || 5000;",
            "app.listen(PORT, () => console.log('Server listening on port ' + (process.env.PORT || 5000)));",
            ""
          ];
          fs.writeFileSync(indexPath, indexLines.join('\n'), 'utf8');
        }

        // Append CLERK_WEBHOOK_SIGNING_SECRET and CLIENT_URL to backend/.env if missing
        const backendEnv = path.join(backendDir, '.env');
        let envExisting = '';
        if (fs.existsSync(backendEnv)) envExisting = fs.readFileSync(backendEnv, 'utf8');
        const secretLine = 'CLERK_WEBHOOK_SIGNING_SECRET=your_secret';
        const clientLine = 'CLIENT_URL=http://localhost:5173';
        if (!envExisting.includes('CLERK_WEBHOOK_SIGNING_SECRET')) {
          fs.appendFileSync(backendEnv, '\n' + secretLine + '\n', 'utf8');
          console.log(chalk.green('Added CLERK_WEBHOOK_SIGNING_SECRET to backend/.env'));
        }
        if (!envExisting.includes('CLIENT_URL')) {
          fs.appendFileSync(backendEnv, clientLine + '\n', 'utf8');
          console.log(chalk.green('Added CLIENT_URL to backend/.env'));
        }
      } catch (e) {
        console.log(chalk.yellow('Could not scaffold Clerk backend helpers automatically:'), e.message);
      }
    }
  } catch (err) {
    console.error(chalk.red('Error setting up Clerk for Vue:'), err && err.message ? err.message : err);
  }
}