import { BaseFramework } from './BaseFramework.js';
import createAstroProject from '../../lib/createAstroProject/index.js';

/**
 * Framework creator for Astro.
 */
export class AstroFramework extends BaseFramework {
  static id = 'astro';
  static displayName = 'Astro';
  static requiresTypeScript = false;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'shadcn/ui', value: 'shadcn' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'None (plain CSS)', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    await createAstroProject(config);
  }
}
