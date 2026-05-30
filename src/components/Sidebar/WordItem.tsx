import type { WordEntry, WordAnalysis } from '../../types'

interface WordItemProps {
  entry: WordEntry
  analysis: WordAnalysis | undefined
  onToggleOverride: () => void
}

export function WordItem({ entry, analysis, onToggleOverride }: WordItemProps) {
  const isFlagged = analysis?.isFlagged ?? false
  const isOverridden = entry.isOverridden

  const className = [
    'word-item',
    isFlagged && !isOverridden ? 'word-item--flagged' : '',
    isOverridden ? 'word-item--overridden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const hasAnalysis = analysis !== undefined
  const showCheckmark = hasAnalysis && !isFlagged && !isOverridden

  return (
    <div className={className}>
      <span className="word-item-text">{entry.text}</span>
      {showCheckmark && <span className="word-item-check">✓</span>}
      {(isFlagged || isOverridden) && (
        <button
          className="word-item-override-btn"
          onClick={onToggleOverride}
          title={isOverridden ? 'Re-enable warning for this word' : 'Ignore warning for this word'}
        >
          {isOverridden ? 'enable warning' : 'ignore warning'}
        </button>
      )}
    </div>
  )
}
