interface GraphNodeProps {
  centerX: number
  centerY: number
  diameter: number
  badnessIntensity: number  // 0 = no tint, 0-1 scale
}

export function GraphNode({
  centerX,
  centerY,
  diameter,
  badnessIntensity,
}: GraphNodeProps) {
  const radius = diameter / 2

  return (
    <g>
      {/* Base circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="rgba(100, 100, 200, 0.5)"
        opacity={0.6}
      />
      
      {/* Red badness overlay — max opacity 50% */}
      {badnessIntensity > 0 && (
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill={`rgba(220, 50, 50, ${Math.min(badnessIntensity, 0.5)})`}
        />
      )}
    </g>
  )
}
