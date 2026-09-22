/** Compact thousands for supporting figures in a 3-up row on 320→430px. */
export function kFormat(n: number): string {
  if (n >= 1_000_000)
    return "£" + (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  return "£" + Math.round(n / 1000) + "k";
}
