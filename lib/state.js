import fs from 'fs';
import path from 'path';
import os from 'os';

const STATE_FILE_NAME = '.hackpack-state.json';

function getStateFilePath() {
  // Priority:
  // 1. If HACKPACK_STATE_DIR env var is set, use that.
  // 2. Prefer a state file in the current working directory so state is colocated with the project.
  // 3. Fallback to the user's home directory for backward compatibility.
  const envPath = process.env.HACKPACK_STATE_DIR;
  if (envPath) return path.resolve(envPath, STATE_FILE_NAME);

  const cwdPath = path.resolve(process.cwd(), STATE_FILE_NAME);
  const homePath = path.join(os.homedir(), STATE_FILE_NAME);

  // If there's a state file in home but not in cwd, migrate it to cwd for project-local storage.
  try {
    if (fs.existsSync(homePath) && !fs.existsSync(cwdPath)) {
      try {
        const content = fs.readFileSync(homePath, 'utf8');
        // ensure we have write permissions in cwd
        fs.writeFileSync(cwdPath, content, 'utf8');
      } catch (e) {
        // ignore migration errors and fall back to homePath
        return homePath;
      }
      return cwdPath;
    }
  } catch (e) {
    // ignore and continue to choose path
  }

  // Prefer cwd location if present, otherwise fallback to home
  if (fs.existsSync(cwdPath)) return cwdPath;
  return homePath;
}

// Internal helper to read the raw JSON from disk and return a normalized object
function readRawState() {
  const file = getStateFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      // If it's the old single-object shape, migrate to new shape
      if (parsed && !parsed.projects) {
        const single = Object.assign({ step: 'start' }, parsed);
        return { projects: [single], active: single.projectName || null };
      }
      // Ensure basic structure
      return Object.assign({ projects: [], active: null }, parsed);
    }
  } catch (e) {
    // ignore and fallthrough to empty state
  }
  return { projects: [], active: null };
}

const DEFAULT_PROJECT_SHAPE = {
  framework: null,
  projectName: null,
  language: null,
  styling: null,
  uiLibrary: null,
  database: null,
  step: null
};

function sanitizeProjectInput(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  Object.keys(obj).forEach(k => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

function writeRawState(obj) {
  const file = getStateFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    // silent failure — callers may want to surface this later
  }
}

// Backwards-compatible: loadState returns the active project's state (legacy shape)
export function loadState() {
  const raw = readRawState();
  const activeName = raw.active || (raw.projects[0] && raw.projects[0].projectName) || null;
  const project = raw.projects.find(p => p.projectName === activeName) || raw.projects[0] || null;
  if (project) return project;
  // default legacy empty state
  return {
    framework: null,
    projectName: null,
    language: null,
    styling: null,
    uiLibrary: null,
    database: null,
    authentication: null,
    step: 'start'
  };
}

// Backwards-compatible: saveState will upsert the active project into projects[] and set it as active
export function saveState(state) {
  try {
    if (!state || typeof state !== 'object') return;
    const raw = readRawState();
    const sanitizedState = sanitizeProjectInput(state);
    const projectName = sanitizedState.projectName || raw.active || null;
    if (!projectName) {
      // No projectName — write as anonymous single project entry
      const anon = Object.assign({}, DEFAULT_PROJECT_SHAPE, sanitizedState, { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      raw.projects.push(anon);
      raw.active = anon.projectName || null;
      writeRawState(raw);
      return;
    }

    const existingIndex = raw.projects.findIndex(p => p.projectName === projectName);
    const currentActive = raw.active || null;
    const idxActive = currentActive ? raw.projects.findIndex(p => p.projectName === currentActive) : -1;

    // If projectName already exists in list, update/merge into that entry.
    if (existingIndex >= 0) {
      const toSave = Object.assign({}, DEFAULT_PROJECT_SHAPE, raw.projects[existingIndex], sanitizedState, { updatedAt: new Date().toISOString() });
      raw.projects[existingIndex] = toSave;
      // If we renamed the previously active project to an already-existing project name,
      // remove the old active entry to avoid duplicates.
      if (idxActive >= 0 && idxActive !== existingIndex) {
        raw.projects.splice(idxActive, 1);
      }
      raw.active = projectName;
      writeRawState(raw);
      return;
    }

    // If projectName does not exist but an active project exists, assume this is a rename
    if (idxActive >= 0) {
      const merged = Object.assign({}, DEFAULT_PROJECT_SHAPE, raw.projects[idxActive], sanitizedState, { projectName, updatedAt: new Date().toISOString() });
      raw.projects[idxActive] = merged;
      // After renaming, set new active name
      raw.active = projectName;
      writeRawState(raw);
      return;
    }

    // Otherwise it's a new project
  const toSave = Object.assign({}, DEFAULT_PROJECT_SHAPE, sanitizedState, { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  raw.projects.push(toSave);
    raw.active = projectName;
    writeRawState(raw);
  } catch (e) {
    // silent
  }
}

export function listProjects() {
  const raw = readRawState();
  return raw.projects.slice();
}

export function getProject(projectName) {
  const raw = readRawState();
  return raw.projects.find(p => p.projectName === projectName) || null;
}

export function addOrUpdateProject(project, options = {}) {
  // options.activate (default true) controls whether this upsert makes the project active
  const sanitized = sanitizeProjectInput(project);
  if (!sanitized || !sanitized.projectName) return;
  const activate = options.activate !== undefined ? options.activate : true;
  const raw = readRawState();
  const idx = raw.projects.findIndex(p => p.projectName === sanitized.projectName);
  const now = new Date().toISOString();
  if (idx >= 0) {
    raw.projects[idx] = Object.assign({}, DEFAULT_PROJECT_SHAPE, raw.projects[idx], sanitized, { updatedAt: now });
  } else {
    raw.projects.push(Object.assign({}, DEFAULT_PROJECT_SHAPE, sanitized, { createdAt: now, updatedAt: now }));
  }
  if (activate) raw.active = project.projectName;
  writeRawState(raw);
}

export function removeProject(projectName) {
  if (!projectName) return;
  const raw = readRawState();
  const filtered = raw.projects.filter(p => p.projectName !== projectName);
  raw.projects = filtered;
  if (raw.active === projectName) raw.active = filtered[0] ? filtered[0].projectName : null;
  writeRawState(raw);
}

export function clearState() {
  const file = getStateFilePath();
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  } catch (e) {
    // ignore
  }
}

export function getStateFilePathPublic() {
  return getStateFilePath();
}
