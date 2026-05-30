interface GraphEdgeProps {
  x1: number
  y1: number   // source center
  x2: number
  y2: number   // target center
  opacity: number
  isBidirectional: boolean  // if true, offset slightly to avoid overlap
  markerId: string          // SVG arrowhead marker id
}

export function GraphEdge({
  x1,
  y1,
  x2,
  y2,
  opacity,
  isBidirectional,
  markerId,
}: GraphEdgeProps) {
  // Self-loop detection
  if (x1 === x2 && y1 === y2) {
    // Render a small circular arc above the key
    const radius = 15
    const arcPath = `
      M ${x1} ${y1 - 5}
      A ${radius} ${radius} 0 1 1 ${x1 + 0.1} ${y1 - 5}
    `
    return (
      <path
        d={arcPath}
        fill="none"
        stroke={`rgba(80, 80, 150, ${opacity})`}
        strokeWidth={2}
        markerEnd={`url(#${markerId})`}
      />
    )
  }

  let lineX1 = x1
  let lineY1 = y1
  let lineX2 = x2
  let lineY2 = y2

  // Offset for bidirectional to avoid overlap
  if (isBidirectional) {
    const dx = x2 - x1
    const dy = y2 - y1
    const length = Math.sqrt(dx * dx + dy * dy)
    
    if (length > 0) {
      const perpX = -dy / length
      const perpY = dx / length
      const offset = 4
      
      lineX1 += perpX * offset
      lineY1 += perpY * offset
      lineX2 += perpX * offset
      lineY2 += perpY * offset
    }
  }

  // Shorten line to account for node circles (~15px offset from center)
  const dx = lineX2 - lineX1
  const dy = lineY2 - lineY1
  const length = Math.sqrt(dx * dx + dy * dy)
  
  if (length > 30) {
    const nodeRadius = 15
    const ratio1 = nodeRadius / length
    const ratio2 = (length - nodeRadius) / length
    
    lineX1 = lineX1 + dx * ratio1
    lineY1 = lineY1 + dy * ratio1
    lineX2 = lineX1 + dx * ratio2
    lineY2 = lineY1 + dy * ratio2
  }

  return (
    <line
      x1={lineX1}
      y1={lineY1}
      x2={lineX2}
      y2={lineY2}
      stroke={`rgba(80, 80, 150, ${opacity})`}
      strokeWidth={2}
      markerEnd={`url(#${markerId})`}
    />
  )
}
