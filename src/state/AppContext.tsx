/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import type { AppState, AppAction } from '../types'
import { reducer } from './reducer'
import { loadState, saveState } from './persistence'

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useAppState(): AppState {
  const context = useContext(StateContext)
  if (context === null) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}

export function useAppDispatch(): React.Dispatch<AppAction> {
  const context = useContext(DispatchContext)
  if (context === null) {
    throw new Error('useAppDispatch must be used within AppProvider')
  }
  return context
}

export function useCharToKey(): Map<string, string> {
  const state = useAppState()
  return useMemo(() => {
    const map = new Map<string, string>()
    // shift layer keyboard (lower priority)
    for (const [code, assignment] of Object.entries(state.shiftKeyAssignments)) {
      if (assignment.character !== null) {
        map.set(assignment.character, code)
      }
    }
    // shift layer mouse
    for (const [code, char] of Object.entries(state.shiftMouseAssignments)) {
      if (char !== null) {
        map.set(char, code)
      }
    }
    // main layer keyboard (higher priority)
    for (const [code, assignment] of Object.entries(state.keyAssignments)) {
      if (assignment.character !== null) {
        map.set(assignment.character, code)
      }
    }
    // main layer mouse (highest priority)
    for (const [code, char] of Object.entries(state.mouseAssignments)) {
      if (char !== null) {
        map.set(char, code)
      }
    }
    return map
  }, [state.keyAssignments, state.shiftKeyAssignments, state.mouseAssignments, state.shiftMouseAssignments])
}

export function useMouseChars(): Set<string> {
  const state = useAppState()
  return useMemo(() => {
    const set = new Set<string>()
    for (const char of Object.values(state.mouseAssignments)) {
      if (char !== null) set.add(char)
    }
    for (const char of Object.values(state.shiftMouseAssignments)) {
      if (char !== null) set.add(char)
    }
    return set
  }, [state.mouseAssignments, state.shiftMouseAssignments])
}
