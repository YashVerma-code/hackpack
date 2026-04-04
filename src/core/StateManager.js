import {
  loadState,
  saveState,
  clearState,
  listProjects,
  getProject,
  addOrUpdateProject,
  removeProject,
  getStateFilePathPublic,
} from '../../lib/state.js';

/**
 * Singleton service that owns all access to the persisted project state.
 *
 * Pattern: Singleton
 *   - Guarantees a single read/write path to .hackpack-state.json.
 *   - Every command and wizard step obtains the instance via getInstance()
 *     instead of importing lib/state.js functions directly.
 *
 * SOLID:
 *   - SRP: all state I/O responsibility lives here, nowhere else in src/.
 *   - DIP: commands depend on this abstraction, not on the concrete lib/state
 *          functions, so the persistence back-end can be swapped later.
 */
export class StateManager {
  /** @type {StateManager|null} */
  static #instance = null;

  /** @private — use StateManager.getInstance() */
  constructor() {}

  /**
   * Returns the single shared StateManager instance.
   * @returns {StateManager}
   */
  static getInstance() {
    if (!StateManager.#instance) {
      StateManager.#instance = new StateManager();
    }
    return StateManager.#instance;
  }

  /**
   * Load the currently active project's state (or a sensible default).
   * @returns {object}
   */
  load() {
    return loadState();
  }

  /**
   * Persist (upsert) a state object.
   * @param {object} state
   */
  save(state) {
    return saveState(state);
  }

  /** Delete the state file entirely. */
  clear() {
    return clearState();
  }

  /**
   * Return all saved projects as an array.
   * @returns {object[]}
   */
  list() {
    return listProjects();
  }

  /**
   * Fetch a specific saved project by name.
   * @param {string} name
   * @returns {object|null}
   */
  get(name) {
    return getProject(name);
  }

  /**
   * Add or update a project in the state file.
   * @param {object} project
   * @param {{ activate?: boolean }} [options]
   */
  upsert(project, options = {}) {
    return addOrUpdateProject(project, options);
  }

  /**
   * Remove a project from the state file by name.
   * @param {string} name
   */
  remove(name) {
    return removeProject(name);
  }

  /**
   * Absolute path to the .hackpack-state.json file.
   * @returns {string}
   */
  getFilePath() {
    return getStateFilePathPublic();
  }
}
