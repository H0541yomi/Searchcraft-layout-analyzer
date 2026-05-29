# SearchCraft Keybind Planner

## What This Is

Browser-based tool for Minecraft speedrunners to optimize left-hand keyboard layouts for searchcrafting. Right hand stays on mouse. Users assign characters + fingers to keys, input word lists, and get real-time ergonomic analysis (SFBs, rolls, scissors, redirects, etc.) visualized as a directed graph overlaid on a keyboard.

## Project Status

**Phase: Scaffold only.** No features implemented yet. Vite + React + TypeScript skeleton renders a placeholder heading. All feature specs live in `PRD.md`.

## Stack

- **Framework:** React 19 + TypeScript 6
- **Build:** Vite 8
- **Lint:** ESLint 10 with react-hooks + react-refresh plugins
- **Styling:** Plain CSS (no framework). Light mode only.
- **State persistence:** LocalStorage (no backend, no network calls)
- **Package manager:** npm

## Commands

```bash
npm run dev      # dev server → http://localhost:5173
npm run build    # typecheck + production build → dist/
npm run preview  # preview production build
npm run lint     # eslint
```

## File Structure

```
keyboard/
├── PRD.md                  # Full product requirements (v3, final draft) — READ THIS FIRST
├── CLAUDE.md               # This file
├── docs/
│   ├── ARCHITECTURE.md     # Planned component tree, data flow, state management
│   └── IMPLEMENTATION.md   # Build order, implementation phases, gotchas
├── index.html              # Vite entry
├── src/
│   ├── main.tsx            # React root
│   ├── App.tsx             # Placeholder (replace with real layout)
│   ├── App.css             # Placeholder styles
│   └── index.css           # CSS reset + base styles
├── public/
│   └── favicon.svg
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── package.json
```

## Key Design Decisions

- **Left hand only.** 5 fingers: L-Pinky, L-Ring, L-Middle, L-Index, L-Thumb. No right-hand assignment.
- **Unassigned keys allowed.** Right-side keys default to unassigned (no finger, no character).
- **Character reassignment.** Users can move characters between keys. Each character on at most one key.
- **Directed graph.** `a→r` ≠ `r→a`. Edges only between adjacent characters in words.
- **Spaces are characters.** They create nodes and edges like any other character.
- **Light mode only.** Calm, muted finger colors: orange, yellow, blue, green, purple.
- **Edge weight threshold.** Low-weight edges hidden by default (`EDGE_WEIGHT_THRESHOLD = 2`, source-configurable).
- **SFS gap configurable.** User-facing control, default 1, range 1–5.
- **Rolls master flag.** Toggling "Rolls" auto-enables/disables both Outward and Inward sub-flags.
- **Scissor detection excludes thumbs.**
- **F-keys same size as alpha keys.**
- **Modifier keys fully assignable** (Tab, CapsLock, Shift, Ctrl, Alt).

## Canonical Terminology

Use exact terms from `PRD.md § 2. Glossary`. Key terms: Bigram, Roll, Outward Roll, Inward Roll, Redirect, SFB, SFS, Scissor, Directed Character Graph, Badness Weight, Word Override, Unassigned Key.

## Finger Colors

| Finger | Hex |
|--------|-----|
| L-Pinky | `#E8A87C` (muted orange) |
| L-Ring | `#D4C36A` (muted yellow) |
| L-Middle | `#7BA7C9` (muted blue) |
| L-Index | `#7CB98F` (muted green) |
| L-Thumb | `#A388BF` (muted purple) |
| Unassigned | `#D4D4D4` (light gray) |

## What To Build Next

See `docs/IMPLEMENTATION.md` for phased build order. Summary:
1. Keyboard rendering + finger/character assignment
2. Word list sidebar + graph construction
3. Graph visualization overlay (nodes + edges on keys)
4. Bad word detection engine + flag toggles
5. Word override system
6. Polish: tooltips, hover effects, edge threshold, persistence

## Rules for Implementation

- All config constants in a single `src/config.ts` file
- Node circles must NEVER overflow key boundaries
- Graph edges are strictly adjacent-character pairs (not all pairs in a word)
- Characters without finger assignment break all ergonomic sequences
- Unrecognized characters (not on any key) break adjacency in word parsing
- Debounce word list parsing at 300ms
- Every state change persists to LocalStorage immediately
