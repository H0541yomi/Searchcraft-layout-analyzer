import { useMemo } from 'react'
import { buildKeyPixelMap, getKeyboardDimensions } from '../../lib/keyboard-utils'
import { buildGraph } from '../../lib/graph'
import { analyzeWords } from '../../lib/analysis'
import { useAppState } from '../../state/AppContext'
import { useWordHighlight } from '../../state/WordHighlightContext'
import { CONFIG } from '../../config'
import { GraphNode } from './GraphNode'
import { GraphEdge } from './GraphEdge'

interface GraphOverlayProps {
  layer?: 'main' | 'shift'
  hoveredKeyChar?: string | null
}

export function GraphOverlay({ layer = 'main', hoveredKeyChar = null }: GraphOverlayProps) {
  const state = useAppState()
  const { highlightedChars } = useWordHighlight()

  // Each overlay only shows chars from its own layer
  const layerAssignments = layer === 'shift' ? state.shiftKeyAssignments : state.keyAssignments
  const mouseLayer = layer === 'shift' ? state.shiftMouseAssignments : state.mouseAssignments
  const charToKey = useMemo(() => {
    const map = new Map<string, string>()
    for (const [code, a] of Object.entries(layerAssignments)) {
      if (a.character !== null) map.set(a.character, code)
    }
    // Add mouse chars
    for (const [code, char] of Object.entries(mouseLayer)) {
      if (char !== null) map.set(char, code)
    }
    return map
  }, [layerAssignments, mouseLayer])

  const { nodes, edges, keyPixelMap, dimensions } = useMemo(() => {
    const keyPixelMap = buildKeyPixelMap()
    const dimensions = getKeyboardDimensions()
    const graph = buildGraph(state.wordEntries, charToKey)
    const { nodeBadness } = analyzeWords(
      state.wordEntries,
      state.keyAssignments,
      state.shiftKeyAssignments,
      state.mouseAssignments,
      state.shiftMouseAssignments,
      state.flags,
      state.sfsGap
    )

    // Apply badness to graph nodes
    for (const [char, badness] of nodeBadness.entries()) {
      const node = graph.nodes.get(char)
      if (node) {
        node.badnessWeight = badness
      }
    }

    return { nodes: graph.nodes, edges: graph.edges, keyPixelMap, dimensions }
  }, [state.wordEntries, state.keyAssignments, state.shiftKeyAssignments, state.mouseAssignments, state.shiftMouseAssignments, state.flags, state.sfsGap, charToKey])

  // Calculate max values for scaling
  const maxFreq = useMemo(() => {
    let max = 0
    for (const node of nodes.values()) {
      max = Math.max(max, node.frequency)
    }
    return max || 1
  }, [nodes])

  const maxBadness = useMemo(() => {
    let max = 0
    for (const node of nodes.values()) {
      max = Math.max(max, node.badnessWeight)
    }
    return max || 1
  }, [nodes])

  const maxEdgeWeight = useMemo(() => {
    let max = 0
    for (const edge of edges.values()) {
      max = Math.max(max, edge.weight)
    }
    return max || 1
  }, [edges])

  // Compute which chars are directly connected to hoveredKeyChar
  const hoveredConnectedChars = useMemo(() => {
    if (hoveredKeyChar === null) return null
    const set = new Set<string>([hoveredKeyChar])
    for (const edge of edges.values()) {
      if (edge.source === hoveredKeyChar) set.add(edge.target)
      if (edge.target === hoveredKeyChar) set.add(edge.source)
    }
    return set
  }, [hoveredKeyChar, edges])

  // Visibility helpers — key hover takes priority over word highlight
  const isNodeVisible = (char: string): boolean => {
    if (hoveredKeyChar !== null) return hoveredConnectedChars!.has(char)
    if (highlightedChars !== null) return highlightedChars.has(char)
    return true
  }

  const isEdgeVisible = (source: string, target: string): boolean => {
    if (hoveredKeyChar !== null) {
      return source === hoveredKeyChar || target === hoveredKeyChar
    }
    if (highlightedChars !== null) {
      return highlightedChars.has(source) && highlightedChars.has(target)
    }
    return true
  }

  // Build bidirectional edge map
  const bidirectionalEdges = useMemo(() => {
    const set = new Set<string>()
    for (const edge of edges.values()) {
      const reverseKey = `${edge.target}→${edge.source}`
      if (edges.has(reverseKey)) {
        set.add(`${edge.source}→${edge.target}`)
      }
    }
    return set
  }, [edges])

  return (
    <svg
      className="graph-overlay"
      width={dimensions.width}
      height={dimensions.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Create markers dynamically for each edge opacity */}
        {state.showArrows && Array.from(edges.values()).map((edge, idx) => {
          const opacity = (edge.weight / maxEdgeWeight) * CONFIG.EDGE_OPACITY_MAX
          return (
            <marker
              key={`marker-${idx}`}
              id={`arrowhead-${idx}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill={`rgba(80, 80, 150, ${opacity})`} />
            </marker>
          )
        })}
      </defs>

      {/* Render edges first (behind nodes) */}
      {state.showArrows && Array.from(edges.values()).map((edge, edgeIdx) => {
        const sourceKeyCode = charToKey.get(edge.source)
        const targetKeyCode = charToKey.get(edge.target)

        if (!sourceKeyCode || !targetKeyCode) return null

        const sourcePixel = keyPixelMap.get(sourceKeyCode)
        const targetPixel = keyPixelMap.get(targetKeyCode)

        if (!sourcePixel || !targetPixel) return null

        const opacity = (edge.weight / maxEdgeWeight) * CONFIG.EDGE_OPACITY_MAX

        const edgeKey = `${edge.source}→${edge.target}`
        const isBidirectional = bidirectionalEdges.has(edgeKey)
        const visible = isEdgeVisible(edge.source, edge.target)

        return (
          <g key={edgeKey} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.1s ease' }}>
            <GraphEdge
              x1={sourcePixel.centerX}
              y1={sourcePixel.centerY}
              x2={targetPixel.centerX}
              y2={targetPixel.centerY}
              opacity={opacity}
              isBidirectional={isBidirectional}
              markerId={`arrowhead-${edgeIdx}`}
            />
          </g>
        )
      })}

      {/* Render nodes on top */}
      {state.showNodes && Array.from(nodes.values()).map(node => {
        const keyCode = charToKey.get(node.character)
        if (!keyCode) return null

        const pixel = keyPixelMap.get(keyCode)
        if (!pixel) return null

        // Special handling for spacebar: use height instead of width
        const isSpace = node.character === ' '
        const maxAllowed = isSpace
          ? pixel.height * 0.8
          : Math.min(pixel.width, pixel.height) * 0.8

        const floor = CONFIG.NODE_SIZE_FLOOR
        const relative = nodes.size === 1
          ? 1.0
          : floor + (node.frequency / maxFreq) * (1.0 - floor)
        const diameter = relative * maxAllowed

        const badnessIntensity = node.badnessWeight > 0
          ? Math.max(
              CONFIG.BADNESS_TINT_FLOOR,
              node.badnessWeight / maxBadness
            )
          : 0

        const visible = isNodeVisible(node.character)

        return (
          <GraphNode
            key={node.character}
            centerX={pixel.centerX}
            centerY={pixel.centerY}
            diameter={diameter}
            badnessIntensity={badnessIntensity}
            visible={visible}
            showBadness={state.showBadness}
          />
        )
      })}
    </svg>
  )
}
