import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PhysicalKeyDef, KeyAssignment, FingerEnum } from '../../types'
import { useAppDispatch } from '../../state/AppContext'
import { FINGER_COLORS, KEY_UNIT_PX } from '../../config'

interface KeyProps {
  keyDef: PhysicalKeyDef
  assignment: KeyAssignment
  isEditing: boolean
  onStartEdit: () => void
  onConfirmEdit: (char: string | null) => void
  onCancelEdit: () => void
  layer?: 'main' | 'shift'
  isDragging?: boolean
  isDragOver?: boolean
  isDragActive?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDragEnter?: () => void
  onDragLeave?: () => void
  onDrop?: () => void
}

export function Key({
  keyDef,
  assignment,
  isEditing,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  layer = 'main',
  isDragging = false,
  isDragOver = false,
  isDragActive = false,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
}: KeyProps) {
  const dispatch = useAppDispatch()
  const fingerAction = layer === 'shift' ? 'SET_SHIFT_FINGER' : 'SET_FINGER'
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const backgroundColor = assignment.finger
    ? FINGER_COLORS[assignment.finger]
    : FINGER_COLORS.UNASSIGNED

  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0) return  // only left-click opens edit
    onStartEdit()
  }

  const keyDivRef = useRef<HTMLDivElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (keyDivRef.current) {
      const rect = keyDivRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX })
    }
    setShowDropdown(!showDropdown)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim()
      const firstChar = value ? [...value][0] : null
      onConfirmEdit(firstChar)
    } else if (e.key === 'Escape') {
      onCancelEdit()
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim()
    const firstChar = value ? [...value][0] : null
    onConfirmEdit(firstChar)
  }

  const handleFingerSelect = (finger: FingerEnum | null) => {
    dispatch({ type: fingerAction, keyCode: keyDef.code, finger })
    setShowDropdown(false)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const width = keyDef.width * KEY_UNIT_PX
  const height = KEY_UNIT_PX

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    onDragEnter?.()
  }

  const handleDragLeave = () => {
    onDragLeave?.()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop?.()
  }

  const handleDragEnd = () => {
    onDragEnd?.()
  }

  const keyClassNames = [
    'key',
    assignment.character ? 'key--assigned' : 'key--unassigned',
    isDragging && 'key--dragging',
    isDragOver && 'key--drag-over',
    isDragActive && !isDragging && 'key--drag-active',
  ].filter(Boolean).join(' ')

  const dropdown = showDropdown ? createPortal(
    <div
      ref={dropdownRef}
      className="key-dropdown"
      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
      onClick={e => e.stopPropagation()}
    >
      {(['L_PINKY', 'L_RING', 'L_MIDDLE', 'L_INDEX', 'L_THUMB'] as FingerEnum[]).map(f => (
        <div key={f} className="key-dropdown-item" onClick={() => handleFingerSelect(f)}>
          {f === 'L_PINKY' ? 'Pinky' : f === 'L_RING' ? 'Ring' : f === 'L_MIDDLE' ? 'Middle' : f === 'L_INDEX' ? 'Index' : 'Thumb'}
        </div>
      ))}
      <div className="key-dropdown-item" onClick={() => handleFingerSelect(null)}>Unassigned</div>
    </div>,
    document.body
  ) : null

  return (
    <div
      ref={keyDivRef}
      className={keyClassNames}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor,
      }}
      draggable={!isEditing}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="key-edit-input"
          defaultValue={assignment.character || ''}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <>
          {assignment.character && (
            <span className="key-label">{assignment.character === ' ' ? '␣' : assignment.character}</span>
          )}
          {isDragOver && (
            <div className="key-swap-icon">⇄</div>
          )}
        </>
      )}

      {dropdown}
    </div>
  )
}
