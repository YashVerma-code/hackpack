<template>
  <div>
    <div
      class="min-h-screen bg-gradient-to-tr from-indigo-600 to-sky-400 text-white overflow-hidden relative flex items-center justify-center"
    >
      <div class="absolute top-4 left-4 z-20">
        <!-- <ClerkHeader /> -->
      </div>
      <Toaster position="bottom-right" />
      <ClerkLoaded>
        <router-view />
      </ClerkLoaded>
      <ClerkLoading>Loading...</ClerkLoading>
    </div>
  </div>
</template>

<script setup>
import { SignedIn, SignedOut, ClerkLoaded, ClerkLoading } from '@clerk/vue'
import ClerkHeader from './components/ClerkHeader.vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
