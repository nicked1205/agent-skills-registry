// maps values to in the thousands to K, mils to M and bils to B
export function formatStat(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${Math.floor(value / 1_000_000_000)}B`;
  }

  if (abs >= 1_000_000) {
    return `${Math.floor(value / 1_000_000)}M`;
  }

  if (abs >= 1_000) {
    return `${Math.floor(value / 1_000)}k`;
  }

  return value.toString();
}
