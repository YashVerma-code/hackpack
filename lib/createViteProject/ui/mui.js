import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupMaterialUI(projectName, languageChoice, opts = {}) {
  console.log(chalk.blue('Setting up Material UI for Vite+React...'));
  
  const originalDir = process.cwd();
  const projectPath = path.resolve(originalDir, projectName);
  
  try {
    const currentDir = process.cwd();
    const isAlreadyInProjectDir = currentDir === projectPath || 
                                  currentDir.endsWith(projectName);
    
    if (!isAlreadyInProjectDir) {
      console.log(`Changing to project directory: ${projectPath}`);
      process.chdir(projectPath);
    } else {
      console.log(`Already in project directory: ${currentDir}`);
    }

    // Step 1: Install MUI and its peer dependencies (following official docs)
    console.log(chalk.blue('Installing @mui/material, @emotion/react, @emotion/styled...'));
    await execa('npm', ['install', '@mui/material', '@emotion/react', '@emotion/styled'], { 
      stdio: 'inherit' 
    });
    
    // Step 2: Install Roboto font
    console.log(chalk.blue('Installing Roboto font...'));
    await execa('npm', ['install', '@fontsource/roboto'], { 
      stdio: 'inherit' 
    });
    
    // Step 3: Install MUI icons (optional but useful)
    console.log(chalk.blue('Installing Material Icons...'));
    await execa('npm', ['install', '@mui/icons-material'], { 
      stdio: 'inherit' 
    });
    
    // Step 4: Install sonner for toast notifications
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });

    // Step 5: Clear CSS files
    await clearCSSFiles();
    
    // Step 6: Setup MUI theme provider
    await setupMUIProvider(languageChoice);
    
    // Step 7: Create toaster component
    await createToasterComponent(languageChoice);
    
    // Step 8: Create welcome page
    await createWelcomeApp(languageChoice);
    
    // Step 9: Update main file with providers
    await updateMainFile(languageChoice);
    
    console.log(chalk.green('Material UI setup for Vite+React completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Material UI for Vite+React:'), error.message);
    console.log(chalk.yellow('You may need to set up Material UI manually after project creation.'));
  } finally {
    const currentDir = process.cwd();
    if (currentDir !== originalDir) {
      process.chdir(originalDir);
      console.log(`Returned to original directory: ${originalDir}`);
    }
  }
}

async function clearCSSFiles() {
  try {
    const appCssPath = 'src/App.css';
    try {
      await fs.writeFile(appCssPath, '', 'utf8');
      console.log(chalk.green('✓ Cleared App.css'));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not clear App.css'));
    }
    
    const indexCssPath = 'src/index.css';
    try {
      const robotoImports = `/* Roboto font imports for MUI */
@import '@fontsource/roboto/300.css';
@import '@fontsource/roboto/400.css';
@import '@fontsource/roboto/500.css';
@import '@fontsource/roboto/700.css';`;
      
      await fs.writeFile(indexCssPath, robotoImports, 'utf8');
      console.log(chalk.green('✓ Added Roboto font imports to index.css'));
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not update index.css'));
    }
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not clear CSS files'));
  }
}

async function setupMUIProvider(languageChoice) {
  console.log(chalk.blue('Setting up MUI Theme Provider...'));
  
  try {
    const providersDir = path.join(process.cwd(), 'src', 'providers');
    await fs.mkdir(providersDir, { recursive: true });
    
    const isTypeScript = languageChoice === 'ts';
    const fileExt = isTypeScript ? 'tsx' : 'jsx';
    const muiProviderPath = path.join(providersDir, `MuiProvider.${fileExt}`);
    
    const muiProviderContent = isTypeScript
      ? `import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

interface MuiProviderProps {
  children: ReactNode;
}

export function MuiProvider({ children }: MuiProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}`
      : `import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export function MuiProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}`;
    
    await fs.writeFile(muiProviderPath, muiProviderContent, 'utf8');
    console.log(chalk.green('✓ Created MUI Provider'));
  } catch (error) {
    console.error(chalk.red('Error setting up MUI Provider:'), error.message);
    throw error;
  }
}

async function createToasterComponent(languageChoice) {
  console.log(chalk.blue('Creating toaster component...'));
  
  try {
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    await fs.mkdir(componentsDir, { recursive: true });
    
    const uiComponentsDir = path.join(componentsDir, 'ui');
    await fs.mkdir(uiComponentsDir, { recursive: true });
    
    const isTypeScript = languageChoice === 'ts';
    const fileExt = isTypeScript ? 'tsx' : 'jsx';
    const toasterPath = path.join(uiComponentsDir, `toaster.${fileExt}`);
    
    const toasterContent = `import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right" 
      richColors 
      closeButton 
      className="z-50" 
    />
  );
}

export { toast };`;
    
    await fs.writeFile(toasterPath, toasterContent, 'utf8');
    console.log(chalk.green('✓ Created toaster component'));
  } catch (error) {
    console.error(chalk.red('Error creating toaster component:'), error.message);
    throw error;
  }
}

async function updateMainFile(languageChoice) {
  const isTypeScript = languageChoice === 'ts';
  const mainFile = isTypeScript ? 'src/main.tsx' : 'src/main.jsx';
  
  try {
    let mainContent = await fs.readFile(mainFile, 'utf8');
    
    if (!mainContent.includes('import { MuiProvider }')) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const muiImport = 'import { MuiProvider } from "./providers/MuiProvider";';
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + muiImport + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = muiImport + '\n' + mainContent;
      }
    }
    
    if (!mainContent.includes('import { Toaster }')) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const toasterImport = 'import { Toaster } from "./components/ui/toaster";';
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + toasterImport + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = toasterImport + '\n' + mainContent;
      }
    }
    
    if (!mainContent.includes('<MuiProvider>')) {
      mainContent = mainContent.replace(
        '<App />',
        '<MuiProvider>\n    <App />\n    <Toaster />\n  </MuiProvider>'
      );
    }
    
    await fs.writeFile(mainFile, mainContent);
    console.log(chalk.green('✓ Added MUI Provider and Toaster to main file'));
  } catch (error) {
    console.warn(chalk.yellow('Warning: Could not update main file with MUI Provider'));
  }
}

async function createWelcomeApp(languageChoice) {
  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const appPath = `src/App.${fileExt}`;
  
  const appContent = languageChoice === 'ts' ?
  `import { useState } from "react";
import { 
  Button, 
  Box, 
  Container, 
  Typography, 
  Chip, 
  Divider, 
  Stack 
} from "@mui/material";
import { toast } from "./components/ui/toaster";

export default function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Material UI with HackPack 🚀",
    });
  };
  
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(to bottom, #1976d2, #9c27b0)' }} >
      <Container maxWidth="sm" sx={{ bgcolor: '#', opacity:0.9, borderRadius: 2, boxShadow: 2, py: 6, px: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" mb={2} color="primary.secondary" sx={{opacity: 0.9}}>
          Welcome to <Box component="span" color="secondary.main">HackPack</Box>
        </Typography>
        <Typography variant="body1" mb={3} color="text.secondary">
          Build Fast, Ship Faster! 🚀<br />This project is set up with Next.js and Material UI.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={handleClick} sx={{ mb: 3 }}>
          Click me for a toast notification: {count}
        </Button>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2} mt={2}>
          <Chip label="Material UI" color="primary" />
          <Chip label="Next.js" color="secondary" />
          <Chip label="HackPack" color="success" />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="#030303">
          Edit <Box component="span" color={"#030303"} sx={{ bgcolor: 'grey.500', p: 0.5, borderRadius: 1 }}>src/app/page.tsx</Box> to get started
        </Typography>
      </Container>
    </Box>
  );
}`
  : 
  `import { useState } from "react";
import { 
  Button, 
  Box, 
  Container, 
  Typography, 
  Chip, 
  Divider, 
  Stack 
} from "@mui/material";
import { toast } from "./components/ui/toaster";

export default function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Material UI with HackPack 🚀",
    });
  };
  
  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ background: 'linear-gradient(to bottom, #1976d2, #9c27b0)' }} >
      <Container maxWidth="sm" sx={{ bgcolor: '#', opacity:0.9, borderRadius: 2, boxShadow: 2, py: 6, px: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" mb={2} color="primary.secondary" sx={{opacity: 0.9}}>
          Welcome to <Box component="span" color="secondary.main">HackPack</Box>
        </Typography>
        <Typography variant="body1" mb={3} color="text.secondary">
          Build Fast, Ship Faster! 🚀<br />This project is set up with Next.js and Material UI.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={handleClick} sx={{ mb: 3 }}>
          Click me for a toast notification: {count}
        </Button>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2} mt={2}>
          <Chip label="Material UI" color="primary" />
          <Chip label="Next.js" color="secondary" />
          <Chip label="HackPack" color="success" />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="#030303">
          Edit <Box component="span" color={"#030303"} sx={{ bgcolor: 'grey.500', p: 0.5, borderRadius: 1 }}>src/app/page.tsx</Box> to get started
        </Typography>
      </Container>
    </Box>
  );
}`;  

  try {
    await fs.writeFile(appPath, appContent, 'utf8');
    console.log(chalk.blue('Created welcome page with Material UI components.'));
  } catch (error) {
    console.error(chalk.yellow('Could not create welcome page:'), error.message);
  }
}
