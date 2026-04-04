/**
 * Abstract base class for UI library strategy implementations.
 *
 * Pattern: Strategy
 *   - Concrete subclasses encapsulate how a specific UI library is installed
 *     and configured for a given framework.
 *   - UILibraryFactory selects and returns the right strategy at runtime.
 *
 * SOLID:
 *   - OCP — add new libraries by creating a new subclass + registry entry.
 *   - LSP — all UI library strategies are interchangeable through this interface.
 */
export class BaseUILibrary {
  static id = null; // 'shadcn', 'daisyui'
  static displayName = null;
  static requiresTailwind = true;

  /**
   * Apply this UI library to an already-scaffolded project.
   *
   * @param {object} config
   * @param {string} config.projectName
   * @param {string} config.language   'ts' | 'js'
   * @param {boolean} config.useTailwind
   * @abstract
   */
  async setup(config) {
    throw new Error(`${this.constructor.name} must implement setup(config).`);
  }

  /**
   * npm package names that this library installs.
   * Used by UninstallCommand to know what to remove.
   * @returns {string[]}
   */
  getDependencies() {
    return [];
  }
}
