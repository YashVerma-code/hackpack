/**
 * Abstract base class for database integration strategies.
 *
 * Pattern: Strategy
 *   - Concrete implementations (MongoDatabase, PostgresDatabase) encapsulate
 *     their own dependency installation, schema generation, and config steps.
 *   - DatabaseFactory selects the right strategy at runtime.
 *
 * SOLID:
 *   - OCP — add new databases by creating a subclass + registry entry.
 *   - LSP — every database strategy is interchangeable through this interface.
 */
export class BaseDatabase {
  /** Short identifier used in state JSON (e.g. 'mongodb', 'postgresql'). */
  static id = null;

  /** Human-readable name for wizard prompts. */
  static displayName = null;

  /**
   * Frameworks this database integration officially supports.
   * An empty array means "all frameworks".
   * @type {string[]}
   */
  static supportedFrameworks = [];

  /**
   * Install dependencies and generate boilerplate for this database.
   *
   * @param {string} projectName
   * @param {string} frameworkId
   * @param {string} language  'ts' | 'js'
   * @abstract
   */
  async setup(projectName, frameworkId, language) {
    throw new Error(`${this.constructor.name} must implement setup(projectName, frameworkId, language).`);
  }
}
