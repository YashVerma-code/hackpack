<script setup lang="ts">
import { useAuth, SignedIn, UserButton } from '@clerk/vue'
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

const { isLoaded, isSignedIn, sessionId, userId } = useAuth();

function generateParticleStyle(index) {
  const size = Math.random() * 80 + 20;
  const top = Math.random() * 100;
  const left = Math.random() * 100;
  const delay = Math.random() * 5;

  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
  };
}
</script>

<template>
  <div v-if="!isLoaded">Loading...</div>
  <div v-else-if="!isSignedIn">Sign in to view this page</div>

  <div v-else>
    <div class="user-btn">
      <SignedIn>
        <UserButton class="chip-user" afterSignOutUrl="/sign-in" />
      </SignedIn>
    </div>

    <div class="text-center z-10 animate-fade-in-up">
      <h1
        class="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg typewriter"
      >
        🚀 Welcome to <span class="text-yellow-400">HackPack</span>
      </h1>

      <p class="text-lg sm:text-xl md:text-2xl text-gray-200 mb-10">
        Harness Vue’s reactive brilliance—gracefully styled with pure CSS.<br />
        ⚡Automation keeps your workflow stellar.
      </p>

      <button
        @click="
          () => toast(
            '🎉 Welcome aboard! HackPack is ready to accelerate your development journey.'
          )
        "
        class="btn btn-primary"
      >
        Launch a Toast message
      </button>

      <p class="mt-12 text-sm text-pink-200">
        Start building from
        <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">src/App.vue</code>
      </p>
    </div>

    <div class="absolute inset-0 overflow-hidden pointer-events-none">
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
  animation: typewriter 2.5s steps(10) forwards,
    blink 0.7s step-end infinite;
}

.user-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
}
</style>
