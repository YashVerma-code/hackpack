import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupPlainCSS(projectName, languageChoice) {
  console.log(chalk.blue('Setting up plain CSS...'));
  
  try {
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });

    console.log(chalk.blue('Creating components directory...'));
    await createComponentsStructure(languageChoice);

    console.log(chalk.blue('Updating main entry file...'));
    await updateMainFile(languageChoice);

    console.log(chalk.blue('Setting up CSS...'));
    await setupCSS();

    console.log(chalk.blue('Creating a welcome page...'));
    await createWelcomePage(languageChoice);

    console.log(chalk.green('Plain CSS setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up plain CSS:'), error.message);
    console.log(chalk.yellow('You may need to set up plain CSS manually after project creation.'));
  }
  
  process.chdir('..');
}

async function createComponentsStructure(languageChoice) {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const uiDir = path.join(componentsDir, 'ui');
  
  try {
    await fs.mkdir(uiDir, { recursive: true });
  } catch (error) {
    console.log(chalk.yellow('UI components directory already exists.'));
  }

  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const toasterPath = path.join(uiDir, `toaster.${fileExt}`);
  const toasterContent = `import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      className="z-50"
    />
  )
}
`;
  await fs.writeFile(toasterPath, toasterContent, 'utf8');
}

async function updateMainFile(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  const mainFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
  
  try {
    let mainContent = await fs.readFile(mainFile, 'utf8');
    console.log(chalk.blue(`Updating main file: ${mainFile}`));
    
    if (!mainContent.includes("import { Toaster }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const toasterImport = 'import { Toaster } from "./components/ui/toaster"';
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + toasterImport + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = toasterImport + '\n' + mainContent;
      }
    }
    
    if (!mainContent.includes("<Toaster />")) {
      if (mainContent.includes("<App />")) {
        mainContent = mainContent.replace(
          "<App />",
          "<>\n    <App />\n    <Toaster />\n  </>"
        );
      } else {
        mainContent = mainContent.replace(
          /<App\s*\/>/g,
          "<>\n    <App />\n    <Toaster />\n  </>"
        );
      }
    }
    
    await fs.writeFile(mainFile, mainContent);
    console.log(chalk.green('✓ Updated main file with Toaster'));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update main file: ${error.message}`));
    console.log(chalk.yellow('You may need to manually add the Toaster to your main file.'));
  }
}

async function setupCSS() {
  try {
    const indexCSSPath = path.join(process.cwd(), 'src', 'index.css');
    const hackpackCSS = `:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: var(--foreground);
  background: linear-gradient(to bottom, #082166, #bfa391);
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}

/* HackPack Welcome Page Styles */
.welcome-btn {
  background: #1f84c2;
  color: #fff;
  border: none;
  border-radius: 0.7rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.welcome-btn:hover {
  background: #18628f;
}

.welcome-card {
  background: rgba(255,255,255,0.04);
  border-radius: 1rem;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.15);
  padding: 2.5rem 2rem;
  max-width: 36rem;
  margin: 0 auto;
  margin-top: 9rem;
  text-align: center;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 1.5rem;
}

.welcome-highlight {
  color: #31aaf5;
}

.welcome-desc {
  color: #cbd5e1;
  font-size: 1.125rem;
  margin-bottom: 2rem;
}

.welcome-edit {
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-top: 2.5rem;
}

.welcome-code {
  background: #334155;
  color: #fff;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-family: monospace;
}

.welcome-badges {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.welcome-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-badge.plain-css {
  background: rgba(49, 170, 245, 0.2);
  border-color: rgba(49, 170, 245, 0.4);
}

.welcome-badge.hackpack {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}

.welcome-badge.vite {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
}

.welcome-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 1.5rem auto;
  width: 200px;
}
`;
    await fs.writeFile(indexCSSPath, hackpackCSS);
    console.log(chalk.green('✓ Updated index.css with HackPack styles'));
    
    const appCSSPath = path.join(process.cwd(), 'src', 'App.css');
    try {
      await fs.writeFile(appCSSPath, '');
      console.log(chalk.green('✓ Cleared App.css'));
    } catch (error) {
      // App.css might not exist, that's fine
    }
  } catch (error) {
    console.log(chalk.yellow('Could not update CSS files.'));
  }
}

async function createWelcomePage(languageChoice) {
  const appFile = languageChoice === 'ts' ? 'App.tsx' : 'App.jsx';
  const appPath = path.join(process.cwd(), 'src', appFile);
  
  const appContent = languageChoice === 'ts'
    ? `import { toast } from "sonner"
import { useState } from "react"

function App() {
  const [count, setCount] = useState<number>(0)

  const handleClick = () => {
    setCount(count + 1)
    toast.success("Success!", {
      description: "You've installed plain CSS with HackPack 🚀",
    })
  }

  return (
    <main>
      <div className="welcome-card">
        <h1 className="welcome-title">
          Welcome to <span className="welcome-highlight">HackPack</span>
        </h1>
        <p className="welcome-desc">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React and plain CSS.
        </p>
        <button className="welcome-btn" onClick={handleClick}>
          Click me for a toast notification: {count}
        </button>
        
        <div className="welcome-separator"></div>
        
        <div className="welcome-badges">
          <span className="welcome-badge plain-css">Plain CSS</span>
          <span className="welcome-badge hackpack">HackPack</span>
          <span className="welcome-badge vite">Vite</span>
        </div>
        
        <p className="welcome-edit">
          Edit <span className="welcome-code">src/App.tsx</span> to get started
        </p>
      </div>
    </main>
  )
}

export default App
`
    : `import { toast } from "sonner"
import { useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    toast.success("Success!", {
      description: "You've installed plain CSS with HackPack 🚀",
    })
  }

  return (
    <main>
      <div className="welcome-card">
        <h1 className="welcome-title">
          Welcome to <span className="welcome-highlight">HackPack</span>
        </h1>
        <p className="welcome-desc">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React and plain CSS.
        </p>
        <button className="welcome-btn" onClick={handleClick}>
          Click me for a toast notification: {count}
        </button>
        
        <div className="welcome-separator"></div>
        
        <div className="welcome-badges">
          <span className="welcome-badge plain-css">Plain CSS</span>
          <span className="welcome-badge hackpack">HackPack</span>
          <span className="welcome-badge vite">Vite</span>
        </div>
        
        <p className="welcome-edit">
          Edit <span className="welcome-code">src/App.jsx</span> to get started
        </p>
      </div>
    </main>
  )
}

export default App
`;
  
  await fs.writeFile(appPath, appContent);
  console.log(chalk.green('✓ Created welcome page with plain CSS'));
}
