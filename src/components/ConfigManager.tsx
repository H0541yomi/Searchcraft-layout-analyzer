import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppState, useAppDispatch } from '../state/AppContext'
import {
  loadSavedConfigs,
  saveConfigList,
  upsertConfig,
  deleteConfig,
} from '../state/configStorage'
import type { SavedConfig } from '../types'

function useConfigs() {
  const [configs, setConfigs] = useState<SavedConfig[]>(() => loadSavedConfigs())

  const persist = useCallback((next: SavedConfig[]) => {
    setConfigs(next)
    saveConfigList(next)
  }, [])

  return { configs, persist }
}

export function ConfigManager() {
  const state = useAppState()
  const dispatch = useAppDispatch()
  const { configs, persist } = useConfigs()

  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const loadBtnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        loadBtnRef.current?.contains(e.target as Node)
      ) return
      setShowDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  const handleLoadClick = () => {
    if (loadBtnRef.current) {
      const rect = loadBtnRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 4, left: rect.left })
    }
    setShowDropdown(v => !v)
  }

  const handleSelect = (cfg: SavedConfig) => {
    dispatch({ type: 'LOAD_CONFIG', data: cfg.data })
    setShowDropdown(false)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this layout?')) {
      persist(deleteConfig(configs, id))
    }
  }

  const isPreset = (id: string) => id.startsWith('preset-')

  const handleSaveAs = () => {
    const name = window.prompt('Save configuration as:', 'My Config')
    if (!name?.trim()) return
    const existing = configs.find(c => c.name === name.trim())
    const id = existing?.id ?? `user-${Date.now()}`
    const cfg: SavedConfig = {
      id,
      name: name.trim(),
      data: {
        keyAssignments: state.keyAssignments,
        shiftKeyAssignments: state.shiftKeyAssignments,
        mouseAssignments: state.mouseAssignments,
        shiftMouseAssignments: state.shiftMouseAssignments,
      },
    }
    persist(upsertConfig(configs, cfg))
  }

  const dropdown = showDropdown ? createPortal(
    <div
      ref={dropdownRef}
      className="config-dropdown"
      style={{ top: dropdownPos.top, left: dropdownPos.left }}
    >
      {configs.map(cfg => (
        <div
          key={cfg.id}
          className="config-dropdown-item"
          onClick={() => handleSelect(cfg)}
        >
          {!isPreset(cfg.id) && (
            <button
              className="btn-delete-config"
              onClick={(e) => handleDelete(cfg.id, e)}
              title="Delete layout"
            >
              ✕
            </button>
          )}
          {cfg.name}
        </div>
      ))}
    </div>,
    document.body
  ) : null

  return (
    <div className="config-manager">
      <button ref={loadBtnRef} className="btn-config" onClick={handleLoadClick}>
        Load Layout  ▾
      </button>
      <button className="btn-config" onClick={handleSaveAs}>
        Save As
      </button>
      {dropdown}
    </div>
  )
}
