import { MOUSE_KEYS } from '../../data/mouse-layout'
import { useAppState } from '../../state/AppContext'
import { MouseKey } from './MouseKey'

interface MouseKeysProps {
  layer: 'main' | 'shift'
}

export function MouseKeys({ layer }: MouseKeysProps) {
  const state = useAppState()
  const assignments = layer === 'shift' ? state.shiftMouseAssignments : state.mouseAssignments

  return (
    <div className="mouse-keys-panel">
      <div className="mouse-keys-label">Mouse</div>
      <div className="mouse-keys-row">
        {MOUSE_KEYS.map(keyDef => (
          <MouseKey
            key={keyDef.code}
            keyDef={keyDef}
            character={assignments[keyDef.code] ?? null}
            layer={layer}
          />
        ))}
      </div>
    </div>
  )
}
