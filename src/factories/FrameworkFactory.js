import { NextFramework } from '../frameworks/NextFramework.js';
import { ViteReactFramework } from '../frameworks/ViteReactFramework.js';
import { SvelteFramework } from '../frameworks/SvelteFramework.js';
import { VueFramework } from '../frameworks/VueFramework.js';
import { AngularFramework } from '../frameworks/AngularFramework.js';
import { AstroFramework } from '../frameworks/AstroFramework.js';
import { NuxtFramework } from '../frameworks/NuxtFramework.js';

/**
 * Registry-based factory for framework creators.
 *
 * Pattern: Factory + Registry
 *   - New frameworks are registered at the bottom of this file.
 *   - No framework class imports this factory — dependency flows one way only,
 *     preventing circular imports.
 *
 * SOLID:
 *   - OCP — add a new framework by importing its class and calling register().
 *          No existing code needs to change.
 *   - DIP — orchestrators depend on this factory abstraction rather than
 *          importing concrete framework classes directly.
 *
 * getMeta() reads static class properties WITHOUT instantiating the class,
 * so the wizard can build framework choice lists with zero side-effects.
 */
export class FrameworkFactory {
  /** @type {Map<string, typeof import('../frameworks/BaseFramework.js').BaseFramework>} */
  static #registry = new Map();

  /**
   * Register a framework class under its static id.
   * @param {typeof import('../frameworks/BaseFramework.js').BaseFramework} FrameworkClass
   */
  static register(FrameworkClass) {
    FrameworkFactory.#registry.set(FrameworkClass.id, FrameworkClass);
  }

  /**
   * Create and return a new framework instance for the given id.
   *
   * @param {string} id            Framework identifier (e.g. 'next', 'vite-react')
   * @param {object} config        Project configuration passed to the constructor
   * @returns {import('../frameworks/BaseFramework.js').BaseFramework}
   * @throws {Error} if the framework id is not registered
   */
  static create(id, config) {
    const FrameworkClass = FrameworkFactory.#registry.get(id);
    if (!FrameworkClass) {
      const known = [...FrameworkFactory.#registry.keys()].join(', ');
      throw new Error(`Unsupported framework '${id}'. Registered frameworks: ${known}`);
    }
    return new FrameworkClass(config);
  }

  /**
   * Returns static metadata for a framework without instantiating it.
   * Used by the wizard to build prompt choices data-driven.
   *
   * @param {string} id
   * @returns {{ id, displayName, requiresTypeScript, requiresStylingStep, uiLibraryOptions }|null}
   */
  static getMeta(id) {
    const Cls = FrameworkFactory.#registry.get(id);
    if (!Cls) return null;
    return {
      id: Cls.id,
      displayName: Cls.displayName,
      requiresTypeScript: Cls.requiresTypeScript,
      requiresStylingStep: Cls.requiresStylingStep,
      uiLibraryOptions: Cls.uiLibraryOptions,
    };
  }

  /**
   * Returns metadata for all registered frameworks (for wizard framework list).
   * @returns {Array<{ id, displayName, requiresTypeScript, requiresStylingStep, uiLibraryOptions }>}
   */
  static getAllMeta() {
    return [...FrameworkFactory.#registry.values()].map(Cls => ({
      id: Cls.id,
      displayName: Cls.displayName,
      requiresTypeScript: Cls.requiresTypeScript,
      requiresStylingStep: Cls.requiresStylingStep,
      uiLibraryOptions: Cls.uiLibraryOptions,
    }));
  }

  /**
   * All registered framework ids.
   * @returns {string[]}
   */
  static getIds() {
    return [...FrameworkFactory.#registry.keys()];
  }

  /**
   * Whether the given id is registered.
   * @param {string} id
   * @returns {boolean}
   */
  static isSupported(id) {
    return FrameworkFactory.#registry.has(id);
  }
}

// ── Default registrations ────────────────────────────────────────────────────
// To add a new framework: import its class above and call register() here.
FrameworkFactory.register(NextFramework);
FrameworkFactory.register(ViteReactFramework);
FrameworkFactory.register(SvelteFramework);
FrameworkFactory.register(VueFramework);
FrameworkFactory.register(AngularFramework);
FrameworkFactory.register(AstroFramework);
FrameworkFactory.register(NuxtFramework);
