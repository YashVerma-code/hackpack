<script setup>
import { SignUp } from '@clerk/vue'
</script>

<template>
  <div class="signup-container">
    <SignUp routing="path" path="/sign-up" redirectUrl="/" signInUrl='/sign-in'/>
  </div>
</template>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
}
</style>