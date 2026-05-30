import type { SavedConfig } from '../types'
import { PRESET_CONFIGS } from '../data/preset-configs'

const LS_KEY = 'skp-saved-configs'

export function loadSavedConfigs(): SavedConfig[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return [...PRESET_CONFIGS]
    const parsed = JSON.parse(raw) as SavedConfig[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [...PRESET_CONFIGS]
    return parsed
  } catch {
    return [...PRESET_CONFIGS]
  }
}

export function saveConfigList(configs: SavedConfig[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(configs))
  } catch (e) {
    console.error('Failed to save configs:', e)
  }
}

export function upsertConfig(configs: SavedConfig[], incoming: SavedConfig): SavedConfig[] {
  const idx = configs.findIndex(c => c.id === incoming.id)
  if (idx >= 0) {
    const next = [...configs]
    next[idx] = incoming
    return next
  }
  return [...configs, incoming]
}

export function deleteConfig(configs: SavedConfig[], id: string): SavedConfig[] {
  return configs.filter(c => c.id !== id)
}
