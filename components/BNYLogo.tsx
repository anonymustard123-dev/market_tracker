// BNY (Bank of New York) wordmark — stylized eagle/shield mark + wordmark
// Rendered as inline SVG so it ships with the app (no external assets).
type Props = {
  size?: number;
  className?: string;
};

export default function BNYLogo({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="BNY"
    >
      <defs>
        <linearGradient id="bnyShield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b8def" />
          <stop offset="100%" stopColor="#2a4d8f" />
        </linearGradient>
        <linearGradient id="bnyEagle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cfe0ff" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M32 3 L58 12 V32 C58 47 47 57 32 61 C17 57 6 47 6 32 V12 Z"
        fill="url(#bnyShield)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />

      {/* Eagle silhouette (stylized) */}
      <g fill="url(#bnyEagle)">
        {/* head */}
        <path d="M32 14 L29 18 L31 19 L28 21 L32 20 L36 21 L33 19 L35 18 Z" />
        {/* body */}
        <path d="M32 19 L30 24 L32 23 L34 24 Z" />
        {/* left wing */}
        <path d="M30 22 C24 24 19 27 16 32 C20 28 25 26 30 26 Z" />
        {/* right wing */}
        <path d="M34 22 C40 24 45 27 48 32 C44 28 39 26 34 26 Z" />
        {/* tail */}
        <path d="M30 26 L32 33 L34 26 L33 31 L32 34 L31 31 Z" />
      </g>

      {/* BNY wordmark */}
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="11"
        fontWeight="800"
        letterSpacing="1.5"
        fill="#ffffff"
      >
        BNY
      </text>
    </svg>
  );
}
