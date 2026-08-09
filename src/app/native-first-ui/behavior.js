const openers = '[data-nf-dialog-open]';
const closers = '[data-nf-dialog-close]';
const lastFocused = new WeakMap();

function getDialog(id) {
  const dialog = document.getElementById(id);
  return dialog instanceof HTMLDialogElement ? dialog : null;
}

function announce(dialog, message) {
  const target = dialog.querySelector('[data-nf-dialog-status]');
  if (target) target.textContent = message;
}

function openDialog(button) {
  const dialog = getDialog(button.dataset.nfDialogOpen);
  if (!dialog) return;
  lastFocused.set(dialog, button);
  if (!dialog.open) dialog.showModal();
  announce(dialog, 'Dialog opened. Press Escape to close.');
  const first = dialog.querySelector('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
  first?.focus();
}

function closeDialog(dialog) {
  if (!dialog.open) return;
  dialog.close();
  announce(dialog, 'Dialog closed.');
  lastFocused.get(dialog)?.focus();
}

document.addEventListener('click', (event) => {
  const opener = event.target.closest?.(openers);
  if (opener) openDialog(opener);
  const closer = event.target.closest?.(closers);
  if (closer) {
    const dialog = closer.closest('dialog');
    if (dialog) closeDialog(dialog);
  }
});

document.addEventListener('cancel', (event) => {
  const dialog = event.target;
  if (dialog instanceof HTMLDialogElement) {
    event.preventDefault();
    closeDialog(dialog);
  }
});

document.addEventListener('close', (event) => {
  const dialog = event.target;
  if (dialog instanceof HTMLDialogElement) {
    announce(dialog, 'Dialog closed.');
    lastFocused.get(dialog)?.focus();
  }
}, true);
