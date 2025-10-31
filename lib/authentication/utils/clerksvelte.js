import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';

// Component templates
const SIGNIN_COMPONENT_TS = `<script lang="ts">
import { ClerkLoaded, ClerkLoading, SignIn } from 'svelte-clerk';
</script>

<div class="signup-container">
  <ClerkLoading>Loading...</ClerkLoading>
  <ClerkLoaded> 
    <SignIn routing="path" path="/sign-in" redirectUrl="/" signUpUrl='/sign-up' />
  </ClerkLoaded>
</div>`;

const SIGNIN_COMPONENT_JS = `<script>
import { ClerkLoaded, ClerkLoading, SignIn } from 'svelte-clerk';
</script>
<div class="signup-container">
  <ClerkLoading>Loading...</ClerkLoading>
  <ClerkLoaded> 
    <SignIn routing="path" path="/sign-in" redirectUrl="/" signUpUrl='/sign-up' />
  </ClerkLoaded>
</div>`;

const SIGNUP_COMPONENT_TS = `<script lang="ts">
import { ClerkLoaded, ClerkLoading, SignUp } from 'svelte-clerk';
</script>

<div class="signup-container">
  <ClerkLoading>Loading...</ClerkLoading>
  <ClerkLoaded> 
    <SignUp routing="path" path="/sign-up" redirectUrl="/" signInUrl='/sign-in'/>
  </ClerkLoaded>
</div>`;

const SIGNUP_COMPONENT_JS = `<script>
import { ClerkLoaded, ClerkLoading, SignUp } from 'svelte-clerk';
</script>
<div class="signup-container">
  <ClerkLoading>Loading...</ClerkLoading>
  <ClerkLoaded> 
    <SignUp routing="path" path="/sign-up" redirectUrl="/"  signInUrl='/sign-in'/>
  </ClerkLoaded>
</div>`;

const CLERK_HEADER_COMPONENT = `<script lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';
</script>

<span class="clerk-chip-inline" aria-hidden="false">
  <SignedOut>
    <SignInButton mode='modal'>
      <button class="chip">Sign In</button>
    </SignInButton>
  </SignedOut>

  <SignedIn>
    <div class="chip-user">
      <UserButton afterSignOutUrl="/sign-in"/>
    </div>
  </SignedIn>
</span>

<style>
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
</style>`;

const ROOT_LAYOUT_TS = `<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { ClerkProvider } from 'svelte-clerk';

  // data contains the server-built Clerk props from +layout.server.ts
  export let data: any;
</script>

<ClerkProvider {...data} afterSignOutUrl="/sign-in">
  <Toaster richColors position="bottom-right" />
  <main>
    <slot />
  </main>
</ClerkProvider>

<style>
  main {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background: linear-gradient( 
      to bottom,
      #1e1b4b,
      #1e3a8a,
      #111827
    );
  }
</style>`;
const ROOT_LAYOUT_JS = `<script>
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { ClerkProvider } from 'svelte-clerk';
    // data contains the server-built Clerk props from +layout.server.js
    export let data;
</script>

<ClerkProvider {...data} afterSignOutUrl="/sign-in">
    <Toaster richColors position="bottom-right" />
    <main>
        <slot />
    </main>
</ClerkProvider>

<style>
    main {
        display: flex;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
            to bottom,
            #1e1b4b,
            #1e3a8a,
            #111827
        );
    }
</style>`;

const LAYOUT_SERVER_TS = `import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  return {
    ...buildClerkProps(locals.auth())
  };
};`;

const LAYOUT_SERVER_JS = `import { buildClerkProps } from 'svelte-clerk/server';

export const load = ({ locals }) => {
  return {
    ...buildClerkProps(locals.auth())
  };
};`;

const SIGNIN_PAGE_SERVER_TS = `import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (userId) {
    return redirect(307, '/');
  }
  
  return {};
};`;

const SIGNIN_PAGE_SERVER_JS = `import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (userId) {
    return redirect(307, '/');
  }
  
  return {};
};`;

const SIGNUP_PAGE_SERVER_TS = `import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (userId) {
    return redirect(307, '/');
  }
  
  return {};
};`;

const SIGNUP_PAGE_SERVER_JS = `import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (userId) {
    return redirect(307, '/');
  }
  
  return {};
};`;

const HOME_PAGE_SERVER_TS = `import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (!userId) {
    return redirect(307, '/sign-in');
  }
  
  return {
    userId
  };
};`;

const HOME_PAGE_SERVER_JS = `import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { userId } = locals.auth();
  
  if (!userId) {
    return redirect(307, '/sign-in');
  }
  
  return {
    userId
  };
};`;

const HOOKS_SERVER_TS = `import { withClerkHandler } from 'svelte-clerk/server';

export const handle = withClerkHandler();`;

const HOOKS_SERVER_JS = `import { withClerkHandler } from 'svelte-clerk/server';

export const handle = withClerkHandler();`;

const APP_D_TS = `// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="svelte-clerk/env" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};`;

const clerkCss = `/* === Clerk Auth UI Styles === */
.user-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
}

.signup-container,
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}

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
}`

export async function setupSvelteClerk(state) {
    const { projectName, language } = state;
    console.log(chalk.blue(`Setting up Clerk for SvelteKit project: ${projectName} (lang=${language})`));

    const rootDir = path.isAbsolute(projectName)
        ? projectName
        : process.cwd();

    const srcDir = path.join(rootDir, 'src');
    const routesDir = path.join(srcDir, 'routes');
    const libDir = path.join(srcDir, 'lib');
    const componentsDir = path.join(libDir, 'components');

    try {
        if (!fs.existsSync(rootDir)) {
            console.log(chalk.red(`Project directory ${rootDir} does not exist`));
            return;
        }

        // Create necessary directories
        [componentsDir, routesDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Create ClerkHeader component
        const headerPath = path.join(componentsDir, 'ClerkHeader.svelte');
        if (!fs.existsSync(headerPath)) {
            fs.writeFileSync(headerPath, CLERK_HEADER_COMPONENT);
            console.log(chalk.green(`Created ClerkHeader component at ${headerPath}`));
        } else {
            console.log(chalk.yellow(`${headerPath} already exists, skipping creation`));
        }

        // Create hooks.server file
        const hooksServerPath = path.join(srcDir, language === 'ts' ? 'hooks.server.ts' : 'hooks.server.js');
        if (!fs.existsSync(hooksServerPath)) {
            fs.writeFileSync(hooksServerPath, language === 'ts' ? HOOKS_SERVER_TS : HOOKS_SERVER_JS);
            console.log(chalk.green(`Created hooks.server at ${hooksServerPath}`));
        } else {
            console.log(chalk.yellow(`${hooksServerPath} already exists, skipping creation`));
        }

        // Create app.d.ts for TypeScript
        if (language === 'ts') {
            const appDtsPath = path.join(srcDir, 'app.d.ts');
            fs.writeFileSync(appDtsPath, APP_D_TS);
            console.log(chalk.green(`Created app.d.ts at ${appDtsPath}`));
        }

        // Create root layout
        if (language === 'ts') {
            const layoutPath = path.join(routesDir, '+layout.svelte');
            fs.writeFileSync(layoutPath, ROOT_LAYOUT_TS);
        } else {
            const layoutPath = path.join(routesDir, '+layout.svelte');
            fs.writeFileSync(layoutPath, ROOT_LAYOUT_JS);
        }

        // Create root layout server
        const layoutServerPath = path.join(routesDir, language === 'ts' ? '+layout.server.ts' : '+layout.server.js');
        if (!fs.existsSync(layoutServerPath)) {
            fs.writeFileSync(layoutServerPath, language === 'ts' ? LAYOUT_SERVER_TS : LAYOUT_SERVER_JS);
        } else {
            console.log(chalk.yellow(`${layoutServerPath} already exists, skipping creation`));
        }

        // Create sign-in route
        const signInDir = path.join(routesDir, 'sign-in');
        if (!fs.existsSync(signInDir)) {
            fs.mkdirSync(signInDir, { recursive: true });
        }

        const signInPagePath = path.join(signInDir, '+page.svelte');
        if (!fs.existsSync(signInPagePath)) {
            if (language === 'ts') {
                fs.writeFileSync(signInPagePath, SIGNIN_COMPONENT_TS);
            } else {
                fs.writeFileSync(signInPagePath, SIGNIN_COMPONENT_JS);
            }
        }

        const signInServerPath = path.join(signInDir, language === 'ts' ? '+page.server.ts' : '+page.server.js');
        if (!fs.existsSync(signInServerPath)) {
            fs.writeFileSync(signInServerPath, language === 'ts' ? SIGNIN_PAGE_SERVER_TS : SIGNIN_PAGE_SERVER_JS);
        }

        // Create sign-up route
        const signUpDir = path.join(routesDir, 'sign-up');
        if (!fs.existsSync(signUpDir)) {
            fs.mkdirSync(signUpDir, { recursive: true });
        }

        const signUpPagePath = path.join(signUpDir, '+page.svelte');
        if (!fs.existsSync(signUpPagePath)) {
            if (language === 'ts') {
                fs.writeFileSync(signUpPagePath, SIGNUP_COMPONENT_TS);
            } else {
                fs.writeFileSync(signUpPagePath, SIGNUP_COMPONENT_JS);
            }
        }

        const signUpServerPath = path.join(signUpDir, language === 'ts' ? '+page.server.ts' : '+page.server.js');
        if (!fs.existsSync(signUpServerPath)) {
            fs.writeFileSync(signUpServerPath, language === 'ts' ? SIGNUP_PAGE_SERVER_TS : SIGNUP_PAGE_SERVER_JS);
        }

        // Create home page
        const homePagePath = path.join(routesDir, '+page.svelte');

        let existingContent = fs.readFileSync(homePagePath, 'utf-8');

        existingContent = existingContent.replace(
            /<div class="min-h-screen bg-gradient-to-b from-\[#1e1b4b\] via-\[#1e3a8a\] to-\[#111827\] flex items-center justify-center p-4">/,
            '<div>'
        );

        // Add Clerk imports if not already present
        if (!existingContent.includes('svelte-clerk')) {
            const scriptMatch = existingContent.match(/<script[^>]*>/);
            if (scriptMatch) {
                const scriptTag = scriptMatch[0];
                const clerkImport = `\n\timport { ClerkLoaded, ClerkLoading, SignedIn, UserButton } from 'svelte-clerk';`;
                existingContent = existingContent.replace(scriptTag, scriptTag + clerkImport);
            }
        }

        // Wrap content with ClerkLoaded and ClerkLoading
        existingContent = existingContent.replace(
            /<div>\s*<div class="max-w-4xl w-full">/,
            `<div>
\t<ClerkLoaded>
\t\t<div class="user-btn">
\t\t\t<SignedIn>
\t\t\t\t<UserButton afterSignOutUrl="/sign-in" />
\t\t\t</SignedIn>
\t\t</div>
\t\t<div class="max-w-4xl w-full">`
        );

        // Close ClerkLoaded and add ClerkLoading before final closing div
        existingContent = existingContent.replace(
            /<\/div>\s*<\/div>\s*<\/div>$/m,
            `\t\t</div>
\t</ClerkLoaded>
\t<ClerkLoading>Loading...</ClerkLoading>`
        );

        fs.writeFileSync(homePagePath, existingContent);
        console.log(chalk.green(`Updated home page at ${homePagePath}`));

        const homeServerPath = path.join(routesDir, language === 'ts' ? '+page.server.ts' : '+page.server.js');
        if (!fs.existsSync(homeServerPath)) {
            fs.writeFileSync(homeServerPath, language === 'ts' ? HOME_PAGE_SERVER_TS : HOME_PAGE_SERVER_JS);
            console.log(chalk.green(`Created home server at ${homeServerPath}`));
        } else {
            console.log(chalk.yellow(`${homeServerPath} already exists, skipping creation`));
        }

        // Install dependencies
        console.log(chalk.blue('Installing Clerk dependencies...'));
        await execa('npm', ['install', 'svelte-clerk'], { cwd: rootDir, stdio: 'inherit' });
        await execa('npm', ['install', 'svelte-sonner'], { cwd: rootDir, stdio: 'inherit' });

        // Add .env file
        const envPath = path.join(rootDir, '.env');
        if (!fs.existsSync(envPath)) {
            const envContent = `PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
`;
            fs.writeFileSync(envPath, envContent);
            console.log(chalk.green(`Created .env file at ${envPath}`));
        } else {
            console.log(chalk.yellow('.env already exists, skipping .env creation'));
        }

        // Create svelte.config.js if it doesn't exist
        const svelteConfigPath = path.join(rootDir, 'svelte.config.js');
        if (!fs.existsSync(svelteConfigPath)) {
            const svelteConfigContent = `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  
  kit: {
    adapter: adapter()
  }
};

export default config;
`;
            fs.writeFileSync(svelteConfigPath, svelteConfigContent);
            console.log(chalk.green(`Created svelte.config.js at ${svelteConfigPath}`));
        }

        // Create vite.config file if it doesn't exist
        const viteConfigPath = path.join(rootDir, language === 'ts' ? 'vite.config.ts' : 'vite.config.js');
        if (!fs.existsSync(viteConfigPath)) {
            const viteConfigContent = `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()]
});
`;
            fs.writeFileSync(viteConfigPath, viteConfigContent);
            console.log(chalk.green(`Created vite.config at ${viteConfigPath}`));
        }
        // append Clerk CSS to app.css
        const appCssPath = path.join(srcDir, 'app.css');
        if (fs.existsSync(appCssPath)) {
            fs.appendFileSync(appCssPath, '\n' + clerkCss);
            console.log(chalk.green(`Added clerk styles at ${appCssPath}`));
        }

        console.log(chalk.green.bold('\n🎉 SvelteKit Clerk setup completed!'));
        console.log(chalk.white('Add your Clerk API keys to .env file'));
        console.log(chalk.green('\nThe ClerkHeader.svelte component in src/lib/components can be used as a compact auth button anywhere in your app.'));

    } catch (err) {
        console.error(chalk.red('Error setting up Clerk for SvelteKit:'), err && err.message ? err.message : err);
    }
}