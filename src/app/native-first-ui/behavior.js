const initializedRoots = new WeakSet();
const menuStates = new WeakMap();
const responsiveNavigationStates = new WeakMap();

function menus(root) {
  return root.querySelectorAll(".nf-navigation [data-menu-content]");
}

function closeMenus(root, except = null) {
  menus(root).forEach((menu) => {
    if (except && (except.contains(menu) || menu.contains(except))) return;
    menu.hidden = true;
    menu.closest("[data-menu]")?.querySelector("[data-menu-trigger]")?.setAttribute("aria-expanded", "false");
  });
}

function clearTimers(root) {
  const state = menuStates.get(root);
  if (!state) return;
  clearTimeout(state.open);
  clearTimeout(state.close);
  state.open = null;
  state.close = null;
}

function openMenu(root, trigger) {
  const menu = root.querySelector(`#${CSS.escape(trigger.getAttribute("aria-controls"))}`);
  if (!menu) return;
  closeMenus(root, menu);
  menu.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
}

function openSoon(root, trigger) {
  const state = menuStates.get(root) ?? { open: null, close: null };
  menuStates.set(root, state);
  clearTimeout(state.open);
  clearTimeout(state.close);
  state.open = setTimeout(() => openMenu(root, trigger), 120);
}

function closeSoon(root) {
  const state = menuStates.get(root) ?? { open: null, close: null };
  menuStates.set(root, state);
  clearTimeout(state.open);
  clearTimeout(state.close);
  state.close = setTimeout(() => closeMenus(root), 180);
}

function positionResponsiveNavigation(navigation) {
  const summary = navigation.querySelector(":scope > summary");
  const panel = navigation.querySelector(":scope > nav");
  if (!summary || !panel || !navigation.open) return;

  const margin = 16;
  const gap = 8;
  const rect = summary.getBoundingClientRect();
  const width = Math.min(288, window.innerWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.right - width), window.innerWidth - margin - width);

  panel.style.position = "fixed";
  panel.style.insetBlockStart = `${rect.bottom + gap}px`;
  panel.style.insetInlineStart = `${left}px`;
  panel.style.insetInlineEnd = "auto";
  panel.style.inlineSize = `${width}px`;
}

function enhanceResponsiveNavigation(root) {
  const navigations = root.querySelectorAll(".nf-navigation-mobile");
  if (!navigations.length) return;

  const state = responsiveNavigationStates.get(root) ?? { update: null };
  state.update = () => navigations.forEach(positionResponsiveNavigation);
  responsiveNavigationStates.set(root, state);

  navigations.forEach((navigation) => navigation.addEventListener("toggle", state.update));
  window.addEventListener("resize", state.update);
  window.addEventListener("scroll", state.update, true);
}

export function enhanceNativeInteractions(root = document) {
  if (initializedRoots.has(root)) return;
  initializedRoots.add(root);
  enhanceResponsiveNavigation(root);

  root.addEventListener("pointerover", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const navigation = target?.closest(".nf-navigation");
    const trigger = target?.closest("[data-menu-trigger]");
    if (!navigation) return;
    clearTimers(root);
    if (trigger) openSoon(root, trigger);
  });

  root.addEventListener("pointerout", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const navigation = target?.closest(".nf-navigation");
    const next = event.relatedTarget instanceof Node ? event.relatedTarget : null;
    if (!navigation) return;
    if (!next || !navigation.contains(next)) closeSoon(root);
    else clearTimers(root);
  });

  root.addEventListener("focusin", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const trigger = target?.closest("[data-menu-trigger]");
    if (trigger) {
      clearTimers(root);
      openMenu(root, trigger);
    } else if (!target?.closest("[data-menu-content]")) {
      closeMenus(root);
    }
  });

  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const trigger = target.closest("[data-menu-trigger]");
    if (trigger) {
      event.preventDefault();
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      clearTimers(root);
      if (expanded) closeMenus(root);
      else openMenu(root, trigger);
      return;
    }
    if (!target.closest(".nf-navigation")) closeMenus(root);
  });

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const open = [...menus(root)].filter((menu) => !menu.hidden).at(-1);
      if (!open) return;
      event.preventDefault();
      const trigger = open.closest("[data-menu]")?.querySelector("[data-menu-trigger]");
      open.hidden = true;
      open.querySelectorAll("[data-menu-content]").forEach((child) => { child.hidden = true; });
      trigger?.setAttribute("aria-expanded", "false");
      trigger?.focus();
      return;
    }

    if (event.key !== "ArrowDown") return;
    const trigger = event.target instanceof Element ? event.target.closest("[data-menu-trigger]") : null;
    if (!trigger) return;
    const menu = root.querySelector(`#${CSS.escape(trigger.getAttribute("aria-controls"))}`);
    const firstLink = menu?.querySelector("a, button");
    if (!firstLink) return;
    event.preventDefault();
    openMenu(root, trigger);
    firstLink.focus();
  });

  root.addEventListener("click", (event) => {
    const dialog = event.target instanceof Element ? event.target.closest("dialog[open]") : null;
    if (dialog && event.target === dialog) dialog.close("dismiss");
  });
}
