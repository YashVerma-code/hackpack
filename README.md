<div align="center">

# 🚀 Hackpack

<p align="center">
  <a href="https://github.com/YOUR_GITHUB_USERNAME/hackpack">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=2000&color=00FF00&center=true&vCenter=true&width=700&lines=Bootstrap+Full-Stack+Apps+Fast;One+Command.+Full+Setup.;Focus+on+Building%2C+Not+Configuring" alt="Hackpack Typing Animation">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/hackpack-cli"><img src="https://img.shields.io/npm/v/hackpack-cli?color=brightgreen&logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/hackpack-cli"><img src="https://img.shields.io/npm/dt/hackpack-cli?color=blue&logo=npm" alt="npm downloads"></a>
  <a href="https://github.com/YashVerma-code/hackpack/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License"></a>
  <a href="https://github.com/YashVerma-code/hackpack/stargazers"><img src="https://img.shields.io/github/stars/YashVerma-code/hackpack?style=social" alt="GitHub stars"></a>
</p>

<p align="center">
  <em>Tired of manually setting up full-stack projects every time? 😩<br>
  Say hello to <b>Hackpack</b> — your one-command project bootstrapper that saves hours of setup time 🎯</em>
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

## 🎯 What is Hackpack?

**Hackpack** is a powerful CLI tool that scaffolds production-ready full-stack applications in seconds. Stop wasting time on repetitive setup — let Hackpack handle your project structure, UI libraries, databases, authentication, and more with a single command.

```bash
npm i -g hackpack-cli
```

That's it. Your project is ready to go. 🎉

---

## ✨ Features

<table align="center">
<tr>
<td>

⚡ **Lightning Fast Setup**  
Generate complete projects in under 30 seconds

🧱 **Modern Frameworks**  
React, Next.js, Astro, Vue, Nuxt, Angular and Svelte.

🎨 **Pre-configured UI**  
shadcn/ui, DaisyUI, Material, Hero UI & many more.

</td>
<td>

🗄️ **Database Ready**  
MongoDB, PostgreSQL support out of the box

🔐 **Auth Integration**  
Clerk authentication pre-configured

📦 **Package Manager Agnostic**  
Works with npm, yarn, or pnpm

</td>
</tr>
</table>

<div align="center">

### 🏗️ Full Stack Support

| Frontend | Backend | Database | Auth | UI Libraries |
|:--------:|:-------:|:--------:|:----:|:------------:|
| ✅ React (Vite) | ✅ Node.js | ✅ MongoDB | ✅ Clerk | ✅ shadcn/ui |
| ✅ Next.js | ✅ Express | 🔜 PostgreSQL (beta) | 🔜 Supabase | ✅ DaisyUI |
| ✅ Astro | 🔜 Prisma | 🔜 MySQL | 🔜 Auth0 | ✅ Material UI |
| ✅ Vue | 🔜 NestJS | 🔜 SQLite | | ✅ Hero UI |
| ✅ Nuxt | 🔜 FastAPI | | | ✅ Ant Design many more |
| ✅ Angular | 🔜 Django | | | |
| ✅ Svelte 

</div>

---

## 🚀 Quick Start

### Installation

```bash

# Install globally
npm install -g hackpack

# Then run
hp
```

### Interactive Mode

Simply run the command and follow the prompts:

```bash
hp
```

The interactive wizard will guide you through:
- 📁 Project name and location
- 🎨 Framework selection (React, Next.js, Vue, etc.)
- 🗄️ Database choice (MongoDB, PostgreSQL)
- 🔐 Authentication setup
- 🎭 UI library preferences

---

## 🧰 CLI Commands

### 📜 Core Commands

| Command | Description |
|---------|-------------|
| `hp` | Launch interactive wizard (recommended for beginners) |
| `hp -h`, `hp --help` | Display help and command usage |
| `hp reset` | Clear all locally saved state and configurations |
| `hp state` | View all saved projects and highlight the active one |
| `hp resume` | Resume an interrupted or incomplete setup |
| `hp run` | Execute setup for the currently selected project |

### 🔧 Project Management

| Command | Description |
|---------|-------------|
| `hp select <project-name>` | Set a project as active for operations |
| `hp projects` | List all projects created with Hackpack |
| `hp name <new-name>` | Rename the currently active project |
| `hp add ui <library>` | Add a UI library to your project |
| `hp uninstall ui <library>` | Remove an installed UI library |
| `hp migrate` | 🔜 Migrate project to newer template versions |

### 💡 Usage Examples

```bash
# Select and run a project
hp select my-awesome-app
hp run

# Add UI libraries on the fly
hp add ui shadcn
hp add ui daisyui

# Remove unwanted libraries
hp uninstall ui tailwind

# Check your saved projects
hp projects
hp state
```

### ⚡ Autocomplete Support

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

## 🎨 Supported Stacks

### Frontend Frameworks

```
React (Vite) • Next.js • Astro • Vue • Nuxt • Angular
```

### Backend Technologies

```
Node.js • Express • Prisma • NestJS (coming soon) • FastAPI (coming soon)
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
Clerk • Supabase (coming soon) • Auth0 (coming soon)
```

## 🤝 Contributing

We love contributions! Whether it's a bug report, feature request, or pull request — all are welcome.


### Found a Bug?

Open an issue with:
- Clear description of the problem
- Mail to [varun.singh10011@gmail.com] or [yashverma221004@gmail.com]
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`]<a href="https://github.com/YashVerma-code/hackpack/blob/main/LICENSE.md">LICENSE</a> for more information.

---

## 🙏 Acknowledgments

Made with ❤️ by Yash & Varun — because setup time is coding time wasted 😜
---

<div align="center">

### 🌟 If you find Hackpack useful, give it a star!

<p>
  <a href="https://github.com/YOUR_GITHUB_USERNAME/hackpack">
    <img src="https://img.shields.io/github/stars/YashVerma-code/hackpack?style=social" alt="Star on GitHub">
  </a>
</p>

**Made with ❤️ to speed up your builds — one command at a time.**

<p>
  <!-- <a href="https://twitter.com/YOUR_TWITTER">Twitter</a> •
  <a href="https://discord.gg/YOUR_DISCORD">Discord</a> • -->
  <a href="https://github.com/YashVerma-code/hackpack/issues">Issues</a> •
  <a href="https://github.com/YashVerma-code/hackpack/discussions">Discussions</a>
</p>

</div>
