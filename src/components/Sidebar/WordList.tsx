import { useMemo } from 'react'
import { useAppState, useAppDispatch } from '../../state/AppContext'
import { analyzeWords } from '../../lib/analysis'
import { WordItem } from './WordItem'

export function WordList() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const { wordAnalysis } = useMemo(
    () =>
      analyzeWords(
        state.wordEntries,
        state.keyAssignments,
        state.shiftKeyAssignments,
        state.mouseAssignments,
        state.shiftMouseAssignments,
        state.flags,
        state.sfsGap
      ),
    [state.wordEntries, state.keyAssignments, state.shiftKeyAssignments, state.mouseAssignments, state.shiftMouseAssignments, state.flags, state.sfsGap]
  )

  const analysisMap = useMemo(() => {
    const map = new Map<string, typeof wordAnalysis[0]>()
    for (const analysis of wordAnalysis) {
      map.set(analysis.id, analysis)
    }
    return map
  }, [wordAnalysis])

  const handleToggleOverride = (id: string) => {
    dispatch({ type: 'TOGGLE_OVERRIDE', id })
  }

  if (state.wordEntries.length === 0) {
    return <div className="word-list" style={{ padding: '8px', color: '#999' }}>No words yet</div>
  }

  return (
    <div className="word-list">
      {state.wordEntries.map(entry => (
        <WordItem
          key={entry.id}
          entry={entry}
          analysis={analysisMap.get(entry.id)}
          onToggleOverride={() => handleToggleOverride(entry.id)}
        />
      ))}
    </div>
  )
}
