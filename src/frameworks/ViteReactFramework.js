import { BaseFramework } from './BaseFramework.js';
import createViteProject from '../../lib/createViteProject/index.js';

/**
 * Framework creator for Vite + React.
 */
export class ViteReactFramework extends BaseFramework {
  static id = 'vite-react';
  static displayName = 'Vite (React)';
  static requiresTypeScript = false;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'shadcn/ui', value: 'shadcn' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'NextUI (HeroUI)', value: 'heroui' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'Chakra UI (beta)', value: 'chakra' },
      { name: 'Material UI (beta)', value: 'mui' },
      { name: 'Plain CSS', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    await createViteProject(config);
  }
}
