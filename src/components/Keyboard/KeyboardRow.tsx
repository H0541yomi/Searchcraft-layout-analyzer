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
  draggedKeyCode: string | null
  dragOverKeyCode: string | null
  onDragStart: (code: string) => void
  onDragEnd: () => void
  onDragEnter: (code: string) => void
  onDragLeave: () => void
  onDrop: (code: string) => void
}

export function KeyboardRow({
  keys,
  assignments,
  editingKeyCode,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  layer = 'main',
  draggedKeyCode,
  dragOverKeyCode,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
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
          isDragging={draggedKeyCode === key.code}
          isDragOver={dragOverKeyCode === key.code}
          isDragActive={draggedKeyCode !== null}
          onDragStart={() => onDragStart(key.code)}
          onDragEnd={onDragEnd}
          onDragEnter={() => onDragEnter(key.code)}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop(key.code)}
        />
      ))}
    </div>
  )
}
