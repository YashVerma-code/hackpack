import { BaseFramework } from './BaseFramework.js';
import createAngularProject from '../../lib/createAngularProject/index.js';

/**
 * Framework creator for Angular.
 *
 * Angular projects must use TypeScript — requiresTypeScript is true, so the
 * wizard auto-selects TS and skips the language selection step entirely.
 */
export class AngularFramework extends BaseFramework {
  static id = 'angular';
  static displayName = 'Angular';
  static requiresTypeScript = true;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'Tailwind CSS only', value: 'twonly' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'PrimeNG', value: 'primeng' },
      { name: 'Angular Material', value: 'angular-material' },
    ],
    nonTailwind: [
      { name: 'None (plain CSS) (beta)', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    await createAngularProject(config);
  }
}
