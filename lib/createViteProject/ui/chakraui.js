import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupChakraUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Chakra UI...'));
  try {
    console.log(chalk.blue('Installing Chakra UI and its dependencies...'));
    await execa('npm', ['install', '@chakra-ui/react', '@emotion/react'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Installing vite-tsconfig-paths...'));
    await execa('npm', ['install', '-D', 'vite-tsconfig-paths'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    console.log(chalk.blue('Updating Vite configuration...'));
    await updateViteConfig(languageChoice);
    
    console.log(chalk.blue('Updating configuration for path aliases...'));
    await updatePathConfig(languageChoice);
    
    console.log(chalk.blue('Creating Chakra UI provider...'));
    await createProvider(languageChoice);
    
    console.log(chalk.blue('Creating components directory...'));
    await createComponentsStructure(languageChoice);
    
    console.log(chalk.blue('Updating main entry file...'));
    await updateMainFile(languageChoice);
    
    console.log(chalk.blue('Setting up CSS...'));
    await setupCSS();
    
    console.log(chalk.blue('Creating a welcome page...'));
    await createWelcomePage(languageChoice);
    
    console.log(chalk.green('Chakra UI setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Chakra UI:'), error.message);
    console.log(chalk.yellow('You may need to set up Chakra UI manually after project creation.'));
  }
  
  process.chdir('..');
}

async function updateViteConfig(languageChoice) {
  const configFile = languageChoice === 'ts' ? 'vite.config.ts' : 'vite.config.js';
  const configPath = path.join(process.cwd(), configFile);
  
  try {
    let configContent = await fs.readFile(configPath, 'utf8');
    
    if (!configContent.includes('vite-tsconfig-paths')) {
      configContent = configContent.replace(
        "import { defineConfig } from 'vite'",
        "import { defineConfig } from 'vite'\nimport tsconfigPaths from 'vite-tsconfig-paths'"
      );
      
      configContent = configContent.replace(
        'plugins: [react()]',
        'plugins: [react(), tsconfigPaths()]'
      );
      
      await fs.writeFile(configPath, configContent);
    }
  } catch (error) {
    console.log(chalk.yellow('Could not update Vite config. You may need to configure it manually.'));
  }
}

async function updatePathConfig(languageChoice) {
  if (languageChoice === 'ts') {
    await updateTsConfig();
    await updateTsAppConfig();
  } else {
    await updateJsConfig();
  }
}

async function updateTsConfig() {
  try {
    const tsconfigPath = 'tsconfig.json';
    
    let tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
    
    tsconfigContent = tsconfigContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const tsconfig = JSON.parse(tsconfigContent);
    
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    tsconfig.compilerOptions.baseUrl = ".";
    tsconfig.compilerOptions.paths = {
      "@/*": ["./src/*"]
    };
    
    await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    console.log(chalk.green('✓ Updated tsconfig.json with path aliases'));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update tsconfig.json: ${error.message}`));
  }
}

async function updateTsAppConfig() {
  try {
    const tsconfigAppPath = 'tsconfig.app.json';
    
    try {
      await fs.access(tsconfigAppPath);
    } catch {
      console.warn(chalk.yellow('tsconfig.app.json not found, skipping...'));
      return;
    }
    
    let tsconfigAppContent = await fs.readFile(tsconfigAppPath, 'utf8');
    
    tsconfigAppContent = tsconfigAppContent
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '') // Remove // comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    const tsconfigApp = JSON.parse(tsconfigAppContent);
    
    if (!tsconfigApp.compilerOptions) {
      tsconfigApp.compilerOptions = {};
    }
    
    tsconfigApp.compilerOptions.baseUrl = ".";
    tsconfigApp.compilerOptions.paths = {
      "@/*": ["./src/*"]
    };
    
    await fs.writeFile(tsconfigAppPath, JSON.stringify(tsconfigApp, null, 2));
    console.log(chalk.green('✓ Updated tsconfig.app.json with path aliases'));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update tsconfig.app.json: ${error.message}`));
  }
}

async function updateJsConfig() {
  try {
    const jsconfigPath = 'jsconfig.json';
    
    const jsConfig = {
      compilerOptions: {
        target: "ESNext",
        module: "ESNext",
        moduleResolution: "Bundler",
        skipLibCheck: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./src/*"]
        }
      }
    };
    
    await fs.writeFile(jsconfigPath, JSON.stringify(jsConfig, null, 2));
    console.log(chalk.green('✓ Created jsconfig.json with path aliases'));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not create jsconfig.json: ${error.message}`));
  }
}

async function createProvider(languageChoice) {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const uiDir = path.join(componentsDir, 'ui');
  
  try {
    await fs.mkdir(uiDir, { recursive: true });
  } catch (error) {
    console.log(chalk.yellow('Components directory already exists.'));
  }
  
  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const providerPath = path.join(uiDir, `provider.${fileExt}`);
  
  const providerContent = languageChoice === 'ts' 
    ? `import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface ProviderProps {
  children: ReactNode
}

export function Provider({ children }: ProviderProps) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
}` 
    : `import { ChakraProvider, defaultSystem } from '@chakra-ui/react'

export function Provider({ children }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
}`;

  await fs.writeFile(providerPath, providerContent, 'utf8');
}

async function createComponentsStructure(languageChoice) {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const uiDir = path.join(componentsDir, 'ui');
  
  try {
    await fs.mkdir(uiDir, { recursive: true });
  } catch (error) {
    console.log(chalk.yellow('UI components directory already exists.'));
  }

  // Create a toast component wrapper for sonner
  const fileExt = languageChoice === 'ts' ? 'tsx' : 'jsx';
  const toasterPath = path.join(uiDir, `toaster.${fileExt}`);
  const toasterContent = languageChoice === 'ts'
    ? `import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    />
  )
}
`
    : `import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
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
    
    if (!mainContent.includes("import { Provider }") && !mainContent.includes("import { Toaster }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
      
      while ((match = importRegex.exec(mainContent)) !== null) {
        lastImportIndex = match.index + match[0].length;
      }
      
      const newImports = 'import { Provider } from "@/components/ui/provider"\nimport { Toaster } from "@/components/ui/toaster"';
      
      if (lastImportIndex > 0) {
        mainContent = 
          mainContent.substring(0, lastImportIndex) + 
          '\n' + newImports + 
          mainContent.substring(lastImportIndex);
      } else {
        mainContent = newImports + '\n' + mainContent;
      }
    } else {
      if (!mainContent.includes("import { Provider }")) {
        const importRegex = /^import .+?;/gm;
        let match;
        let lastImportIndex = 0;
        
        while ((match = importRegex.exec(mainContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        
        const providerImport = 'import { Provider } from "@/components/ui/provider"';
        
        if (lastImportIndex > 0) {
          mainContent = 
            mainContent.substring(0, lastImportIndex) + 
            '\n' + providerImport + 
            mainContent.substring(lastImportIndex);
        } else {
          mainContent = providerImport + '\n' + mainContent;
        }
      }
      
      if (!mainContent.includes("import { Toaster }")) {
        const importRegex = /^import .+?;/gm;
        let match;
        let lastImportIndex = 0;
        
        while ((match = importRegex.exec(mainContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        
        const toasterImport = 'import { Toaster } from "@/components/ui/toaster"';
        
        if (lastImportIndex > 0) {
          mainContent = 
            mainContent.substring(0, lastImportIndex) + 
            '\n' + toasterImport + 
            mainContent.substring(lastImportIndex);
        } else {
          mainContent = toasterImport + '\n' + mainContent;
        }
      }
    }
    
    if (!mainContent.includes("<Provider>")) {
      if (mainContent.includes("<App />")) {
        mainContent = mainContent.replace(
          "<App />",
          "<Provider>\n      <App />\n      <Toaster />\n    </Provider>"
        );
      } else {
        mainContent = mainContent.replace(
          /<App\s*\/>/g,
          "<Provider>\n      <App />\n      <Toaster />\n    </Provider>"
        );
      }
    }
    
    await fs.writeFile(mainFile, mainContent);
    console.log(chalk.green('✓ Updated main file with Provider and Toaster'));
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not update main file: ${error.message}`));
    console.log(chalk.yellow('You may need to manually add the Provider and Toaster to your main file.'));
  }
}

async function setupCSS() {
  try {
    const indexCSSPath = path.join(process.cwd(), 'src', 'index.css');
    const minimalCSS = `/* Minimal CSS reset for Chakra UI */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`;
    await fs.writeFile(indexCSSPath, minimalCSS);
    
    const appCSSPath = path.join(process.cwd(), 'src', 'App.css');
    try {
      await fs.writeFile(appCSSPath, '');
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
    ? `import { Box, Button, Container, Heading, Text, Code, Badge, Separator, Flex } from "@chakra-ui/react"
import { useState } from "react"
import { toast } from "sonner"

function App() {
  const [count, setCount] = useState<number>(0)

  const handleClick = () => {
    setCount(count + 1)
    toast.success("Success!", {
      description: "You've installed Chakra UI with HackPack 🚀",
    })
  }

  return (
    <Box as="main" minH="100vh" bgGradient="to-b" gradientFrom="blue.900" gradientTo="teal.700" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl" rounded="lg" h={400} textAlign="center" boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)">
        <Heading as="h1" fontSize="5xl" fontWeight="bold" mb={6} color="white">
          Welcome to <Text as="span" color="teal.300">HackPack</Text>
        </Heading>

        <Text fontSize="xl" mb={8} color="gray.300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React and Chakra UI.
        </Text>

        <Button 
          onClick={handleClick} 
          bg="teal.700"
          px={8}
          py={6}
          _hover={{ bg: "teal.600" }}
          rounded="lg"
          mb={4}
          color="white"
          fontWeight="semibold"
        >
          Click me for a toast notification: {count}
        </Button>
        
        <Separator my={6} borderColor="gray.600" mx="auto" width="500px" />
        
        <Flex justifyContent="center" flexWrap="wrap" gap={2} mb={4}>
          <Badge colorPalette="teal" fontSize="1em" px={3} py={1} borderRadius="full">
            Chakra UI
          </Badge>
          <Badge colorPalette="red" fontSize="1em" px={3} py={1} borderRadius="full">
            HackPack
          </Badge>
          <Badge colorPalette="blue" fontSize="1em" px={3} py={1} borderRadius="full">
            Vite
          </Badge>
        </Flex>
        <Text mt={2} fontSize="sm" color="gray.400">
          Edit <Code p={1} borderRadius="md" bg="gray.700" color="gray.200">src/App.tsx</Code> to get started
        </Text>
      </Container>
    </Box>
  )
}

export default App
`
    : `import { Box, Button, Container, Heading, Text, Code, Badge, Separator, Flex } from "@chakra-ui/react"
import { useState } from "react"
import { toast } from "sonner"

function App() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    toast.success("Success!", {
      description: "You've installed Chakra UI with HackPack 🚀",
    })
  }

  return (
    <Box as="main" minH="100vh" bgGradient="to-b" gradientFrom="blue.900" gradientTo="teal.700" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl" rounded="lg" h={400} textAlign="center" boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)">
        <Heading as="h1" fontSize="5xl" fontWeight="bold" mb={6} color="white">
          Welcome to <Text as="span" color="teal.300">HackPack</Text>
        </Heading>

        <Text fontSize="xl" mb={8} color="gray.300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Vite, React and Chakra UI.
        </Text>

        <Button 
          onClick={handleClick} 
          bg="teal.700"
          px={8}
          py={6}
          _hover={{ bg: "teal.600" }}
          rounded="lg"
          mb={4}
          color="white"
          fontWeight="semibold"
        >
          Click me for a toast notification: {count}
        </Button>
        
        <Separator my={6} borderColor="gray.600" mx="auto" width="500px" />
        
        <Flex justifyContent="center" flexWrap="wrap" gap={2} mb={4}>
          <Badge colorPalette="teal" fontSize="1em" px={3} py={1} borderRadius="full">
            Chakra UI
          </Badge>
          <Badge colorPalette="red" fontSize="1em" px={3} py={1} borderRadius="full">
            HackPack
          </Badge>
          <Badge colorPalette="blue" fontSize="1em" px={3} py={1} borderRadius="full">
            Vite
          </Badge>
        </Flex>
        <Text mt={2} fontSize="sm" color="gray.400">
          Edit <Code p={1} borderRadius="md" bg="gray.700" color="gray.200">src/App.jsx</Code> to get started
        </Text>
      </Container>
    </Box>
  )
}

export default App
`;
  
  await fs.writeFile(appPath, appContent);
}
