import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function setupChakraUI(projectName, languageChoice) {
  console.log(chalk.blue('Setting up Chakra UI...'));
  
  // Change to project directory
  process.chdir(projectName);
  
  try {
    // Install Chakra UI and its dependencies
    console.log(chalk.blue('Installing Chakra UI and its dependencies...'));
    await execa('npm', ['install', '@chakra-ui/next-js', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'], { 
      stdio: 'inherit' 
    });
    
    // Install sonner for toast notifications (for consistency with other UI libraries)
    console.log(chalk.blue('Installing toast component...'));
    await execa('npm', ['install', 'sonner'], { 
      stdio: 'inherit' 
    });
    
    // Create the provider files
    console.log(chalk.blue('Creating Chakra UI providers...'));
    
    // Create the providers directory
    const providersDir = path.join(process.cwd(), 'src', 'app', 'providers');
    try {
      await fs.mkdir(providersDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Providers directory already exists or could not be created.'));
    }
    
    // Create the Chakra provider component
    const fileExt = languageChoice === 'ts' ? 'tsx' : 'js';
    const chakraProviderPath = path.join(providersDir, `ChakraProvider.${fileExt}`);
    
    const chakraProviderContent = languageChoice === 'ts' 
      ? `'use client'

import { ChakraProvider as BaseChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function ChakraProvider({ children }: { children: ReactNode }) {
  return <BaseChakraProvider value={defaultSystem}>{children}</BaseChakraProvider>
}` 
      : `'use client'

import { ChakraProvider as BaseChakraProvider, defaultSystem } from '@chakra-ui/react'

export function ChakraProvider({ children }) {
  return <BaseChakraProvider value={defaultSystem}>{children}</BaseChakraProvider>
}`;

    await fs.writeFile(chakraProviderPath, chakraProviderContent, 'utf8');
    
    // Create a component for the toast integration (similar to shadcn approach)
    const componentsDir = path.join(process.cwd(), 'src', 'components');
    try {
      await fs.mkdir(componentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: Components directory already exists.'));
    }
    
    const uiComponentsDir = path.join(componentsDir, 'ui');
    try {
      await fs.mkdir(uiComponentsDir, { recursive: true });
    } catch (error) {
      console.log(chalk.yellow('Note: UI components directory already exists.'));
    }

    // Create a toast component wrapper for sonner
    const toasterPath = path.join(uiComponentsDir, `toaster.${fileExt}`);
    const toasterContent = languageChoice === 'ts'
      ? `'use client'

import { Toaster as SonnerToaster } from 'sonner'

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
      : `'use client'

import { Toaster as SonnerToaster } from 'sonner'

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
    
    // Create a layout file with the providers
    console.log(chalk.blue('Updating layout file with Chakra UI providers...'));
    const layoutPath = path.join(process.cwd(), 'src', 'app', `layout.${fileExt}`);
    
    try {
      const layoutContent = await fs.readFile(layoutPath, 'utf8');
      let updatedLayoutContent = addChakraProviderToLayout(layoutContent, fileExt);
      
      // Add toaster to layout
      updatedLayoutContent = addToasterToLayout(updatedLayoutContent, fileExt);
      
      // Then update the page title
      updatedLayoutContent = updatePageTitle(updatedLayoutContent);
      
      await fs.writeFile(layoutPath, updatedLayoutContent);
    } catch (error) {
      console.error(chalk.red('Error updating layout file:'), error.message);
    }
    
    // Create a welcome page
    console.log(chalk.blue('Creating a welcome page...'));
    const pagePath = path.join(process.cwd(), 'src', 'app', `page.${fileExt}`);
    const pageContent = createWelcomePage(fileExt);
    await fs.writeFile(pagePath, pageContent);
    
    console.log(chalk.green('Chakra UI setup completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error setting up Chakra UI:'), error.message);
    console.log(chalk.yellow('You may need to set up Chakra UI manually after project creation.'));
  }
  
  process.chdir('..');
}

function addChakraProviderToLayout(layoutContent, fileExt) {
  // Add the ChakraProvider import
  if (!layoutContent.includes("import { ChakraProvider }")) {
    const importRegex = /^import .+?;/gm;
    let match;
    let lastImportIndex = 0;
    
    // Find the position of the last import
    while ((match = importRegex.exec(layoutContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const chakraImport = 'import { ChakraProvider } from "@/app/providers/ChakraProvider";';
    
    if (lastImportIndex > 0) {
      layoutContent = 
        layoutContent.substring(0, lastImportIndex) + 
        '\n' + chakraImport + 
        layoutContent.substring(lastImportIndex);
    } else {
      layoutContent = chakraImport + '\n' + layoutContent;
    }
  }
  
  if (!layoutContent.includes("<ChakraProvider>")) {
    if (layoutContent.includes("{children}")) {
      // Find where children are rendered and wrap with ChakraProvider
      layoutContent = layoutContent.replace(
        "{children}",
        "<ChakraProvider>{children}</ChakraProvider>"
      );
    }
  }
  
  return layoutContent;
}

function addToasterToLayout(layoutContent, fileExt) {
  if (!layoutContent.includes("import { Toaster }")) {
    const importRegex = /^import .+?;/gm;
    let match;
    let lastImportIndex = 0;
    
    // Find the position of the last import
    while ((match = importRegex.exec(layoutContent)) !== null) {
      lastImportIndex = match.index + match[0].length;
    }
    
    const toasterImport = 'import { Toaster } from "@/components/ui/toaster";';
    
    if (lastImportIndex > 0) {
      layoutContent = 
        layoutContent.substring(0, lastImportIndex) + 
        '\n' + toasterImport + 
        layoutContent.substring(lastImportIndex);
    } else {
      layoutContent = toasterImport + '\n' + layoutContent;
    }
  }
  
  if (!layoutContent.includes("<Toaster />")) {
    if (layoutContent.includes("</body>")) {
      layoutContent = layoutContent.replace(
        "</body>",
        "        <Toaster />\n      </body>"
      );
    } else {
      layoutContent = layoutContent.replace(
        "</ChakraProvider>",
        "  <Toaster />\n</ChakraProvider>"
      );
    }
  }
  
  return layoutContent;
}

function updatePageTitle(layoutContent) {
  if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
    layoutContent = layoutContent.replace(
      /title: ["']Create Next App["']/,
      'title: "HackPack Turbo — Build Fast, Ship Faster"'
    );
    
    if (layoutContent.includes('description:')) {
      layoutContent = layoutContent.replace(
        /description: ["']Generated by create next app["']/,
        'description: "Web application created with HackPack"'
      );
    }
  }
  
  return layoutContent;
}

function createWelcomePage(fileExt) {
  // For JavaScript
  if (fileExt === 'js') {
    return `'use client'

import { Box, Button, Container, Heading, Text, Code, Badge, Separator, Flex } from "@chakra-ui/react"
import { useState } from "react"
import { toast } from "sonner"

export default function Home() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
    toast.success("Success!", {
      description: "You've installed Chakra UI with HackPack 🚀",
    })
  }

  return (
    <Box as="main" minH="100vh" bgGradient="to-b" gradientFrom="blue.900" gradientTo="teal.700" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl" rounded="lg" height={400} textAlign="center" boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)">
        <Heading as="h1" fontSize="5xl" fontWeight="bold" mb={6} color="white">
          Welcome to <Text as="span" color="teal.500">HackPack</Text>
        </Heading>

        <Text fontSize="xl" mb={8} color="gray.300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Next.js and Chakra UI.
        </Text>

        <Button 
          onClick={handleClick} 
          bg="teal.700"
          px={2}
          _hover={{ bg: "teal.600" }}
          rounded="lg"
          mb={4}
        >
          Click me for a toast notification: {count}
        </Button>
        
        <Separator my={3} borderColor="gray.600" mx="auto" width={500} />
        
        <Flex justifyContent="center" flexWrap="wrap" gap={2} mb={3}>
          <Badge colorPalette="teal" fontSize="1em" px={2} py={1} borderRadius="full" mb={2}>
            Chakra UI
          </Badge>
          <Badge colorPalette="red" fontSize="1em" px={2} py={1} borderRadius="full" mb={2}>
            HackPack
          </Badge>
        </Flex>
        <Text mt={2} fontSize="sm" color="gray.400">
          Edit <Code p={1} borderRadius="md" bg="gray.500" color="black">src/app/page.js</Code> to get started
        </Text>
      </Container>
    </Box>
  )
}`
  } 
  // For TypeScript
  else {
    return `'use client'

import { Box, Button, Container, Heading, Text, Code, Badge, Separator, Flex } from "@chakra-ui/react"
import { useState } from "react";
import { toast } from "sonner"

export default function Home() {

  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Chakra UI with HackPack 🚀",
    })
  }

  return (
    <Box as="main" minH="100vh" bgGradient="to-b" gradientFrom="blue.900" gradientTo="teal.700" display="flex" alignItems="center" justifyContent="center" p={6}>
      <Container maxW="4xl" rounded={"lg"} height={400} textAlign="center" boxShadow="0 4px 6px rgba(0, 0, 0, 0.3)">
        <Heading as="h1" fontSize="5xl" fontWeight="bold" mb={6} color="white">
          Welcome to <Text as="span" color="teal.500">HackPack</Text>
        </Heading>

        <Text fontSize="xl" mb={8} color="gray.300">
          Build Fast, Ship Faster! 🚀
          <br />
          This project is set up with Next.js and Chakra UI.
        </Text>


        <Button 
          onClick={handleClick} 
          colorPalette="teal"
          bg="teal.700"
          px={2}
          _hover={{ bg: "teal.600" }}
          rounded="lg"
          mb={4}
        >
          Click me for a toast notification: {count}
        </Button>
        
        <Separator my={3} borderColor="gray.600" mx={"auto"} width={500} />
        
        <Flex justifyContent="center" flexWrap="wrap" gap={2} mb={3}>
          <Badge colorPalette="teal" fontSize="1em" px={2} py={1}  borderRadius="full" mb={2}>
          Chakra UI
        </Badge>
         <Badge colorPalette="red" fontSize="1em" px={2} py={1}  borderRadius="full" mb={2}>
          HackPack
        </Badge>
        </Flex>
        <Text mt={2} fontSize="sm" color="gray.400">
          Edit <Code p={1} borderRadius="md" bg="gray.500" color="black">src/app/page.tsx</Code> to get started
        </Text>
      </Container>
    </Box>
  )
}`
  }
}