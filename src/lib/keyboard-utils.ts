import { KEYBOARD_LAYOUT, KEYBOARD_ROWS } from '../data/keyboard-layout'
import { KEY_UNIT_PX, KEY_GAP_PX } from '../config'

export interface KeyPixelInfo {
  x: number      // top-left x within keyboard container
  y: number      // top-left y within keyboard container
  width: number  // pixel width
  height: number // pixel height (always KEY_UNIT_PX)
  centerX: number
  centerY: number
}

// Build map of keyCode → pixel info (computed once from layout data)
export function buildKeyPixelMap(): Map<string, KeyPixelInfo> {
  const map = new Map<string, KeyPixelInfo>()
  const ROW_ORDER: Record<string, number> = { '-1': 0, '0': 1, '1': 2, '2': 3, '3': 4, '4': 5 }
  
  for (const row of KEYBOARD_ROWS) {
    let xCursor = 0
    const rowIndex = ROW_ORDER[String(row[0].row)]
    const y = rowIndex * (KEY_UNIT_PX + KEY_GAP_PX)
    
    for (const key of row) {
      const width = key.width * KEY_UNIT_PX
      const height = KEY_UNIT_PX
      map.set(key.code, {
        x: xCursor, y, width, height,
        centerX: xCursor + width / 2,
        centerY: y + height / 2,
      })
      xCursor += width + KEY_GAP_PX
    }
  }
  return map
}

// Total keyboard pixel dimensions
export function getKeyboardDimensions(): { width: number; height: number } {
  let maxWidth = 0
  for (const row of KEYBOARD_ROWS) {
    let rowWidth = 0
    for (const key of row) {
      rowWidth += key.width * KEY_UNIT_PX + KEY_GAP_PX
    }
    rowWidth -= KEY_GAP_PX // no trailing gap
    maxWidth = Math.max(maxWidth, rowWidth)
  }
  const height = 6 * (KEY_UNIT_PX + KEY_GAP_PX) - KEY_GAP_PX
  return { width: maxWidth, height }
}

// Get finger cycling order: null → L_PINKY → L_RING → L_MIDDLE → L_INDEX → L_THUMB → null
export function cycleFingerForward(current: string | null): string | null {
  const order: Array<string | null> = [null, 'L_PINKY', 'L_RING', 'L_MIDDLE', 'L_INDEX', 'L_THUMB']
  const currentIndex = order.indexOf(current)
  const nextIndex = (currentIndex + 1) % order.length
  return order[nextIndex]
}

// Re-export for convenience
export { KEYBOARD_LAYOUT as ALL_KEYS }
