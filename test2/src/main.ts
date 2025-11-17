import { clerkPlugin } from '@clerk/vue';
import './assets/main.css';
import router from './router';

import { createApp } from 'vue';
import App from './App.vue';

// Type-safe environment variable
const PUBLISHABLE_KEY: string | undefined = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined. Add it to your environment variables.');
}

const app = createApp(App);
app.use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY });
app.use(router);
app.mount('#app');
