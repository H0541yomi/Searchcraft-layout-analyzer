import type { PhysicalKeyDef, KeyAssignment } from '../../types'
import { Key } from './Key'
import { KEY_GAP_PX } from '../../config'

interface KeyboardRowProps {
  keys: PhysicalKeyDef[]
  assignments: Record<string, KeyAssignment>
  editingKeyCode: string | null
  onStartEdit: (code: string) => void
  onConfirmEdit: (code: string, char: string | null) => void
  onCancelEdit: () => void
  layer?: 'main' | 'shift'
}

export function KeyboardRow({
  keys,
  assignments,
  editingKeyCode,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  layer = 'main',
}: KeyboardRowProps) {
  return (
    <div className="keyboard-row" style={{ gap: `${KEY_GAP_PX}px` }}>
      {keys.map(key => (
        <Key
          key={key.code}
          keyDef={key}
          assignment={assignments[key.code]}
          isEditing={editingKeyCode === key.code}
          onStartEdit={() => onStartEdit(key.code)}
          onConfirmEdit={(char) => onConfirmEdit(key.code, char)}
          onCancelEdit={onCancelEdit}
          layer={layer}
        />
      ))}
    </div>
  )
}
