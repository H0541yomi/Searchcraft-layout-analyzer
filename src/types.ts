export type FingerEnum = 'L_PINKY' | 'L_RING' | 'L_MIDDLE' | 'L_INDEX' | 'L_THUMB'
export type FlagType = 'roll' | 'outward_roll' | 'inward_roll' | 'redirect' | 'sfb' | 'sfs' | 'scissor'
export type PhysicalKeyCode = string

export interface KeyAssignment {
  character: string | null
  finger: FingerEnum | null
}

export interface WordEntry {
  id: string
  text: string
  isOverridden: boolean
}

export interface GraphNode {
  character: string
  frequency: number
  badnessWeight: number
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
}

export interface FlaggedPattern {
  type: FlagType
  charIndices: number[]
}

export interface WordAnalysis {
  id: string
  flaggedPatterns: FlaggedPattern[]
  isFlagged: boolean
}

export interface PhysicalKeyDef {
  code: PhysicalKeyCode
  label: string
  row: number
  column: number
  width: number
}

export interface AppState {
  keyAssignments: Record<PhysicalKeyCode, KeyAssignment>
  shiftKeyAssignments: Record<PhysicalKeyCode, KeyAssignment>
  mouseAssignments: Record<string, string | null>
  shiftMouseAssignments: Record<string, string | null>
  wordEntries: WordEntry[]
  flags: Record<FlagType, boolean>
  sfsGap: number
  showShiftLayer: boolean
  showArrows: boolean
}

export type AppAction =
  | { type: 'SET_FINGER'; keyCode: PhysicalKeyCode; finger: FingerEnum | null }
  | { type: 'SET_CHARACTER'; keyCode: PhysicalKeyCode; character: string | null }
  | { type: 'SET_SHIFT_FINGER'; keyCode: PhysicalKeyCode; finger: FingerEnum | null }
  | { type: 'SET_SHIFT_CHARACTER'; keyCode: PhysicalKeyCode; character: string | null }
  | { type: 'SET_MOUSE_CHARACTER'; keyCode: string; character: string | null; layer: 'main' | 'shift' }
  | { type: 'SET_WORD_LIST'; rawText: string }
  | { type: 'TOGGLE_FLAG'; flag: FlagType }
  | { type: 'SET_SFS_GAP'; gap: number }
  | { type: 'TOGGLE_OVERRIDE'; id: string }
  | { type: 'RESET_DEFAULTS' }
  | { type: 'RESET_SHIFT_DEFAULTS' }
  | { type: 'TOGGLE_SHIFT_LAYER' }
  | { type: 'TOGGLE_SHOW_ARROWS' }
  | { type: 'SWAP_CHARACTERS'; keyCodeA: PhysicalKeyCode; keyCodeB: PhysicalKeyCode }
  | { type: 'SWAP_SHIFT_CHARACTERS'; keyCodeA: PhysicalKeyCode; keyCodeB: PhysicalKeyCode }
