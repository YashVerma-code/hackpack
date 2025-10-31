
export function createWelcomePageHTML(useTailwind) {
  if (useTailwind) {
    return `---
import "../styles/global.css";
import ToastDemo from "../components/ToastDemo";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hackpack Welcome</title>
    <style>
      .stars {
        background: radial-gradient(#ffffff33 1px, transparent 1px);
        background-size: 20px 20px;
        animation: starMove 50s linear infinite;
      }

      @keyframes starMove {
        from {
          background-position: 0 0;
        }
        to {
          background-position: 1000px 1000px;
        }
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
        animation:
          typing 3.5s steps(30, end),
          blink 0.75s step-end infinite;
      }
      @keyframes float {
        0%,
        100% {
          transform: translateY(0) translateX(0);
        }
        50% {
          transform: translateY(-20px) translateX(10px);
        }
      }

      .glow-orb {
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.15);
        position: absolute;
        animation: float 6s ease-in-out infinite;
        filter: blur(8px);
      }
    </style>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const cards = document.querySelectorAll(".fade-up");
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("opacity-100", "translate-y-0");
              }
            });
          },
          { threshold: 0.2 }
        );

        cards.forEach((el) => observer.observe(el));
      });
    </script>
  </head>
  <body
    class="relative min-h-screen text-white bg-gradient-to-br from-gray-900 via-indigo-900 to-black overflow-hidden"
  >
    <!-- Animated Stars Background -->
    <div class="absolute inset-0 stars opacity-20 pointer-events-none"></div>
    <div class="glow-orb top-1/3 left-1/4"></div>
    <div class="glow-orb top-1/4 right-1/3"></div>
    <div class="glow-orb bottom-1/4 left-1/2"></div>

    <main
      class="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 space-y-10 text-center"
    >
      <!-- Typewriter Heading -->
      <h1
        class="text-4xl sm:text-6xl font-extrabold typewriter-text text-white"
      >
        🚀 Welcome to <span class="text-indigo-200">Hackpack</span>
      </h1>

      <p
        class="sm:text-xl text-lg max-w-xl fade-up opacity-0 translate-y-8 transition-all duration-700 delay-300 text-purple-100 leading-9"
      >
        Unleash Astro&apos;s cosmic performance—elegantly styled with Tailwind.💫<br
        />
        React drives the interactivity, automation powers your workflow.
      </p>

      <ToastDemo client:load />
      <p class="mt-5 text-sm text-purple-200">
        Start building from{" "}
        <code class="font-mono bg-purple-700 px-2 py-1 rounded">
          src/pages/index.astro
        </code>
      </p>
    </main>
  </body>
</html>
`.trim();
  } else {
    return `---
// import "../styles/global.css";
import ToastDemo from "../components/ToastDemo";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hackpack Welcome</title>
    <style>
      body {
        position: relative;
        min-height: 100vh;
        margin: 0;
        font-family: sans-serif;
        background: linear-gradient(to bottom right, #1a202c, #312e81, #000);
        color: white;
        overflow: hidden;
        text-align: center;
        padding: 0;
      }

      .stars {
        position: absolute;
        inset: 0;
        background: radial-gradient(#ffffff33 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.2;
        animation: starMove 50s linear infinite;
        pointer-events: none;
        z-index: 0;
      }

      @keyframes starMove {
        from {
          background-position: 0 0;
        }
        to {
          background-position: 1000px 1000px;
        }
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
        font-size: 2.5rem;
        font-weight: 800;
        white-space: nowrap;
        overflow: hidden;
        border-right: 0.15em solid white;
        animation:
          typing 3.5s steps(30, end),
          blink 0.75s step-end infinite;
      }

      .highlight {
        color: #c7d2fe;
      }

      .main-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        
      }

      .fade-up {
        opacity: 0;
        transform: translateY(2rem);
        transition: all 0.7s ease 0.3s;
        max-width: 40rem;
        font-size: 1.125rem;
        line-height: 1.75rem;
        color: #e9d5ff;
      }

      .glow-orb {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        background-color: rgba(255, 255, 255, 0.15);
        filter: blur(8px);
        animation: float 6s ease-in-out infinite;
        z-index: 1;
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0) translateX(0);
        }
        50% {
          transform: translateY(-20px) translateX(10px);
        }
      }

      .code-block {
        margin-top: 1.25rem;
        font-size: 0.875rem;
        color: #ddd6fe;
      }

      .code-inline {
        font-family: monospace;
        background-color: #6b21a8;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
      }

      @media (min-width: 640px) {
        .typewriter-text {
          font-size: 3.75rem;
        }

        .fade-up {
          font-size: 1.25rem;
        }
      }
    </style>

    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const cards = document.querySelectorAll(".fade-up");
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("show");
              }
            });
          },
          { threshold: 0.2 }
        );

        cards.forEach((el) => observer.observe(el));
      });
    </script>
    <style>
      .fade-up.show {
        opacity: 1;
        transform: translateY(0);
      }
    </style>
  </head>

  <body>
    <!-- Animated Stars Background -->
    <div class="stars"></div>
    <div class="glow-orb" style="top: 33%; left: 25%;"></div>
    <div class="glow-orb" style="top: 25%; right: 33%;"></div>
    <div class="glow-orb" style="bottom: 25%; left: 50%;"></div>

    <main class="main-content">
      <!-- Typewriter Heading -->
      <h1 class="typewriter-text">
        🚀 Welcome to <span class="highlight">Hackpack</span>
      </h1>

      <p class="fade-up">
        Unleash Astro's cosmic performance—elegantly styled with pure CSS. 💫<br />
        React drives the interactivity, automation powers your workflow.
      </p>

      <ToastDemo client:load />

      <p class="code-block">
        Start building from
        <code class="code-inline">src/pages/index.astro</code>
      </p>
    </main>
  </body>
</html>
`.trim();
  }
}

export function createToastMessage(useTailwind,notShadcn=true,daisy=false) {
  if (useTailwind) {
    return `import { Toaster, toast } from "sonner";
  import React from "react";
  ${notShadcn?'':`import { Button } from "./ui/button";`}
  
  
  export default function ToastDemo() {
    return (
      <>
        <Toaster richColors position="bottom-right" />
        <${notShadcn?'b':'B'}utton
        ${daisy?`className="btn"`:(notShadcn?`className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 m-5"`:``)}
          onClick={() => toast.success("🎉 Welcome aboard! HackPack is ready to accelerate your development journey.")}
        >
          Launch a toast notification
        </${notShadcn?'b':'B'}utton>
      </>
    );
  }
  `.trim();
  } else {
    return `import React from "react";
import { Toaster, toast } from "sonner";
import "../styles/toast.css"; // plain CSS file for styles

export default function ToastDemo() {
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <button
        className="custom-toast-button"
        onClick={() =>
          toast.success(
            "🎉 Welcome aboard! HackPack is ready to accelerate your development journey."
          )
        }
      >
        Launch a toast notification
      </button>
    </>
  );
}
`.trim();
  }
}

export function toastStyle() {
  return `.custom-toast-button {
  background-color: #2563eb; /* blue-600 */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  margin: 1.25rem;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.custom-toast-button:hover {
  background-color: #1d4ed8; /* blue-700 */
}
`.trim();
}


// // For clerk 
// import fs from "fs";
// import path from "path";

// const filePath = path.resolve("astro.config.mjs");

// // Read the file
// let content = fs.readFileSync(filePath, "utf-8");

// // Add missing imports
// if (!content.includes("import node from '@astrojs/node'")) {
//   content =
//     `import node from '@astrojs/node'\n` + content;
// }

// if (!content.includes("import clerk from '@clerk/astro'")) {
//   content =
//     `import clerk from '@clerk/astro'\n` + content;
// }

// // Add integration + adapter if not present
// if (!content.includes("integrations: [react(), clerk()]")) {
//   content = content.replace(
//     /integrations:\s*\[react\(\)\]/,
//     "integrations: [react(), clerk()]"
//   );
// }

// if (!content.includes("adapter: node({ mode: 'standalone' })")) {
//   content = content.replace(
//     /export default defineConfig\(\{([\s\S]*?)\}\);/,
//     `export default defineConfig({$1
//   adapter: node({ mode: 'standalone' }),
//   output: 'server',
// });`
//   );
// }

// // Write back updated file
// fs.writeFileSync(filePath, content, "utf-8");

// console.log("✅ astro.config.mjs updated successfully!");
