import type { FingerEnum, KeyAssignment, PhysicalKeyCode } from '../types'
import { KEYBOARD_LAYOUT } from './keyboard-layout'

const leftHand: Array<[PhysicalKeyCode, FingerEnum, string]> = [
  // L_PINKY
  ['Backquote', 'L_PINKY', '`'],
  ['Digit1', 'L_PINKY', '1'],
  ['KeyQ', 'L_PINKY', 'q'],
  ['KeyA', 'L_PINKY', 'a'],
  ['KeyZ', 'L_PINKY', 'z'],
  // L_RING
  ['Digit2', 'L_RING', '2'],
  ['KeyW', 'L_RING', 'w'],
  ['KeyS', 'L_RING', 's'],
  ['KeyX', 'L_RING', 'x'],
  // L_MIDDLE
  ['Digit3', 'L_MIDDLE', '3'],
  ['KeyE', 'L_MIDDLE', 'e'],
  ['KeyD', 'L_MIDDLE', 'd'],
  ['KeyC', 'L_MIDDLE', 'c'],
  // L_INDEX
  ['Digit4', 'L_INDEX', '4'],
  ['Digit5', 'L_INDEX', '5'],
  ['KeyR', 'L_INDEX', 'r'],
  ['KeyT', 'L_INDEX', 't'],
  ['KeyF', 'L_INDEX', 'f'],
  ['KeyG', 'L_INDEX', 'g'],
  ['KeyV', 'L_INDEX', 'v'],
  ['KeyB', 'L_INDEX', 'b'],
  // L_THUMB
  ['Space', 'L_THUMB', ' '],
]

const base: Record<PhysicalKeyCode, KeyAssignment> = Object.fromEntries(
  KEYBOARD_LAYOUT.map(k => [k.code, { character: null, finger: null }])
)

for (const [code, finger, character] of leftHand) {
  base[code] = { character, finger }
}

export const DEFAULT_ASSIGNMENTS: Record<PhysicalKeyCode, KeyAssignment> = base
