import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execa } from 'execa';

// Component templates
const SIGNIN_COMPONENT_TS = `import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { finalize, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  loading = false;

  constructor(public auth: AuthService, private router: Router) {}

  login() {
    if (this.loading) return;
    this.loading = true;
    // loginWithPopup returns an Observable<void>
    this.auth.loginWithPopup()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          // Wait for the SDK to report authenticated state, then navigate.
          this.auth.isAuthenticated$.pipe(
            filter(Boolean),
            take(1)
          ).subscribe(() => this.router.navigate(['/']));
        },
        error: (err) => {
          console.error('loginWithPopup failed', err);
        }
      });
  }
}`;

const SIGNIN_HTML = `<div class="signin-container">
  <button class="chip" (click)="login()">Sign In</button>
</div>`;

const SIGNUP_COMPONENT_TS = `import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { finalize, filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  loading = false;

  constructor(public auth: AuthService, private router: Router) {}

  signup() {
    if (this.loading) return;
    this.loading = true;
    this.auth.loginWithPopup({ authorizationParams: { screen_hint: 'signup' } })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.auth.isAuthenticated$.pipe(
            filter(Boolean),
            take(1)
          ).subscribe(() => this.router.navigate(['/']));
        },
        error: (err) => console.error('signup popup failed', err)
      });
  }
}`;

const SIGNUP_HTML = `<div class="signup-container">
  <button class="chip" (click)="signup()">Sign Up</button>
</div>`;

const HEADER_COMPONENT_TS = `import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { finalize, filter, take } from 'rxjs/operators';

@Component({
  selector: 'auth-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  loading = false;

  constructor(public auth: AuthService, private router: Router) {}

  login() {
    if (this.loading) return;
    this.loading = true;
    this.auth.loginWithPopup()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.auth.isAuthenticated$.pipe(
            filter(Boolean),
            take(1)
          ).subscribe(() => this.router.navigate(['/']));
        },
        error: (err) => console.error('login popup failed', err)
      });
  }

  logout() {
    this.auth.logout({ logoutParams: { returnTo: document.location.origin } });
  }
}`;

const HEADER_HTML = `<span class="clerk-chip-inline">
  <ng-container *ngIf="auth.isAuthenticated$ | async as loggedIn; else signedOut">
    <div class="chip-user">
      <img [src]="(auth.user$ | async)?.picture" [alt]="(auth.user$ | async)?.name || 'User profile'" />
    </div>
    <button class="chip" (click)="logout()">Log Out</button>
  </ng-container>
  <ng-template #signedOut>
    <button class="chip" (click)="login()">Sign In</button>
  </ng-template>
</span>`;

const HEADER_CSS = `.clerk-chip-inline {
  display: inline-flex;
  align-items: center;
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
}
.chip:hover {
  background: rgba(255,255,255,0.9);
}
.chip-user {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}
.chip-user img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`;

const AUTH_GUARD_TS = `import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, filter, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    // wait until the SDK has finished loading
    return combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$]).pipe(
      filter(([isLoading]) => isLoading === false),
      take(1),
      map(([_, isAuthenticated]) => {
        if (!isAuthenticated) {
          this.router.navigate(['/sign-in']);
          return false;
        }
        return true;
      })
    );
  }
}`;

const REDIRECT_IF_AUTH_GUARD_TS = `import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, filter, take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RedirectIfAuthenticatedGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate() {
    // wait until the SDK has finished loading to avoid redirects
    return combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$]).pipe(
      filter(([isLoading]) => isLoading === false),
      take(1),
      map(([_, isAuthenticated]) => {
        if (isAuthenticated) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}`;

const auth0Css = `/* === Auth0 Auth UI Styles === */
.signup-container,
.signin-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.clerk-chip-inline {
  display: inline-flex;
  align-items: center;
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
}

.chip:hover {
  background: rgba(255,255,255,0.9);
}

.chip-user {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.chip-user img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}`;


export async function setupAuth0Angular(state) {
  const { projectName } = state;
  const angMat = "angular-material" === state.uiLibrary;
  const daisy = "daisyui" === state.uiLibrary;
  const primeng = "primeng" === state.uiLibrary;
  console.log(chalk.blue(`Setting up Auth0 for Angular project: ${projectName}`));

  const rootDir = path.isAbsolute(projectName) ? projectName : process.cwd();

  const srcDir = path.join(rootDir, 'src');
  const appDir = path.join(srcDir, 'app');
  const componentsDir = path.join(appDir, 'components');
  const guardsDir = path.join(appDir, 'guards');
  const environmentsDir = path.join(srcDir, 'environments');

  try {
    if (!fs.existsSync(rootDir)) {
      console.log(chalk.red(`Project directory ${rootDir} does not exist`));
      return;
    }

    // Create necessary directories
    [componentsDir, guardsDir, environmentsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create Header component
    fs.writeFileSync(path.join(componentsDir, 'header.component.ts'), HEADER_COMPONENT_TS);
    fs.writeFileSync(path.join(componentsDir, 'header.component.html'), HEADER_HTML);
    fs.writeFileSync(path.join(componentsDir, 'header.component.css'), HEADER_CSS);

    // Create SignIn component
    fs.writeFileSync(path.join(componentsDir, 'sign-in.component.ts'), SIGNIN_COMPONENT_TS);
    fs.writeFileSync(path.join(componentsDir, 'sign-in.component.html'), SIGNIN_HTML);

    // Create SignUp component
    fs.writeFileSync(path.join(componentsDir, 'sign-up.component.ts'), SIGNUP_COMPONENT_TS);
    fs.writeFileSync(path.join(componentsDir, 'sign-up.component.html'), SIGNUP_HTML);

    // Create guards
    fs.writeFileSync(path.join(guardsDir, 'auth.guard.ts'), AUTH_GUARD_TS);

    fs.writeFileSync(path.join(guardsDir, 'redirect-if-authenticated.guard.ts'), REDIRECT_IF_AUTH_GUARD_TS);

    // Update environment.ts
    const environmentPath = path.join(environmentsDir, 'environment.ts');
    let envContent = `export const environment = {
  production: false,
  auth0Domain: 'your-domain-here',
  auth0ClientId: 'your-client-id-here'
};`
    fs.writeFileSync(environmentPath, envContent);

    // Update app.html
    const appHtmlPath = path.join(appDir, 'app.html');
    if (fs.existsSync(appHtmlPath)) {
      const appHtml = `<main class="relative flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 overflow-hidden
bg-[#0f0f0f]
bg-[radial-gradient(#ff4d5c22_1px,transparent_1px)]
bg-[length:20px_20px] z-0">

<!-- Angular Glow Orbs -->
<div class="absolute w-96 h-96 bg-[#dd0031] opacity-25 rounded-full blur-3xl top-1/3 left-1/5 pointer-events-none animate-[float_8s_ease-in-out_infinite]"></div>
<div class="absolute w-80 h-80 bg-[#dd0031] opacity-20 rounded-full blur-2xl top-1/4 right-1/4 pointer-events-none animate-[float_10s_ease-in-out_infinite] delay-200"></div>
<div class="absolute w-72 h-72 bg-[#dd0031] opacity-15 rounded-full blur-2xl bottom-1/4 left-1/2 pointer-events-none animate-[float_12s_ease-in-out_infinite] delay-500"></div>

<!-- Content: only show when authenticated -->
<ng-container *ngIf="auth.isAuthenticated$ | async; else showSignIn">
    <auth-button style="position: absolute; top:15px;left:15px"></auth-button>
    <div class="z-10 max-w-6xl w-full text-center">
      <h1 class="text-5xl sm:text-6xl font-extrabold mb-6 text-white drop-shadow-xl typewriter-text p-2">
        Welcome to <span class="text-[#dd0031]">HackPack</span>
      </h1>

      <p class="text-xl sm:text-lg mb-8 text-pink-100 leading-relaxed">
        Harness the power of Angular, styled with class. 💫
        <br />
        This project is wired with Angular, Tailwind CSS & HackPack
      </p>

        
   ${!angMat && !daisy && !primeng
          ? `
    <button
      class="px-4 py-2 rounded-lg bg-[#dd0031] text-white font-medium hover:bg-blue-500/30 transition"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
          : daisy
            ? `
    <button
      class="btn btn-error"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
            : primeng
              ? `
    <p-button
      label="Launch a toast notification"
      severity="danger"
      [raised]="true"
      (onClick)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    ></p-button>
  `
              : `
    <button
      matButton="tonal"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
        }

      <p class="mt-12 text-sm text-pink-200">
        Start building from
        <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">
          src/app/app.component.ts or arc/app/app.ts
        </code>
      </p>
    </div>
  </ng-container>

  <ng-template #showSignIn>
    <!-- When not authenticated, render the sign-in route (redirect is handled in App ctor) -->
     <div class="z-10 max-w-6xl w-full text-center">
      <h1 class="text-5xl sm:text-6xl font-extrabold mb-6 text-white drop-shadow-xl p-2">
        Login to <span class="text-[#dd0031]">Your App</span>
      </h1>

      <p class="text-xl sm:text-lg mb-8 text-pink-100 leading-relaxed">
        Harness the power of Angular, styled with class. 💫
        <br />
        This project is wired with Angular, Tailwind CSS & HackPack
      </p>

      
   ${!angMat && !daisy && !primeng
          ? `
    <button
      class="px-4 py-2 rounded-lg bg-[#dd0031] text-white font-medium hover:bg-blue-500/30 transition"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
          : daisy
            ? `
    <button
      class="btn btn-error"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
            : primeng
              ? `
    <p-button
      label="Launch a toast notification"
      severity="danger"
      [raised]="true"
      (onClick)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    ></p-button>
  `
              : `
    <button
      matButton="tonal"
      (click)="toast('🎉 Welcome aboard! HackPack is ready to accelerate your development journey.')"
    >
      Launch a toast notification
    </button>
  `
        }

      <p class="mt-12 text-sm text-pink-200">
        Start building from
        <code class="font-mono bg-pink-900/70 px-2 py-1 rounded">
          src/app/app.component.ts or arc/app/app.ts
        </code>
      </p>
    </div>
    <router-outlet></router-outlet>
  </ng-template>
  
</main>

<ngx-sonner-toaster position="bottom-right" />`;
      fs.writeFileSync(appHtmlPath, appHtml);
    }

    const appCssPath = path.join(appDir, 'app.css');
    if (fs.existsSync(appCssPath)) {
      const appCss = `@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.typewriter-text {
  overflow: hidden;
  border-right: 0.15em solid white;
  white-space: nowrap;
  animation: typing 3.5s steps(30, end), blink 0.75s step-end infinite;
}
`;
      fs.writeFileSync(appCssPath, appCss);
    }
    // write app.ts content to app.ts file
    const appTsPath = path.join(appDir, 'app.ts');
    if (fs.existsSync(appTsPath)) {
      const appTs = `import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
${!angMat ? `` : `import {MatButtonModule} from '@angular/material/button';`}
${primeng ? `import { ButtonModule } from 'primeng/button';` : ``}
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NgxSonnerToaster,
    ${!angMat ? `` : `MatButtonModule,`}
    ${primeng ? `ButtonModule,` : ``}
    RouterModule,
    CommonModule,
    HeaderComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly toast = toast;
  protected readonly title = signal('test1');

  constructor(public auth: AuthService, private router: Router) {
    // Wait until the SDK finishes loading, then redirect based on auth state.
    combineLatest([this.auth.isLoading$, this.auth.isAuthenticated$])
      .pipe(filter(([loading]) => !loading))
      .subscribe(([_, isAuthenticated]) => {
        const url = this.router.url || '/';
        if (!isAuthenticated && url !== '/sign-in') {
          this.router.navigate(['/sign-in']);
        } else if (isAuthenticated && url === '/sign-in') {
          this.router.navigate(['/']);
        }
      });
  }
}
`
      fs.writeFileSync(appTsPath, appTs);
    }
    // write app.routes.ts content to app.routes.ts file
    const appRoutesPath = path.join(appDir, 'app.routes.ts');
    if (fs.existsSync(appRoutesPath)) {
      const appRoutesTs = `import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in.component';
import { SignUpComponent } from './components/sign-up.component';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';

export const routes: Routes = [
  { path: 'sign-in', component: SignInComponent, canActivate: [RedirectIfAuthenticatedGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate: [RedirectIfAuthenticatedGuard] },
  { path: '**', redirectTo: '' }
]`
      fs.writeFileSync(appRoutesPath, appRoutesTs);
    }
    // write app.config.ts content to app.config.ts file
    const appConfigPath = path.join(appDir, 'app.config.ts');
    if (fs.existsSync(appConfigPath)) {
      const appConfigTs = `import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthModule } from '@auth0/auth0-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
 ${primeng ? `import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';`: ``}
export const appConfig: ApplicationConfig = {
  providers: [
  ${primeng ? ` provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura
            }
        }),`: ``}
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // configure Auth0 for the standalone bootstrapped application
    importProvidersFrom(
      AuthModule.forRoot({
        domain: environment.auth0Domain,
        clientId: environment.auth0ClientId,
        authorizationParams: {
          redirect_uri: window.location.origin
        },
        // Persist tokens across reloads using refresh tokens. Note: enable Refresh Token Rotation
        // and allow refresh tokens for your application in the Auth0 dashboard for production use.
        cacheLocation: 'localstorage',
        useRefreshTokens: true
      })
    )
  ]
};
`
      fs.writeFileSync(appConfigPath, appConfigTs);
    }
    const globalStylesPath = path.join(srcDir, 'styles.css');
    if (fs.existsSync(globalStylesPath)) {
      fs.appendFileSync(globalStylesPath, '\n' + auth0Css);
      console.log(chalk.green(`Added Auth0 styles to styles.css`));
    }

    // Install dependencies
    console.log(chalk.blue('Installing Auth0 dependencies...'));
    await execa('npm', ['install', '@auth0/auth0-angular'], { cwd: rootDir, stdio: 'inherit' });

    console.log(chalk.green.bold('\n🎉 Angular Auth0 setup completed!'));
    console.log(chalk.white('Update your Auth0 domain and clientId in src/environments/environment.ts'));
    console.log(chalk.white('Add localhost:4200 to the Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins in your Auth0 application settings.'));
    console.log(chalk.white('Protect routes using the AuthGuard and RedirectIfAuthenticatedGuard'));
    console.log(chalk.green('\nThe HeaderComponent can be used as a compact auth button in your app.'));

  } catch (err) {
    console.error(chalk.red('Error setting up Auth0 for Angular:'), err && err.message ? err.message : err);
  }
}