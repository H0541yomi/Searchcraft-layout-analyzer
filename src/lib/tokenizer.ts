// Special multi-character tokens that can be assigned to keys
export const SPECIAL_CHARS = ['[BS]', '[Sh]', '[Home]'] as const
export type SpecialChar = typeof SPECIAL_CHARS[number]

export function isSpecialChar(s: string): boolean {
  return (SPECIAL_CHARS as readonly string[]).includes(s)
}

/** Validate a value that can be assigned to a keyboard key */
export function isValidKeyChar(char: string): boolean {
  if (isSpecialChar(char)) return true
  if (char.length === 0) return false
  // Only single code-point regular chars
  const cp = char.codePointAt(0)!
  if ([...char].length !== 1) return false
  return !(cp <= 0x1F || (cp >= 0x7F && cp <= 0x9F))
}

/**
 * Parse a key-edit input string into a canonical character (or null to clear).
 * Multi-char tokens are recognized case-insensitively.
 *   "[bs]"   → "[BS]"
 *   "[sh]"   → "[Sh]"   (the shift key itself)
 *   "[home]" → "[Home]"
 *   otherwise → first code point
 */
export function normalizeKeyInput(input: string): string | null {
  const t = input.trim()
  if (!t) return null
  if (/^\[bs\]$/i.test(t)) return '[BS]'
  if (/^\[sh\]$/i.test(t)) return '[Sh]'
  if (/^\[home\]$/i.test(t)) return '[Home]'
  if (t === '_') return ' '   // _ is an alias for the space key
  return [...t][0] ?? null
}

/**
 * Normalize a word-list line.
 * Preserves [BS] and [SH] tokens in canonical form,
 * lowercases all other characters.
 */
export function normalizeLine(line: string): string {
  let result = ''
  let i = 0
  while (i < line.length) {
    if (line[i] === '[') {
      if (/\[BS\]/i.test(line.slice(i, i + 4))) {
        result += '[BS]'
        i += 4
      } else if (/\[SH\]/i.test(line.slice(i, i + 4))) {
        result += '[SH]'
        i += 4
      } else {
        result += line[i].toLowerCase()
        i++
      }
    } else if (line[i] === '_') {
      result += ' '   // _ is a visual alias for the space key
      i++
    } else {
      result += line[i].toLowerCase()
      i++
    }
  }
  return result
}

/**
 * Tokenize a normalized word-list line into analysis tokens.
 *
 * Rules:
 *   [BS]  → '[BS]'   treated as a normal keystroke
 *   [SH]  → '[Home]' shift is transparent; only Home key participates
 *   other → individual characters
 */
export function tokenizeWord(text: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '[') {
      if (text.startsWith('[BS]', i)) {
        tokens.push('[BS]')
        i += 4
      } else if (text.startsWith('[SH]', i)) {
        // Shift is transparent — only Home participates in analysis
        tokens.push('[Home]')
        i += 4
      } else {
        tokens.push(text[i])
        i++
      }
    } else {
      tokens.push(text[i])
      i++
    }
  }
  return tokens
}
