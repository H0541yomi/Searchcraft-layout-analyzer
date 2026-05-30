import { useMemo } from 'react'
import { useAppState } from '../../state/AppContext'

export function WordListStats() {
  const state = useAppState()

  const { wordCount, uniqueChars } = useMemo(() => {
    const wordCount = state.wordEntries.length
    const charSet = new Set<string>()

    for (const entry of state.wordEntries) {
      for (const char of entry.text) {
        charSet.add(char)
      }
    }

    return { wordCount, uniqueChars: charSet.size }
  }, [state.wordEntries])

  return (
    <div className="stats">
      {wordCount} words | {uniqueChars} unique characters
    </div>
  )
}
