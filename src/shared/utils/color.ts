/**
 * Lighten/darken a hex color by an integer amount per channel.
 * Ported from the design's `shade()` helper to keep gradients identical.
 */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amount;
  let g = ((n >> 8) & 255) + amount;
  let b = (n & 255) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/** Deterministic avatar color palette (matches the design seed). */
export const AVATAR_COLORS = [
  '#67B2D8',
  '#7B6FCB',
  '#2E9E73',
  '#C98A1E',
  '#D6533F',
  '#4A93BC',
  '#5A8FB0',
  '#9B7BC9',
] as const;

export function colorAt(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
