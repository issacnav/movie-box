/**
 * Shared SVG mask for ticket outline (corners + stub perforation).
 * Used by the digital ticket and the generating skeleton so the silhouette matches.
 */
export function ticketSilhouetteMaskStyle(maskId) {
  if (!maskId) return {}
  const u = `url(#${maskId})`
  return {
    WebkitMaskImage: u,
    maskImage: u,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  }
}

export function TicketSilhouetteDefs({ maskId }) {
  return (
    <svg
      width="1"
      height="1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 block h-px w-px overflow-visible"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="objectBoundingBox"
          maskContentUnits="objectBoundingBox"
        >
          <rect width="1" height="1" fill="white" />
          {/* Corner clips: slightly larger radius so the cut reads clearly against dark UI */}
          <circle cx="0" cy="0" r="0.058" fill="black" />
          <circle cx="1" cy="0" r="0.058" fill="black" />
          <circle cx="1" cy="1" r="0.058" fill="black" />
          <circle cx="0" cy="1" r="0.058" fill="black" />
          {/* Stub notches: a touch lower + wider bite for a deliberate perforation read */}
          <circle cx="0" cy="0.772" r="0.046" fill="black" />
          <circle cx="1" cy="0.772" r="0.046" fill="black" />
        </mask>
      </defs>
    </svg>
  )
}
