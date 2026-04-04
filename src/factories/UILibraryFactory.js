import { Logger } from '../core/Logger.js';
import { addTailwind } from '../../lib/addTailwind.js';

// ── Next.js UI imports ───────────────────────────────────────────────────────
import { ShadcnUINext } from '../generators/next/ui/ShadcnUINext.js';
import { DaisyUINext } from '../generators/next/ui/DaisyUINext.js';
import { HeroUINext } from '../generators/next/ui/HeroUINext.js';
import { AceternityUINext } from '../generators/next/ui/AceternityUINext.js';
import { TailwindOnlyNext } from '../generators/next/ui/TailwindOnlyNext.js';
import { ChakraUINext } from '../generators/next/ui/ChakraUINext.js';
import { MaterialUINext } from '../generators/next/ui/MaterialUINext.js';
import { PlainCSSNext } from '../generators/next/ui/PlainCSSNext.js';

// ── Vite + React UI imports ──────────────────────────────────────────────────
import { setupShadcnUI as shadcnVite } from '../../lib/createViteProject/ui/shadcn.js';
import { setupDaisyUI as daisyVite } from '../../lib/createViteProject/ui/daisyui.js';
import { setupHeroUI as heroVite } from '../../lib/createViteProject/ui/heroui.js';
import { setupTailwindOnly as twonlyVite } from '../../lib/createViteProject/ui/twonly.js';
import { setupChakraUI as chakraVite } from '../../lib/createViteProject/ui/chakraui.js';
import { setupMaterialUI as muiVite } from '../../lib/createViteProject/ui/mui.js';
import { setupPlainCSS as plainVite } from '../../lib/createViteProject/ui/plaincss.js';

// ── SvelteKit UI imports ─────────────────────────────────────────────────────
import { setupDaisyUI as daisySvelte } from '../../lib/createSvelteProject/ui/daisyui.js';
import { setupSkeletonUI as skeletonSvelte } from '../../lib/createSvelteProject/ui/skeletonui.js';
import { setupTailwindOnly as twonlySvelte } from '../../lib/createSvelteProject/ui/twonly.js';
import { setupPlainCSS as plainSvelte } from '../../lib/createSvelteProject/ui/plaincss.js';

// ── Vue UI imports ──────────────────────────────────────────────────────────
import { DaisyUIVue } from '../generators/vue/ui/DaisyUIVue.js';
import { VuetifyVue } from '../generators/vue/ui/VuetifyVue.js';
import { ShadcnVue } from '../generators/vue/ui/ShadcnVue.js';
import { PrimeVueUI } from '../generators/vue/ui/PrimeVueUI.js';
import { DefaultVue } from '../generators/vue/ui/DefaultVue.js';
import { TailwindOnlyVue } from '../generators/vue/ui/TailwindOnlyVue.js';

// ── Angular UI imports ───────────────────────────────────────────────────────
import { setupAngularMaterial as angularMaterial } from '../../lib/createAngularProject/ui/angularmaterialui.js';
import { setupDaisyUi as daisyAngular } from '../../lib/createAngularProject/ui/daisyui.js';
import { setupPrimeNg as primengAngular } from '../../lib/createAngularProject/ui/primeNg.js';

// ── Astro UI imports ─────────────────────────────────────────────────────────
import { setupShadcnUI as shadcnAstro } from '../../lib/createAstroProject/ui/shadcn.js';
import { setupDaisyUi as daisyUIAstro } from '../../lib/createAstroProject/ui/daisyui.js';

// ── Nuxt UI imports ──────────────────────────────────────────────────────────
import { setupShadcnUI as shadcnNuxt } from '../../lib/createNuxtProject/ui/shadcn.js';
import { setupDaisyUI as daisyNuxt } from '../../lib/createNuxtProject/ui/daisyui.js';

/**
 * Registry-based factory for UI library setup strategies.
 *
 * Pattern: Factory + Registry
 *   - Registry key: `${frameworkId}:${libraryId}`
 *   - Each registered value is an async setup function receiving a config object.
 *   - Alias normalisation is centralised here, eliminating the three divergent
 *     alias maps that existed in wizard.js, select.js, and uiLibrary.js.
 *
 * SOLID:
 *   - OCP  — add a new (framework, library) combo by calling register() at the
 *            bottom of this file. No existing code changes required.
 *   - SRP  — this class is the single source of truth for UI library dispatch.
 *   - DIP  — AddCommand and ProjectOrchestrator depend on this abstraction.
 */
export class UILibraryFactory {
  /** @type {Map<string, Function>} */
  static #registry = new Map();

  /**
   * Canonical alias map.
   * Merges the three previously scattered alias objects into one place.
   */
  static #aliases = {
    twonly: 'tailwind-only',
    'tw-only': 'tailwind-only',
    tailwindonly: 'tailwind-only',
    plaincss: 'plain',
    aceui: 'aceternityui',   // some places used 'aceui', canonical is 'aceternityui'
    material: 'angular-material',
  };

  /**
   * Register a setup function for a (framework, library) combination.
   *
   * @param {string}   frameworkId  e.g. 'next'
   * @param {string}   libraryId    e.g. 'shadcn'
   * @param {Function} setupFn      async (config) => void
   */
  static register(frameworkId, libraryId, setupFn) {
    UILibraryFactory.#registry.set(`${frameworkId}:${libraryId}`, setupFn);
  }

  /**
   * Resolve an alias to the canonical library id.
   * @param {string} id
   * @returns {string}
   */
  static normalize(id) {
    return UILibraryFactory.#aliases[id] ?? id;
  }

  /**
   * Returns the setup function for the given (framework, library) pair, or null.
   * @param {string} frameworkId
   * @param {string} libraryId
   * @returns {Function|null}
   */
  static get(frameworkId, libraryId) {
    const normalised = UILibraryFactory.normalize(libraryId);
    return UILibraryFactory.#registry.get(`${frameworkId}:${normalised}`) ?? null;
  }

  /**
   * Returns true if the combination is registered.
   */
  static isSupported(frameworkId, libraryId) {
    return UILibraryFactory.get(frameworkId, libraryId) !== null;
  }

  /**
   * Apply a UI library to an already-scaffolded project.
   * This is the primary entry point for AddCommand and ProjectOrchestrator.
   *
   * @param {object} opts
   * @param {string} opts.framework
   * @param {string} opts.projectName
   * @param {string} opts.language
   * @param {string} opts.library
   * @param {object} [opts.state]
   */
  static async apply({ framework, projectName, language, library, state }) {
    const normalised = UILibraryFactory.normalize(library);
    const setupFn = UILibraryFactory.get(framework, normalised);

    if (!setupFn) {
      Logger.warn(`UI library '${normalised}' is not supported for ${framework}.`);
      return;
    }

    const useTailwind = state?.styling === 'tailwind';
    await setupFn({ projectName, language, useTailwind, state });
  }
}

// ── Registry: Next.js ────────────────────────────────────────────────────────
UILibraryFactory.register('next', 'shadcn',       ({ projectName, language }) => new ShadcnUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'daisyui',      ({ projectName, language }) => new DaisyUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'heroui',       ({ projectName, language }) => new HeroUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'aceternityui', ({ projectName, language }) => new AceternityUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'tailwind-only',({ projectName, language }) => new TailwindOnlyNext({ projectName, language }).setup());
UILibraryFactory.register('next', 'chakraui',     ({ projectName, language }) => new ChakraUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'mui',          ({ projectName, language }) => new MaterialUINext({ projectName, language }).setup());
UILibraryFactory.register('next', 'plain',        ({ projectName, language }) => new PlainCSSNext({ projectName, language }).setup());

// ── Registry: Vite + React ───────────────────────────────────────────────────
UILibraryFactory.register('vite-react', 'shadcn',       ({ projectName, language }) => shadcnVite(projectName, language));
UILibraryFactory.register('vite-react', 'daisyui',      ({ projectName, language }) => daisyVite(projectName, language));
UILibraryFactory.register('vite-react', 'heroui',       ({ projectName, language }) => heroVite(projectName, language));
UILibraryFactory.register('vite-react', 'tailwind-only',({ projectName, language }) => twonlyVite(projectName, language));
UILibraryFactory.register('vite-react', 'chakra',       ({ projectName, language }) => chakraVite(projectName, language));
UILibraryFactory.register('vite-react', 'mui',          ({ projectName, language }) => muiVite(projectName, language));
UILibraryFactory.register('vite-react', 'plain',        ({ projectName, language }) => plainVite(projectName, language));

// ── Registry: SvelteKit ──────────────────────────────────────────────────────
UILibraryFactory.register('svelte', 'daisyui',      ({ projectName, language }) => daisySvelte(projectName, language));
UILibraryFactory.register('svelte', 'skeletonui',    ({ projectName, language }) => skeletonSvelte(projectName, language));
UILibraryFactory.register('svelte', 'tailwind-only', ({ projectName, language }) => twonlySvelte(projectName, language));
UILibraryFactory.register('svelte', 'plain',         ({ projectName, language }) => plainSvelte(projectName, language));

// ── Registry: Vue ────────────────────────────────────────────────────────────
UILibraryFactory.register('vue', 'daisyui',      ({ projectName, language, useTailwind }) => new DaisyUIVue({ projectName, language, useTailwind }).setup());
UILibraryFactory.register('vue', 'vuetify',      ({ projectName, language, useTailwind }) => new VuetifyVue({ projectName, language, useTailwind }).setup());
UILibraryFactory.register('vue', 'shadcn-vue',   ({ projectName, language, useTailwind }) => new ShadcnVue({ projectName, language, useTailwind }).setup());
UILibraryFactory.register('vue', 'primevue',     ({ projectName, language, useTailwind }) => new PrimeVueUI({ projectName, language, useTailwind }).setup());
UILibraryFactory.register('vue', 'tailwind-only',({ projectName, language, useTailwind }) => new TailwindOnlyVue({ projectName, language, useTailwind }).setup());
UILibraryFactory.register('vue', 'plain',        ({ projectName, language, useTailwind }) => new DefaultVue({ projectName, language, useTailwind }).setup());

// ── Registry: Angular ────────────────────────────────────────────────────────
UILibraryFactory.register('angular', 'angular-material', ({ projectName, useTailwind }) => angularMaterial({ projectName, useTailwind }));
UILibraryFactory.register('angular', 'daisyui',          ({ projectName, language }) => daisyAngular(projectName, language));
UILibraryFactory.register('angular', 'primeng',          ({ projectName, language }) => primengAngular(projectName, language));
UILibraryFactory.register('angular', 'tailwind-only',    ({ projectName }) => addTailwind({ framework: 'angular', projectName }));
UILibraryFactory.register('angular', 'plain',            () => Logger.warn('Plain CSS selected for Angular — no UI packages installed.'));

// ── Registry: Astro ──────────────────────────────────────────────────────────
UILibraryFactory.register('astro', 'shadcn',       ({ projectName, language, useTailwind }) => shadcnAstro(projectName, language === 'ts', useTailwind));
UILibraryFactory.register('astro', 'daisyui',      ({ projectName, language, useTailwind }) => daisyUIAstro(projectName, language === 'ts', useTailwind));
UILibraryFactory.register('astro', 'tailwind-only',({ projectName }) => addTailwind({ framework: 'astro', projectName }));
UILibraryFactory.register('astro', 'plain',        () => Logger.warn('Plain CSS selected for Astro — no UI packages installed.'));

// ── Registry: Nuxt ───────────────────────────────────────────────────────────
UILibraryFactory.register('nuxt', 'shadcn',       ({ projectName, useTailwind }) => shadcnNuxt(projectName, useTailwind));
UILibraryFactory.register('nuxt', 'daisyui',      ({ projectName }) => daisyNuxt(projectName));
UILibraryFactory.register('nuxt', 'tailwind-only',({ projectName }) => addTailwind({ framework: 'nuxt', projectName }));
UILibraryFactory.register('nuxt', 'plain',        () => Logger.warn('Plain CSS selected for Nuxt — no UI packages installed.'));
