# Native-First UI System

This project uses semantic HTML as its public interface. CSS supplies consistent tokens, sizing, typography, spacing, responsive behavior, and focus treatment. JavaScript is reserved for interactions that native HTML cannot provide reliably.

The styles are intentionally split into two layers:

- `src/app/core.css` contains reusable native-first contracts for any application.
- `src/app/ui.css` contains CCSE-specific screens and can grow without inflating the core layer.

Both desktop and mobile use the same semantic markup and navigation data. The base layout is mobile-first; wider viewports add room with media queries instead of introducing a second component system.

## Support levels

### Native

Use `a`, `button`, `form`, `input`, `select`, `textarea`, `fieldset`, `dialog`, `details`, tables, lists, and headings directly.

### Native plus CSS

Use shared layout patterns such as `stack`, `cluster`, `content-readable`, and `action-group` when the markup needs reusable layout behavior.

### Enhanced behavior

Add JavaScript only for features such as comboboxes, command menus, virtualized data, drag and drop, complex focus management, and async overlays.

## Contracts

- Interactive controls have a minimum 44px target.
- Keyboard focus is always visible.
- Every form control has a label or an explicit accessible name.
- Long content must wrap or use an explicitly scrollable region.
- Mobile layouts must not create page-level horizontal overflow.
- Native controls keep their native semantics and keyboard behavior.
- New patterns must be covered by the relevant UI tests.

## Validation

Run the following before releasing a UI change:

```text
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Then manually verify keyboard navigation, 200% zoom, reduced motion, forced colors, long labels, empty states, error states, and narrow viewports.
