import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';

export class ChakraUINext extends BaseUILibrary {
  static id = 'chakraui';
  static displayName = 'Chakra UI';
  static requiresTailwind = false;

  constructor({ projectName, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.language = language;
  }

  getDependencies() {
    return ['@chakra-ui/next-js', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion', 'sonner'];
  }

  async setup() {
    process.chdir(this.projectName);

    console.log(chalk.blue('Setting up Chakra UI...'));

    try {
      console.log(chalk.blue('Installing Chakra UI and its dependencies...'));
      await execa('npm', ['install', '@chakra-ui/next-js', '@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'], { stdio: 'inherit' });

      console.log(chalk.blue('Installing toast component...'));
      await execa('npm', ['install', 'sonner'], { stdio: 'inherit' });

      console.log(chalk.blue('Creating Chakra UI providers...'));
      const providersDir = path.join(process.cwd(), 'src', 'app', 'providers');
      await fs.mkdir(providersDir, { recursive: true });

      const fileExt = this.language === 'ts' ? 'tsx' : 'js';
      const chakraProviderPath = path.join(providersDir, `ChakraProvider.${fileExt}`);
      const chakraProviderContent = this.language === 'ts'
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

      const componentsDir = path.join(process.cwd(), 'src', 'components');
      await fs.mkdir(componentsDir, { recursive: true });
      const uiComponentsDir = path.join(componentsDir, 'ui');
      await fs.mkdir(uiComponentsDir, { recursive: true });

      const toasterPath = path.join(uiComponentsDir, `toaster.${fileExt}`);
      const toasterContent = this.language === 'ts'
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

      console.log(chalk.blue('Updating layout file with Chakra UI providers...'));
      const layoutPath = path.join(process.cwd(), 'src', 'app', `layout.${fileExt}`);

      const layoutContent = await fs.readFile(layoutPath, 'utf8');
      let updatedLayoutContent = this.#addChakraProviderToLayout(layoutContent, fileExt);
      updatedLayoutContent = this.#addToasterToLayout(updatedLayoutContent, fileExt);
      updatedLayoutContent = this.#updatePageTitle(updatedLayoutContent);
      await fs.writeFile(layoutPath, updatedLayoutContent);

      console.log(chalk.blue('Creating a welcome page...'));
      const pagePath = path.join(process.cwd(), 'src', 'app', `page.${fileExt}`);
      const pageContent = this.#createWelcomePage(fileExt);
      await fs.writeFile(pagePath, pageContent);

      console.log(chalk.green('Chakra UI setup completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Error setting up Chakra UI:'), error.message);
      console.log(chalk.yellow('You may need to set up Chakra UI manually after project creation.'));
    }

    process.chdir('..');
  }

  #addChakraProviderToLayout(layoutContent, fileExt) {
    if (!layoutContent.includes("import { ChakraProvider }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
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
        layoutContent = layoutContent.replace("{children}", "<ChakraProvider>{children}</ChakraProvider>");
      }
    }
    return layoutContent;
  }

  #addToasterToLayout(layoutContent, fileExt) {
    if (!layoutContent.includes("import { Toaster }")) {
      const importRegex = /^import .+?;/gm;
      let match;
      let lastImportIndex = 0;
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
        layoutContent = layoutContent.replace("</body>", "        <Toaster />\n      </body>");
      } else {
        layoutContent = layoutContent.replace("</ChakraProvider>", "  <Toaster />\n</ChakraProvider>");
      }
    }
    return layoutContent;
  }

  #updatePageTitle(layoutContent) {
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

  #createWelcomePage(fileExt) {
    const editFile = fileExt === 'js' ? 'page.js' : 'page.tsx';
    const useStateType = fileExt === 'ts' ? '' : '';
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
  <>
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
          Edit <Code p={1} borderRadius="md" bg="gray.500" color="black">src/app/${editFile}</Code> to get started
        </Text>
      </Container>
    </Box>
    </>
  )
}`;
  }
}
