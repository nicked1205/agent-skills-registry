export default function HudCorners({
  className = "",
  offset,
  length,
  strokeWidth,
}: {
  className?: string;
  offset: number;
  length: number;
  strokeWidth: number;
}) {
  return (
    <>
      <span
        style={{
          top: -offset,
          left: -offset,
          width: length,
          height: length,
          borderTopWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
        }}
        className={`absolute border-current ${className}`}
      />

      <span
        style={{
          top: -offset,
          right: -offset,
          width: length,
          height: length,
          borderTopWidth: strokeWidth,
          borderRightWidth: strokeWidth,
        }}
        className={`absolute border-current ${className}`}
      />
      <span
        style={{
          bottom: -offset,
          left: -offset,
          width: length,
          height: length,
          borderBottomWidth: strokeWidth,
          borderLeftWidth: strokeWidth,
        }}
        className={`absolute border-current ${className}`}
      />

      <span
        style={{
          bottom: -offset,
          right: -offset,
          width: length,
          height: length,
          borderBottomWidth: strokeWidth,
          borderRightWidth: strokeWidth,
        }}
        className={`absolute border-current ${className}`}
      />
    </>
  );
}
