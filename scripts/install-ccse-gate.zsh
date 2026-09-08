#!/usr/bin/env zsh
set -e
script_dir="${0:A:h}"
repo_dir="${script_dir:h}"
rc_file="${ZDOTDIR:-$HOME}/.zshrc"
comment="# CCSE Prep start-of-day terminal gate"
snippet="source \"${script_dir}/ccse-shell-gate.zsh\""

print -r -- "Linking CCSE CLI from ${repo_dir}..."
cd "$repo_dir"
npm link

if ! command -v ccse >/dev/null 2>&1; then
  print -u2 -r -- "CCSE CLI was linked, but 'ccse' is not available on PATH."
  exit 1
fi

if ! grep -Fqx "$snippet" "$rc_file" 2>/dev/null; then
  {
    if ! grep -Fqx "$comment" "$rc_file" 2>/dev/null; then
      print -r -- ""
      print -r -- "$comment"
    fi
    print -r -- "$snippet"
  } >> "$rc_file"
fi
print -r -- "Installed CCSE Prep gate in ${rc_file}. Open a new terminal to try it."
