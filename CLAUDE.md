# SearchCraft Keybind Planner

## What This Is

Browser-based tool for Minecraft speedrunners optimizing left-hand keyboard layouts for searchcrafting. Right hand stays on mouse. Users assign characters + fingers to keys across two layers (main and shift), input word lists, and get real-time visual + analytic feedback on ergonomic problem areas (SFBs, rolls, scissors, redirects, etc.) visualized as a directed graph overlaid on keyboards.

## Project Status

**Status: COMPLETE** — All features implemented and functional. Production ready for light-mode browsers.

## Stack

- **Framework:** React 19 + TypeScript 6
- **Build:** Vite 8
- **Lint:** ESLint 10 with react-hooks + react-refresh plugins
- **Styling:** Plain CSS (light mode only, no framework)
- **State persistence:** LocalStorage (9 keys, no backend)
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
├── PRD.md                          # Product requirements (v4, implemented)
├── CLAUDE.md                       # This file
├── docs/
│   ├── ARCHITECTURE.md             # Component tree, state shape, data flow
│   └── IMPLEMENTATION.md           # Reference of what was built
├── index.html                      # Vite entry
├── src/
│   ├── main.tsx                    # React root
│   ├── App.tsx                     # App layout root
│   ├── App.css                     # Main styles
│   ├── index.css                   # CSS reset + base
│   ├── config.ts                   # All constants (colors, sizes, thresholds)
│   ├── types.ts                    # TypeScript type definitions
│   ├── data/
│   │   ├── keyboard-layout.ts      # Physical key definitions (ANSI layout)
│   │   ├── mouse-layout.ts         # 5 mouse keys (LClick, RClick, MB4, MB5, Scroll)
│   │   └── default-assignments.ts  # Default QWERTY finger + char assignments
│   ├── state/
│   │   ├── AppContext.tsx          # React context + hooks (useAppState, useAppDispatch, etc.)
│   │   ├── reducer.ts              # State reducer: 12 action types
│   │   └── persistence.ts          # LocalStorage read/write + defaults
│   ├── lib/
│   │   ├── graph.ts                # buildGraph: adjacency, directed edges, spaces as chars
│   │   ├── detection.ts            # 5 detectors: SFB, SFS, Rolls, Redirects, Scissors
│   │   ├── analysis.ts             # Orchestrates detectors, aggregates badness per node
│   │   └── keyboard-utils.ts       # Pixel math, finger cycling, keyboard dimensions
│   ├── components/
│   │   ├── Header.tsx              # Title + "Reset to Defaults" button
│   │   ├── FingerLegend.tsx        # 5 finger colors + unassigned swatches
│   │   ├── HelpModal.tsx           # Help overlay (? button)
│   │   ├── MainLayout.tsx          # Main flex container (sidebar + keyboards + mouse)
│   │   ├── Keyboard/
│   │   │   ├── Keyboard.tsx        # Keyboard container, renders all rows + graph overlay
│   │   │   ├── KeyboardRow.tsx     # Single row of keys
│   │   │   └── Key.tsx             # Single key: color, char, click/right-click handlers
│   │   ├── GraphOverlay/
│   │   │   ├── GraphOverlay.tsx    # SVG overlay: nodes + edges + markers
│   │   │   ├── GraphNode.tsx       # SVG circle with badness tint
│   │   │   └── GraphEdge.tsx       # SVG path + arrowhead for directed edge
│   │   ├── MouseKeys/
│   │   │   ├── MouseKeys.tsx       # Container for 5 mouse keys
│   │   │   └── MouseKey.tsx        # Single mouse key (char edit only)
│   │   └── Sidebar/
│   │       ├── Sidebar.tsx         # Full sidebar: word list + flags + settings
│   │       ├── WordListInput.tsx   # Textarea for word list
│   │       ├── WordListStats.tsx   # Line count + unique char count
│   │       ├── WordList.tsx        # Rendered list of words
│   │       ├── WordItem.tsx        # Single word: flag highlight, override toggle, checkmark
│   │       ├── FlagToggles.tsx     # 7 checkboxes + master roll logic
│   │       └── SFSGapInput.tsx     # SFS gap numeric input (1–5)
├── public/
│   └── favicon.svg
├── vite.config.ts
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── eslint.config.js
└── package.json
```

## Key Design Decisions

- **Left hand only.** 5 fingers: L-Pinky, L-Ring, L-Middle, L-Index, L-Thumb. No right-hand assignment.
- **Two layers.** Main keyboard + shift layer (both fully independent). Mouse keys shared visual but layer-specific.
- **Unassigned keys allowed.** Keys can have: finger + char, finger only, char only, or neither.
- **Character uniqueness.** Each character assigned to at most one key per layer. Moving char clears old key.
- **Directed graph.** a→r ≠ r→a. Edges only between adjacent characters in words.
- **Spaces are characters.** Create nodes and edges. Represented as `␣` in UI.
- **Light mode only.** Calm, muted finger colors (orange, yellow, blue, green, purple).
- **Graph edges always shown** (unless `showArrows` is toggled off). No weight-based hiding.
- **SFS gap configurable.** User control: default 1, range 1–5.
- **Rolls master flag.** Toggling "Rolls" auto-enables/disables both Outward and Inward.
- **Scissor detection excludes thumbs.**
- **F-keys same size as alpha keys.**
- **Mouse keys transparent in SFS gap.** Intervening mouse-bound chars don't break skipgrams.
- **Shift layer independent.** Each layer has own keyboard, mouse, graph, analysis.
- **Portal dropdowns.** Finger selector uses React portal to avoid z-index/overflow clipping.

## Interaction Model

### Keyboard Keys
- **Left-click** → Opens inline character edit field. Type character, press Enter or click away to confirm. Escape cancels.
- **Right-click** → Opens finger dropdown (portal-based, rendered to document.body). Select finger or "Unassigned." Click elsewhere closes.
- **Double-click not used** for char edit (single-click opens inline edit).

### Mouse Keys (LClick, RClick, MB4, MB5, Scroll)
- **Left-click** → Opens inline character edit field (same as keyboard keys).
- **No finger assignment.** Mouse keys have no finger, only character binding.

### Shift Layer
- **Button** "Shift Layer ▼/▲" toggles panel visibility.
- Shift layer fully independent from main: separate keyboard, separate mouse assignments, separate graph.
- Both layers analyzed together when computing badness (unified graph).

### Graph Visualization
- **Nodes:** Semi-transparent circles on keys, sized by frequency (capped to 80% of key).
- **Edges:** Directed arrows with opacity scaled by weight. Show/hide toggle in sidebar.
- **Red tint:** Node badness visualized as red overlay (0–50% opacity).
- **Bidirectional edges:** Curved offset to avoid overlap (a↔b renders as curved arrows).
- **Self-loops:** Small circular arrow on key itself.

## Finger Colors

| Finger | Hex | Name |
|--------|-----|------|
| L-Pinky | `#E8A87C` | Muted Orange |
| L-Ring | `#D4C36A` | Muted Yellow |
| L-Middle | `#7BA7C9` | Muted Blue |
| L-Index | `#7CB98F` | Muted Green |
| L-Thumb | `#A388BF` | Muted Purple |
| Unassigned | `#D4D4D4` | Light Gray |

## Canonical Terminology

From PRD §2 Glossary: Bigram, Roll, Outward Roll, Inward Roll, Redirect, SFB, SFS, Scissor, Directed Character Graph, Badness Weight, Word Override, Unassigned Key, Shift Layer, Mouse Key.

## Config Constants

Single source: `src/config.ts`

```typescript
const CONFIG = {
  NODE_SIZE_FLOOR: 0.15,          // min node size (15% of max allowed)
  NODE_SIZE_MAX: 1.0,             // max = full key-capped size (80% of key)
  EDGE_OPACITY_FLOOR: 0.15,       // min edge opacity
  EDGE_OPACITY_MAX: 0.70,         // max edge opacity
  EDGE_WEIGHT_THRESHOLD: 2,       // no longer used in UI (edges always shown)
  BADNESS_TINT_FLOOR: 0.10,       // min red tint (10% intensity)
  DEBOUNCE_MS: 300,               // word list parse debounce
  SFS_GAP_DEFAULT: 1,
  SFS_GAP_MIN: 1,
  SFS_GAP_MAX: 5,
  FINGER_LATERAL_ORDER: { ... },  // pinky(0)...thumb(4)
  FINGER_HEIGHT: { ... },         // middle(3) > ring(2) > pinky(1) > index(0)
  FINGER_COLORS: { ... },         // all 6 colors
}
```

## LocalStorage Keys

9 keys, all JSON-serialized:

| Key | Value Type | Purpose |
|-----|-----------|---------|
| `skp-key-assignments` | `Record<keyCode, {character, finger}>` | Main layer keyboard |
| `skp-shift-key-assignments` | `Record<keyCode, {character, finger}>` | Shift layer keyboard |
| `skp-mouse-assignments` | `Record<mouseCode, character\|null>` | Main layer mouse |
| `skp-shift-mouse-assignments` | `Record<mouseCode, character\|null>` | Shift layer mouse |
| `skp-word-list` | `Array<{id, text, isOverridden}>` | Word entries |
| `skp-flags` | `Record<FlagType, boolean>` | 7 detection flags |
| `skp-sfs-gap` | `number` | SFS gap setting (1–5) |
| `skp-show-shift-layer` | `boolean` | Shift panel visibility |
| `skp-show-arrows` | `boolean` | Graph edge visibility |

Parse failure → fallback to defaults + console warning.

## Rules for Implementation

- All constants in `src/config.ts` only
- Node circles NEVER overflow key boundaries (80% max)
- Graph edges strictly adjacent-character pairs (not all pairs in word)
- Characters without finger assignment break all ergonomic sequences
- Unrecognized characters (not on any key) break adjacency in word parsing
- Debounce word list parsing at 300ms
- Every state change persists to LocalStorage immediately (via `useEffect` in AppProvider)
- Mouse chars transparent in SFS gap (don't break intervening check)
- Mouse chars DO participate in other patterns (SFB, rolls, redirects, scissors)
