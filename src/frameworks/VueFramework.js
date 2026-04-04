import { BaseFramework } from './BaseFramework.js';
import { VueGenerator } from '../generators/vue/VueGenerator.js';

export class VueFramework extends BaseFramework {
  static id = 'vue';
  static displayName = 'Vue.js';
  static requiresTypeScript = false;
  static requiresStylingStep = true;

  static uiLibraryOptions = {
    tailwind: [
      { name: 'DaisyUI', value: 'daisyui' },
      { name: 'shadcn-vue', value: 'shadcn-vue' },
      { name: 'PrimeVue (beta)', value: 'primevue' },
      { name: 'Tailwind CSS only', value: 'twonly' },
    ],
    nonTailwind: [
      { name: 'Vuetify (beta)', value: 'vuetify' },
      { name: 'None (plain CSS)', value: 'plaincss' },
    ],
  };

  async runCLI(config) {
    const generator = new VueGenerator({
      projectName: config.projectName,
      language: config.language,
      styling: config.styling,
      uiLibrary: config.uiLibrary ?? null,
    });
    await generator.create();
  }
}
