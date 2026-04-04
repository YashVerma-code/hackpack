import { BaseFramework } from './BaseFramework.js';
import createSvelteProject from '../../lib/createSvelteProject/index.js';

/**
 * Framework creator for SvelteKit.
 */
export class SvelteFramework extends BaseFramework {
  static id = 'svelte';
  static displayName = 'SvelteKit';
  static requiresTypeScript = false;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'Skeleton UI (beta)', value: 'skeletonui' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'Plain CSS', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    await createSvelteProject(config);
  }
}
