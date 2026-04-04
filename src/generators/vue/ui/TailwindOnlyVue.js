import { DefaultVue } from './DefaultVue.js';

// Tailwind-only Vue is the same as Default (scaffold already sets up Tailwind if useTailwind=true).
// This class exists as an explicit named alias for readability in the registry.
export class TailwindOnlyVue extends DefaultVue {
  static id = 'tailwind-only';
  static displayName = 'Tailwind CSS only';
  static requiresTailwind = true;
}
