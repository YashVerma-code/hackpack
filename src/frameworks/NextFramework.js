import { BaseFramework } from './BaseFramework.js';
import { NextGenerator } from '../generators/next/NextGenerator.js';

export class NextFramework extends BaseFramework {
  static id = 'next';
  static displayName = 'Next.js';
  static requiresTypeScript = false;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'shadcn/ui', value: 'shadcn' },
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'NextUI (HeroUI)', value: 'heroui' },
      { name: 'Aceternity UI', value: 'aceternityui' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'Chakra UI (beta)', value: 'chakraui' },
      { name: 'Material UI', value: 'mui' },
    ],
  };

  async runCLI(config) {
    const generator = new NextGenerator({
      projectName: config.projectName,
      language: config.language,
      styling: config.styling,
      uiLibrary: config.uiLibrary ?? null,
    });
    await generator.create();
  }
}
