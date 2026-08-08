export default function CCSEMark({ animated = false, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className={animated ? "splash-mark-line splash-mark-line-1" : undefined} d="M10 18H30L42 32H54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path className={animated ? "splash-mark-line splash-mark-line-2" : undefined} d="M10 32H24L36 46H54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".76" />
      <path className={animated ? "splash-mark-line splash-mark-line-3" : undefined} d="M10 46H25L37 32H54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".56" />
      <circle className={animated ? "splash-mark-node splash-mark-node-1" : undefined} cx="30" cy="18" r="5.5" fill="var(--splash-bg)" stroke="currentColor" strokeWidth="3.5" />
      <circle className={animated ? "splash-mark-node splash-mark-node-2" : undefined} cx="36" cy="46" r="5.5" fill="var(--splash-bg)" stroke="currentColor" strokeWidth="3.5" />
      <circle className={animated ? "splash-mark-node splash-mark-node-3" : undefined} cx="42" cy="32" r="6.5" fill="var(--splash-bg)" stroke="currentColor" strokeWidth="3.5" />
      <path className={animated ? "splash-mark-line splash-mark-check" : undefined} d="M39 32L41.5 34.5L46.5 29" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
