import { useMemo } from 'react'
import { useAppState } from '../../state/AppContext'
import { tokenizeWord } from '../../lib/tokenizer'

export function WordListStats() {
  const state = useAppState()

  const { wordCount, uniqueChars } = useMemo(() => {
    const wordCount = state.wordEntries.length
    const charSet = new Set<string>()

    for (const entry of state.wordEntries) {
      for (const tok of tokenizeWord(entry.text)) {
        charSet.add(tok)
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
