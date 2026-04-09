/** Join class names; falsy values are skipped. */
export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ')
}
