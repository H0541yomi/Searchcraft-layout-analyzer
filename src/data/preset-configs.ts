import type { FingerEnum, KeyAssignment, PhysicalKeyCode, ConfigData, SavedConfig } from '../types'
import { KEYBOARD_LAYOUT } from './keyboard-layout'
import { MOUSE_KEYS } from './mouse-layout'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyAssignments(): Record<PhysicalKeyCode, KeyAssignment> {
  return Object.fromEntries(KEYBOARD_LAYOUT.map(k => [k.code, { character: null, finger: null }]))
}

function emptyMouseAssignments(): Record<string, string | null> {
  return Object.fromEntries(MOUSE_KEYS.map(k => [k.code, null]))
}

// ─── Standard QWERTY fingering ────────────────────────────────────────────────
// Pinky: Tab/Caps/LShift/Ctrl/`/1/Q/A/Z
// Ring: 2/W/S/X  Middle: 3/E/D/C  Index: 4/5/R/T/F/G/V/B  Thumb: Space
// No ` char assigned anywhere.

const STANDARD_ENTRIES: Array<[PhysicalKeyCode, FingerEnum]> = [
  // L_PINKY
  ['Tab',         'L_PINKY'],
  ['CapsLock',    'L_PINKY'],
  ['ShiftLeft',   'L_PINKY'],
  ['ControlLeft', 'L_PINKY'],
  ['Backquote',   'L_RING'],
  ['Digit1',      'L_PINKY'],
  ['KeyQ',        'L_PINKY'],
  ['KeyA',        'L_PINKY'],
  ['KeyZ',        'L_PINKY'],
  // L_RING
  ['Digit2', 'L_RING'],
  ['KeyW',   'L_RING'],
  ['KeyS',   'L_RING'],
  ['KeyX',   'L_RING'],
  // L_MIDDLE
  ['Digit3', 'L_MIDDLE'],
  ['KeyE',   'L_MIDDLE'],
  ['KeyD',   'L_MIDDLE'],
  ['KeyC',   'L_MIDDLE'],
  // L_INDEX
  ['Digit4', 'L_INDEX'],
  ['Digit5', 'L_INDEX'],
  ['KeyR',   'L_INDEX'],
  ['KeyT',   'L_INDEX'],
  ['KeyF',   'L_INDEX'],
  ['KeyG',   'L_INDEX'],
  ['KeyV',   'L_INDEX'],
  ['KeyB',   'L_INDEX'],
  // L_THUMB
  ['Space',  'L_THUMB'],
]

// ─── WASD fingering ───────────────────────────────────────────────────────────
// Pinky: Ctrl only.  Ring: 1/2/Tab/Q/Caps/A/LShift/Z (no Backquote, no MetaLeft, no AltLeft)
// Middle: 3/W/S/X   Index: 4/5/E/R/T/D/F/G/C/V/B (col 3–5 only, nothing past T/G/B)
// Thumb: Space.  Fn keys, col 6+, MetaLeft, AltLeft all UNASSIGNED.

const WASD_ENTRIES: Array<[PhysicalKeyCode, FingerEnum]> = [
  // L_PINKY
  ['ControlLeft', 'L_PINKY'],
  // L_RING
  ['Digit1',    'L_RING'],
  ['Digit2',    'L_RING'],
  ['Tab',       'L_RING'],
  ['KeyQ',      'L_RING'],
  ['CapsLock',  'L_RING'],
  ['KeyA',      'L_RING'],
  ['ShiftLeft', 'L_RING'],
  ['KeyZ',      'L_RING'],
  // L_MIDDLE
  ['Digit3', 'L_MIDDLE'],
  ['KeyW',   'L_MIDDLE'],
  ['KeyS',   'L_MIDDLE'],
  ['KeyX',   'L_MIDDLE'],
  // L_INDEX  (col 3–5: E/R/T, D/F/G, C/V/B, Digit4/5)
  ['Digit4', 'L_INDEX'],
  ['Digit5', 'L_INDEX'],
  ['KeyE',   'L_INDEX'],
  ['KeyR',   'L_INDEX'],
  ['KeyT',   'L_INDEX'],
  ['KeyD',   'L_INDEX'],
  ['KeyF',   'L_INDEX'],
  ['KeyG',   'L_INDEX'],
  ['KeyC',   'L_INDEX'],
  ['KeyV',   'L_INDEX'],
  ['KeyB',   'L_INDEX'],
  // L_THUMB
  ['Space',  'L_THUMB'],
]

// ─── QWERTY char assignments (no ` char) ─────────────────────────────────────

const QWERTY_CHARS: Array<[PhysicalKeyCode, string]> = [
  ['Digit1', '1'], ['KeyQ', 'q'], ['KeyA', 'a'], ['KeyZ', 'z'],
  ['Digit2', '2'], ['KeyW', 'w'], ['KeyS', 's'], ['KeyX', 'x'],
  ['Digit3', '3'], ['KeyE', 'e'], ['KeyD', 'd'], ['KeyC', 'c'],
  ['Digit4', '4'], ['Digit5', '5'],
  ['KeyR', 'r'], ['KeyT', 't'], ['KeyF', 'f'], ['KeyG', 'g'],
  ['KeyV', 'v'], ['KeyB', 'b'],
  ['Space', ' '],
]

// ─── Build ConfigData ─────────────────────────────────────────────────────────

function buildConfig(
  fingerEntries: Array<[PhysicalKeyCode, FingerEnum]>,
  charEntries: Array<[PhysicalKeyCode, string]>
): ConfigData {
  const base = emptyAssignments()

  // Apply finger assignments
  for (const [code, finger] of fingerEntries) {
    if (base[code] !== undefined) base[code] = { character: null, finger }
  }

  // Apply char assignments (on top of fingers)
  for (const [code, char] of charEntries) {
    if (base[code] !== undefined) {
      base[code] = { ...base[code], character: char }
    }
  }

  // Mirror finger assignments to shift layer (same fingers, no chars)
  const shiftBase: Record<PhysicalKeyCode, KeyAssignment> = Object.fromEntries(
    Object.entries(base).map(([code, a]) => [code, { character: null, finger: a.finger }])
  )

  return {
    keyAssignments: base,
    shiftKeyAssignments: shiftBase,
    mouseAssignments: emptyMouseAssignments(),
    shiftMouseAssignments: emptyMouseAssignments(),
  }
}

// ─── Presets ──────────────────────────────────────────────────────────────────

export const PRESET_CONFIGS: SavedConfig[] = [
  {
    id: 'preset-qwerty-standard',
    name: 'QWERTY – Standard',
    data: buildConfig(STANDARD_ENTRIES, QWERTY_CHARS),
  },
  {
    id: 'preset-qwerty-wasd',
    name: 'QWERTY – WASD',
    data: buildConfig(WASD_ENTRIES, QWERTY_CHARS),
  },
  {
    id: 'preset-blank-standard',
    name: 'Blank – Standard',
    data: buildConfig(STANDARD_ENTRIES, []),
  },
  {
    id: 'preset-blank-wasd',
    name: 'Blank – WASD',
    data: buildConfig(WASD_ENTRIES, []),
  },
]
