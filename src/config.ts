export const KEY_UNIT_PX = 44
export const KEY_GAP_PX = 3

export const CONFIG = {
  NODE_SIZE_FLOOR: 0.15,
  NODE_SIZE_MAX: 1.0,
  EDGE_OPACITY_FLOOR: 0.15,
  EDGE_OPACITY_MAX: 0.70,
  EDGE_WEIGHT_THRESHOLD: 2,
  BADNESS_TINT_FLOOR: 0.05,
  BADNESS_TINT_MAX: 0.22,
  DEBOUNCE_MS: 300,
  SFS_GAP_DEFAULT: 1,
  SFS_GAP_MIN: 1,
  SFS_GAP_MAX: 5,
} as const

export const FINGER_COLORS: Record<string, string> = {
  L_PINKY:    '#E8A87C',
  L_RING:     '#D4C36A',
  L_MIDDLE:   '#7BA7C9',
  L_INDEX:    '#7CB98F',
  L_THUMB:    '#A388BF',
  UNASSIGNED: '#D4D4D4',
}

export const FINGER_HEIGHT: Partial<Record<string, number>> = {
  L_MIDDLE: 3,
  L_RING:   2,
  L_PINKY:  1,
  L_INDEX:  0,
}

export const FINGER_LATERAL_ORDER: Record<string, number> = {
  L_PINKY:  0,
  L_RING:   1,
  L_MIDDLE: 2,
  L_INDEX:  3,
  L_THUMB:  4,
}

export const ROWS = {
  FN_ROW:     -1,
  NUMBER_ROW:  0,
  TOP_ALPHA:   1,
  HOME_ROW:    2,
  BOTTOM_ROW:  3,
  BOTTOM_MOD:  4,
} as const
