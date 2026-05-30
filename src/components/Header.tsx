import { useAppDispatch } from '../state/AppContext'

export function Header() {
  const dispatch = useAppDispatch()

  const handleReset = () => {
    if (confirm('Reset all assignments to defaults? This cannot be undone.')) {
      dispatch({ type: 'RESET_DEFAULTS' })
    }
  }

  return (
    <div className="header">
      <h1>SearchCraft Keybind Planner</h1>
      <div className="subtitle">Minecraft left-hand layout optimizer</div>
      <button className="btn-reset" onClick={handleReset}>
        Reset to Defaults
      </button>
    </div>
  )
}
