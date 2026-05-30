import type { FlaggedPattern, FingerEnum } from '../types'
import { FINGER_LATERAL_ORDER, FINGER_HEIGHT } from '../config'

type FingerOf = (char: string) => FingerEnum | null
type RowOf = (char: string) => number | null

export function detectSFBs(chars: string[], fingerOf: FingerOf): FlaggedPattern[] {
  const patterns: FlaggedPattern[] = []

  for (let i = 0; i < chars.length - 1; i++) {
    const finger1 = fingerOf(chars[i])
    const finger2 = fingerOf(chars[i + 1])

    if (finger1 && finger2 && finger1 === finger2) {
      patterns.push({
        type: 'sfb',
        charIndices: [i, i + 1],
      })
    }
  }

  return patterns
}

export function detectSFS(
  chars: string[],
  fingerOf: FingerOf,
  gap: number,
  mouseChars: ReadonlySet<string> = new Set()
): FlaggedPattern[] {
  const patterns: FlaggedPattern[] = []

  for (let i = 0; i <= chars.length - gap - 2; i++) {
    const endIndex = i + gap + 1

    // Check endpoints
    const finger1 = fingerOf(chars[i])
    const finger2 = fingerOf(chars[endIndex])
    if (!finger1 || !finger2) continue

    // Check intervening chars: mouse chars are transparent
    let broken = false
    for (let j = i + 1; j < endIndex; j++) {
      if (!fingerOf(chars[j]) && !mouseChars.has(chars[j])) {
        broken = true
        break
      }
    }
    if (broken) continue

    if (finger1 === finger2) {
      patterns.push({
        type: 'sfs',
        charIndices: [i, endIndex],
      })
    }
  }

  return patterns
}

export function detectRolls(
  chars: string[],
  fingerOf: FingerOf
): { outward: FlaggedPattern[]; inward: FlaggedPattern[] } {
  const outward: FlaggedPattern[] = []
  const inward: FlaggedPattern[] = []

  // Find maximal sequences where all chars have finger assignments
  let segmentStart = 0
  while (segmentStart < chars.length) {
    // Skip chars without fingers
    while (segmentStart < chars.length && !fingerOf(chars[segmentStart])) {
      segmentStart++
    }

    if (segmentStart >= chars.length) break

    // Find end of segment (all chars with fingers)
    let segmentEnd = segmentStart
    while (segmentEnd < chars.length && fingerOf(chars[segmentEnd])) {
      segmentEnd++
    }

    // Process segment [segmentStart, segmentEnd)
    const segment = chars.slice(segmentStart, segmentEnd)
    const fingers = segment.map(c => fingerOf(c)!)

    // Find maximal roll sequences within this segment
    let rollStart = 0
    while (rollStart < segment.length) {
      // Find end of roll (consecutive different fingers)
      let rollEnd = rollStart + 1
      while (
        rollEnd < segment.length &&
        fingers[rollEnd] !== fingers[rollEnd - 1]
      ) {
        rollEnd++
      }

      // If we have ≥2 chars with all different consecutive fingers, check direction
      if (rollEnd - rollStart >= 2) {
        const lateralOrders = fingers
          .slice(rollStart, rollEnd)
          .map(f => FINGER_LATERAL_ORDER[f])

        let allIncreasing = true
        let allDecreasing = true

        for (let i = 0; i < lateralOrders.length - 1; i++) {
          if (lateralOrders[i + 1] <= lateralOrders[i]) allIncreasing = false
          if (lateralOrders[i + 1] >= lateralOrders[i]) allDecreasing = false
        }

        const globalIndices = Array.from(
          { length: rollEnd - rollStart },
          (_, i) => segmentStart + rollStart + i
        )

        if (allIncreasing) {
          inward.push({
            type: 'inward_roll',
            charIndices: globalIndices,
          })
        } else if (allDecreasing) {
          outward.push({
            type: 'outward_roll',
            charIndices: globalIndices,
          })
        }
      }

      rollStart = rollEnd
    }

    segmentStart = segmentEnd
  }

  return { outward, inward }
}

export function detectRedirects(chars: string[], fingerOf: FingerOf): FlaggedPattern[] {
  const patterns: FlaggedPattern[] = []

  // Find maximal sequences where all chars have finger assignments
  let segmentStart = 0
  while (segmentStart < chars.length) {
    // Skip chars without fingers
    while (segmentStart < chars.length && !fingerOf(chars[segmentStart])) {
      segmentStart++
    }

    if (segmentStart >= chars.length) break

    // Find end of segment
    let segmentEnd = segmentStart
    while (segmentEnd < chars.length && fingerOf(chars[segmentEnd])) {
      segmentEnd++
    }

    // Process segment
    if (segmentEnd - segmentStart >= 3) {
      const segment = chars.slice(segmentStart, segmentEnd)
      const fingers = segment.map(c => fingerOf(c)!)
      const lateralOrders = fingers.map(f => FINGER_LATERAL_ORDER[f])

      // Find direction changes
      const directions: number[] = []
      for (let i = 0; i < lateralOrders.length - 1; i++) {
        const diff = lateralOrders[i + 1] - lateralOrders[i]
        if (diff !== 0) {
          directions.push(Math.sign(diff))
        }
      }

      // Check if there's a direction change
      if (directions.length >= 2) {
        let hasChange = false
        for (let i = 0; i < directions.length - 1; i++) {
          if (directions[i] !== directions[i + 1]) {
            hasChange = true
            break
          }
        }

        if (hasChange) {
          // Flag the entire segment as a redirect
          const globalIndices = Array.from(
            { length: segmentEnd - segmentStart },
            (_, i) => segmentStart + i
          )
          patterns.push({
            type: 'redirect',
            charIndices: globalIndices,
          })
        }
      }
    }

    segmentStart = segmentEnd
  }

  return patterns
}

export function detectScissors(
  chars: string[],
  fingerOf: FingerOf,
  rowOf: RowOf
): FlaggedPattern[] {
  const patterns: FlaggedPattern[] = []

  for (let i = 0; i < chars.length - 1; i++) {
    const finger1 = fingerOf(chars[i])
    const finger2 = fingerOf(chars[i + 1])

    // Both must have fingers, neither can be thumb
    if (!finger1 || !finger2 || finger1 === 'L_THUMB' || finger2 === 'L_THUMB') {
      continue
    }

    const row1 = rowOf(chars[i])
    const row2 = rowOf(chars[i + 1])

    if (row1 === null || row2 === null) continue

    const rowDiff = Math.abs(row1 - row2)
    if (rowDiff < 2) continue

    // Get height values (both must be in FINGER_HEIGHT)
    const height1 = FINGER_HEIGHT[finger1]
    const height2 = FINGER_HEIGHT[finger2]

    if (height1 === undefined || height2 === undefined) continue

    // Scissor: finger with LOWER height value is on HIGHER row (smaller row number)
    // Higher row = smaller row number (fn row = -1 is highest)
    const finger1OnHigherRow = row1 < row2
    const finger1HasLowerHeight = height1 < height2

    if (finger1OnHigherRow === finger1HasLowerHeight) {
      patterns.push({
        type: 'scissor',
        charIndices: [i, i + 1],
      })
    }
  }

  return patterns
}
