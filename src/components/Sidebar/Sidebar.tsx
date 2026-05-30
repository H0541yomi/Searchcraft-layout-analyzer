import { useAppState, useAppDispatch } from '../../state/AppContext'
import { WordListStats } from './WordListStats'
import { WordListInput } from './WordListInput'
import { WordList } from './WordList'
import { FlagToggles } from './FlagToggles'
import { SFSGapInput } from './SFSGapInput'

export function Sidebar() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const handleClearAll = () => {
    dispatch({ type: 'SET_WORD_LIST', rawText: '' })
  }

  return (
    <div className="sidebar">
      <WordListStats />
      <WordListInput />
      <WordList />
      
      <div style={{ borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
      
      <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '6px' }}>
        Bad Pattern Flags:
      </div>
      <FlagToggles />
      <SFSGapInput />
      
      <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
        <input
          type="checkbox"
          checked={state.showArrows}
          onChange={() => dispatch({ type: 'TOGGLE_SHOW_ARROWS' })}
        />
        Show arrows
      </label>
      
      <button
        onClick={handleClearAll}
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          fontSize: '11px',
          cursor: 'pointer',
        }}
      >
        Clear All
      </button>
    </div>
  )
}
