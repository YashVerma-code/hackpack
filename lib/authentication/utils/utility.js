export function isFrameworkSupported(framework) {
  const supportedFrameworks = ['next', 'svelte', 'vue', 'vite-react', 'astro', 'nuxt', 'angular'];
  return supportedFrameworks.includes(framework);
}

export const middlewareContent = `import { auth } from "auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isSignInPage = req.nextUrl.pathname === "/api/auth/signin";

  // If the user *is* signed in and tries to visit the built-in sign-in page,
  // bounce them to home.
  if (isSignInPage && req.auth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Apply to the built-in sign-in page only
  matcher: ["/api/auth/signin"],
};
`

export const appBarContent = `
// app/components/AppBar.tsx
import { auth } from "auth";            // <-- your Auth.js helper
import { signOut, signIn } from "auth"; // if you’ve exported these

export default async function AppBar() {   // ✅ Server Component
  const session = await auth();            // ✅ works only on the server

  return (
    <div className="p-2 bg-slate-800 flex items-center gap-4">
      <div className="text-xl font-bold text-white">My App</div>

      <div className="ml-auto flex gap-3 items-center">
        {session?.user ? (
          <>
            <p className="text-white">{session.user.name}</p>
            <form action={async () => { "use server"; await signOut(); }}>
              <button type="submit">Sign Out</button>
            </form>
          </>
        ) : (
          <form action={async () => { "use server"; await signIn("github"); }}>
            <button type="submit">Sign In2</button>
          </form>
        )}
      </div>
    </div>
  );
}
`

export const authFileContent = (language) => {
  if (language === 'ts') {
    return `
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import NextAuth, { NextAuthConfig } from "next-auth";

const credentailsConfig = CredentialsProvider({
    name: "Credentials",
    credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        // email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
    },
    async authorize(credentials) {
        if (!credentials) return null;
        const { username, password } = credentials;
        if (username === "admin" && password === "admin") {
            return { id: "1", name: "Admin" }; // id should be string ideally
        }
        return null;    
    }

})

const config = {
    providers: [Google, credentailsConfig],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config)

`
  } else {
    return `import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the 'credentials' object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        // email: { label: "Email", type: "email", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        const { username, password } = credentials;
        if (username === "admin" && password === "admin") {
            return { id: "1", name: "Admin" }; // id should be string ideally
        }
        return null;
      }
    }),
  ],
  
})`;
  }
}

// Clerk Setup utility

export const clerkUI = `
  <div class="absolute top-4 right-6 z-50">
    <SignedIn>
      <UserButton />
    </SignedIn>
    <SignedOut>
      <SignInButton>
        <button class="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
          Sign In
        </button>
      </SignInButton>
    </SignedOut>
  </div>
  `;

// Next- Clerk Setup
export const nextSignInPage = (useTailwind) => {
  if (useTailwind) {
    return `import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (

    <div className="hero min-h-screen bg-slate-800  flex justify-center">

      <div className="p-8 bg-slate-600 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>
        <SignIn />
      </div>
    </div>
  )
}`
  } else {
    return `import { SignIn } from '@clerk/nextjs'
import './signin.css' // import the CSS file

export default function Page() {
  return (
    <div className="hero">
      <div className="signin-box">
        <h1 className="signin-title">Sign In</h1>
        <SignIn />
      </div>
    </div>
  )
}
`
  }
}

export const nextSignUpPage = (useTailwind) => {
  if (useTailwind) {
    return `import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="hero min-h-screen bg-slate-800  flex justify-center">
            <div className=" bg-slate-600 rounded-xl shadow-lg p-2 w-full max-w-md flex justify-center flex-wrap">
                <h1 className="text-2xl font-bold text-white text-center w-full">Sign Up</h1>
                <SignUp />
            </div>
        </div>
    )
}`
  } else {
    return `import { SignUp } from '@clerk/nextjs'
import './signup.css' // import the CSS file

export default function Page() {
  return (
    <div className="hero">
      <div className="signup-box">
        <h1 className="signup-title">Sign Up</h1>
        <SignUp />
      </div>
    </div>
  )
}
`
  }
}

export const nextMiddleware = `
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)','/sign-up(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}`

export const nextsignInCss = `/* Full-screen centered background */
.hero {
  min-height: 100vh;
  background-color: #1e293b; /* slate-800 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Sign-in card box */
.signin-box {
  background-color: #475569; /* slate-600 */
  padding: 2rem;
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* shadow-lg */
  width: 100%;
  max-width: 28rem; /* max-w-md */
}

/* Title styling */
.signin-title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: bold;
  color: #fff;
  margin-bottom: 1.5rem; /* mb-6 */
  text-align: center;
}
`
export const nextsignUpCss = `/* Full-screen centered background */
.hero {
  min-height: 100vh;
  background-color: #1e293b; /* slate-800 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Sign-up card box */
.signup-box {
  background-color: #475569; /* slate-600 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3); /* shadow-lg */
  padding: 0.5rem; /* p-2 */
  width: 100%;
  max-width: 28rem; /* max-w-md */
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

/* Title styling */
.signup-title {
  font-size: 1.5rem; /* text-2xl */
  font-weight: bold;
  color: #fff;
  text-align: center;
  width: 100%;
  margin-bottom: 1rem;
}
`
export const newStyles = `
/* User Authentication Button Styles */
.user-auth-container {
  position: absolute;
  top: 1rem;         /* same as top-4 */
  right: 1.5rem;     /* same as right-6 */
  z-index: 50;
}

/* Button styling (inspired by Tailwind look) */
.sign-in-btn {
  padding: 0.5rem 1rem;             /* py-2 px-4 */
  background-color: #4338ca;        /* indigo-700 */
  color: white;
  border: none;
  border-radius: 0.5rem;            /* rounded-lg */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* shadow-md */
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.sign-in-btn:hover {
  background-color: #3730a3;        /* indigo-800 */
}
`;
// Define middleware content
export const AstromiddlewareContent = `import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

// Define which routes should be protected
const isProtectedRoute = createRouteMatcher([
  '/((?!api/webhook(?:/.*)?|signin(?:/.*)?|signup(?:/.*)?|_astro|assets|favicon).*)',
]);


export const onRequest = clerkMiddleware((auth, context) => {
  const { isAuthenticated } = auth();
  const pathname = context.url.pathname;

  // Redirect signed-in users away from signin/signup
  if (isAuthenticated && (pathname === '/signin' || pathname === '/signup')) {
    return context.redirect('/');
  }

  // Redirect unauthenticated users to custom /signin route
  if (!isAuthenticated && isProtectedRoute(context.request)) {
    // Instead of using redirectToSignIn(), use context.redirect()
    const redirectUrl = "/signin";
    return context.redirect(redirectUrl);
  }

  // Continue normally
  return;
});
`;

// Nuxt - signup and signin page ui 

export const SignIn = (useTailwind) => {
  if (useTailwind) {
    return (`<script setup lang="ts">
import { SignIn } from '@clerk/nuxt/components';

</script>

<template>
  <div class="min-h-screen flex flex-wrap items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="bg-white py-4 px-6 shadow rounded-lg">
        <div class="w-full p-2">
          <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <SignIn 
        path="/signin"
        routing="path"
        signUpUrl="/signup"
        />
      </div>
    </div>

</template>

<style scoped>
/* you can add further tweaks if needed */
</style>
`)
  } else {
    return `<script setup lang="ts">
import { SignIn } from '@clerk/nuxt/components';
</script>

<template>
  <div class="signin-container">
    <div class="signin-box">
      <div class="signin-header">
        <h2>Sign in to your account</h2>
      </div>
      <SignIn 
        path="/signin"
        routing="path"
        signUpUrl="/signup"
      />
    </div>
  </div>
</template>

<style scoped>
.signin-container {
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f9fafb, #cfe2ff);
  padding: 3rem 1rem;
}

.signin-box {
  background: #ffffff;
  padding: 1.5rem 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 420px;
  width: 100%;
}

.signin-header {
  text-align: center;
  margin-bottom: 1rem;
}

.signin-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

/* Optional: Add smooth animation */
.signin-box {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
`
  }
}

export const SignUp = (useTailwind) => {
  if (useTailwind) {
    return (`<script setup lang="ts">
import { SignUp } from '@clerk/nuxt/components';


</script>

<template>
  <div class="flex min-h-screen items-center justify-center   bg-gradient-to-br from-gray-50 to-blue-100">
    <div class="p-8 bg-white rounded-2xl shadow-lg w-full max-w-md text-center">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">Create your account</h1>

      <!-- Clerk Signup Form -->
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
      />
    </div>
  </div>
</template>
`)
  } else {
    return `<script setup lang="ts">
import { SignUp } from '@clerk/nuxt/components';
</script>

<template>
  <div class="signup-container">
    <div class="signup-box">
      <h1>Create your account</h1>

      <!-- Clerk Signup Form -->
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
      />
    </div>
  </div>
</template>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f9fafb, #cfe2ff);
  padding: 3rem 1rem;
}

.signup-box {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  animation: fadeIn 0.6s ease-in-out;
}

.signup-box h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* Optional fade-in animation for smooth load */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
`
  }
}

export const nuxtMiddlewareContent = `// Define the routes you want to protect with createRouteMatcher()
const isProtectedRoute = createRouteMatcher(['/'])

export default defineNuxtRouteMiddleware((to) => {
  // Use the "useAuth()" composable to access the "isSignedIn" property
  const { isSignedIn } = useAuth()

  // Protect home route if not logged in
  if (to.path === '/' && !isSignedIn.value) {
    return navigateTo('/signin')
  }

  // Prevent signed-in users from visiting signin/signup pages
  if ((to.path === '/signin' || to.path === '/signup') && isSignedIn.value) {
    return navigateTo('/')
  }
  // Check if the user is not signed in and is trying to access a protected route
  // If so, redirect them to the sign-in page
  if (!isSignedIn.value && isProtectedRoute(to)) {
      return navigateTo('/signin')
  }
})

`

// Astro - signup and signin Page ui 
export const SignInPage = (useTailwind) => {
  if (useTailwind) {
    return `---
import { SignIn } from "@clerk/astro/components";
import "../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign In - HackPack</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-slate-900">
    <div class="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </div>
  </body>
</html>
`
  } else {
    return `---
import { SignIn } from "@clerk/astro/components";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign In - HackPack</title>
    <style>
      /* Basic reset & background */
      body {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #0f172a; /* dark slate tone */
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }

      /* Sign-in container */
      .signin-container {
        background-color: #1e293b; /* slate-800 */
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 400px;
        text-align: center;
      }

      .signin-title {
        font-size: 1.75rem;
        font-weight: bold;
        color: white;
        margin-bottom: 1.5rem;
      }

      /* Clerk customization */
      .cl-card {
        background-color: transparent !important;
        box-shadow: none !important;
      }

      .cl-input {
        background-color: #334155 !important;
        color: white !important;
      }

      .cl-button {
        background-color: #2563eb !important; /* blue-600 */
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
      }

      .cl-button:hover {
        background-color: #1d4ed8 !important; /* blue-700 */
      }

      /* Smooth fade-in effect */
      .signin-container {
        animation: fadeIn 0.6s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>

  <body>
    <div class="signin-container">
      <h1 class="signin-title">Sign In</h1>
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </div>
  </body>
</html>
`
  }
}

export const SignUpPage = (useTailwind) => {
  if (useTailwind) {
    return `---
import { SignUp } from "@clerk/astro/components";
import "../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign Up - HackPack</title>
  </head>
  <body class="flex items-center justify-center min-h-screen bg-slate-900">
    <div class="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-white mb-6 text-center">Sign Up</h1>
      <SignUp path="/signup" routing="path" signInUrl="/signin" />
    </div>
  </body>
</html>
`
  } else {
    return `---
import { SignUp } from "@clerk/astro/components";
---

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sign Up - HackPack</title>
    <style>
      /* Base layout & background */
      body {
        margin: 0;
        padding: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        background-color: #0f172a; /* dark slate tone */
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }

      /* Container box */
      .signup-container {
        background-color: #1e293b; /* slate-800 */
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 400px;
        text-align: center;
        animation: fadeIn 0.6s ease-in-out;
      }

      .signup-title {
        font-size: 1.75rem;
        font-weight: bold;
        color: white;
        margin-bottom: 1.5rem;
      }

      /* Clerk styling tweaks */
      .cl-card {
        background-color: transparent !important;
        box-shadow: none !important;
      }

      .cl-input {
        background-color: #334155 !important;
        color: white !important;
      }

      .cl-button {
        background-color: #2563eb !important; /* blue-600 */
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
      }

      .cl-button:hover {
        background-color: #1d4ed8 !important; /* blue-700 */
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>

  <body>
    <div class="signup-container">
      <h1 class="signup-title">Sign Up</h1>
      <SignUp path="/signup" routing="path" signInUrl="/signin" />
    </div>
  </body>
</html>
`
  }
}

// Vite-React - Clerk component
export const mainFileContent = (language, useHeroUI) => {
  return (`import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from "sonner";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.${language === 'ts' ? 'tsx' : 'jsx'}'
import { BrowserRouter } from 'react-router-dom';
${useHeroUI ? `import { HeroUIProvider } from "@heroui/react";` : ''}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Add your Clerk Publishable Key to the .env file: VITE_CLERK_PUBLISHABLE_KEY"
  );
}
${language === 'ts'
      ? `createRoot(document.getElementById('root')!).render(`
      : `const root = document.getElementById('root');
createRoot(root).render(`}
  <StrictMode>
    <>
      <ClerkProvider publishableKey={publishableKey}>
        ${useHeroUI ? `<HeroUIProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HeroUIProvider>` : `<BrowserRouter>
          <App />
        </BrowserRouter>`}
      </ClerkProvider>
      <Toaster />
    </>
  </StrictMode>,
)
`)
};
export const appContent = `import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";
import HomePage from "./components/HomePage";
import { ProtectedRoute } from "./components/ProtectedRoute";


const App = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    </Routes>

  );
};

export default App;
`
export const HomePageComponent = (useTailwind, daisy = false, hero = false, shadcn = false) => {
  return shadcn
    ? `import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { toast } from "sonner"

function HomePage() {
  const handleClick = () => {
    toast.success("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've installed shadcn/ui with HackPack 🚀
        </span>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>

        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and shadcn/ui.
        </p>

        <Button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Click me for a toast notification
        </Button>

        <p className="mt-12 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
      <div className="absolute top-4 right-6 z-50">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default HomePage;
`
    : hero
      ? `import { Button, Divider, Chip } from "@heroui/react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { toast } from "sonner"

function HomePage() {
  const handleClick = () => {
    toast.success("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've installed HeroUI with HackPack 🚀
        </span>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>

        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and HeroUI.
        </p>

        <Button onPress={handleClick} color="primary" variant="solid">
          Click me for a toast notification
        </Button>
        <Divider className="bg-gray-700 mt-4 w-1/2 translate-x-60" />
        <div className="flex gap-2 mt-2 justify-center">
          <Chip color="primary">HeroUI</Chip>
          <Chip color="secondary">Vite</Chip>
          <Chip color="success">HackPack</Chip>
        </div>

        <p className="mt-12 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
      <div className="absolute top-4 right-6 z-50">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default HomePage;
`
      : daisy
        ? `import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { toast } from "sonner"

function HomePage() {
  const handleClick = () => {
    toast.success("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've installed Tailwind CSS with HackPack 🚀
        </span>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>

        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and Tailwind CSS.
        </p>

        <button
          onClick={handleClick}
          className="btn btn-primary"
        >
          Click me for a toast notification
        </button>

        <p className="mt-12 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
      <div className="absolute top-4 right-6 z-50">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default HomePage;
`
        : useTailwind
          ? `import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { toast } from "sonner"

function HomePage() {
  const handleClick = () => {
    toast.success("Success!", {
      description: (
        <span style={{ color: "black" }}>
          You've installed Tailwind CSS with HackPack 🚀
        </span>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">
          Welcome to <span className="text-blue-400">HackPack</span>
        </h1>

        <p className="text-lg mb-8 text-slate-300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and Tailwind CSS.
        </p>

        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Click me for a toast notification
        </button>

        <p className="mt-12 text-sm text-slate-400">
          Edit <code className="font-mono bg-slate-700 p-1 rounded">src/App.jsx</code> to get started
        </p>
      </div>
      <div className="absolute top-4 right-6 z-50">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg shadow-md">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  )
}

export default HomePage;
`
          : `
import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { toast } from "sonner";

export default function HomePage() {
  const handleClick = () => {
    toast.success("Success!", {
      description: "You've installed plain CSS HackPack 🚀",
    });
  };

  return (
    <div className="hero">
      <style>{\`
        .hero {
          min-height: 100vh;
          background: linear-gradient(to bottom, #4f46e5, #9333ea);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          color: white;
          text-align: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .hero-content {
          max-width: 600px;
          padding: 2rem;
        }
        h1 {
          font-size: 2.5rem;
          font-weight: bold;
        }
        .accent {
          color: #facc15;
        }
        p {
          margin-top: 1rem;
          line-height: 1.6;
          opacity: 0.9;
        }
        .btn {
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          margin-top: 1.5rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 1rem;
        }
        .btn:hover {
          background-color: #4338ca;
        }
        .badge-container {
          margin-top: 1.5rem;
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .badge {
          padding: 6px 10px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .primary { background-color: #6366f1; }
        .secondary { background-color: #8b5cf6; }
        .accent-badge { background-color: #facc15; color: #1f2937; }
        .divider {
          margin: 2rem auto;
          width: 80%;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.2);
        }
        .edit-note {
          font-size: 0.9rem;
          opacity: 0.7;
        }
        .auth-header {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          z-index: 50;
        }
        .signin-btn {
          background-color: #4338ca;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .signin-btn:hover {
          background-color: #3730a3;
          transform: scale(1.05);
        }
      \`}</style>

      <div className="auth-header">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="signin-btn">Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>

      <div className="hero-content">
        <h1>
          Welcome to <span className="accent">HackPack</span>
        </h1>
        <p>
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React, and plain CSS.
        </p>

        <button onClick={handleClick} className="btn">
          Click me for a toast notification
        </button>

        <div className="badge-container">
          <div className="badge primary">CSS</div>
          <div className="badge secondary">Vite</div>
          <div className="badge accent-badge">HackPack</div>
        </div>

        <div className="divider"></div>

        <p className="edit-note">
          Edit <code>src/HomePage.jsx</code> to get started
        </p>
      </div>
    </div>
  );
}
`;
};

export const ProtectedRouteContent = (language) => {
  return `// src/components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }${language === 'ts' ? ': { children: React.ReactNode }' : ''}) => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) return null; // can replace with a loader

  if (!isSignedIn) return null; // while redirecting

  return <>{children}</>;
};
`
}
export const SignInReactPage = (useTailwind) => {
  if (useTailwind) {
    return `import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Sign In</h1>
        <SignIn path="/signin" routing="path" signUpUrl="/signup" />
      </div>
    </div>
  );
};

export default SignInPage;
`;
  } else {
    return `import React from "react";
import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
    }}>
      <SignIn path="/signin" routing="path" signUpUrl="/signup" />
    </div>
  );
};

export default SignInPage;
`;
  }
};

export const SignUpReactPage = (useTailwind) => {
  if (useTailwind) {
    return `import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="p-8 bg-white rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h1>
        <SignUp path="/signup" routing="path" signInUrl="/signin" />
      </div>
    </div>
  );
};

export default SignUpPage;
`;
  } else {
    return `import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
    }}>
      <SignUp path="/signup" routing="path" signInUrl="/signin" />
    </div>
  );
};

export default SignUpPage;
`;
  }
};


export const clerkUserModel = (language) => {
  return `import mongoose${language === 'ts' ? ', { Document, Model, Schema }' : ''} from "mongoose";

${language === 'ts' ? `export interface IUser extends Document {
  clerkId: string;
  email: string;
  username?: string;
  photo: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}` : ''}

const UserSchema = new Schema${language === 'ts' ? '<IUser>' : ''}(
  {
    clerkId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel${language === 'ts' ? ': Model<IUser>' : ''} =
  mongoose.models.User ${language === 'ts' ? 'as Model<IUser>' : ''} || mongoose.model${language === 'ts' ? '<IUser>' : ''}("User", UserSchema);

export default UserModel;`;
};

export const clerkUserController = (framework, language) => {
  return `${language === 'ts' && (framework === "astro" || framework==="nuxt") ? `import type { IUser } from "../database/models/user.model";` : ``}
${(framework === "astro" || framework==="nuxt")? `import UserModel from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
`: ""}
${language === 'ts' ? `export interface ClerkUserPayload {
  id: string;
  email_addresses?: { email_address: string }[];
  username?: string;
  profile_image_url?: string;
  first_name?: string;
  last_name?: string;
}` : ``}

export async function createUser(${language === 'ts' ? 'payload: ClerkUserPayload' : 'payload'}) {
  try {
    await connectToDatabase();
    console.log("Payload:", payload);

    ${language === 'ts' ? 'const userData: Partial<IUser> = {' : 'const userData = {'}
      clerkId: payload.id,
      email: payload.email_addresses?.[0]?.email_address || "",
      username: payload.username || "",
      photo: payload.profile_image_url || "",
      firstName: payload.first_name || "",
      lastName: payload.last_name || "",
    };

    const newUser = await UserModel.create(userData);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(${language === 'ts' ? 'payload: ClerkUserPayload' : 'payload'}) {
  try {
    await connectToDatabase();

    const updatedUser = await UserModel.findOneAndUpdate(
      { clerkId: payload.id },
      {
        email: payload.email_addresses?.[0]?.email_address,
        username: payload.username,
        photo: payload.profile_image_url,
        firstName: payload.first_name,
        lastName: payload.last_name,
      },
      { new: true }
    );

    return updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(${language === 'ts' ? 'payload: Pick<ClerkUserPayload, "id">' : 'payload'}) {
  try {
    await connectToDatabase();
    await UserModel.findOneAndDelete({ clerkId: payload.id });
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}`;
};

export const clerkWebhookRoute = (framework, language) => {
  return `${language === 'ts' && (framework==="astro"||framework==="nuxt")? `import { verifyWebhook } from '@clerk/astro/webhooks';
import type { APIRoute } from 'astro';
import { createUser, deleteUser, updateUser, type ClerkUserPayload } from '../../../lib/actions/user.action';` : (framework==="astro" || framework==="nuxt")?`
import { verifyWebhook } from '@clerk/astro/webhooks';
import { createUser, deleteUser, updateUser } from '../../../lib/actions/user.action';`:''}

export const POST${language === 'ts' ? ': APIRoute' : ''} = async ({ request }) => {
  try {
    const evt = await verifyWebhook(request, {
      signingSecret: import.meta.env.CLERK_WEBHOOK_SIGNING_SECRET,
    });

    const eventType = evt.type;
    ${language === 'ts' ? 'const data = evt.data as ClerkUserPayload;' : 'const data = evt.data;'}

    switch (eventType) {
      case "user.created":
        await createUser(data);
        console.log("User created:", data);
        break;

      case "user.updated":
        await updateUser(data);
        console.log("User updated:", data);
        break;

      case "user.deleted":
        await deleteUser(data);
        console.log("User deleted:", data.id);
        break;

      default:
        console.log(\`Unhandled Clerk event type: \${eventType}\`);
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
};`;
};