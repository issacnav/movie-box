---
name: ios-motion
description: iOS-style motion tokens for Movie box (Framer Motion). Use for screen transitions that should feel like native UIKit/SwiftUI — smooth, decelerating, no bounce.
---

## When to use

- Full-screen or column **entrances** after navigation (e.g. booking Continue → tickets).
- **Checkout bottom sheet** (seats Continue → modal): slide **up** from below + scrim fade — same deceleration language as the ticket column, axis **`y`** instead of **`x`**.
- **Only** the main scrollable/center column — not the mini movie row or primary CTA unless spec says so (sheet + scrim are explicit exceptions).

## Tokens (source: `src/motion/iosScreenMotion.js`)

Aligned with [Motion for React — Transitions](https://motion.dev/docs/react-transitions): **value-specific** `transition` keys (`x` vs `opacity`).

| Token | Value | Rationale |
|--------|--------|-----------|
| `IOS_TICKET_MAIN_ENTER_TRANSITION` | **`x`:** `tween`, **duration 0.5**, ease **`[0, 0, 0.14, 1]`** · **`opacity`:** `tween`, **duration 0.4**, ease **`[0, 0, 0.2, 1]`** | Strong **ease-out**: movement starts quickly, then **settles slowly** (deceleration curve). Separate opacity tween so the fade matches the same feel. |
| `IOS_TICKET_MAIN_ENTER_INITIAL` | **x: 88** (px), **opacity: 0.78** | Clear lateral travel + light fade; reads as “content slides into place.” |
| `IOS_TICKET_MAIN_ENTER_ANIMATE` | **x: 0**, **opacity: 1** | Rest state. |
| `IOS_TICKET_MAIN_ENTER_REDUCED` | **x: 0**, **opacity: 1** | `prefers-reduced-motion`: skip travel. |
| `IOS_CHECKOUT_SHEET_ENTER_TRANSITION` | **`y`:** tween **0.5s**, ease **`[0, 0, 0.14, 1]`** · **`opacity`:** tween **0.4s**, ease **`[0, 0, 0.2, 1]`** | Same curve family as ticket column; vertical sheet entrance. |
| `IOS_CHECKOUT_SHEET_EXIT_TRANSITION` | **`y`:** tween **0.42s**, ease **`[0, 0, 0.14, 1]`** | Dismiss: slide down, slightly snappier than enter. |
| `IOS_CHECKOUT_SHEET_ENTER_INITIAL` / `…_ANIMATE` / `…_REDUCED` | Same roles as ticket tokens, axis **`y`**, **`y: '100%'`** offscreen | Match ticket **opacity 0.78** on enter for consistency. |
| `IOS_CHECKOUT_SCRIM_TRANSITION` / `…_EXIT_TRANSITION` | **opacity** tweens **0.4s** / **0.32s**, ease **`[0, 0, 0.2, 1]`** | Backdrop fade in/out. |

## Rules

1. Animate **transform + opacity** only for this pattern; keep layout stable.
2. Use **tween + cubic-bezier `[0, 0, c, 1]`** for this entrance (small `c` = faster onset, slower final ease). Avoid springs here if you want predictable “fast then soft” deceleration.
3. Import from `src/motion/iosScreenMotion.js` in components — do not duplicate magic numbers.
4. Tuning: snappier overall → lower **`x.duration`**; more time in the “slow settle” tail → slightly **higher** `x.duration` or ease closer to **`[0.08, 0.82, 0.12, 1]`** (custom ease-out). For checkout, tune **`y.duration`** the same way.

## Reference

- [motion.dev — React transitions](https://motion.dev/docs/react-transitions)

## Related files

- `src/components/TicketScreen.jsx` — ticket main column `motion.div`
- `src/components/CheckoutSheet.jsx` — scrim + sheet variants (`IOS_CHECKOUT_*` tokens)
