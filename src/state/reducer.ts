import type { AppState, AppAction } from '../types'
import { getDefaultState } from './persistence'
import { CONFIG } from '../config'

function isPrintableChar(char: string): boolean {
  if (char.length === 0) return false
  // Reject control characters (U+0000-U+001F, U+007F-U+009F)
  const cp = char.codePointAt(0)
  if (cp === undefined) return false
  if (cp <= 0x1F || (cp >= 0x7F && cp <= 0x9F)) return false
  return true
}

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
      if (character !== null && !isPrintableChar(character)) {
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
      if (character !== null && !isPrintableChar(character)) {
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
          
          const text = trimmed.toLowerCase()
          
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
      return {
        ...state,
        showArrows: !state.showArrows,
      }
    }

    case 'SET_MOUSE_CHARACTER': {
      const { keyCode, character, layer } = action
      const field = layer === 'shift' ? 'shiftMouseAssignments' : 'mouseAssignments'
      const otherField = layer === 'shift' ? 'shiftKeyAssignments' : 'keyAssignments'
      const currentMouseAssignments = state[field]
      const currentKeyAssignments = state[otherField]

      // Validate character
      if (character !== null && !isPrintableChar(character)) {
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

    default:
      return state
  }
}
