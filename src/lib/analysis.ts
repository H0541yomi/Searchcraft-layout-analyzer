import type { WordEntry, KeyAssignment, FlagType, WordAnalysis, FingerEnum } from '../types'
import { detectSFBs, detectSFS, detectRolls, detectRedirects, detectScissors } from './detection'
import { KEYBOARD_LAYOUT } from '../data/keyboard-layout'
import { tokenizeWord } from './tokenizer'

export interface AnalysisResult {
  wordAnalysis: WordAnalysis[]
  nodeBadness: Map<string, number>
}

/** Tokens that split a word into independent sequences for flagging. */
const SEPARATOR_TOKENS = new Set(['[BS]', '[Home]'])

/**
 * Split token array at separators. Each separator starts a new segment
 * (it becomes the first token of that segment).
 * Returns segments with their start offset in the original array.
 */
function splitAtSeparators(chars: string[]): Array<{ tokens: string[]; offset: number }> {
  const segments: Array<{ tokens: string[]; offset: number }> = []
  let current: string[] = []
  let currentOffset = 0

  for (let i = 0; i < chars.length; i++) {
    if (SEPARATOR_TOKENS.has(chars[i]) && i > 0) {
      // End previous segment (without the separator)
      if (current.length > 0) {
        segments.push({ tokens: current, offset: currentOffset })
      }
      // Start new segment with separator as first token
      current = [chars[i]]
      currentOffset = i
    } else {
      if (current.length === 0) currentOffset = i
      current.push(chars[i])
    }
  }

  if (current.length > 0) {
    segments.push({ tokens: current, offset: currentOffset })
  }

  return segments
}

export function analyzeWords(
  entries: WordEntry[],
  keyAssignments: Record<string, KeyAssignment>,
  shiftKeyAssignments: Record<string, KeyAssignment>,
  mouseAssignments: Record<string, string | null>,
  shiftMouseAssignments: Record<string, string | null>,
  flags: Record<FlagType, boolean>,
  sfsGap: number
): AnalysisResult {
  // Build unified char-to-keyCode map
  const charToKeyCode = new Map<string, string>()
  const mouseChars = new Set<string>()
  
  // shift layer keyboard first (lower priority)
  for (const [code, a] of Object.entries(shiftKeyAssignments)) {
    if (a.character !== null) charToKeyCode.set(a.character, code)
  }
  // shift layer mouse
  for (const [code, char] of Object.entries(shiftMouseAssignments)) {
    if (char !== null) {
      charToKeyCode.set(char, code)
      mouseChars.add(char)
    }
  }
  // main layer keyboard (higher priority)
  for (const [code, a] of Object.entries(keyAssignments)) {
    if (a.character !== null) charToKeyCode.set(a.character, code)
  }
  // main layer mouse (highest priority)
  for (const [code, char] of Object.entries(mouseAssignments)) {
    if (char !== null) {
      charToKeyCode.set(char, code)
      mouseChars.add(char)
    }
  }

  const keyToRow = new Map<string, number>()
  for (const key of KEYBOARD_LAYOUT) {
    keyToRow.set(key.code, key.row)
  }

  const fingerOf = (char: string): FingerEnum | null => {
    const code = charToKeyCode.get(char)
    if (!code) return null
    // Check main layer first
    if (keyAssignments[code]?.character === char) return keyAssignments[code].finger
    // Then shift layer
    return shiftKeyAssignments[code]?.finger ?? null
  }

  const rowOf = (char: string): number | null => {
    const keyCode = charToKeyCode.get(char)
    if (!keyCode) return null
    return keyToRow.get(keyCode) ?? null
  }

  const wordAnalysis: WordAnalysis[] = []
  const nodeBadness = new Map<string, number>()

  for (const entry of entries) {
    // Tokenize word (handles [BS], [SH] → [Home], _ → space)
    const chars = tokenizeWord(entry.text)

    // Check if every token is assigned to a key
    const isUntypable = chars.some(tok => !charToKeyCode.has(tok))

    // If overridden, skip detection
    if (entry.isOverridden) {
      wordAnalysis.push({
        id: entry.id,
        flaggedPatterns: [],
        isFlagged: false,
        isUntypable,
      })
      continue
    }

    // Split at separator tokens ([BS], [Home]) before running detectors
    const segments = splitAtSeparators(chars)

    // Run active detectors on each segment, offsetting charIndices
    const flaggedPatterns = []

    for (const { tokens: seg, offset } of segments) {
      const offsetPatterns = (patterns: ReturnType<typeof detectSFBs>) =>
        patterns.map(p => ({ ...p, charIndices: p.charIndices.map(i => i + offset) }))

      if (flags.sfb) {
        flaggedPatterns.push(...offsetPatterns(detectSFBs(seg, fingerOf)))
      }

      if (flags.sfs) {
        flaggedPatterns.push(...offsetPatterns(detectSFS(seg, fingerOf, sfsGap, mouseChars)))
      }

      if (flags.roll || flags.outward_roll || flags.inward_roll) {
        const rolls = detectRolls(seg, fingerOf)
        if (flags.roll || flags.outward_roll) {
          flaggedPatterns.push(...offsetPatterns(rolls.outward))
        }
        if (flags.roll || flags.inward_roll) {
          flaggedPatterns.push(...offsetPatterns(rolls.inward))
        }
      }

      if (flags.redirect) {
        flaggedPatterns.push(...offsetPatterns(detectRedirects(seg, fingerOf)))
      }

      if (flags.scissor) {
        flaggedPatterns.push(...offsetPatterns(detectScissors(seg, fingerOf, rowOf)))
      }
    }

    const isFlagged = flaggedPatterns.length > 0

    wordAnalysis.push({
      id: entry.id,
      flaggedPatterns,
      isFlagged,
      isUntypable,
    })

    // Accumulate badness for each character in flagged patterns
    if (isFlagged) {
      for (const pattern of flaggedPatterns) {
        for (const charIndex of pattern.charIndices) {
          const char = chars[charIndex]
          if (char) {
            nodeBadness.set(char, (nodeBadness.get(char) || 0) + 1)
          }
        }
      }
    }
  }

  return { wordAnalysis, nodeBadness }
}
