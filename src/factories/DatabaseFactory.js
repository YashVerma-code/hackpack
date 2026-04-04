import { MongoDatabase } from '../integrations/database/mongo/MongoDatabase.js';
import { PostgresDatabase } from '../integrations/database/postgres/PostgresDatabase.js';

/**
 * Registry-based factory for database integration strategies.
 *
 * Pattern: Factory + Registry
 *   - New databases are added by importing and registering at the bottom.
 *   - Database classes never import this factory (no circular deps).
 *
 * SOLID:
 *   - OCP — add new databases without modifying existing code.
 *   - DIP — ProjectOrchestrator and wizard depend on this abstraction.
 */
export class DatabaseFactory {
  /** @type {Map<string, typeof import('../database/BaseDatabase.js').BaseDatabase>} */
  static #registry = new Map();

  /**
   * Register a database class under its static id.
   * @param {typeof import('../database/BaseDatabase.js').BaseDatabase} DatabaseClass
   */
  static register(DatabaseClass) {
    DatabaseFactory.#registry.set(DatabaseClass.id, DatabaseClass);
  }

  /**
   * Create and return a new database instance.
   * @param {string} id   Database identifier (e.g. 'mongodb', 'postgresql')
   * @returns {import('../database/BaseDatabase.js').BaseDatabase}
   * @throws {Error} if the id is not registered
   */
  static create(id) {
    const DatabaseClass = DatabaseFactory.#registry.get(id);
    if (!DatabaseClass) {
      const known = [...DatabaseFactory.#registry.keys()].join(', ');
      throw new Error(`Unsupported database '${id}'. Registered: ${known}`);
    }
    return new DatabaseClass();
  }

  /**
   * Static metadata for all registered databases.
   * Used by the wizard to build database choice lists.
   * @returns {Array<{ id, displayName, supportedFrameworks }>}
   */
  static getAllMeta() {
    return [...DatabaseFactory.#registry.values()].map(Cls => ({
      id: Cls.id,
      displayName: Cls.displayName,
      supportedFrameworks: Cls.supportedFrameworks,
    }));
  }

  /** @param {string} id */
  static isSupported(id) {
    return DatabaseFactory.#registry.has(id);
  }
}

// ── Default registrations ────────────────────────────────────────────────────
DatabaseFactory.register(MongoDatabase);
DatabaseFactory.register(PostgresDatabase);
