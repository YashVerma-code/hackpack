<script setup lang="ts">
import { SignIn } from '@clerk/vue'
</script>

<template>
  <div class="signin-container">
    <SignIn routing="path" path="/sign-in" redirectUrl="/" />
  </div>
</template>

<style scoped>
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}
</style>