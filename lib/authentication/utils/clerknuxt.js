import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';
import { clerkUserController, clerkUserModel, indexPageContent, clerkHeaderCont, webhookCont, printStepsToConsole } from './utility.js';

export async function setupClerkNuxt(state) {
  const { projectName, language, database } = state;
  const rootDir = path.isAbsolute(projectName) ? projectName : process.cwd();

  try {
    if (!fs.existsSync(rootDir)) {
      console.error(chalk.red(`Project directory ${rootDir} does not exist`));
      return;
    }

    const serverDir = path.join(rootDir, 'server');
    const apiDir = path.join(serverDir, 'api');
    const middlewareDir = path.join(serverDir, 'middleware');
    const actionsDir = path.join(serverDir, 'actions');
    const appDir = path.join(rootDir, 'app');
    const pagesDir = path.join(appDir, 'pages');

    [serverDir, apiDir, middlewareDir, actionsDir, appDir, pagesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    await execa('npm', ['install', '@clerk/nuxt'], { cwd: rootDir, stdio: 'inherit' });

    const envPath = path.join(rootDir, '.env');
    const envContent = `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
NUXT_CLERK_SECRET_KEY=your_clerk_secret_key_here
`;
    
    if (!fs.existsSync(envPath)) {
      fs.writeFileSync(envPath, envContent);
      console.log(chalk.green(`Created .env file at ${envPath}`));
    } else {
      let existingEnv = fs.readFileSync(envPath, 'utf8');
      if (!existingEnv.includes('NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY')) {
        fs.appendFileSync(envPath, '\n' + envContent);
        console.log(chalk.green('Added Clerk keys to existing .env file'));
      }
    }

    const nuxtConfigPath = path.join(rootDir, language === 'ts' ? 'nuxt.config.ts' : 'nuxt.config.js');
    if (fs.existsSync(nuxtConfigPath)) {
      let configContent = fs.readFileSync(nuxtConfigPath, 'utf8');
      
      if (!configContent.includes('@clerk/nuxt')) {
        // Find the modules array and add @clerk/nuxt
        const modulesRegex = /modules:\s*\[([^\]]*)\]/;
        if (modulesRegex.test(configContent)) {
          configContent = configContent.replace(
            modulesRegex,
            (match, modules) => {
              const trimmedModules = modules.trim();
              const newModule = trimmedModules ? `${trimmedModules}, '@clerk/nuxt'` : "'@clerk/nuxt'";
              return `modules: [${newModule}]`;
            }
          );
        } else {
          // Add modules array if it doesn't exist
          configContent = configContent.replace(
            /export default defineNuxtConfig\({/,
            `export default defineNuxtConfig({\n  modules: ['@clerk/nuxt'],`
          );
        }
        
        fs.writeFileSync(nuxtConfigPath, configContent, 'utf8');
        console.log(chalk.green(`Updated ${nuxtConfigPath} with @clerk/nuxt module`));
      }
    } else {
      const defaultConfig = language === 'ts' 
        ? `export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
  compatibilityDate: '2024-12-19'
})`
        : `export default defineNuxtConfig({
  modules: ['@clerk/nuxt'],
  compatibilityDate: '2024-12-19'
})`;
      
      fs.writeFileSync(nuxtConfigPath, defaultConfig, 'utf8');
      console.log(chalk.green(`Created ${nuxtConfigPath} with Clerk module`));
    }

    const indexPagePath = path.join(pagesDir, 'index.vue');

    const userBtnHtml = `<div class="user-btn">\n      <SignedIn>\n        <UserButton afterSignOutUrl="/sign-in" />\n      </SignedIn>\n    </div>`;

    const userBtnStyle = `\n<style scoped>\n  .user-btn {\n  position: absolute;\n  top: 1.5rem;\n  right: 1.5rem;\n  z-index: 10;\n}\n</style>`;

    if (!fs.existsSync(indexPagePath)) {
      let content = indexPageContent();
      if (!content.includes('class="user-btn"')) {
        content = content.replace(/<div\b[^>]*>/, (match) => `${match}\n${userBtnHtml}\n`);
      }
      if (!content.includes('.user-btn')) {
        content = content + userBtnStyle;
      }
      fs.writeFileSync(indexPagePath, content, 'utf8');
    } else {
      let content = fs.readFileSync(indexPagePath, 'utf8');
      if (!content.includes('class="user-btn"')) {
        if (/<div\b[^>]*>/.test(content)) {
          content = content.replace(/<div\b[^>]*>/, (match) => `${match}\n${userBtnHtml}\n`);
        } else if (/<template[^>]*>/.test(content)) {
          content = content.replace(/<template[^>]*>/, (match) => `${match}\n${userBtnHtml}\n`);
        } else {
          content = userBtnHtml + '\n' + content;
        }
      }
      if (!content.includes('.user-btn')) {
        content = content + userBtnStyle;
      }
      fs.writeFileSync(indexPagePath, content, 'utf8');
    }

     const signInPagePath = path.join(pagesDir, 'sign-in.vue');
     const signInPageContent = `<template>
  <div class="signin-container">
    <SignIn routing="path" path="/sign-in" redirectUrl="/" signUpUrl="/sign-up" />
  </div>
</template>

<style scoped>
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}
</style>`

     if (!fs.existsSync(signInPagePath)) {
      fs.writeFileSync(signInPagePath, signInPageContent, 'utf8');
     }
     const signUpPagePath = path.join(pagesDir, 'sign-up.vue');
     const signUpPageContent = `<template>
  <div class="signup-container">
    <SignUp routing="path" path="/sign-up" redirectUrl="/" signInUrl='/sign-in'/>
  </div>
</template>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}
</style>`
     if (!fs.existsSync(signUpPagePath)) {
      fs.writeFileSync(signUpPagePath, signUpPageContent, 'utf8');
     }
    // create auth middleware
    const authMiddlewarePath = path.join(rootDir, 'app', 'middleware', 'auth.global.ts');
    const authMiddlewareDir = path.join(rootDir, 'app','middleware');
    if (!fs.existsSync(authMiddlewareDir)) {
      fs.mkdirSync(authMiddlewareDir, { recursive: true });
    }

    const authMiddlewareContent = `export default defineNuxtRouteMiddleware((to) => {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded?.value) return

  const publicPaths = ['/sign-in', '/sign-up']

  if (!isSignedIn?.value && !publicPaths.includes(to.path)) {
    return navigateTo('/sign-in')
  }

  if (isSignedIn.value && publicPaths.includes(to.path)) {
    return navigateTo('/')
  }
})
`;

    if (!fs.existsSync(authMiddlewarePath)) {
      fs.writeFileSync(authMiddlewarePath, authMiddlewareContent, 'utf8');
    }

    const componentsDir = path.join(rootDir, 'app', 'components');
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }
    const clerkHeaderPath = path.join(componentsDir, 'ClerkHeader.vue');
    const clerkHeaderContent = clerkHeaderCont()
    if (!fs.existsSync(clerkHeaderPath)) {
      fs.writeFileSync(clerkHeaderPath, clerkHeaderContent, 'utf8');
    }

    if (database === 'mongodb') {
      console.log(chalk.blue('Setting up MongoDB with Clerk webhooks...'));

      const modelsDir = path.join(serverDir, 'database', 'models');
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
      }

      const modelExt = 'ts';
      const userModelPath = path.join(modelsDir, `user.model.${modelExt}`);
      if (!fs.existsSync(userModelPath)) {
        fs.writeFileSync(userModelPath, clerkUserModel(language), 'utf8');
      }

      const nuxtActionsPath = path.join(actionsDir, `user.actions.ts`);

      const nuxtActionsExists = fs.existsSync(nuxtActionsPath);
      const actionsContent = clerkUserController('nuxt', 'ts');
      if (!nuxtActionsExists) {
        fs.writeFileSync(nuxtActionsPath, actionsContent, 'utf8');
      }

      const webhookPath = path.join(apiDir, `webhooks.post.ts`);
      const webhookContent = webhookCont();
      if (!fs.existsSync(webhookPath)) {
        fs.writeFileSync(webhookPath, webhookContent, 'utf8');
      }

      // Update .env with webhook secret
      let envExisting = fs.readFileSync(envPath, 'utf8');
      if (!envExisting.includes('NUXT_CLERK_WEBHOOK_SIGNING_SECRET')) {
        fs.appendFileSync(envPath, '\nNUXT_CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret_here\n', 'utf8');
        console.log(chalk.green('Added NUXT_CLERK_WEBHOOK_SIGNING_SECRET to .env'));
      }
    }

    console.log(chalk.green.bold('\n Nuxt Clerk setup completed successfully!'));
    printStepsToConsole();

  } catch (err) {
    console.error(chalk.red('Error setting up Clerk for Nuxt:'), err && err.message ? err.message : err);
  }
}