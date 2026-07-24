import Image from "next/image";

type Props = {
  height?: number;
  className?: string;
};

// Real BNY Mellon logo (eagle + wordmark).
// The source PNG has a white background, so we render it on a white rounded
// chip to keep it clean against the dark dashboard.
export default function BNYLogo({ height = 40, className }: Props) {
  const width = Math.round((580 / 330) * height);
  return (
    <div
      className={className}
      style={{
        height,
        width: width + 16,
        borderRadius: 10,
        background: "#ffffff",
        display: "grid",
        placeItems: "center",
        padding: "0 8px",
        boxShadow: "0 4px 18px rgba(77,163,255,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
        flexShrink: 0,
      }}
    >
      <Image
        src="/bny-logo.png"
        alt="BNY"
        width={width}
        height={height - 8}
        style={{ objectFit: "contain", display: "block" }}
        priority
      />
    </div>
  );
}
