import { BaseFramework } from './BaseFramework.js';
import { AngularGenerator } from '../generators/angular/AngularGenerator.js';

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
    const generator = new AngularGenerator({
      projectName: config.projectName,
      language: config.language,
      styling: config.styling,
      uiLibrary: config.uiLibrary ?? null,
    });
    await generator.create();
  }
}
