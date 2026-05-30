import { useState } from 'react'
import { KEYBOARD_ROWS } from '../../data/keyboard-layout'
import { useAppState, useAppDispatch } from '../../state/AppContext'
import { KeyboardRow } from './KeyboardRow'
import { GraphOverlay } from '../GraphOverlay/GraphOverlay'
import { KEY_GAP_PX } from '../../config'

interface KeyboardProps {
  layer?: 'main' | 'shift'
}

export function Keyboard({ layer = 'main' }: KeyboardProps) {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const [editingKeyCode, setEditingKeyCode] = useState<string | null>(null)
  const [draggedKeyCode, setDraggedKeyCode] = useState<string | null>(null)
  const [dragOverKeyCode, setDragOverKeyCode] = useState<string | null>(null)
  const [hoveredKeyChar, setHoveredKeyChar] = useState<string | null>(null)

  const isShiftLayer = layer === 'shift'
  const assignments = isShiftLayer ? state.shiftKeyAssignments : state.keyAssignments
  const characterAction = isShiftLayer ? 'SET_SHIFT_CHARACTER' : 'SET_CHARACTER'
  const swapAction = isShiftLayer ? 'SWAP_SHIFT_CHARACTERS' : 'SWAP_CHARACTERS'

  const handleStartEdit = (code: string) => {
    setEditingKeyCode(code)
  }

  const handleConfirmEdit = (code: string, char: string | null) => {
    dispatch({ type: characterAction, keyCode: code, character: char })
    setEditingKeyCode(null)
  }

  const handleCancelEdit = () => {
    setEditingKeyCode(null)
  }

  const handleDragStart = (code: string) => {
    setDraggedKeyCode(code)
  }

  const handleDragEnd = () => {
    setDraggedKeyCode(null)
    setDragOverKeyCode(null)
  }

  const handleDragEnter = (code: string) => {
    if (draggedKeyCode && code !== draggedKeyCode) {
      setDragOverKeyCode(code)
    }
  }

  const handleDragLeave = () => {
    setDragOverKeyCode(null)
  }

  const handleDrop = (targetCode: string) => {
    if (draggedKeyCode && targetCode !== draggedKeyCode) {
      dispatch({ type: swapAction, keyCodeA: draggedKeyCode, keyCodeB: targetCode })
    }
    setDraggedKeyCode(null)
    setDragOverKeyCode(null)
  }

  return (
    <div className="keyboard-container" style={{ position: 'relative' }}>
      <div style={{ marginBottom: `${KEY_GAP_PX}px` }}>
        {KEYBOARD_ROWS.map((row, index) => (
          <KeyboardRow
            key={index}
            keys={row}
            assignments={assignments}
            editingKeyCode={editingKeyCode}
            onStartEdit={handleStartEdit}
            onConfirmEdit={handleConfirmEdit}
            onCancelEdit={handleCancelEdit}
            layer={layer}
            draggedKeyCode={draggedKeyCode}
            dragOverKeyCode={dragOverKeyCode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onKeyHover={setHoveredKeyChar}
          />
        ))}
      </div>
      <GraphOverlay layer={layer} hoveredKeyChar={hoveredKeyChar} />
    </div>
  )
}
