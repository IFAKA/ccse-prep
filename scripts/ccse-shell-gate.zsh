# CCSE Prep start-of-day gate. Source this file from ~/.zshrc.
if [[ -o interactive && -z "${CCSE_GATE_ACTIVE:-}" ]]; then
  _ccse_today="$(date +%Y-%m-%d)"
  _ccse_marker="${XDG_STATE_HOME:-$HOME/.local/state}/ccse-prep/last-gated-day"
  if [[ ! -r "${_ccse_marker}" || "$(<"${_ccse_marker}")" != "${_ccse_today}" ]]; then
    if command -v ccse >/dev/null 2>&1; then
      mkdir -p "${_ccse_marker:h}"
      export CCSE_GATE_ACTIVE=1
      command ccse
      _ccse_status=$?
      unset CCSE_GATE_ACTIVE
      if (( _ccse_status == 0 )); then print -r -- "${_ccse_today}" >| "${_ccse_marker}"; fi
    fi
  fi
  unset _ccse_today _ccse_marker _ccse_status
fi
