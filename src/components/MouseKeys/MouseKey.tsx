import { useState, useRef, useEffect } from 'react'
import type { MouseKeyDef } from '../../data/mouse-layout'
import { useAppDispatch } from '../../state/AppContext'
import { normalizeKeyInput } from '../../lib/tokenizer'

interface MouseKeyProps {
  keyDef: MouseKeyDef
  character: string | null
  layer: 'main' | 'shift'
}

export function MouseKey({ keyDef, character, layer }: MouseKeyProps) {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => setIsEditing(true)

  const confirm = (value: string) => {
    dispatch({ type: 'SET_MOUSE_CHARACTER', keyCode: keyDef.code, character: normalizeKeyInput(value), layer })
    setIsEditing(false)
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <div
      className="mouse-key"
      onClick={handleClick}
      title={`${keyDef.label} — click to bind a character`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className="mouse-key-edit-input"
          defaultValue={character || ''}
          onKeyDown={e => {
            if (e.key === 'Enter') confirm(e.currentTarget.value)
            else if (e.key === 'Escape') setIsEditing(false)
          }}
          onBlur={e => confirm(e.currentTarget.value)}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <>
          <span className={`mouse-key-label${character && character.length > 1 ? ' key-label--token' : ''}`}>
            {character ? (character === ' ' ? '␣' : character) : ''}
          </span>
          <span className="mouse-key-sublabel">{keyDef.label}</span>
        </>
      )}
    </div>
  )
}
