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
export const clerkMiddlewareContent = `import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}`