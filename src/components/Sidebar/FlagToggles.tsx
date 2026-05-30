import type { FlagType } from '../../types'
import { useAppState, useAppDispatch } from '../../state/AppContext'

export function FlagToggles() {
  const state = useAppState()
  const dispatch = useAppDispatch()

  const handleToggle = (flag: FlagType) => {
    dispatch({ type: 'TOGGLE_FLAG', flag })
  }

  return (
    <div className="flag-toggles">
      <label>
        <input
          type="checkbox"
          checked={state.flags.roll}
          onChange={() => handleToggle('roll')}
        />
        {' '}Rolls
      </label>

      <label className="flag-toggle-indent">
        <input
          type="checkbox"
          checked={state.flags.outward_roll}
          onChange={() => handleToggle('outward_roll')}
        />
        {' '}Outward Rolls
      </label>

      <label className="flag-toggle-indent">
        <input
          type="checkbox"
          checked={state.flags.inward_roll}
          onChange={() => handleToggle('inward_roll')}
        />
        {' '}Inward Rolls
      </label>

      <label>
        <input
          type="checkbox"
          checked={state.flags.redirect}
          onChange={() => handleToggle('redirect')}
        />
        {' '}Redirects
      </label>

      <label>
        <input
          type="checkbox"
          checked={state.flags.sfb}
          onChange={() => handleToggle('sfb')}
        />
        {' '}SFBs
      </label>

      <label>
        <input
          type="checkbox"
          checked={state.flags.sfs}
          onChange={() => handleToggle('sfs')}
        />
        {' '}SFSs
      </label>

      <label>
        <input
          type="checkbox"
          checked={state.flags.scissor}
          onChange={() => handleToggle('scissor')}
        />
        {' '}Scissors
      </label>
    </div>
  )
}
