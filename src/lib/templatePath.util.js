import path from "path";
import { fileURLToPath } from "url";

/**
 * Get absolute path to templates directory
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// go to src/
const SRC_DIR = path.resolve(__dirname, "..");

// templates inside src
const TEMPLATES_DIR = path.join(SRC_DIR, "templates");

/**
 * Resolve template path
 */
export function getTemplatePath(...segments) {
    return path.join(TEMPLATES_DIR, ...segments);
}