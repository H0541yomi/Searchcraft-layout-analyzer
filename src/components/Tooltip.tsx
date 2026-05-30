import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  text: string
  children: React.ReactNode
  className?: string
}

export function Tooltip({ text, children, className }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  // Keep position in sync while visible (handles scroll)
  useEffect(() => {
    if (!pos) return
    const update = () => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect()
        setPos({ x: r.left + r.width / 2, y: r.top })
      }
    }
    window.addEventListener('scroll', update, true)
    return () => window.removeEventListener('scroll', update, true)
  }, [pos])

  const show = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ x: r.left + r.width / 2, y: r.top })
    }
  }

  const hide = () => setPos(null)

  return (
    <>
      <span ref={ref} className={className} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>
      {pos && createPortal(
        <div
          className="tooltip-box"
          style={{ left: pos.x, top: pos.y }}
        >
          {text}
        </div>,
        document.body
      )}
    </>
  )
}
