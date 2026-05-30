export interface MouseKeyDef {
  code: string
  label: string
}

export const MOUSE_KEYS: MouseKeyDef[] = [
  { code: 'MouseLClick', label: 'LClick' },
  { code: 'MouseRClick', label: 'RClick' },
  { code: 'MouseMB4',    label: 'MB4' },
  { code: 'MouseMB5',    label: 'MB5' },
  { code: 'MouseScroll', label: 'Scroll' },
]

export const MOUSE_KEYS_BY_CODE: Record<string, MouseKeyDef> = Object.fromEntries(
  MOUSE_KEYS.map(k => [k.code, k])
)

export const MOUSE_KEY_CODES: ReadonlySet<string> = new Set(MOUSE_KEYS.map(k => k.code))
