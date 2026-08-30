#!/usr/bin/env zsh
set -e
script_dir="${0:A:h}"
rc_file="${ZDOTDIR:-$HOME}/.zshrc"
comment="# CCSE Prep start-of-day terminal gate"
snippet="source \"${script_dir}/ccse-shell-gate.zsh\""
if ! grep -Fqx "$snippet" "$rc_file" 2>/dev/null; then
  {
    print -r -- ""
    print -r -- "$comment"
    print -r -- "$snippet"
  } >> "$rc_file"
fi
print -r -- "Installed CCSE Prep gate in ${rc_file}. Open a new terminal to try it."
