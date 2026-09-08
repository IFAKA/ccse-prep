#!/usr/bin/env zsh
set -e
rc_file="${ZDOTDIR:-$HOME}/.zshrc"
comment="# CCSE Prep start-of-day terminal gate"
snippet="source \"${0:A:h}/ccse-shell-gate.zsh\""

if [[ ! -f "$rc_file" ]]; then
  print -r -- "CCSE Prep gate is not installed in ${rc_file}."
  exit 0
fi

tmp_file="${rc_file}.ccse-uninstall.$$"
trap 'rm -f "$tmp_file"' EXIT

awk -v comment="$comment" -v snippet="$snippet" '
  $0 != comment && $0 != snippet { print }
' "$rc_file" >| "$tmp_file"
mv "$tmp_file" "$rc_file"
trap - EXIT
print -r -- "Uninstalled CCSE Prep gate from ${rc_file}. Open a new terminal to apply it."
