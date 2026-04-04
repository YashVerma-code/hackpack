import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { execa } from 'execa';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';

export class DefaultVue extends BaseUILibrary {
  static id = 'none';
  static displayName = 'Default (no UI library)';
  static requiresTailwind = false;

  constructor({ projectName, language = 'js', useTailwind = false }) {
    super();
    this.projectName = projectName;
    this.language = language;
    this.useTailwind = useTailwind;
  }

  getDependencies() {
    return ['vue-sonner'];
  }

  async setup() {
    console.log(chalk.blue('\nCreating a welcome page...'));
    const projectPath = process.cwd();

    try {
      await execa('npm', ['install', 'vue-sonner'], { stdio: 'inherit', shell: true });

      console.log(chalk.blue('Creating a welcome page...'));

      let clearCssFilePath;
      if (!this.useTailwind) {
        clearCssFilePath = path.join(projectPath, 'src', 'assets', 'main.css');
        await fs.promises.writeFile(clearCssFilePath, `* {\n  margin: 0;\n  padding: 0;\n}`);
      }
      clearCssFilePath = path.join(projectPath, 'src', 'assets', 'base.css');
      fs.truncateSync(clearCssFilePath);

      const pathToComponents = path.join(projectPath, 'src', 'components');
      fs.rmSync(pathToComponents, { recursive: true, force: true });

      const pageContent = this.#createWelcomePage();
      const contentPath = path.join(projectPath, 'src/App.vue');
      await fs.promises.writeFile(contentPath, pageContent);

      console.log(chalk.greenBright(`\n🚀 ${this.projectName} is ready to roll !`));
    } catch (error) {
      console.error(chalk.red('Error creating Welcome Page:'), error.message);
    }
  }

  #createWelcomePage() {
    if (this.useTailwind) {
      return `<template>
  <div
    class="min-h-screen bg-linear-to-tr from-indigo-600 to-sky-400 text-white overflow-hidden relative flex items-center justify-center"
  >
    <Toaster position="bottom-right" />
    <div class="text-center z-10 animate-fade-in-up">
      <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg typewriter">
        🚀 Welcome to <span class="text-yellow-400">HackPack</span>
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10">
        Harness Vue's reactive brilliance—gracefully styled with pure CSS.<br/>
        ⚡Automation keeps your workflow stellar.
      </p>
      <button
        @click="() => toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
        class="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-transform transform hover:scale-105 shadow-lg"
      >
        Launch a Toast message
      </button>
      <p class="mt-12 text-sm text-pink-200">
        Start building from
        <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">src/App.vue</code>
      </p>
    </div>
    <div class="absolute inset-0 overflow-hidden">
      <svg v-for="n in 10" :key="n" class="absolute animate-ping" :style="generateParticleStyle(n)" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="white" fill-opacity="0.05" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";
function generateParticleStyle(index) {
  const size = Math.random() * 80 + 20;
  const top = Math.random() * 100;
  const left = Math.random() * 100;
  const delay = Math.random() * 5;
  return { width: \`\${size}px\`, height: \`\${size}px\`, top: \`\${top}%\`, left: \`\${left}%\`, animationDelay: \`\${delay}s\` };
}
</script>

<style scoped>
@keyframes fade-in-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-fade-in-up { animation: fade-in-up 1s ease-out both; }
@keyframes typewriter { from { width: 0; } to { width: 100%; } }
@keyframes blink { 0%, 100% { border-color: transparent; } 50% { border-color: white; } }
.typewriter { display: inline-block; overflow: hidden; border-right: 2px solid white; white-space: nowrap; width: 0; animation: typewriter 2.5s steps(10) forwards, blink 0.7s step-end infinite; }
</style>`.trim();
    } else {
      return `<template>
  <div class="container">
    <Toaster position="bottom-right" />
    <div class="content">
      <h1 class="heading typewriter">🚀 Welcome to <span class="highlight">HackPack</span></h1>
      <p class="description">
        Harness Vue's reactive brilliance—gracefully styled with pure CSS.<br />
        ⚡Automation keeps your workflow stellar.
      </p>
      <button class="toast-btn" @click="() => toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')">
        Launch a Toast message
      </button>
      <p class="hint">Start building from <code>src/App.vue</code></p>
    </div>
    <div class="particles">
      <svg v-for="n in 10" :key="n" class="particle" :style="generateParticleStyle(n)" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="white" fill-opacity="0.05" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'
function generateParticleStyle(index) {
  const size = Math.random() * 80 + 20; const top = Math.random() * 100; const left = Math.random() * 100; const delay = Math.random() * 5;
  return { width: \`\${size}px\`, height: \`\${size}px\`, top: \`\${top}%\`, left: \`\${left}%\`, animationDelay: \`\${delay}s\` }
}
</script>

<style scoped>
.container { min-height: 100vh; background: linear-gradient(to top right, #4f46e5, #38bdf8); color: white; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
.content { text-align: center; z-index: 10; animation: fade-in-up 1s ease-out both; }
.heading { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.highlight { color: #facc15; }
.description { font-size: 1.2rem; color: #e5e5e5; margin-bottom: 2rem; }
.toast-btn { background: #facc15; color: #1f2937; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: bold; border: none; cursor: pointer; transition: transform 0.2s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.4); }
.toast-btn:hover { transform: scale(1.05); background: #fde68a; }
.hint { margin-top: 3rem; font-size: 0.9rem; color: #f9a8d4; }
code { background: rgba(236,72,153,0.2); padding: 0.25rem 0.5rem; border-radius: 6px; font-family: monospace; }
@keyframes typewriter { from { width: 0; } to { width: 100%; } }
@keyframes blink { 0%, 100% { border-color: transparent; } 50% { border-color: white; } }
.typewriter { display: inline-block; overflow: hidden; border-right: 2px solid white; white-space: nowrap; width: 0; animation: typewriter 2.5s steps(12) forwards, blink 0.7s step-end infinite; }
@keyframes fade-in-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.particles { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.particle { position: absolute; animation: ping 5s infinite; }
@keyframes ping { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
</style>`;
    }
  }
}
