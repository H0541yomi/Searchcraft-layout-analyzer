import { CONFIG } from '../../config'

interface GraphNodeProps {
  centerX: number
  centerY: number
  diameter: number
  badnessIntensity: number  // 0 = no tint, 0-1 scale
  visible?: boolean
  showBadness?: boolean
}

export function GraphNode({
  centerX,
  centerY,
  diameter,
  badnessIntensity,
  visible = true,
  showBadness = true,
}: GraphNodeProps) {
  const radius = diameter / 2

  return (
    <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.1s ease' }}>
      {/* Base circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="rgba(100, 100, 200, 0.5)"
        opacity={0.6}
      />
      
      {/* Red badness overlay */}
      {showBadness && badnessIntensity > 0 && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={`rgba(220, 50, 50, ${Math.min(badnessIntensity, CONFIG.BADNESS_TINT_MAX)})`}
        />
      )}
    </g>
  )
}
