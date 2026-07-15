export function NeptuneLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-xl gradient-brand shadow-lg"
      style={{ width: size, height: size }}
      aria-label="Neptune"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.7}
        height={size * 0.7}
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M2 12c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6-1" />
        <path d="M2 17c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6-1" opacity=".7" />
      </svg>
    </div>
  );
}
