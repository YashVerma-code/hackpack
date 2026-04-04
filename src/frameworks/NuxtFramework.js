import { BaseFramework } from './BaseFramework.js';
import createNuxtProject from '../../lib/createNuxtProject/index.js';

/**
 * Framework creator for Nuxt.js.
 *
 * Nuxt requires TypeScript — requiresTypeScript is true, so the wizard
 * auto-selects TS and skips the language selection step.  If the user
 * somehow selects JavaScript in a non-wizard flow, Nuxt will override it.
 */
export class NuxtFramework extends BaseFramework {
  static id = 'nuxt';
  static displayName = 'Nuxt.js';
  static requiresTypeScript = true;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'shadcn-vue', value: 'shadcn' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'None (plain CSS)', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    // Nuxt always uses TypeScript regardless of the language field
    await createNuxtProject({ ...config, language: 'ts' });
  }
}
