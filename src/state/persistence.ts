import type { AppState, FlagType } from '../types'
import { DEFAULT_ASSIGNMENTS } from '../data/default-assignments'
import { KEYBOARD_LAYOUT } from '../data/keyboard-layout'
import { MOUSE_KEYS } from '../data/mouse-layout'
import { CONFIG } from '../config'

const KEYS = {
  assignments: 'skp-key-assignments',
  shiftAssignments: 'skp-shift-key-assignments',
  mouseAssignments: 'skp-mouse-assignments',
  shiftMouseAssignments: 'skp-shift-mouse-assignments',
  wordList: 'skp-word-list',
  flags: 'skp-flags',
  sfsGap: 'skp-sfs-gap',
  showShiftLayer: 'skp-show-shift-layer',
  showArrows: 'skp-show-arrows',
  showNodes: 'skp-show-nodes',
  showBadness: 'skp-show-badness',
} as const

export function getDefaultState(): AppState {
  const emptyAssignments = Object.fromEntries(
    KEYBOARD_LAYOUT.map(k => [k.code, { character: null, finger: null }])
  )
  
  return {
    keyAssignments: { ...DEFAULT_ASSIGNMENTS },
    shiftKeyAssignments: emptyAssignments,
    mouseAssignments: Object.fromEntries(MOUSE_KEYS.map(k => [k.code, null])),
    shiftMouseAssignments: Object.fromEntries(MOUSE_KEYS.map(k => [k.code, null])),
    wordEntries: [],
    flags: {
      roll: false,
      outward_roll: false,
      inward_roll: false,
      redirect: true,
      sfb: true,
      sfs: true,
      scissor: true,
    } satisfies Record<FlagType, boolean>,
    sfsGap: CONFIG.SFS_GAP_DEFAULT,
    showShiftLayer: false,
    showArrows: true,
    showNodes: true,
    showBadness: true,
  }
}

export function loadState(): AppState {
  const defaults = getDefaultState()

  try {
    const assignmentsRaw = localStorage.getItem(KEYS.assignments)
    const shiftAssignmentsRaw = localStorage.getItem(KEYS.shiftAssignments)
    const mouseAssignmentsRaw = localStorage.getItem(KEYS.mouseAssignments)
    const shiftMouseAssignmentsRaw = localStorage.getItem(KEYS.shiftMouseAssignments)
    const wordListRaw = localStorage.getItem(KEYS.wordList)
    const flagsRaw = localStorage.getItem(KEYS.flags)
    const sfsGapRaw = localStorage.getItem(KEYS.sfsGap)
    const showShiftLayerRaw = localStorage.getItem(KEYS.showShiftLayer)
    const showArrowsRaw = localStorage.getItem(KEYS.showArrows)
    const showNodesRaw = localStorage.getItem(KEYS.showNodes)
    const showBadnessRaw = localStorage.getItem(KEYS.showBadness)

    const keyAssignments = assignmentsRaw
      ? JSON.parse(assignmentsRaw)
      : defaults.keyAssignments

    const shiftKeyAssignments = shiftAssignmentsRaw
      ? JSON.parse(shiftAssignmentsRaw)
      : defaults.shiftKeyAssignments

    const mouseAssignments = mouseAssignmentsRaw
      ? JSON.parse(mouseAssignmentsRaw)
      : defaults.mouseAssignments

    const shiftMouseAssignments = shiftMouseAssignmentsRaw
      ? JSON.parse(shiftMouseAssignmentsRaw)
      : defaults.shiftMouseAssignments

    const wordEntries = wordListRaw
      ? JSON.parse(wordListRaw)
      : defaults.wordEntries

    const flags = flagsRaw
      ? JSON.parse(flagsRaw)
      : defaults.flags

    const sfsGap = sfsGapRaw
      ? JSON.parse(sfsGapRaw)
      : defaults.sfsGap

    const showShiftLayer = showShiftLayerRaw
      ? JSON.parse(showShiftLayerRaw)
      : defaults.showShiftLayer

    const showArrows = showArrowsRaw
      ? JSON.parse(showArrowsRaw)
      : defaults.showArrows

    const showNodes = showNodesRaw
      ? JSON.parse(showNodesRaw)
      : defaults.showNodes

    const showBadness = showBadnessRaw
      ? JSON.parse(showBadnessRaw)
      : defaults.showBadness

    return {
      keyAssignments,
      shiftKeyAssignments,
      mouseAssignments,
      shiftMouseAssignments,
      wordEntries,
      flags,
      sfsGap,
      showShiftLayer,
      showArrows,
      showNodes,
      showBadness,
    }
  } catch (error) {
    console.warn('Failed to parse LocalStorage, using defaults:', error)
    return defaults
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEYS.assignments, JSON.stringify(state.keyAssignments))
    localStorage.setItem(KEYS.shiftAssignments, JSON.stringify(state.shiftKeyAssignments))
    localStorage.setItem(KEYS.mouseAssignments, JSON.stringify(state.mouseAssignments))
    localStorage.setItem(KEYS.shiftMouseAssignments, JSON.stringify(state.shiftMouseAssignments))
    localStorage.setItem(KEYS.wordList, JSON.stringify(state.wordEntries))
    localStorage.setItem(KEYS.flags, JSON.stringify(state.flags))
    localStorage.setItem(KEYS.sfsGap, JSON.stringify(state.sfsGap))
    localStorage.setItem(KEYS.showShiftLayer, JSON.stringify(state.showShiftLayer))
    localStorage.setItem(KEYS.showArrows, JSON.stringify(state.showArrows))
    localStorage.setItem(KEYS.showNodes, JSON.stringify(state.showNodes))
    localStorage.setItem(KEYS.showBadness, JSON.stringify(state.showBadness))
  } catch (error) {
    console.error('Failed to save state to LocalStorage:', error)
  }
}
