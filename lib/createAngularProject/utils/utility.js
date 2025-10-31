import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
export function createWelcomePageHTML(useTailwind, angMat = false, daisy = false, primeng = false) {
  if (useTailwind) {
    return `<main class="relative flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 overflow-hidden
  bg-[#0f0f0f]
  bg-[radial-gradient(#ff4d5c22_1px,transparent_1px)]
  bg-[length:20px_20px] z-0">
  
  <!-- Angular Glow Orbs -->
  <div class="absolute w-96 h-96 bg-[#dd0031] opacity-25 rounded-full blur-3xl top-1/3 left-1/5 pointer-events-none animate-[float_8s_ease-in-out_infinite]"></div>
  <div class="absolute w-80 h-80 bg-[#dd0031] opacity-20 rounded-full blur-2xl top-1/4 right-1/4 pointer-events-none animate-[float_10s_ease-in-out_infinite] delay-200"></div>
  <div class="absolute w-72 h-72 bg-[#dd0031] opacity-15 rounded-full blur-2xl bottom-1/4 left-1/2 pointer-events-none animate-[float_12s_ease-in-out_infinite] delay-500"></div>

  <!-- Content -->
  <div class="z-10 max-w-6xl w-full text-center">
    <h1 class="text-5xl sm:text-6xl font-extrabold mb-6 text-white drop-shadow-xl typewriter-text p-2">
      Welcome to <span class="text-[#dd0031]">HackPack</span>
    </h1>

    <p class="text-xl sm:text-lg mb-8 text-pink-100 leading-relaxed">
      Harness the power of Angular, styled with class. 💫
      <br />
      This project is wired with Angular, Tailwind CSS & automation.
    </p>

   ${!angMat && !daisy && !primeng
        ? `
    <button
      class="px-4 py-2 rounded-lg bg-[#dd0031] text-white font-medium hover:bg-blue-500/30 transition"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
        : daisy
          ? `
    <button
      class="btn btn-error"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
          : primeng
            ? `
    <p-button
      label="Launch a toast notification"
      severity="danger"
      [raised]="true"
      (onClick)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    ></p-button>
  `
            : `
    <button
      matButton="tonal"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
      }


    <p class="mt-12 text-sm text-pink-200">
      Start building from
      <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">
        src/app/app.component.ts or arc/app/app.ts
      </code>
    </p>
  </div>
</main>

<ngx-sonner-toaster position="bottom-right" />
`.trim();
  } else {
    return ` <main class="main-container">
  <!-- Angular Glow Orbs -->
  <div class="glow-orb orb1"></div>
  <div class="glow-orb orb2"></div>
  <div class="glow-orb orb3"></div>
  <div class="content">
    <h1 class="heading typewriter-text">
      Welcome to <span class="brand-name">HackPack</span>
    </h1>

    <p class="subtext">
      Harness the power of Angular, styled with class. 💫<br />
      This project is wired with Angular, CSS & automation.
    </p>

    <button  class="toast-button" (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')">
      Launch a toast notification
    </button>

    <p class="start-hint">
      Start building from <code class="code-snippet">src/app/app.component.ts or src/app/app.ts</code>
    </p>
  </div>
</main>
<ngx-sonner-toaster position="bottom-right" />`.trim();
  }
}

export function createWelcomePageCSS(useTailwind) {
  if (useTailwind) {
    return `@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter-text {
  overflow: hidden;
  border-right: 0.15em solid white;
  white-space: nowrap;
  animation: typing 3.5s steps(30, end), blink 0.75s step-end infinite;
}
`;
  }
  return `body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #0f0f0f;
  font-family: sans-serif;
}

.main-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
  background-color: #0f0f0f;
  background-image: radial-gradient(#ff4d5c22 1px, transparent 1px);
  background-size: 20px 20px;
  z-index: 0;
}

/* Angular Glow Orbs */
.glow-orb {
  position: absolute;
  background-color: #dd0031;
  border-radius: 9999px;
  pointer-events: none;
  animation-name: float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.orb1 {
  width: 24rem;
  height: 24rem;
  top: 33%;
  left: 20%;
  opacity: 0.25;
  filter: blur(48px);
  animation-duration: 8s;
}

.orb2 {
  width: 20rem;
  height: 20rem;
  top: 25%;
  right: 25%;
  opacity: 0.20;
  filter: blur(32px);
  animation-duration: 10s;
  animation-delay: 0.2s;
}

.orb3 {
  width: 18rem;
  height: 18rem;
  bottom: 25%;
  left: 50%;
  opacity: 0.15;
  filter: blur(32px);
  animation-duration: 12s;
  animation-delay: 0.5s;
}

@keyframes float {
  0% {
    transform: translate(0px, 0px);
  }
  50% {
    transform: translate(20px, -30px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}


.content {
  max-width: 64rem;
  width: 100%;
  text-align: center;
  z-index: 10;
}

.heading {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.brand-name {
  color: #dd0031;
}

.subtext {
  font-size: 1.25rem;
  color: #e9d5ff;
  margin-bottom: 2rem;
}

.toast-button {
  background-color: #dd0031;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toast-button:hover {
  background-color: #c3002f;
}

.start-hint {
  margin-top: 3rem;
  font-size: 0.9rem;
  color: #ddd6fe;
}

.code-snippet {
  font-family: monospace;
  background-color: #6b21a8;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter-text {
  overflow: hidden;
  border-right: 0.15em solid white;
  white-space: nowrap;
  animation: typing 3.5s steps(30, end), blink 0.75s step-end infinite;
}`.trim();
}

export async function updateAppComponent(projectPath, angMat = false,primeNg=false) {
  const filePath = path.join(projectPath, "src/app/app.ts");

  const newContent = `import { Component, signal } from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
${!angMat ? `` : `import {MatButtonModule} from '@angular/material/button';`}
${primeNg?`import { ButtonModule } from 'primeng/button';`:``}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxSonnerToaster,
${!angMat ? `` : `MatButtonModule,`}
${primeNg?`ButtonModule,`:''}
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly toast = toast;
  protected readonly title = signal('test1');
}
`;

  await fs.writeFile(filePath, newContent, "utf-8");
}
