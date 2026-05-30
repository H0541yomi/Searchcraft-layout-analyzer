import { useAppState, useAppDispatch } from '../state/AppContext'
import { Sidebar } from './Sidebar/Sidebar'
import { FingerLegend } from './FingerLegend'
import { Keyboard } from './Keyboard/Keyboard'
import { MouseKeys } from './MouseKeys/MouseKeys'

export function MainLayout() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="keyboard-area">
        <FingerLegend />
        <div className="keyboard-with-mouse">
          <Keyboard />
          <MouseKeys layer="main" />
        </div>
        
        <div className="shift-layer-toggle">
          <button
            className="btn-shift-layer"
            onClick={() => dispatch({ type: 'TOGGLE_SHIFT_LAYER' })}
          >
            Shift Layer {state.showShiftLayer ? '▲' : '▼'}
          </button>
        </div>
        
        {state.showShiftLayer && (
          <div className="shift-keyboard-panel">
            <div className="shift-keyboard-label">Shift Layer</div>
            <div className="keyboard-with-mouse">
              <Keyboard layer="shift" />
              <MouseKeys layer="shift" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
