"use client";

type Props = {
  data: { t: number; v: number }[];
  positive: boolean;
  width?: number;
  height?: number;
};

export default function Sparkline({ data, positive, width = 300, height = 54 }: Props) {
  if (!data || data.length < 2) {
    return <div style={{ height, width: "100%" }} />;
  }

  const vals = data.map(d => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const padY = 4;
  const n = data.length;

  const x = (i: number) => (i / (n - 1)) * width;
  const y = (v: number) => height - padY - ((v - min) / span) * (height - padY * 2);

  const linePts = data.map((d, i) => `${x(i).toFixed(2)},${y(d.v).toFixed(2)}`).join(" ");
  const areaPts = `0,${height} ${linePts} ${width},${height}`;

  const color = positive ? "#2ee6a6" : "#ff5c7a";
  const glow = positive ? "rgba(46,230,166,0.35)" : "rgba(255,92,122,0.35)";
  const gradId = positive ? "sparkUp" : "sparkDown";

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${gradId})`} />
      <polyline
        points={linePts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
      />
      {/* end dot */}
      <circle cx={x(n - 1)} cy={y(vals[n - 1])} r="2.6" fill={color} />
    </svg>
  );
}
