import type { WordEntry, WordAnalysis, FlagType } from '../../types'
import { Tooltip } from '../Tooltip'
import { useWordHighlight, getWordChars } from '../../state/WordHighlightContext'

const FLAG_LABELS: Record<FlagType, string> = {
  roll: 'roll',
  outward_roll: 'out-roll',
  inward_roll: 'in-roll',
  redirect: 'redirect',
  sfb: 'SFB',
  sfs: 'SFS',
  scissor: 'scissor',
}

interface WordItemProps {
  entry: WordEntry
  analysis: WordAnalysis | undefined
  onToggleOverride: () => void
}

export function WordItem({ entry, analysis, onToggleOverride }: WordItemProps) {
  const { setHoveredChars, setLockedChars, locked, highlightedChars } = useWordHighlight()

  const wordChars = getWordChars(entry.text)

  const isThisWordLocked =
    locked &&
    highlightedChars !== null &&
    wordChars.size === highlightedChars.size &&
    [...wordChars].every(c => highlightedChars.has(c))

  const handleMouseEnter = () => {
    if (!locked) setHoveredChars(wordChars)
  }

  const handleMouseLeave = () => {
    if (!locked) setHoveredChars(null)
  }

  const handleClick = () => {
    if (isThisWordLocked) {
      // clicking same locked word unlocks
      // clearLock is handled by the document click handler naturally
      // but we need to prevent the doc handler from also firing first
      // — it won't re-lock, just let doc handler clear it
    } else {
      setLockedChars(wordChars)
    }
  }
  const isFlagged = analysis?.isFlagged ?? false
  const isUntypable = analysis?.isUntypable ?? false
  const isOverridden = entry.isOverridden

  // Collect unique triggered flag types
  const triggeredFlags = analysis
    ? [...new Set(analysis.flaggedPatterns.map(p => p.type))]
    : []

  const className = [
    'word-item',
    isFlagged && !isUntypable && !isOverridden ? 'word-item--flagged' : '',
    isUntypable && !isOverridden ? 'word-item--untypable' : '',
    isOverridden ? 'word-item--overridden' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const hasAnalysis = analysis !== undefined
  const showCheckmark = hasAnalysis && !isFlagged && !isUntypable && !isOverridden
  const showWarning = hasAnalysis && isUntypable && !isOverridden

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <span className="word-item-text">{entry.text}</span>
      {showCheckmark && <span className="word-item-check">✓</span>}
      {showWarning && (
        <Tooltip text="untypable" className="word-item-warn">!</Tooltip>
      )}
      {isFlagged && !isUntypable && !isOverridden && triggeredFlags.map(flag => (
        <span key={flag} className="word-item-flag-badge">{FLAG_LABELS[flag]}</span>
      ))}
      {(isFlagged && !isUntypable || isOverridden) && (
        <button
          className="word-item-override-btn"
          onClick={e => { e.stopPropagation(); onToggleOverride() }}
          title={isOverridden ? 'Re-enable warning for this word' : 'Ignore warning for this word'}
        >
          {isOverridden ? 'enable warning' : 'ignore warning'}
        </button>
      )}
    </div>
  )
}
