# hp/hackpack completion
_hp_completions()
{
    local cur prev
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Get all words except 'hp' or 'hackpack'
    local words=("${COMP_WORDS[@]:1}")

    # Call hp to get completions
    local completions=$(hp --get-completions "${words[@]}" 2>/dev/null)

    if [ -n "$completions" ]; then
        COMPREPLY=( $(compgen -W "$completions" -- "$cur") )
    fi
}

complete -F _hp_completions hp
complete -F _hp_completions hackpack
