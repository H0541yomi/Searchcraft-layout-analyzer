import { useState, useEffect, useRef } from 'react'
import { useAppState, useAppDispatch } from '../../state/AppContext'
import { CONFIG } from '../../config'

export function WordListInput() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [localValue, setLocalValue] = useState(() => 
    state.wordEntries.map(e => e.text).join('\n')
  )
  const timerRef = useRef<number | undefined>(undefined)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // Debounce dispatch
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      dispatch({ type: 'SET_WORD_LIST', rawText: newValue })
    }, CONFIG.DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <textarea
      className="word-list-input"
      value={localValue}
      onChange={handleChange}
      placeholder="Enter words/phrases, one per line..."
      spellCheck={false}
    />
  )
}
