import { Children, useId, useMemo, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { cn } from './utils'

/**
 * Staggered appear animation modeled on plemarquand/react-staggered-animation:
 * each child gets `transition-delay` / `animation-delay` of `start + delay * (indexOffset + i)` ms.
 * The published package targets React ≤15 and does not load on React 19; this uses the same
 * stagger contract with react-transition-group.
 *
 * @see https://github.com/plemarquand/react-staggered-animation
 */

function StaggeredItem({
  child,
  childIndex,
  staggerId,
  transitionName,
  timeoutMs,
  disabled,
  itemClassName,
}) {
  const nodeRef = useRef(null)
  const slotClass = `${staggerId}_a${childIndex}`

  if (disabled) {
    return (
      <span className={cn('inline-flex shrink-0 items-center justify-center', itemClassName)}>
        {child}
      </span>
    )
  }

  return (
    <CSSTransition
      nodeRef={nodeRef}
      appear
      in
      timeout={timeoutMs}
      classNames={transitionName}
    >
      <span
        ref={nodeRef}
        className={cn('inline-flex shrink-0 items-center justify-center', slotClass, itemClassName)}
      >
        {child}
      </span>
    </CSSTransition>
  )
}

export default function StaggeredAnimation({
  children,
  delay = 100,
  start = 0,
  duration = 400,
  indexOffset = 0,
  transitionName = 'seat-stagger',
  className,
  disabled = false,
  itemClassName,
}) {
  const arr = Children.toArray(children).filter((c) => c != null && c !== false)
  const reactId = useId().replace(/:/g, '_')
  const staggerId = `StaggeredAnimation_${reactId}`

  const lastStaggerMs =
    arr.length === 0
      ? start
      : start + delay * (indexOffset + Math.max(arr.length - 1, 0))

  const timeoutMs = lastStaggerMs + duration

  const styleCss = useMemo(() => {
    if (disabled || arr.length === 0) return ''
    let out = ''
    for (let j = 0; j < arr.length; j++) {
      const ms = start + delay * (indexOffset + j)
      out += `.${staggerId}_a${j} { transition-delay: ${ms}ms !important; animation-delay: ${ms}ms !important; }\n`
    }
    return out
  }, [arr.length, delay, start, indexOffset, staggerId, disabled])

  return (
    <>
      {!disabled && styleCss ? (
        <style dangerouslySetInnerHTML={{ __html: styleCss }} />
      ) : null}
      <TransitionGroup component="div" className={className}>
        {arr.map((child, i) => (
          <StaggeredItem
            key={child.key ?? `stagger-${i}`}
            child={child}
            childIndex={i}
            staggerId={staggerId}
            transitionName={transitionName}
            timeoutMs={timeoutMs}
            disabled={disabled}
            itemClassName={itemClassName}
          />
        ))}
      </TransitionGroup>
    </>
  )
}

