import { useAppState, useAppDispatch } from '../../state/AppContext'
import { CONFIG } from '../../config'

export function SFSGapInput() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      dispatch({ type: 'SET_SFS_GAP', gap: value })
    }
  }

  return (
    <div className="sfs-gap">
      <label htmlFor="sfs-gap-input">SFS Gap:</label>
      <input
        id="sfs-gap-input"
        type="number"
        min={CONFIG.SFS_GAP_MIN}
        max={CONFIG.SFS_GAP_MAX}
        value={state.sfsGap}
        onChange={handleChange}
      />
    </div>
  )
}
