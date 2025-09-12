import fs from 'fs';
import path from 'path';
import os from 'os';

const STATE_FILE_NAME = '.hackpack-state.json';

function getStateFilePath() {
  // this is stored globally in home allowing user to resume even if they cd elsewhere
  const envPath = process.env.HACKPACK_STATE_DIR;
  if (envPath) return path.resolve(envPath, STATE_FILE_NAME);
  return path.join(os.homedir(), STATE_FILE_NAME);
}

export function loadState() {
  const file = getStateFilePath();
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return {
    framework: null,
    projectName: null,
    language: null,
    styling: null,
    uiLibrary: null,
    database: null,
    step: 'start'
  };
}

export function saveState(state) {
  const file = getStateFilePath();
  try {
    fs.writeFileSync(file, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    // silent failure
  }
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
