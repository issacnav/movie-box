/**
 * iOS-style motion tokens (booking → tickets column, checkout bottom sheet).
 * Documented in skills/ios-motion/SKILL.md — change values there and mirror here, or edit this file as source of truth.
 *
 * Transition shape follows Motion for React:
 * https://motion.dev/docs/react-transitions
 * — value-specific tweens: strong ease-out (fast start, slow settle).
 */

/**
 * Deceleration curves: most motion in the first part of the timeline, then a long soft landing.
 * Easing [0, 0, c, 1] (c small) ≈ Material / system “decelerate” — quick off the line, eases slowly in.
 */
export const IOS_TICKET_MAIN_ENTER_TRANSITION = {
  x: {
    type: 'tween',
    duration: 0.5,
    ease: [0, 0, 0.14, 1],
  },
  opacity: {
    type: 'tween',
    duration: 0.4,
    ease: [0, 0, 0.2, 1],
  },
}

/** Starts clearly offset right; settles left into layout (≈pt-scale on phone). */
export const IOS_TICKET_MAIN_ENTER_INITIAL = {
  x: 88,
  opacity: 0.78,
}

export const IOS_TICKET_MAIN_ENTER_ANIMATE = {
  x: 0,
  opacity: 1,
}

/** prefers-reduced-motion: no travel. */
export const IOS_TICKET_MAIN_ENTER_REDUCED = {
  x: 0,
  opacity: 1,
}

/**
 * Checkout bottom sheet — same motion language as ticket column (skills/ios-motion/SKILL.md):
 * tween + decelerating cubic-bezier, no spring.
 * Axis is `y` (slide up from below).
 */
export const IOS_CHECKOUT_SHEET_ENTER_TRANSITION = {
  y: {
    type: 'tween',
    duration: 0.5,
    ease: [0, 0, 0.14, 1],
  },
  opacity: {
    type: 'tween',
    duration: 0.4,
    ease: [0, 0, 0.2, 1],
  },
}

/** Sheet begins fully below the viewport; light fade-in matches ticket column entrance. */
export const IOS_CHECKOUT_SHEET_ENTER_INITIAL = {
  y: '100%',
  opacity: 0.78,
}

export const IOS_CHECKOUT_SHEET_ENTER_ANIMATE = {
  y: 0,
  opacity: 1,
}

/** prefers-reduced-motion: no vertical travel. */
export const IOS_CHECKOUT_SHEET_ENTER_REDUCED = {
  y: 0,
  opacity: 1,
}

/** Dismiss: slide down with the same deceleration curve (slightly snappier). */
export const IOS_CHECKOUT_SHEET_EXIT_TRANSITION = {
  y: {
    type: 'tween',
    duration: 0.42,
    ease: [0, 0, 0.14, 1],
  },
}

/** Dimmed scrim behind the sheet — opacity only, same ease as ticket fade. */
export const IOS_CHECKOUT_SCRIM_TRANSITION = {
  opacity: {
    type: 'tween',
    duration: 0.4,
    ease: [0, 0, 0.2, 1],
  },
}

export const IOS_CHECKOUT_SCRIM_EXIT_TRANSITION = {
  opacity: {
    type: 'tween',
    duration: 0.32,
    ease: [0, 0, 0.2, 1],
  },
}
