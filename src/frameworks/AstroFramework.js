import { BaseFramework } from './BaseFramework.js';
import { AstroGenerator } from '../generators/astro/AstroGenerator.js';

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
     const generator = new AstroGenerator({
      projectName: config.projectName,
      language: config.language,
      styling: config.styling,
      uiLibrary: config.uiLibrary ?? null,
    });
    await generator.create();
  }
}
