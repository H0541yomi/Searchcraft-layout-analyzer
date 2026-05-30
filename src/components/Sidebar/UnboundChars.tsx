import { useMemo } from 'react'
import { useAppState } from '../../state/AppContext'
import { tokenizeWord } from '../../lib/tokenizer'

export function UnboundChars() {
  const state = useAppState()

  const { unbound } = useMemo(() => {
    // All unique tokens from the word list
    const wordChars = new Set<string>()
    for (const entry of state.wordEntries) {
      for (const tok of tokenizeWord(entry.text)) {
        wordChars.add(tok)
      }
    }

    if (wordChars.size === 0) return { unbound: [] }

    // Check if any shift key is bound on the main layer
    const hasShiftKey =
      Object.values(state.keyAssignments).some(
        a => a.character === '[LShift]' || a.character === '[RShift]'
      ) ||
      Object.values(state.mouseAssignments).some(
        c => c === '[LShift]' || c === '[RShift]'
      )

    // Chars bound on main layer (always count)
    const bound = new Set<string>()
    for (const a of Object.values(state.keyAssignments)) {
      if (a.character !== null) bound.add(a.character)
    }
    for (const c of Object.values(state.mouseAssignments)) {
      if (c !== null) bound.add(c)
    }

    // Shift layer chars only count if a shift key is bound on main layer
    if (hasShiftKey) {
      for (const a of Object.values(state.shiftKeyAssignments)) {
        if (a.character !== null) bound.add(a.character)
      }
      for (const c of Object.values(state.shiftMouseAssignments)) {
        if (c !== null) bound.add(c)
      }
    }

    const unbound = [...wordChars].filter(c => !bound.has(c)).sort()
    return { unbound }
  }, [state.wordEntries, state.keyAssignments, state.shiftKeyAssignments, state.mouseAssignments, state.shiftMouseAssignments])

  if (unbound.length === 0) return null

  return (
    <div className="unbound-chars">
      <div className="unbound-chars-label">Unbound from word list:</div>
      <div className="unbound-chars-list">
        {unbound.map(c => (
          <span key={c} className="unbound-char">
            {c === ' ' ? '␣' : c}
          </span>
        ))}
      </div>
    </div>
  )
}
