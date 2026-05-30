import type { WordEntry, KeyAssignment, FlagType, WordAnalysis, FingerEnum } from '../types'
import { detectSFBs, detectSFS, detectRolls, detectRedirects, detectScissors } from './detection'
import { KEYBOARD_LAYOUT } from '../data/keyboard-layout'

export interface AnalysisResult {
  wordAnalysis: WordAnalysis[]
  nodeBadness: Map<string, number>
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
    // If overridden, skip detection
    if (entry.isOverridden) {
      wordAnalysis.push({
        id: entry.id,
        flaggedPatterns: [],
        isFlagged: false,
      })
      continue
    }

    // Split into individual characters
    const chars = entry.text.split('')

    // Run active detectors
    const flaggedPatterns = []

    if (flags.sfb) {
      flaggedPatterns.push(...detectSFBs(chars, fingerOf))
    }

    if (flags.sfs) {
      flaggedPatterns.push(...detectSFS(chars, fingerOf, sfsGap, mouseChars))
    }

    if (flags.roll || flags.outward_roll || flags.inward_roll) {
      const rolls = detectRolls(chars, fingerOf)
      if (flags.roll || flags.outward_roll) {
        flaggedPatterns.push(...rolls.outward)
      }
      if (flags.roll || flags.inward_roll) {
        flaggedPatterns.push(...rolls.inward)
      }
    }

    if (flags.redirect) {
      flaggedPatterns.push(...detectRedirects(chars, fingerOf))
    }

    if (flags.scissor) {
      flaggedPatterns.push(...detectScissors(chars, fingerOf, rowOf))
    }

    const isFlagged = flaggedPatterns.length > 0

    wordAnalysis.push({
      id: entry.id,
      flaggedPatterns,
      isFlagged,
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
