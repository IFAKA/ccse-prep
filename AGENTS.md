# CCSE Desk UI Rules

Use `$native-first-ui` for all interface work. Use `$emil-design-eng` when evaluating polish, interaction details, or motion. Keep the native-first architecture: semantic HTML first, minimal reusable CSS second, JavaScript only for behavior native HTML cannot provide.

- Follow the Vercel Web Interface Guidelines in `https://vercel.com/design/guidelines`.
- Keep controls keyboard-operable, show `:focus-visible`, and use at least 44px mobile hit targets.
- Use native semantic controls before ARIA, label every form control, and announce async status with `aria-live`.
- Keep copy concise, action-oriented, and use Title Case for product controls.
- Preserve the local-first promise: official answers come only from the immutable question bank; user study events stay in IndexedDB unless the user explicitly syncs or exports them.
- Prefer system typography, crisp borders, restrained surfaces, and no decorative UI that competes with the question.
