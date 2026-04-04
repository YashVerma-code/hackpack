import { ClerkAuthProvider } from '../integrations/auth/clerk/ClerkAuthProvider.js';
import { AuthJsAuthProvider } from '../integrations/auth/authjs/AuthJsAuthProvider.js';
import { Auth0AuthProvider } from '../integrations/auth/auth0/Auth0AuthProvider.js';

/**
 * Registry-based factory for authentication provider strategies.
 *
 * Pattern: Factory + Registry
 *   - New providers are added by importing and registering at the bottom.
 *   - Provider classes never import this factory (no circular deps).
 *
 * SOLID:
 *   - OCP — add new auth providers without modifying existing code.
 *   - DIP — ProjectOrchestrator and wizard depend on this abstraction.
 */
export class AuthProviderFactory {
  /** @type {Map<string, typeof import('../auth/BaseAuthProvider.js').BaseAuthProvider>} */
  static #registry = new Map();

  /**
   * Register an auth provider class under its static id.
   * @param {typeof import('../auth/BaseAuthProvider.js').BaseAuthProvider} ProviderClass
   */
  static register(ProviderClass) {
    AuthProviderFactory.#registry.set(ProviderClass.id, ProviderClass);
  }

  /**
   * Create and return a new auth provider instance.
   * @param {string} id   Provider identifier (e.g. 'clerk', 'authjs', 'authzero')
   * @returns {import('../auth/BaseAuthProvider.js').BaseAuthProvider}
   * @throws {Error} if the id is not registered
   */
  static create(id) {
    const ProviderClass = AuthProviderFactory.#registry.get(id);
    if (!ProviderClass) {
      const known = [...AuthProviderFactory.#registry.keys()].join(', ');
      throw new Error(`Unsupported auth provider '${id}'. Registered: ${known}`);
    }
    return new ProviderClass();
  }

  /**
   * Static metadata for all registered providers.
   * Used by the wizard to build auth choice lists.
   * @returns {Array<{ id, displayName, supportedFrameworks }>}
   */
  static getAllMeta() {
    return [...AuthProviderFactory.#registry.values()].map(Cls => ({
      id: Cls.id,
      displayName: Cls.displayName,
      supportedFrameworks: Cls.supportedFrameworks,
    }));
  }

  /**
   * Returns ids of providers compatible with the given framework.
   * @param {string} frameworkId
   * @returns {string[]}
   */
  static getCompatibleIds(frameworkId) {
    return [...AuthProviderFactory.#registry.values()]
      .filter(Cls => Cls.isCompatibleWith(frameworkId))
      .map(Cls => Cls.id);
  }

  /** @param {string} id */
  static isSupported(id) {
    return AuthProviderFactory.#registry.has(id);
  }
}

// ── Default registrations ────────────────────────────────────────────────────
AuthProviderFactory.register(ClerkAuthProvider);
AuthProviderFactory.register(AuthJsAuthProvider);
AuthProviderFactory.register(Auth0AuthProvider);
