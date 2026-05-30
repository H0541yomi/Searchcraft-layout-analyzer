/**
 * Special multi-character tokens that can be assigned to physical keys.
 * These are the canonical storage forms.
 */
export const SPECIAL_CHARS = ['[BS]', '[LShift]', '[RShift]', '[Home]'] as const
export type SpecialChar = typeof SPECIAL_CHARS[number]

export function isSpecialChar(s: string): boolean {
  return (SPECIAL_CHARS as readonly string[]).includes(s)
}

/** Validate a value that can be assigned to a keyboard key. */
export function isValidKeyChar(char: string): boolean {
  if (isSpecialChar(char)) return true
  if (char.length === 0) return false
  const cp = char.codePointAt(0)!
  if ([...char].length !== 1) return false
  return !(cp <= 0x1F || (cp >= 0x7F && cp <= 0x9F))
}

// ─── Token recognition ────────────────────────────────────────────────────────

/**
 * Try to read a [...] token at position `pos` in `s`.
 * Returns the canonical form for normalizeLine/tokenizeWord, plus the token length.
 * Returns null if the bracket sequence is not a recognised token.
 */
function readBracketToken(s: string, pos: number): { canonical: string; len: number } | null {
  if (s[pos] !== '[') return null
  const end = s.indexOf(']', pos + 1)
  if (end === -1) return null
  const inner = s.slice(pos + 1, end).toUpperCase()
  const len = end - pos + 1
  switch (inner) {
    case 'BS':                 return { canonical: '[BS]',      len }
    case 'SH':                 return { canonical: '[SH]',      len } // shift+home combo (word-text only)
    case 'HOME':               return { canonical: '[HOME]',    len }
    case 'LSHIFT': case 'LS':  return { canonical: '[LSHIFT]',  len }
    case 'RSHIFT': case 'RS':  return { canonical: '[RSHIFT]',  len }
    default:                   return null
  }
}

// ─── Key-edit input normalization ─────────────────────────────────────────────

/**
 * Parse a key-edit input string into a canonical character (or null to clear).
 *
 *   "[bs]" / "[BS]"           → "[BS]"
 *   "[lshift]" / "[ls]" …     → "[LShift]"
 *   "[rshift]" / "[rs]" …     → "[RShift]"
 *   "[home]" / "[HOME]" …     → "[Home]"
 *   "_"                        → " "  (space-key alias)
 *   anything else              → first code point
 */
export function normalizeKeyInput(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  const tok = readBracketToken(t, 0)
  if (tok && tok.len === t.length) {
    // It's a pure bracket token — map to canonical key-assignment form
    switch (tok.canonical) {
      case '[BS]':     return '[BS]'
      case '[HOME]':   return '[Home]'
      case '[LSHIFT]': return '[LShift]'
      case '[RSHIFT]': return '[RShift]'
      // [SH] typed in key-edit doesn't map to a single key — ignore
    }
  }
  if (t === '_') return ' '
  return [...t][0] ?? null
}

// ─── Word-list line normalization ─────────────────────────────────────────────

/**
 * Normalize a raw word-list line before storage.
 * - Known bracket tokens are preserved in canonical uppercase form.
 * - `_` is converted to a space character.
 * - All other characters are lowercased.
 */
export function normalizeLine(line: string): string {
  let result = ''
  let i = 0
  while (i < line.length) {
    const tok = readBracketToken(line, i)
    if (tok) {
      result += tok.canonical
      i += tok.len
    } else if (line[i] === '_') {
      result += ' '
      i++
    } else {
      result += line[i].toLowerCase()
      i++
    }
  }
  return result
}

// ─── Word tokenizer ────────────────────────────────────────────────────────────

/**
 * Tokenize a stored word-list line into analysis tokens.
 *
 * Canonical → analysis token mapping:
 *   [BS]     → '[BS]'      treated as a normal keystroke
 *   [SH]     → '[Home]'    shift is transparent; only Home participates
 *   [HOME]   → '[Home]'    direct Home keypress
 *   [LSHIFT] → '[LShift]'  left-shift keypress
 *   [RSHIFT] → '[RShift]'  right-shift keypress
 *   other    → the character itself
 */
export function tokenizeWord(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    const tok = readBracketToken(text, i)
    if (tok) {
      switch (tok.canonical) {
        case '[BS]':     tokens.push('[BS]');     break
        case '[SH]':     tokens.push('[Home]');   break // shift transparent
        case '[HOME]':   tokens.push('[Home]');   break
        case '[LSHIFT]': tokens.push('[LShift]'); break
        case '[RSHIFT]': tokens.push('[RShift]'); break
      }
      i += tok.len
    } else {
      tokens.push(text[i])
      i++
    }
  }
  return tokens
}
