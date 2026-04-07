import { execa } from 'execa';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { BaseUILibrary } from '../../../ui/BaseUILibrary.js';

export class MaterialUINext extends BaseUILibrary {
  static id = 'mui';
  static displayName = 'Material UI';
  static requiresTailwind = false;

  constructor({ projectName, language = 'ts' }) {
    super();
    this.projectName = projectName;
    this.language = language;
  }

  getDependencies() {
    return ['@mui/material', '@emotion/react', '@emotion/styled', 'sonner'];
  }

  async setup() {
    console.log(chalk.blue('Setting up Material UI...'));
    process.chdir(this.projectName);

    try {
      console.log(chalk.blue('Installing @mui/material, @emotion/react, @emotion/styled...'));
      await execa('npm', ['install', '@mui/material', '@emotion/react', '@emotion/styled'], { stdio: 'inherit' });

      console.log(chalk.blue('Installing toast component...'));
      await execa('npm', ['install', 'sonner'], { stdio: 'inherit' });

      const providersDir = path.join(process.cwd(), 'src', 'app', 'providers');
      await fs.mkdir(providersDir, { recursive: true });

      const fileExt = this.language === 'ts' ? 'tsx' : 'js';
      const muiProviderPath = path.join(providersDir, `MuiProvider.${fileExt}`);
      const muiProviderContent = this.language === 'ts'
        ? `"use client"
import * as React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
`
        : `"use client"
import * as React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
  },
});

export function MuiProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
`;
      await fs.writeFile(muiProviderPath, muiProviderContent, 'utf8');

      const componentsDir = path.join(process.cwd(), 'src', 'components');
      await fs.mkdir(componentsDir, { recursive: true });
      const uiComponentsDir = path.join(componentsDir, 'ui');
      await fs.mkdir(uiComponentsDir, { recursive: true });

      const toasterPath = path.join(uiComponentsDir, `toaster.${fileExt}`);
      const toasterContent = `"use client"\nimport { Toaster as SonnerToaster } from "sonner";\nexport function Toaster() {\n  return (<SonnerToaster position="bottom-right" richColors closeButton className="z-50" />);\n}\n`;
      await fs.writeFile(toasterPath, toasterContent, 'utf8');

      const layoutPath = `src/app/layout.${fileExt}`;
      let layoutContent = await fs.readFile(layoutPath, 'utf8');

      if (!layoutContent.includes('import { MuiProvider }')) {
        const importRegex = /^import .+?;/gm;
        let match, lastImportIndex = 0;
        while ((match = importRegex.exec(layoutContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        const muiImport = 'import { MuiProvider } from "@/app/providers/MuiProvider";';
        layoutContent = lastImportIndex > 0
          ? layoutContent.slice(0, lastImportIndex) + '\n' + muiImport + layoutContent.slice(lastImportIndex)
          : muiImport + '\n' + layoutContent;
      }
      if (!layoutContent.includes('<MuiProvider>')) {
        layoutContent = layoutContent.replace('{children}', '<MuiProvider>{children}</MuiProvider>');
      }
      if (!layoutContent.includes('import { Toaster }')) {
        const importRegex = /^import .+?;/gm;
        let match, lastImportIndex = 0;
        while ((match = importRegex.exec(layoutContent)) !== null) {
          lastImportIndex = match.index + match[0].length;
        }
        const toasterImport = 'import { Toaster } from "@/components/ui/toaster";';
        layoutContent = lastImportIndex > 0
          ? layoutContent.slice(0, lastImportIndex) + '\n' + toasterImport + layoutContent.slice(lastImportIndex)
          : toasterImport + '\n' + layoutContent;
      }
      if (!layoutContent.includes('<Toaster />')) {
        if (layoutContent.includes('</body>')) {
          layoutContent = layoutContent.replace('</body>', '        <Toaster />\n      </body>');
        } else if (layoutContent.includes('</MuiProvider>')) {
          layoutContent = layoutContent.replace('</MuiProvider>', '  <Toaster />\n</MuiProvider>');
        }
      }
      if (layoutContent.includes('title:') && layoutContent.includes('metadata')) {
        layoutContent = layoutContent.replace(/title: ["']Create Next App["']/, 'title: "HackPack Turbo — Build Fast, Ship Faster"');
        if (layoutContent.includes('description:')) {
          layoutContent = layoutContent.replace(/description: ["']Generated by create next app["']/, 'description: "Web application created with HackPack"');
        }
      }
      await fs.writeFile(layoutPath, layoutContent);

      const pagePath = `src/app/page.${fileExt}`;
      const pageContent = this.#createWelcomePage(fileExt);
      await fs.writeFile(pagePath, pageContent);

      console.log(chalk.green('Material UI setup completed successfully!'));
    } catch (error) {
      console.error(chalk.red('Error setting up Material UI:'), error.message);
      console.log(chalk.yellow('You may need to set up Material UI manually after project creation.'));
    }

    process.chdir('..');
  }

  #createWelcomePage(fileExt) {
    const editFile = fileExt === 'js' ? 'page.js' : 'page.tsx';
    return `"use client"
import { Button, Box, Container, Typography, Chip, Divider, Stack } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    toast.success("Success!", {
      description: "You've installed Material UI with HackPack 🚀",
    });
  };
  return (
  <>
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
          Edit <Box component="span" color={"#030303"} sx={{ bgcolor: 'grey.500', p: 0.5, borderRadius: 1 }}>src/app/${editFile}</Box> to get started
        </Typography>
      </Container>
    </Box>
    </>
  );
}
`;
  }
}
