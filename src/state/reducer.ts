import type { AppState, AppAction } from '../types'
import { getDefaultState } from './persistence'
import { CONFIG } from '../config'
import { isValidKeyChar, normalizeLine } from '../lib/tokenizer'

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FINGER': {
      return {
        ...state,
        keyAssignments: {
          ...state.keyAssignments,
          [action.keyCode]: {
            ...state.keyAssignments[action.keyCode],
            finger: action.finger,
          },
        },
      }
    }

    case 'SET_SHIFT_FINGER': {
      return {
        ...state,
        shiftKeyAssignments: {
          ...state.shiftKeyAssignments,
          [action.keyCode]: {
            ...state.shiftKeyAssignments[action.keyCode],
            finger: action.finger,
          },
        },
      }
    }

    case 'SET_CHARACTER': {
      const { keyCode, character } = action

      // Validate character
      if (character !== null && !isValidKeyChar(character)) {
        return state
      }

      // Capture old character for swap
      const oldCharacter = state.keyAssignments[keyCode]?.character ?? null

      // Swap character from any other key that had it
      const newAssignments = { ...state.keyAssignments }
      if (character !== null) {
        for (const code in newAssignments) {
          if (code !== keyCode && newAssignments[code].character === character) {
            newAssignments[code] = {
              ...newAssignments[code],
              character: oldCharacter,
            }
          }
        }
      }

      // Set character on target key
      newAssignments[keyCode] = {
        ...newAssignments[keyCode],
        character,
      }

      return {
        ...state,
        keyAssignments: newAssignments,
      }
    }

    case 'SET_SHIFT_CHARACTER': {
      const { keyCode, character } = action

      // Validate character
      if (character !== null && !isValidKeyChar(character)) {
        return state
      }

      // Capture old character for swap
      const oldCharacter = state.shiftKeyAssignments[keyCode]?.character ?? null

      // Swap character from any other key in shift layer
      const newAssignments = { ...state.shiftKeyAssignments }
      if (character !== null) {
        for (const code in newAssignments) {
          if (code !== keyCode && newAssignments[code].character === character) {
            newAssignments[code] = {
              ...newAssignments[code],
              character: oldCharacter,
            }
          }
        }
      }

      // Set character on target key
      newAssignments[keyCode] = {
        ...newAssignments[keyCode],
        character,
      }

      return {
        ...state,
        shiftKeyAssignments: newAssignments,
      }
    }

    case 'SET_WORD_LIST': {
      const lines = action.rawText.split('\n')
      const newEntries = lines
        .map((line, index) => {
          const trimmed = line.trim()
          if (trimmed === '') return null
          
          const text = normalizeLine(trimmed)
          
          // Try to preserve ID if text matches an existing entry at the same position
          const existingEntry = state.wordEntries[index]
          const id = existingEntry && existingEntry.text === text
            ? existingEntry.id
            : `entry-${Date.now()}-${index}`
          
          // Preserve isOverridden if text is unchanged
          const isOverridden = existingEntry && existingEntry.text === text
            ? existingEntry.isOverridden
            : false

          return { id, text, isOverridden }
        })
        .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

      return {
        ...state,
        wordEntries: newEntries,
      }
    }

    case 'TOGGLE_FLAG': {
      const { flag } = action

      if (flag === 'roll') {
        const newRollValue = !state.flags.roll
        return {
          ...state,
          flags: {
            ...state.flags,
            roll: newRollValue,
            outward_roll: newRollValue,
            inward_roll: newRollValue,
          },
        }
      }

      if (flag === 'outward_roll' || flag === 'inward_roll') {
        const newFlagValue = !state.flags[flag]
        const otherFlag = flag === 'outward_roll' ? 'inward_roll' : 'outward_roll'
        const rollValue = newFlagValue && state.flags[otherFlag]

        return {
          ...state,
          flags: {
            ...state.flags,
            [flag]: newFlagValue,
            roll: rollValue,
          },
        }
      }

      // Simple toggle for other flags
      return {
        ...state,
        flags: {
          ...state.flags,
          [flag]: !state.flags[flag],
        },
      }
    }

    case 'SET_SFS_GAP': {
      const clampedGap = Math.max(
        CONFIG.SFS_GAP_MIN,
        Math.min(CONFIG.SFS_GAP_MAX, action.gap)
      )
      return {
        ...state,
        sfsGap: clampedGap,
      }
    }

    case 'TOGGLE_OVERRIDE': {
      return {
        ...state,
        wordEntries: state.wordEntries.map(entry =>
          entry.id === action.id
            ? { ...entry, isOverridden: !entry.isOverridden }
            : entry
        ),
      }
    }

    case 'RESET_DEFAULTS': {
      return getDefaultState()
    }

    case 'RESET_SHIFT_DEFAULTS': {
      const emptyAssignments = Object.fromEntries(
        Object.keys(state.shiftKeyAssignments).map(code => [
          code,
          { character: null, finger: null },
        ])
      )
      return {
        ...state,
        shiftKeyAssignments: emptyAssignments,
      }
    }

    case 'TOGGLE_SHIFT_LAYER': {
      return {
        ...state,
        showShiftLayer: !state.showShiftLayer,
      }
    }

    case 'TOGGLE_SHOW_ARROWS': {
      return { ...state, showArrows: !state.showArrows }
    }

    case 'TOGGLE_SHOW_NODES': {
      return { ...state, showNodes: !state.showNodes }
    }

    case 'TOGGLE_SHOW_BADNESS': {
      return { ...state, showBadness: !state.showBadness }
    }

    case 'LOAD_CONFIG': {
      const { data } = action
      return {
        ...state,
        keyAssignments: data.keyAssignments,
        shiftKeyAssignments: data.shiftKeyAssignments,
        mouseAssignments: data.mouseAssignments,
        shiftMouseAssignments: data.shiftMouseAssignments,
      }
    }

    case 'SET_MOUSE_CHARACTER': {
      const { keyCode, character, layer } = action
      const field = layer === 'shift' ? 'shiftMouseAssignments' : 'mouseAssignments'
      const otherField = layer === 'shift' ? 'shiftKeyAssignments' : 'keyAssignments'
      const currentMouseAssignments = state[field]
      const currentKeyAssignments = state[otherField]

      // Validate character
      if (character !== null && !isValidKeyChar(character)) {
        return state
      }

      if (character !== null) {
        // Clear this char from all other mouse keys in same layer
        const newMouseAssignments = { ...currentMouseAssignments }
        for (const code in newMouseAssignments) {
          if (code !== keyCode && newMouseAssignments[code] === character) {
            newMouseAssignments[code] = null
          }
        }
        newMouseAssignments[keyCode] = character

        // Also clear from keyboard assignments in same layer
        const newKeyAssignments = { ...currentKeyAssignments }
        for (const code in newKeyAssignments) {
          if (newKeyAssignments[code].character === character) {
            newKeyAssignments[code] = {
              ...newKeyAssignments[code],
              character: null,
            }
          }
        }

        return {
          ...state,
          [field]: newMouseAssignments,
          [otherField]: newKeyAssignments,
        }
      }

      return {
        ...state,
        [field]: { ...currentMouseAssignments, [keyCode]: null },
      }
    }

    case 'SWAP_CHARACTERS': {
      const { keyCodeA, keyCodeB } = action
      const charA = state.keyAssignments[keyCodeA]?.character ?? null
      const charB = state.keyAssignments[keyCodeB]?.character ?? null

      return {
        ...state,
        keyAssignments: {
          ...state.keyAssignments,
          [keyCodeA]: {
            ...state.keyAssignments[keyCodeA],
            character: charB,
          },
          [keyCodeB]: {
            ...state.keyAssignments[keyCodeB],
            character: charA,
          },
        },
      }
    }

    case 'SWAP_SHIFT_CHARACTERS': {
      const { keyCodeA, keyCodeB } = action
      const charA = state.shiftKeyAssignments[keyCodeA]?.character ?? null
      const charB = state.shiftKeyAssignments[keyCodeB]?.character ?? null

      return {
        ...state,
        shiftKeyAssignments: {
          ...state.shiftKeyAssignments,
          [keyCodeA]: {
            ...state.shiftKeyAssignments[keyCodeA],
            character: charB,
          },
          [keyCodeB]: {
            ...state.shiftKeyAssignments[keyCodeB],
            character: charA,
          },
        },
      }
    }

    default:
      return state
  }
}
