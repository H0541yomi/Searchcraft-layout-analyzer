/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { tokenizeWord } from '../lib/tokenizer'

export function getWordChars(text: string): Set<string> {
  return new Set(tokenizeWord(text))
}

interface WordHighlightContextValue {
  highlightedChars: Set<string> | null
  setHoveredChars: (chars: Set<string> | null) => void
  setLockedChars: (chars: Set<string>) => void
  clearLock: () => void
  locked: boolean
}

const WordHighlightContext = createContext<WordHighlightContextValue | null>(null)

export function WordHighlightProvider({ children }: { children: React.ReactNode }) {
  const [hoveredChars, setHoveredChars] = useState<Set<string> | null>(null)
  const [lockedChars, setLockedChars] = useState<Set<string> | null>(null)

  const handleSetLockedChars = useCallback((chars: Set<string>) => {
    setLockedChars(chars)
  }, [])

  const clearLock = useCallback(() => {
    setLockedChars(null)
  }, [])

  // Clear lock when clicking outside any word-item
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.word-item')) {
        setLockedChars(null)
      }
    }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [])

  const highlightedChars = lockedChars ?? hoveredChars

  return (
    <WordHighlightContext.Provider value={{
      highlightedChars,
      setHoveredChars,
      setLockedChars: handleSetLockedChars,
      clearLock,
      locked: lockedChars !== null,
    }}>
      {children}
    </WordHighlightContext.Provider>
  )
}

export function useWordHighlight() {
  const ctx = useContext(WordHighlightContext)
  if (!ctx) throw new Error('useWordHighlight must be used within WordHighlightProvider')
  return ctx
}
