import chalk from 'chalk';

/**
 * Centralized, static logging utility.
 *
 * Single Responsibility: all console output in the new src/ layer
 * flows through this class, making it trivial to add log levels,
 * silent mode, or structured output later without touching call sites.
 */
export class Logger {
  static info(msg) {
    console.log(chalk.blue(msg));
  }

  static success(msg) {
    console.log(chalk.green(msg));
  }

  static warn(msg) {
    console.log(chalk.yellow(msg));
  }

  static error(msg) {
    console.log(chalk.red(msg));
  }

  static dim(msg) {
    console.log(chalk.gray(msg));
  }

  static bold(msg) {
    console.log(chalk.bold(msg));
  }

  /** Plain line — no colour styling. */
  static log(msg = '') {
    console.log(msg);
  }

  /** Pass-through for cases that need raw console.log arguments. */
  static raw(...args) {
    console.log(...args);
  }

  /** Pretty-print a JSON-serialisable object. */
  static json(obj) {
    console.log(JSON.stringify(obj, null, 2));
  }
}
