export default function CCSEMark({ animated = false, className = "" }: { animated?: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className={animated ? "splash-mark-line splash-mark-line-1" : undefined} d="M18 8H46L52 14V56H18V8Z" fill="var(--surface)" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path className={animated ? "splash-mark-line splash-mark-line-2" : undefined} d="M18 18H52V25H18V18Z" fill="#c60b1e" />
      <path className={animated ? "splash-mark-line splash-mark-line-3" : undefined} d="M18 25H52V39H18V25Z" fill="#ffc400" />
      <path className={animated ? "splash-mark-line splash-mark-check" : undefined} d="M25 45L30 50L42 37" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
