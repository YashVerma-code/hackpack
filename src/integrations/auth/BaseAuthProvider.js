/**
 * Abstract base class for authentication provider strategies.
 *
 * Pattern: Strategy
 *   - Concrete providers (Clerk, Auth.js, Auth0) each encapsulate their own
 *     installation and configuration steps.
 *   - AuthProviderFactory selects the right strategy at runtime.
 *
 * SOLID:
 *   - OCP  — new providers are added by creating a subclass + registry entry.
 *   - LSP  — every provider is interchangeable through this interface.
 *   - ISP  — this interface is minimal; providers implement only what they need.
 */
export class BaseAuthProvider {
  /** Short identifier used in state JSON (e.g. 'clerk', 'authjs', 'authzero'). */
  static id = null;

  /** Human-readable name for wizard prompts. */
  static displayName = null;

  /**
   * Frameworks this provider supports.
   * The wizard uses this to filter choices based on the selected framework.
   * An empty array means "all frameworks".
   * @type {string[]}
   */
  static supportedFrameworks = [];

  /**
   * Configure and integrate this auth provider into the scaffolded project.
   *
   * @param {object} state — the full project state object
   * @abstract
   */
  async setup(state) {
    throw new Error(`${this.constructor.name} must implement setup(state).`);
  }

  /**
   * Returns true if this provider can be used with the given framework.
   * @param {string} frameworkId
   * @returns {boolean}
   */
  static isCompatibleWith(frameworkId) {
    if (!this.supportedFrameworks.length) return true;
    return this.supportedFrameworks.includes(frameworkId);
  }
}
