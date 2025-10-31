<script >
import { useAuth, SignedIn, UserButton } from '@clerk/vue'
import { Button } from "../components/ui/button"
import { Toaster, toast } from "vue-sonner";
import "vue-sonner/style.css";

const { isLoaded, isSignedIn, sessionId, userId } = useAuth()
const handleClick = () => {
  toast("Success!", {
    description: "You've installed shadcn-vue with HackPack 🚀"
  })
}
</script>

<template>
  <div v-if="!isLoaded">Loading...</div>
  <div v-else-if="!isSignedIn">Sign in to view this page</div>
  <div v-else>
    <div class="user-btn">
      <SignedIn>
      <UserButton class="chip-user" afterSignOutUrl = '/sign-in' />
    </SignedIn>
    </div>
    <template>
  <main class="flex min-h-screen flex-col items-center justify-center p-24 bg-linear-to-b from-slate-900 to-slate-800">
    <div class="z-10 max-w-5xl w-full items-center justify-center text-center">
      <h1 class="text-5xl font-bold mb-6 text-white">
        Welcome to <span class="text-blue-400">HackPack</span>
      </h1>
      
      <p class="text-lg mb-8 text-slate-300">
        Build Fast, Ship Faster!🚀
        <br />
        This project is set up with Vue.js and shadcn-vue.
      </p>
      
      <Button 
        @click="handleClick"
        variant="outline"
      >
        Click me for a toast notification
      </Button>
      <p class="mt-12 text-sm text-slate-400">
        Edit <code class="font-mono bg-slate-700 p-1 rounded">src/App.vue</code> to get started
      </p>
    </div>
    
    <Toaster />
  </main>
</template>
   </div>
</template>