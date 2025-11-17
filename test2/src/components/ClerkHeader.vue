<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/vue'
</script>

<template>
  <span class="clerk-chip-inline" aria-hidden="false">
    <SignedOut>
      <SignInButton class="chip" mode= 'modal'/>
    </SignedOut>

    <SignedIn>
      <UserButton class="chip-user" afterSignOutUrl = '/sign-in' />
    </SignedIn>
  </span>
</template>

<style scoped>
.clerk-chip-inline {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  gap: 0.375rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(255,255,255,0.98);
  color: #0f172a;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(2,6,23,0.08);
  border: 1px solid rgba(15,23,42,0.06);
  cursor: pointer;
  line-height: 1;
}
.chip:focus,
.chip:active {
  transform: translateY(0.5px);
}
.chip-user {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  overflow: hidden;
}
</style>
