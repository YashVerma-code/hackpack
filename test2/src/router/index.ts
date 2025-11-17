import { createRouter, createWebHistory } from 'vue-router'
import { Clerk } from '@clerk/clerk-js'
import SignIn from '@/views/SignIn.vue'
import SignUp from '@/views/SignUp.vue'
import Home from '@/views/Home.vue'

const clerk = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)
void clerk.load() // pre-load Clerk before first navigation

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/sign-in',
      name: 'signin',
      component: SignIn,
    },
    {
      path: '/sign-up',
      name: 'signup',
      component: SignUp,
    },
  ],
})

router.beforeEach(async (to) => {
  await clerk.load()

  const isSignedIn = !!clerk.user

  if (to.meta.requiresAuth && !isSignedIn) {
    return {
      path: '/sign-in',
      query: { redirect: to.fullPath },
    }
  }

  if ((to.path === '/sign-in' || to.path === '/sign-up') && isSignedIn) {
    return { path: '/' }
  }
})

export default router