import type { WordEntry, GraphNode, GraphEdge } from '../types'
import { tokenizeWord } from './tokenizer'

export interface CharacterGraph {
  nodes: Map<string, GraphNode>
  edges: Map<string, GraphEdge>
}

export function buildGraph(
  entries: WordEntry[],
  charToKey: Map<string, string>
): CharacterGraph {
  const nodes = new Map<string, GraphNode>()
  const edges = new Map<string, GraphEdge>()

  for (const entry of entries) {
    const rawTokens = tokenizeWord(entry.text)

    // Extract only tokens that are assigned to keys
    const validChars: string[] = []
    for (const tok of rawTokens) {
      if (charToKey.has(tok)) {
        validChars.push(tok)
      }
      // Unassigned tokens break adjacency - they are skipped
    }

    // Count character frequencies (for all valid chars)
    for (const char of validChars) {
      if (!nodes.has(char)) {
        nodes.set(char, {
          character: char,
          frequency: 0,
          badnessWeight: 0,
        })
      }
      nodes.get(char)!.frequency++
    }

    // Build edges between adjacent valid characters
    for (let i = 0; i < validChars.length - 1; i++) {
      const source = validChars[i]
      const target = validChars[i + 1]
      const edgeKey = `${source}→${target}`

      if (!edges.has(edgeKey)) {
        edges.set(edgeKey, {
          source,
          target,
          weight: 0,
        })
      }
      edges.get(edgeKey)!.weight++
    }
  }

  return { nodes, edges }
}
