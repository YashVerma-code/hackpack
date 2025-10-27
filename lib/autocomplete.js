import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { listProjects, loadState } from '../lib/state.js';

export function generateCompletions(args) {
  args = args.filter(a => a && a.trim());
  
  // If we're completing the first argument (command)
  if (args.length === 0) {
    return [
      'help',
      'reset',
      'resume',
      'state',
      'select',
      'projects',
      'name',
      'run',
      'add',
      'uninstall',
      'migrate',
      'autocomplete',
      '-h',
      '--help'
    ];
  }

  // Handle subcommands
  const command = args[0];

  // load active project to provide context-aware completions
  const active = loadState();

  // helper: return ui libraries based on styling
  function uiLibrariesForStyling(styling) {
    if (!styling) return [
      'daisyui', 'flowbite', 'shadcn', 'twonly', 'skeletonui', 'plaincss', 'mui', 'chakraui'
    ];
    const s = String(styling).toLowerCase();
    if (s.includes('tailwind') || s.includes('tw')) {
      return ['daisyui', 'flowbite', 'twonly', 'shadcn', 'skeletonui'];
    }
    if (s.includes('mui') || s.includes('material')) {
      return ['mui', 'heroui', 'primeNg', 'vuetify'];
    }
    if (s.includes('chakra')) {
      return ['chakraui', 'daisyui', 'plaincss'];
    }
    if (s.includes('plain') || s.includes('css')) {
      return ['plaincss', 'daisyui'];
    }
    // fallback
    return ['daisyui', 'flowbite', 'shadcn', 'twonly', 'plaincss', 'mui', 'chakraui'];
  }

  if (command === 'add') {
    // support `hp add ui` and top-level add options
    if (args.length === 2 && args[1] === 'ui') {
      return uiLibrariesForStyling(active && active.styling);
    }
    return [];
  }

  if (command === 'uninstall' && args.length === 1) {
    return ['tw', 'ui'];
  }

  if (command === 'projects') {
    if (args.length === 1) {
      return ['list', 'use', 'rm'];
    } else if (args.length === 2 && ['use', 'rm'].includes(args[1])) {
      try {
        const projects = listProjects();
        return projects.map(p => p.projectName);
      } catch (e) {
        return [];
      }
    }
  }

  if (command === 'autocomplete' && args.length === 1) {
    return ['install', 'uninstall'];
  }

  // select <thing> ...
  if (command === 'select') {
    // if only `select` typed, suggest top-level selectable things
    if (args.length === 1) return ['fw', 'lang', 'styling', 'ui'];

    // select ui -> suggest UI libs based on active project's styling
    if (args.length === 2 && args[1] === 'ui') {
      return uiLibrariesForStyling(active && active.styling);
    }

    // select styling -> suggest common stylings
    if (args.length === 2 && args[1] === 'styling') {
      return ['tailwind/tw', 'plaincss', 'none'];
    }

    // select project -> suggest existing project names
    if (args.length === 2 && args[1] === 'project') {
      try { return listProjects().map(p => p.projectName); } catch (e) { return []; }
    }
  }

  if (command === 'name' && args.length === 1) {
    try {
      const projects = listProjects();
      return projects.map(p => p.projectName);
    } catch (e) {
      return [];
    }
  }

  return [];
}

function getBashCompletionScript() {
  return `# hp/hackpack completion
_hp_completions()
{
    local cur prev
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"

    # Get all words except 'hp' or 'hackpack'
    local words=("\${COMP_WORDS[@]:1}")
    
    # Call hp to get completions
    local completions=\$(hp --get-completions "\${words[@]}" 2>/dev/null)
    
    if [ -n "\$completions" ]; then
        COMPREPLY=( \$(compgen -W "\$completions" -- "\$cur") )
    fi
}

complete -F _hp_completions hp
complete -F _hp_completions hackpack
`;
}

// Zsh completion script
function getZshCompletionScript() {
  return `# hp/hackpack completion for zsh
_hp_completions()
{
    local -a completions
    local words
    words=("\${(@)words[2,-1]}")  # Remove command name
    
    # Get completions from hp
    completions=(\${(f)"\$(hp --get-completions \${words[@]} 2>/dev/null)"})
    
    if [ \${#completions[@]} -gt 0 ]; then
        _describe 'values' completions
    fi
}

compdef _hp_completions hp
compdef _hp_completions hackpack
`;
}

export async function installAutocomplete() {
  const homeDir = os.homedir();
  const isWindows = process.platform === 'win32';
  
  console.log(chalk.blue('Setting up autocomplete...\n'));

  try {
    if (isWindows) {
      // Git Bash (most common on Windows)
      const bashrc = path.join(homeDir, '.bashrc');
      const bashScript = getBashCompletionScript();
      
      console.log(chalk.yellow('For Git Bash:'));
      console.log(chalk.gray(`File: ${bashrc}\n`));
      console.log(chalk.cyan('Copy and paste this into your .bashrc file:'));
      console.log(chalk.dim('─'.repeat(60)));
      console.log(bashScript);
      console.log(chalk.dim('─'.repeat(60)));
      
    } else {
      // Unix-like systems
      const shell = process.env.SHELL || '';
      
      if (shell.includes('zsh')) {
        const zshrc = path.join(homeDir, '.zshrc');
        const script = getZshCompletionScript();
        
        console.log(chalk.yellow(`For Zsh:`));
        console.log(chalk.gray(`File: ${zshrc}\n`));
        console.log(chalk.cyan('Copy and paste this:'));
        console.log(chalk.dim('─'.repeat(60)));
        console.log(script);
        console.log(chalk.dim('─'.repeat(60)));
        
      } else {
        const bashrc = path.join(homeDir, '.bashrc');
        const script = getBashCompletionScript();
        
        console.log(chalk.yellow(`For Bash:`));
        console.log(chalk.gray(`File: ${bashrc}\n`));
        console.log(chalk.cyan('Copy and paste this:'));
        console.log(chalk.dim('─'.repeat(60)));
        console.log(script);
        console.log(chalk.dim('─'.repeat(60)));
      }
    }
    
    console.log(chalk.green('\nCopy the script above to your shell config file'));
    console.log(chalk.yellow('\nThen reload your shell:'));
    console.log(chalk.cyan('  source ~/.bashrc  ') + chalk.gray('(or ~/.zshrc)'));
    console.log(chalk.gray('  or restart your terminal'));
    
  } catch (err) {
    console.error(chalk.red('Error:'), err.message);
  }
}

export async function uninstallAutocomplete() {
  console.log(chalk.yellow('To uninstall, remove the hp/hackpack completion section from:'));
  console.log(chalk.gray('  Windows (Git Bash): ~/.bashrc'));
  console.log(chalk.gray('  Linux/Mac (Zsh): ~/.zshrc'));
  console.log(chalk.gray('  Linux/Mac (Bash): ~/.bashrc'));
}

export function handleCompletionRequest(args) {
  const completions = generateCompletions(args);
  completions.forEach(c => console.log(c));
  
  return true;
}