import type { PhysicalKeyDef } from '../types'

export const KEYBOARD_LAYOUT: PhysicalKeyDef[] = [
  // Row -1: Function keys
  { code: 'Escape', label: 'Esc', row: -1, column: 0, width: 1.0 },
  { code: 'F1', label: 'F1', row: -1, column: 1, width: 1.0 },
  { code: 'F2', label: 'F2', row: -1, column: 2, width: 1.0 },
  { code: 'F3', label: 'F3', row: -1, column: 3, width: 1.0 },
  { code: 'F4', label: 'F4', row: -1, column: 4, width: 1.0 },
  { code: 'F5', label: 'F5', row: -1, column: 5, width: 1.0 },
  { code: 'F6', label: 'F6', row: -1, column: 6, width: 1.0 },
  { code: 'F7', label: 'F7', row: -1, column: 7, width: 1.0 },
  { code: 'F8', label: 'F8', row: -1, column: 8, width: 1.0 },
  { code: 'F9', label: 'F9', row: -1, column: 9, width: 1.0 },
  { code: 'F10', label: 'F10', row: -1, column: 10, width: 1.0 },
  { code: 'F11', label: 'F11', row: -1, column: 11, width: 1.0 },
  { code: 'F12', label: 'F12', row: -1, column: 12, width: 1.0 },

  // Row 0: Number row
  { code: 'Backquote', label: '`', row: 0, column: 0, width: 1.0 },
  { code: 'Digit1', label: '1', row: 0, column: 1, width: 1.0 },
  { code: 'Digit2', label: '2', row: 0, column: 2, width: 1.0 },
  { code: 'Digit3', label: '3', row: 0, column: 3, width: 1.0 },
  { code: 'Digit4', label: '4', row: 0, column: 4, width: 1.0 },
  { code: 'Digit5', label: '5', row: 0, column: 5, width: 1.0 },
  { code: 'Digit6', label: '6', row: 0, column: 6, width: 1.0 },
  { code: 'Digit7', label: '7', row: 0, column: 7, width: 1.0 },
  { code: 'Digit8', label: '8', row: 0, column: 8, width: 1.0 },
  { code: 'Digit9', label: '9', row: 0, column: 9, width: 1.0 },
  { code: 'Digit0', label: '0', row: 0, column: 10, width: 1.0 },
  { code: 'Minus', label: '-', row: 0, column: 11, width: 1.0 },
  { code: 'Equal', label: '=', row: 0, column: 12, width: 1.0 },
  { code: 'Backspace', label: '⌫', row: 0, column: 13, width: 2.0 },

  // Row 1: Top alpha row (QWERTY)
  { code: 'Tab', label: 'Tab', row: 1, column: 0, width: 1.5 },
  { code: 'KeyQ', label: 'Q', row: 1, column: 1, width: 1.0 },
  { code: 'KeyW', label: 'W', row: 1, column: 2, width: 1.0 },
  { code: 'KeyE', label: 'E', row: 1, column: 3, width: 1.0 },
  { code: 'KeyR', label: 'R', row: 1, column: 4, width: 1.0 },
  { code: 'KeyT', label: 'T', row: 1, column: 5, width: 1.0 },
  { code: 'KeyY', label: 'Y', row: 1, column: 6, width: 1.0 },
  { code: 'KeyU', label: 'U', row: 1, column: 7, width: 1.0 },
  { code: 'KeyI', label: 'I', row: 1, column: 8, width: 1.0 },
  { code: 'KeyO', label: 'O', row: 1, column: 9, width: 1.0 },
  { code: 'KeyP', label: 'P', row: 1, column: 10, width: 1.0 },
  { code: 'BracketLeft', label: '[', row: 1, column: 11, width: 1.0 },
  { code: 'BracketRight', label: ']', row: 1, column: 12, width: 1.0 },
  { code: 'Backslash', label: '\\', row: 1, column: 13, width: 1.5 },

  // Row 2: Home row (ASDFGH)
  { code: 'CapsLock', label: 'Caps', row: 2, column: 0, width: 1.75 },
  { code: 'KeyA', label: 'A', row: 2, column: 1, width: 1.0 },
  { code: 'KeyS', label: 'S', row: 2, column: 2, width: 1.0 },
  { code: 'KeyD', label: 'D', row: 2, column: 3, width: 1.0 },
  { code: 'KeyF', label: 'F', row: 2, column: 4, width: 1.0 },
  { code: 'KeyG', label: 'G', row: 2, column: 5, width: 1.0 },
  { code: 'KeyH', label: 'H', row: 2, column: 6, width: 1.0 },
  { code: 'KeyJ', label: 'J', row: 2, column: 7, width: 1.0 },
  { code: 'KeyK', label: 'K', row: 2, column: 8, width: 1.0 },
  { code: 'KeyL', label: 'L', row: 2, column: 9, width: 1.0 },
  { code: 'Semicolon', label: ';', row: 2, column: 10, width: 1.0 },
  { code: 'Quote', label: "'", row: 2, column: 11, width: 1.0 },
  { code: 'Enter', label: '↵', row: 2, column: 12, width: 2.25 },

  // Row 3: Bottom alpha row (ZXCVBN)
  { code: 'ShiftLeft', label: '⇧', row: 3, column: 0, width: 2.25 },
  { code: 'KeyZ', label: 'Z', row: 3, column: 1, width: 1.0 },
  { code: 'KeyX', label: 'X', row: 3, column: 2, width: 1.0 },
  { code: 'KeyC', label: 'C', row: 3, column: 3, width: 1.0 },
  { code: 'KeyV', label: 'V', row: 3, column: 4, width: 1.0 },
  { code: 'KeyB', label: 'B', row: 3, column: 5, width: 1.0 },
  { code: 'KeyN', label: 'N', row: 3, column: 6, width: 1.0 },
  { code: 'KeyM', label: 'M', row: 3, column: 7, width: 1.0 },
  { code: 'Comma', label: ',', row: 3, column: 8, width: 1.0 },
  { code: 'Period', label: '.', row: 3, column: 9, width: 1.0 },
  { code: 'Slash', label: '/', row: 3, column: 10, width: 1.0 },
  { code: 'ShiftRight', label: '⇧', row: 3, column: 11, width: 2.75 },

  // Row 4: Modifier row (Windows layout: 3 left of space, 4 right)
  { code: 'ControlLeft',  label: 'Ctrl', row: 4, column: 0, width: 1.25 },
  { code: 'MetaLeft',     label: 'Win',  row: 4, column: 1, width: 1.25 },
  { code: 'AltLeft',      label: 'Alt',  row: 4, column: 2, width: 1.25 },
  { code: 'Space',        label: 'Space',row: 4, column: 3, width: 6.25 },
  { code: 'AltRight',     label: 'Alt',  row: 4, column: 4, width: 1.25 },
  { code: 'MetaRight',    label: 'Win',  row: 4, column: 5, width: 1.25 },
  { code: 'ContextMenu',  label: 'Menu', row: 4, column: 6, width: 1.25 },
  { code: 'ControlRight', label: 'Ctrl', row: 4, column: 7, width: 1.25 },
]

export const KEYS_BY_CODE: Record<string, PhysicalKeyDef> = Object.fromEntries(
  KEYBOARD_LAYOUT.map(k => [k.code, k])
)

export const KEYBOARD_ROWS: PhysicalKeyDef[][] = [-1, 0, 1, 2, 3, 4].map(
  row => KEYBOARD_LAYOUT.filter(k => k.row === row)
)
