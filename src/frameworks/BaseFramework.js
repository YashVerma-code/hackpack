/**
 * Abstract base class for all framework creators.
 *
 * Pattern: Template Method
 *   - `create(config)` defines the overall scaffold algorithm.
 *   - Subclasses implement `runCLI(config)` for their specific CLI commands.
 *
 * SOLID:
 *   - SRP  — each subclass owns only its framework's scaffold step.
 *   - OCP  — add new frameworks by extending, never by editing this class.
 *   - LSP  — every framework is interchangeable through this interface.
 *   - DIP  — higher-level orchestrators depend on BaseFramework, not concrete types.
 *
 * Static metadata properties (id, displayName, …) are read by FrameworkFactory
 * without instantiating the class, so wizard prompts can be built data-driven.
 */
export class BaseFramework {
  // ── Static metadata ──────────────────────────────────────────────────────
  // Each subclass MUST override these.

  /** Short identifier used in state JSON (e.g. 'next', 'vite-react'). */
  static id = null;

  /** Human-readable name displayed in prompts. */
  static displayName = null;

  /**
   * When true the wizard auto-selects TypeScript and skips the language step.
   * Override in Angular / Nuxt.
   */
  static requiresTypeScript = false;

  /**
   * Whether this framework uses a dedicated styling step.
   * All current frameworks use one, but future meta-frameworks may not.
   */
  static requiresStylingStep = true;

  /**
   * Available UI library options, split by whether the user chose Tailwind.
   * The wizard reads this via FrameworkFactory.getMeta() to build choices.
   *
   * Shape: { tailwind: [{name, value}], nonTailwind: [{name, value}] }
   */
  static uiLibraryOptions = { tailwind: [], nonTailwind: [] };

  // ── Constructor ───────────────────────────────────────────────────────────

  /**
   * @param {object} config
   * @param {string} config.projectName
   * @param {string} config.language    'ts' | 'js'
   * @param {string} config.styling     'tailwind' | 'plain'
   * @param {string|null} config.uiLibrary
   */
  constructor(config) {
    if (new.target === BaseFramework) {
      throw new Error(
        'BaseFramework is abstract — extend it instead of instantiating it directly.'
      );
    }
    this.config = config;
    this.projectName = config.projectName;
    this.language = config.language;
    this.styling = config.styling;
    this.uiLibrary = config.uiLibrary ?? null;
  }

  // ── Instance accessors (mirrors static props for convenience) ─────────────

  get id() { return this.constructor.id; }
  get displayName() { return this.constructor.displayName; }

  // ── Abstract method ───────────────────────────────────────────────────────

  /**
   * Run the framework's CLI scaffolding command and apply the chosen UI library.
   * Subclasses delegate to the existing lib/create*Project/ functions.
   *
   * @param {object} config — same shape as constructor argument
   * @abstract
   */
  async runCLI(config) {
    throw new Error(`${this.constructor.name} must implement runCLI(config).`);
  }

  // ── Template Method ───────────────────────────────────────────────────────

  /**
   * Full creation pipeline.  Calls runCLI() which handles both scaffolding
   * and UI library application (the lib/create* functions do this internally).
   *
   * Subclasses that need pre- or post-scaffold hooks should override this
   * method and call `await super.create()` at the appropriate point.
   */
  async create() {
    await this.runCLI(this.config);
  }
}
