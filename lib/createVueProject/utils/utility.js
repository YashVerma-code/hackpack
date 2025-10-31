export const createWelcomePage = (
  useTailwind,
  isInspiraUi = false,
  isPrimeVue = false
) => {
  if(useTailwind){
    return `<template>
  <div
    class="min-h-screen bg-linear-to-tr from-indigo-600 to-sky-400 text-white overflow-hidden relative flex items-center justify-center"
  >
  ${
    isInspiraUi
      ? `  <AuroraBackground>
      <Motion
        as="div"
        :initial="{ opacity: 0, y: 40, filter: 'blur(10px)' }"
        :while-in-view="{
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        }"
        :transition="{
          delay: 0.3,
          duration: 0.8,
          ease: 'easeInOut',
        }"
        class="relative flex flex-col items-center justify-center gap-4 px-4"
      >`
      : ""
  }
    <Toaster position="bottom-right" />
    <div class="text-center z-10 animate-fade-in-up">
      <h1
        class="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg typewriter"
      >
        🚀 Welcome to <span class="text-yellow-400">HackPack</span>
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10">
        Harness Vue’s reactive brilliance—gracefully styled with pure CSS.<br/>
        ⚡Automation keeps your workflow stellar.
      </p>
      ${
        isPrimeVue
          ? ` <Button
        label="Launch a Toast message"
        @click="
          () =>
            toast(
              '🎉 Welcome aboard! HackPack is ready to accelerate your development journey.'
            )
        "
        class="toast-btn"
      />`
          : `<button
        @click="
          () =>
            toast(
              '🎉 Welcome aboard! HackPack is ready to accelerate your development journey.'
            )
        "
        class="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-transform transform hover:scale-105 shadow-lg"
      >
        Launch a Toast message
      </button>`
      }
      
      <p class="mt-12 text-sm text-pink-200">
      Start building from
      <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">
        src/App.vue
      </code>
    </p>
    </div>

    ${
      isInspiraUi
        ? ` </Motion>
    </AuroraBackground>`
        : ``
    }
    <!-- Animated Particles -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute w-full h-full opacity-5"></div>
      <svg
        v-for="n in 10"
        :key="n"
        class="absolute animate-ping"
        :style="generateParticleStyle(n)"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill="white" fill-opacity="0.05" />
      </svg>
    </div>
  </div>
</template>

<script setup>
${isPrimeVue ? `import Button from 'primevue/button';\n` : ``}
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";
function generateParticleStyle(index) {
  const size = Math.random() * 80 + 20;
  const top = Math.random() * 100;
  const left = Math.random() * 100;
  const delay = Math.random() * 5;
  return {
    width: \`\${size}px\`,
    height: \`\${size}px\`,
    top: \`\${top}%\`,
    left: \`\${left}%\`,
    animationDelay: \`\${delay}s\`,
  };
}
</script>

<style scoped>
@keyframes fade-in-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-fade-in-up {
  animation: fade-in-up 1s ease-out both;
}
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
@keyframes blink {
  0%,
  100% {
    border-color: transparent;
  }
  50% {
    border-color: white;
  }
}
.typewriter {
  display: inline-block;
  overflow: hidden;
  border-right: 2px solid white;
  white-space: nowrap;
  width: 0;
  animation: typewriter 2.5s steps(10) forwards, blink 0.7s step-end infinite;
}

</style>
`.trim();
  }else{
    return `<template>
  <div class="container">
    <Toaster position="bottom-right" />
    <div class="content">
      <h1 class="heading typewriter">
        🚀 Welcome to <span class="highlight">HackPack</span>
      </h1>
      <p class="description">
        Harness Vue’s reactive brilliance—gracefully styled with pure CSS.<br />
        ⚡Automation keeps your workflow stellar.
      </p>
      ${
        isPrimeVue
          ? `<Button
        label="Launch a Toast message"
        @click="
          () =>
            toast(
              '🎉 Welcome aboard! HackPack is ready to accelerate your development journey.'
            )
        "
        class="toast-btn"
      />`
          : `<button class="toast-btn" @click="() => toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')">
        Launch a Toast message
      </button>`
      }
      
      <p class="hint">
        Start building from
        <code>src/App.vue</code>
      </p>
    </div>

    <!-- Particles -->
    <div class="particles">
      <svg
        v-for="n in 10"
        :key="n"
        class="particle"
        :style="generateParticleStyle(n)"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill="white" fill-opacity="0.05" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'
${isPrimeVue ? `import Button from 'primevue/button';\n` : ``}
function generateParticleStyle(index) {
  const size = Math.random() * 80 + 20
  const top = Math.random() * 100
  const left = Math.random() * 100
  const delay = Math.random() * 5
  return {
    width: \`\${size}px\`,
    height: \`\${size}px\`,
    top: \`\${top}%\`,
    left: \`\${left}%\`,
    animationDelay: \`\${delay}s\`
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(to top right, #4f46e5, #38bdf8);
  color: white;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: sans-serif;
}

.content {
  text-align: center;
  z-index: 10;
  animation: fade-in-up 1s ease-out both;
}

.heading {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.highlight {
  color: #facc15;
}

.description {
  font-size: 1.2rem;
  color: #e5e5e5;
  margin-bottom: 2rem;
}

.toast-btn {
  background: #facc15;
  color: #1f2937;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}
.toast-btn:hover {
  transform: scale(1.05);
  background: #fde68a;
}

.hint {
  margin-top: 3rem;
  font-size: 0.9rem;
  color: #f9a8d4;
}

code {
  background: rgba(236, 72, 153, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
}

/* Typewriter effect */
@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
@keyframes blink {
  0%, 100% {
    border-color: transparent;
  }
  50% {
    border-color: white;
  }
}
.typewriter {
  display: inline-block;
  overflow: hidden;
  border-right: 2px solid white;
  white-space: nowrap;
  width: 0;
  animation: typewriter 2.5s steps(12) forwards, blink 0.7s step-end infinite;
}

/* Fade in up */
@keyframes fade-in-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.particle {
  position: absolute;
  animation: ping 5s infinite;
}
@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
`;
  }
};
export const vuetifyMainJsContent = () => {
  return `import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App).use(vuetify).mount('#app')
`.trim();
};

export const inspiraMainCSSContent = () => {
  return `@import "tailwindcss";
@import './base.css';

@import "tw-animate-css";


@custom-variant dark (&:is(.dark *));

:root {
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.141 0.005 285.823);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.141 0.005 285.823);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.274 0.006 286.033);
  --input: oklch(0.274 0.006 286.033);
  --ring: oklch(0.442 0.017 285.786);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

html {
  color-scheme: light dark;
}
html.dark {
  color-scheme: dark;
}
html.light {
  color-scheme: light;
}
`.trim();
};

export const utilContent = () => {
  return `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`.trim();
};

export function vuetifyBaseCSS(useTailwind) {
  return `/* color palette from <https://github.com/vuejs/theme> */
:root {
  --vt-c-white: #ffffff;
  --vt-c-white-soft: #f8f8f8;
  --vt-c-white-mute: #f2f2f2;

  --vt-c-black: #181818;
  --vt-c-black-soft: #222222;
  --vt-c-black-mute: #282828;

  --vt-c-indigo: #2c3e50;

  --vt-c-divider-light-1: rgba(60, 60, 60, 0.29);
  --vt-c-divider-light-2: rgba(60, 60, 60, 0.12);
  --vt-c-divider-dark-1: rgba(84, 84, 84, 0.65);
  --vt-c-divider-dark-2: rgba(84, 84, 84, 0.48);

  --vt-c-text-light-1: var(--vt-c-indigo);
  --vt-c-text-light-2: rgba(60, 60, 60, 0.66);
  --vt-c-text-dark-1: var(--vt-c-white);
  --vt-c-text-dark-2: rgba(235, 235, 235, 0.64);
}

/* semantic color variables for this project */
:root {
  --color-background: var(--vt-c-white);
  --color-background-soft: var(--vt-c-white-soft);
  --color-background-mute: var(--vt-c-white-mute);

  --color-border: var(--vt-c-divider-light-2);
  --color-border-hover: var(--vt-c-divider-light-1);

  --color-heading: var(--vt-c-text-light-1);
  --color-text: var(--vt-c-text-light-1);

  --section-gap: 160px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--vt-c-black);
    --color-background-soft: var(--vt-c-black-soft);
    --color-background-mute: var(--vt-c-black-mute);

    --color-border: var(--vt-c-divider-dark-2);
    --color-border-hover: var(--vt-c-divider-dark-1);

    --color-heading: var(--vt-c-text-dark-1);
    --color-text: var(--vt-c-text-dark-2);
  }
}
  ${
    useTailwind
      ? ``
      : `*{
  margin: 0;
  padding: 0;
}`
  }
`.trim();
}

export const primeVueMainJsContent = () => {
  return `  import './assets/main.css'

    import { createApp } from 'vue'
    import App from './App.vue'
    import PrimeVue from 'primevue/config';
    import Aura from '@primeuix/themes/aura';

    const app = createApp(App);
    app.use(PrimeVue, {
        theme: {
            preset: Aura
        }
    });
    app.mount('#app')`.trim();
};
