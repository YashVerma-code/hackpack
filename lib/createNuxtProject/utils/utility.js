export function createWelcomePageHTML(useTailwind, isTypescript, uiLibrary) {
  if (useTailwind) {
    return `<template>
  <div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 "
    style="font-family: 'Kalam', cursive;">
    <!-- Animated Background Particles -->
    <div class="absolute inset-0">
      <div v-for="particle in particles" :key="particle.id" class="absolute rounded-full bg-white animate-pulse" :style="{
        left: \`\${particle.x}%\`,
        top: \`\${particle.y}%\`,
        width: \`\${particle.size}px\`,
        height: \`\${particle.size}px\`,
        opacity: particle.opacity,
        animation: \`float \${particle.speed * 4}s infinite ease-in-out\`,
        animationDelay: \`\${particle.id * 0.1}s\`
      }" />
    </div>

    <!-- Animated Gradient Orbs -->
    <div
      class="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob">
    </div>
    <div
      class="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000">
    </div>
    <div
      class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000">
    </div>

    <!-- Main Content -->
    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

      <!-- Main Heading -->
      <h1 id="typewriter"
        class="typewriter-h1 mt-5 text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
        HACKPACK
      </h1>

      <!-- Welcome Message -->
      <div class="mb-8 space-y-4">
        <h2 class="text-2xl md:text-4xl font-bold text-white animate-fade-in-up animation-delay-500">
          Welcome to the Future
        </h2>
        <p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-1000">
          Where innovation meets possibility. Ready to transform your ideas into reality?
        </p>
      </div>

      <!-- Eye-catching Tagline -->
      <div class="mb-12 fade-up opacity-0 translate-y-8 transition-all duration-700 delay-1500">
        <p
          class="text-xl md:text-2xl font-semibold text-transparent bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text">
          ⚡ Code. Create. Conquer. ⚡
        </p>
        <p class="text-md text-purple-200 mt-2">
          "Turning caffeine into code since forever"
        </p>
      </div>
${uiLibrary === "daisyui" ? `<button @click="handleWelcomeClick"
        class="btn btn-primary btn-lg border-none text-white font-bold px-8 py-2 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 fade-up opacity-0 translate-y-8 delay-2000">

        Launch a toast notification
      </button>` : `<button @click="handleWelcomeClick"
        class="btn btn-primary btn-lg bg-gradient-to-r from-cyan-500 to-blue-600 border-none text-white font-bold px-8 py-2 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 fade-up opacity-0 translate-y-8 delay-2000">

        Launch a toast notification
      </button>`}

      <!-- Code Start Info -->
      <p class="mt-8 text-sm text-purple-200 fade-up opacity-0 translate-y-8 transition-all duration-700 delay-2500">
        Start building from
        <code class="font-mono bg-purple-700/50 px-2 py-1 rounded text-purple-100">
          app/app.vue
        </code>
      </p>

    </div>

  
  </div>
</template>
${isTypescript === "ts" ? (`<script setup lang="ts">
import { ref, onMounted } from 'vue'
const toast = useToast()

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

const particles = ref<Particle[]>([])

const generateParticles = (): void => {
  const newParticles: Particle[] = []
  for (let i = 0; i < 50; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    })
  }
  particles.value = newParticles
}

const handleWelcomeClick = (): void => {
  toast.success({ message: 'Welcome aboard! HackPack is ready to accelerate your development journey.',backgroundColor:"white"});
}

onMounted(() => {
  generateParticles()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8')
          entry.target.classList.add('opacity-100', 'translate-y-0')
        }
      })
    },
    { threshold: 0.2 }
  )

  const fadeElements = document.querySelectorAll('.fade-up')
  fadeElements.forEach((el) => observer.observe(el))
})

useHead({
  title: 'Welcome to HackPack',
  meta: [
    { name: 'description', content: 'Welcome to HackPack - Where innovation meets possibility' }
  ]
})
</script>`) : (`<script setup>
import { ref, onMounted } from 'vue'
const toast = useToast()

// Reactive state
const particles = ref([])

// Generate random particles for background animation
const generateParticles = () => {
  const newParticles = []
  for (let i = 0; i < 50; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    })
  }
  particles.value = newParticles
}

// Handle welcome button click
const handleWelcomeClick = () => {
  toast.success({ message: 'Welcome aboard! HackPack is ready to accelerate your development journey.',backgroundColor:"white"});
}

// Initialize particles and fade-up animations on component mount
onMounted(() => {
  generateParticles()

  // Initialize fade-up animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8')
          entry.target.classList.add('opacity-100', 'translate-y-0')
        }
      })
    },
    { threshold: 0.2 }
  )

  // Observe all fade-up elements
  const fadeElements = document.querySelectorAll('.fade-up')
  fadeElements.forEach((el) => observer.observe(el))
})

// Set page title and meta
useHead({
  title: 'Welcome to HackPack',
  meta: [
    { name: 'description', content: 'Welcome to HackPack - Where innovation meets possibility' }
  ]
})
</script>
`)}
<style scoped>
.typewriter-h1 {
  white-space: nowrap;
  overflow: hidden;
  animation: typing 4s steps(40, end), blink-caret 0.75s step-end infinite;
}

@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes blink-caret {

  from,
  to {
    border-color: transparent;
  }

  50% {
    border-color: #00ff88;
  }
}



@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }

  33% {
    transform: translate(30px, -50px) scale(1.1);
  }

  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

.animation-delay-500 {
  animation-delay: 0.5s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

.animation-delay-1500 {
  animation-delay: 1.5s;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-2500 {
  animation-delay: 2.5s;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out forwards;
}

.fade-up {
  transition: all 0.7s ease;
}

.glass-card {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Custom hover effects */
.btn:hover {
  box-shadow: 0 20px 25px -5px rgba(6, 182, 212, 0.4), 0 10px 10px -5px rgba(6, 182, 212, 0.04);
}
</style>`
  } else {
    return `<template>
    <div class="container">
        <!-- Animated Background Particles -->
        <div class="particles">
            <div 
                v-for="particle in particles" 
                :key="particle.id" 
                class="particle" 
                :style="{
                    left: \`\${particle.x}%\`,
                    top: \`\${particle.y}%\`,
                    width: \`\${particle.size}px\`,
                    height: \`\${particle.size}px\`,
                    opacity: particle.opacity,
                    animationDuration: \`\${particle.speed * 4}s\`,
                    animationDelay: \`\${particle.id * 0.1}s\`
                }"
            />
        </div>

        <!-- Animated Gradient Orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Main Heading -->
            <h1 ref="typewriterRef" class="typewriter-h1">HACKPACK</h1>

            <!-- Welcome Message -->
            <div class="welcome-section">
                <h2 class="welcome-title">Welcome to the Future</h2>
                <p class="welcome-description">
                    Where innovation meets possibility. Ready to transform your ideas into reality?
                </p>
            </div>

            <!-- Eye-catching Tagline -->
            <div class="tagline-section fade-up">
                <p class="tagline-main">⚡ Code. Create. Conquer. ⚡</p>
                <p class="tagline-sub">"Turning caffeine into code since forever"</p>
            </div>

            // <!-- CTA Button -->
            // <button class="cta-button fade-up" @click="handleWelcomeClick">
            //     <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            //             d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 010 6h-1m4 0h1a3 3 0 000-6h-1m-4 0V8a2 2 0 012-2h4a2 2 0 012 2v2">
            //         </path>
            //     </svg>
            //     Start Your Journey
            // </button>
             <button className="cta-button" @click="handleWelcomeClick"
              >
                Launch a toast notification
            </button>

            <!-- Code Start Info -->
            <p class="start-info fade-up">
                Start building from
                <code class="code-highlight">app/app.vue</code>
            </p>
        </div>

    </div>
</template>

${isTypescript === "js" ? (`
<script setup>
import { ref, onMounted, nextTick } from 'vue'
const toast = useToast()

// Reactive state
const particles = ref([])
const typewriterRef = ref(null)

// Generate random particles for background animation
const generateParticles = () => {
    const newParticles = []
    for (let i = 0; i < 50; i++) {
        newParticles.push({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.3,
        })
    }
    particles.value = newParticles
}

// Handle welcome button click
const handleWelcomeClick = () => {
    toast.success({ message: 'Welcome aboard! HackPack is ready to accelerate your development journey.',backgroundColor:"white"});
}

// Restart typewriter animation after completion
const restartTypewriter = () => {
    setTimeout(() => {
        if (typewriterRef.value) {
            typewriterRef.value.style.animation = 'blink-caret 0.75s step-end infinite, gradient-shift 3s ease infinite'
        }
    }, 4000)
}

// Initialize fade-up animations
const initializeFadeAnimations = () => {
    nextTick(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('opacity-0', 'translate-y-8')
                        entry.target.classList.add('opacity-100', 'translate-y-0')
                    }
                })
            },
            { threshold: 0.2 }
        )

        // Observe all fade-up elements
        const fadeElements = document.querySelectorAll('.fade-up')
        fadeElements.forEach((el) => observer.observe(el))

        // Cleanup observer when component unmounts
        onUnmounted(() => {
            observer.disconnect()
        })
    })
}

// Initialize everything on component mount
onMounted(() => {
    generateParticles()
    restartTypewriter()
    initializeFadeAnimations()
})

// Set page meta
useHead({
    title: 'Welcome to HackPack',
    meta: [
        { name: 'description', content: 'Welcome to HackPack - Where innovation meets possibility' }
    ],
    link: [
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com'
        },
        {
            rel: 'preconnect', 
            href: 'https://fonts.gstatic.com',
            crossorigin: ''
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap'
        }
    ]
})
</script>`) : (`<script setup lang="ts">
import { ref, onMounted } from 'vue'
const toast = useToast();

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

const particles = ref<Particle[]>([])

const generateParticles = (): void => {
  const newParticles: Particle[] = []
  for (let i = 0; i < 50; i++) {
    newParticles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    })
  }
  particles.value = newParticles
}

const handleWelcomeClick = (): void => {
  toast.success({ message: 'Welcome aboard! HackPack is ready to accelerate your development journey.',backgroundColor:"white"});
}

onMounted(() => {
  generateParticles()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-8')
          entry.target.classList.add('opacity-100', 'translate-y-0')
        }
      })
    },
    { threshold: 0.2 }
  )

  const fadeElements = document.querySelectorAll('.fade-up')
  fadeElements.forEach((el) => observer.observe(el))
})

useHead({
  title: 'Welcome to HackPack',
  meta: [
    { name: 'description', content: 'Welcome to HackPack - Where innovation meets possibility' }
  ]
})
</script>`)}

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
.container {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #581c87, #1e3a8a, #312e81);
    font-family: 'Kalam', cursive;
}

/* Animated Background Particles */
.particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.particle {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: float 8s infinite ease-in-out, pulse 2s infinite ease-in-out;
}

/* Animated Gradient Orbs */
.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.7;
    mix-blend-mode: multiply;
    animation: blob 7s infinite;
}

.orb-1 {
    top: 0;
    left: -100px;
    width: 300px;
    height: 300px;
    background: #d8b4fe;
}

.orb-2 {
    top: 0;
    right: -100px;
    width: 300px;
    height: 300px;
    background: #fde047;
    animation-delay: 2s;
}

.orb-3 {
    bottom: -50px;
    left: 80px;
    width: 300px;
    height: 300px;
    background: #f9a8d4;
    animation-delay: 4s;
}

/* Main Content */
.main-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
    text-align: center;
}

/* Typewriter Heading */
.typewriter-h1 {
    margin-top: 20px;
    font-size: 6rem;
    font-weight: 900;
    margin-bottom: 24px;
    background: linear-gradient(45deg, #c084fc, #f472b6, #06b6d4);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: typing 4s steps(40, end), blink-caret 0.75s step-end infinite, gradient-shift 3s ease infinite;
    white-space: nowrap;
    overflow: hidden;
    border-right: 3px solid #00ff88;
}

.welcome-section {
    margin-bottom: 32px;
}

.welcome-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 16px;
    animation: fade-in-up 1s ease-out 0.5s both;
}

.welcome-description {
    font-size: 1.25rem;
    color: #d1d5db;
    max-width: 600px;
    margin: 0 auto;
    animation: fade-in-up 1s ease-out 1s both;
}

.tagline-section {
    margin-bottom: 48px;
    opacity: 0;
    transform: translateY(32px);
    animation: fade-up 0.7s ease 1.5s both;
}

.tagline-main {
    font-size: 1.5rem;
    font-weight: 600;
    background: linear-gradient(45deg, #f472b6, #fbbf24);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 8px;
}

.tagline-sub {
    font-size: 1rem;
    color: #c4b5fd;
}

/* Button Styling */
.cta-button {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(45deg, #06b6d4, #2563eb);
    border: none;
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    padding: 16px 32px;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(32px);
    animation: fade-up 0.7s ease 2s both;
    font-family: 'Kalam', cursive;
}

.cta-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 20px 25px -5px rgba(6, 182, 212, 0.4), 0 10px 10px -5px rgba(6, 182, 212, 0.04);
}

.cta-button svg {
    width: 20px;
    height: 20px;
    margin-right: 8px;
}

.start-info {
    margin-top: 32px;
    font-size: 0.875rem;
    color: #c4b5fd;
    opacity: 0;
    transform: translateY(32px);
    animation: fade-up 0.7s ease 2.5s both;
}

.code-highlight {
    font-family: 'Courier New', monospace;
    background: rgba(139, 92, 246, 0.5);
    padding: 4px 8px;
    border-radius: 4px;
    color: #e9d5ff;
}

/* Toast Message */
.toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 50;
}

.toast-content {
    background: linear-gradient(45deg, #10b981, #059669);
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    align-items: center;
    color: white;
    min-width: 300px;
}

.toast-icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
}

.toast-title {
    font-weight: bold;
    margin-bottom: 4px;
}

.toast-message {
    font-size: 0.875rem;
    color: #d1fae5;
}

/* Toast Transitions */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* Fade-up utility classes */
.fade-up {
    opacity: 0;
    transform: translateY(32px);
    transition: all 0.7s ease;
}

.opacity-0 {
    opacity: 0;
}

.opacity-100 {
    opacity: 1;
}

.translate-y-8 {
    transform: translateY(32px);
}

.translate-y-0 {
    transform: translateY(0);
}

/* Animations */
@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}

@keyframes blink-caret {
    from, to { border-color: transparent; }
    50% { border-color: #00ff88; }
}

@keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
}

@keyframes fade-in-up {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fade-up {
    0% {
        opacity: 0;
        transform: translateY(32px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .typewriter-h1 {
        font-size: 3rem;
    }
    
    .welcome-title {
        font-size: 2rem;
    }
    
    .welcome-description {
        font-size: 1.1rem;
    }
    
    .tagline-main {
        font-size: 1.25rem;
    }
    
    .cta-button {
        padding: 12px 24px;
        font-size: 1rem;
    }
    
    .toast-content {
        min-width: 250px;
    }
}

@media (max-width: 480px) {
    .typewriter-h1 {
        font-size: 2.5rem;
    }
    
    .main-content {
        padding: 10px;
    }
}
</style>;`
  }

}

export function createWelcomeDaisy(){
return `<template>
  <div class="hero min-h-screen bg-linear-to-b from-primary to-secondary">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold text-primary-content">
          Welcome to <span class="text-accent">HackPack</span>
        </h1>
        <p class="py-6 text-primary-content">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Nuxt.js and daisyUI.
        </p>
        
        <div class="flex flex-col gap-4 items-center">
           <Toaster />
          <button 
            @click="handleClick"
            class="btn btn-primary"
          >
            Click me for a toast notification
          </button>
          
          <div class="mt-8 flex gap-4">
            <div class="badge badge-primary">daisyUI</div>
            <div class="badge badge-secondary">Nuxt.js</div>
            <div class="badge badge-accent">HackPack</div>
          </div>
        </div>
        
        <div class="divider"></div>
        
        <p class="text-sm opacity-70 text-primary-content">
          Edit <code class="bg-base-300 px-1 rounded">app/app.vue</code> to get started
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/style.css'
const handleClick = (): void => {
  toast("Success! You've installed daisyUI with HackPack 🚀")
}

useHead({
  title: 'Welcome to HackPack',
  meta: [
    { name: 'description', content: 'Build Fast, Ship Faster with Nuxt.js and daisyUI' }
  ]
})
</script>`
}
export function CSScontent() {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}`;
}

export async function exists(p) {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}
