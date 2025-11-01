<div align="center">

<img width="744" height="172" alt="hp-img" src="https://github.com/user-attachments/assets/6768dc69-b0c6-420d-baf6-4b2c1f87b111" />

<p align="center">
  <a href="https://github.com/YashVerma-code/hackpack">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2400&pause=1800&color=00FF00&center=true&vCenter=true&width=700&lines=Bootstrap+Full-Stack+Apps+Fast;One+Command.+Full+Setup." alt="Hackpack Typing Animation">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hackpack-cli"><img src="https://img.shields.io/npm/v/hackpack-cli?color=brightgreen&logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/hackpack-cli"><img src="https://img.shields.io/npm/dt/hackpack-cli?color=blue&logo=npm" alt="npm downloads"></a>
  <a href="https://github.com/YashVerma-code/hackpack/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License"></a>
  <a href="https://github.com/YashVerma-code/hackpack/stargazers"><img src="https://img.shields.io/github/stars/YashVerma-code/hackpack?style=social" alt="GitHub stars"></a>
</p>

<p align="center">
  <em>Tired of manually setting up full-stack projects every time? <br>
  Say hello to <b>Hackpack</b> — your all-in-one project bootstrapper that turns setup time into build time </em>
</p>

<p align="center">
  <a href="#-quick-start"><strong>Quick Start</strong></a> •
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-cli-commands"><strong>CLI Commands</strong></a> •
  <a href="#-supported-stacks"><strong>Supported Stacks</strong></a> •
  <a href="#-roadmap"><strong>Roadmap</strong></a>
</p>

</div>

---

## What is Hackpack?

**Hackpack** is a powerful CLI tool that scaffolds hackathon-ready full-stack applications in seconds. Stop wasting time on repetitive setup — let the CLI handle your project structure, UI libraries, databases, authentication, and more with a single command

```bash
npm i -g hackpack-cli
```
---

## Features

<table align="center">
<tr>
<td>
  
**Lightning-Fast Setup**  
Spin up full projects in seconds

**Modern Frameworks**  
React, Next.js, Astro, Vue, Nuxt, Angular and Svelte

**Pre-configured UI**  
shadcn/ui, DaisyUI, Material, Hero UI & many more
</td>

<td>
  
**Database Ready**  
MongoDB, PostgreSQL support out of the box

**Auth Integration**  
Clerk and more, ready to use out of the box

**Your Hackathon Superpower**  
Launch your project in seconds with a single command — skip the setup, focus on building and winning the hackathon

</td>
</tr>
</table>

<div align="center">

### Full Stack Support

<table>
  <tr>
    <th>Frontend</th>
    <th>Backend</th>
    <th>Database</th>
    <th>Auth</th>
    <th>UI Libraries</th>
  </tr>
  <tr>
    <td align="left">✅ React (Vite)</td>
    <td align="left">✅ Node.js</td>
    <td align="left">✅ MongoDB</td>
    <td align="left">✅ Clerk</td>
    <td align="left">✅ shadcn/ui</td>
  </tr>
  <tr>
    <td align="left">✅ Next.js</td>
    <td align="left">✅ Express</td>
    <td align="left">🔜 PostgreSQL (beta)</td>
    <td align="left">🔜 Supabase</td>
    <td align="left">✅ DaisyUI</td>
  </tr>
  <tr>
    <td align="left">✅ Astro</td>
    <td align="left">🔜 Prisma</td>
    <td align="left">🔜 MySQL</td>
    <td align="left">🔜 Auth0</td>
    <td align="left">✅ Material UI</td>
  </tr>
  <tr>
    <td align="left">✅ Vue</td>
    <td align="left">🔜 NestJS</td>
    <td align="left">🔜 SQLite</td>
    <td align="left"></td>
    <td align="left">✅ Hero UI</td>
  </tr>
  <tr>
    <td align="left">✅ Nuxt</td>
    <td align="left">🔜 FastAPI</td>
    <td align="left"></td>
    <td align="left"></td>
    <td align="left">✅ Ant Design & more</td>
  </tr>
  <tr>
    <td align="left">✅ Angular</td>
    <td align="left">🔜 Django</td>
    <td align="left"></td>
    <td align="left"></td>
    <td align="left"></td>
  </tr>
  <tr>
    <td align="left">✅ Svelte</td>
    <td align="left"></td>
    <td align="left"></td>
    <td align="left"></td>
    <td align="left"></td>
  </tr>
</table>

</div>


---

## Quick Start

### Installation

```bash

# Install globally
npm install -g hackpack-cli

# Then run
hp
```

### Interactive Mode

Simply run the command and follow the prompts:

```bash
hp
```

The interactive wizard will guide you through:
- Project name and location
- Framework selection (React, Next.js, Vue, etc.)
- Database choice (MongoDB, PostgreSQL)
- Authentication setup
- UI library preferences

---

## CLI Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `hp` | Launch interactive wizard (recommended for beginners) |
| `hp -h`, `hp --help` | Display help and command usage |
| `hp reset` | Clear all locally saved state and configurations |
| `hp state` | View all saved projects and highlight the active one |
| `hp resume` | Resume an interrupted or incomplete setup |
| `hp run` | Execute setup for the currently selected project |

### Project Management

| Command | Description |
|---------|-------------|
| `hp select <project-name>` | Set a project as active for operations |
| `hp projects` | List all projects created with Hackpack |
| `hp name <new-name>` | Rename the currently active project |
| `hp add ui <library>` | Add a UI library to your project |
| `hp uninstall ui <library>` | Remove an installed UI library |
| `hp migrate` | 🔜 Migrate project to newer template versions |

### Usage Examples

```bash
# Add UI libraries on the fly
hp add ui shadcn
hp add ui daisyui

# Remove unwanted libraries
hp uninstall ui tailwind

# Check your saved projects
hp projects
hp state
```

### Autocomplete Support

Speed up your workflow with terminal autocompletion:

| Command | Description |
|---------|-------------|
| `hp autocomplete install` | Show instructions for shell autocomplete (bash, zsh, fish) |
| `hp autocomplete uninstall` | Remove autocomplete configuration |

```bash
# Enable autocomplete
hp autocomplete install

# Follow the instructions for your shell
```

---

## Supported Stacks

### Frontend Frameworks

```
React (Vite) • Next.js • Astro • Vue • Nuxt • Angular • SvelteKit
```

### Backend Technologies

```
Node.js • Express • Prisma (coming soon) • NestJS (coming soon) • FastAPI (coming soon)
```

### UI Libraries

```
shadcn/ui • DaisyUI • Material UI • Hero UI • Ant Design • Angular Material and many more...
```

### Databases

```
MongoDB • PostgreSQL (beta) • MySQL (coming soon) • SQLite (coming soon)
```

### Authentication

```
Clerk • Supabase (coming soon) • Auth0 (AngularJS)
```

## Contributing

We love contributions! Whether it's a bug report, feature request, or pull request — all are welcome.

### Found a Bug?

Open an issue with:
- Clear description of the problem
- Mail to [varun.singh10011@gmail.com] or [yashverma221004@gmail.com]
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

---

## License

Distributed under the **Proprietary License**. See <a href="https://github.com/YashVerma-code/hackpack/blob/main/LICENSE.md">LICENSE</a> for more information.

---

## Acknowledgments

By TeamHackpack ( Varun & Yash ) — because setup time is coding time wasted!
<div>
