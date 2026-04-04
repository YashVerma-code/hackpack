import chalk from "chalk";
import fs from "fs";
import path from "path";
import { BaseAuthProvider } from "../BaseAuthProvider.js";
import { ClerkNext } from "./frameworks/ClerkNext.js";
import { ClerkVue } from "./frameworks/ClerkVue.js";
import { ClerkSvelte } from "./frameworks/ClerkSvelte.js";
import { ClerkViteReact } from "./frameworks/ClerkViteReact.js";
import { ClerkAstro } from "./frameworks/ClerkAstro.js";
import { ClerkNuxt } from "./frameworks/ClerkNuxt.js";

export class ClerkAuthProvider extends BaseAuthProvider {
  static id = 'clerk';
  static displayName = 'Clerk';
  static supportedFrameworks = ['next', 'vite-react', 'svelte', 'vue', 'astro', 'nuxt'];

  // Private registry: frameworkId → framework-specific class
  static #registry = new Map([
    ['next',       ClerkNext],
    ['vue',        ClerkVue],
    ['svelte',     ClerkSvelte],
    ['vite-react', ClerkViteReact],
    ['astro',      ClerkAstro],
    ['nuxt',       ClerkNuxt],
  ]);

  async setup(state) {
    const { framework, projectName, database } = state;

    console.log(chalk.blue(`Setting up clerk for ${framework} project: ${projectName}`));

    const FrameworkClass = ClerkAuthProvider.#registry.get(framework);
    if (!FrameworkClass) {
      console.log(chalk.yellow(`Clerk setup for '${framework}' is not yet automated. Please refer to https://clerk.com/docs for manual setup instructions.`));
    } else {
      await new FrameworkClass(state).setup();
    }

    // Write CLERKSETUP.md after delegating to the framework class
    try {
      const mdPath = path.join('CLERKSETUP.md');
      let md = `# Clerk Setup\n\nFirst-time setup:\n1. Sign in to your Clerk dashboard and create a new application.\n2. Copy your 'CLERK_PUBLISHABLE_KEY' and 'CLERK_SECRET_KEY' into your .env | .env.local file.\n3. `;
      if (database === 'mongodb') {
        md += `\n4. Set up Clerk webhooks for DBsync:\n   - In the Clerk dashboard, go to Webhooks and create a new webhook with the URL: <HTTPS_URL>/api/webhooks or <HTTPS_URL>/api/webhooks/clerk\n   - Subscribe to events: user.created, user.updated, user.deleted\n   - Also add CLERK_WEBHOOK_SIGNING_SECRET to your environment variables.`;
      }
      md += `\n\nFor localhost testing, you may need an HTTPS proxy.\nRun the following command for temporary public URL:\n\n\thp expose\n`;

      fs.writeFileSync(mdPath, md, 'utf8');
    } catch (err) {
      console.log(chalk.yellow('Could not write CLERKSETUP.md:'), err && err.message ? err.message : err);
    }
  }
}
