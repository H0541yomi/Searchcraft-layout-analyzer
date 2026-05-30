# Architecture

## Component Tree

```
App
├── Header                        # Title + "Reset to Defaults" button
├── MainLayout                    # Horizontal flex: sidebar + keyboard area
│   ├── Sidebar
│   │   ├── WordListStats         # Line count + unique char count
│   │   ├── WordListInput         # Textarea, one word/phrase per line (300ms debounce)
│   │   ├── WordList              # Rendered list of parsed words
│   │   │   └── WordItem[]        # Single word: text, ✓ checkmark, ignore/enable button
│   │   ├── FlagToggles           # 7 checkboxes + show arrows checkbox + master roll logic
│   │   └── SFSGapInput           # Numeric input, range 1–5, default 1
│   └── KeyboardArea
│       ├── FingerLegend          # 5 finger colors + unassigned swatch
│       ├── ShiftLayerToggle      # Button: "Shift Layer ▼/▲"
│       ├── MainKeyboardPanel
│       │   ├── Keyboard (layer=main)
│       │   │   ├── KeyboardRow[] # Row of keys
│       │   │   │   └── Key[]     # Single key: color, char label, click/right-click handlers
│       │   │   └── GraphOverlay (layer=main)  # SVG: nodes + edges for main layer
│       │   └── MouseKeys (layer=main)         # 5 mouse keys
│       │       └── MouseKey[]    # Single mouse key: char only, click to edit
│       └── [Shift panel — when showShiftLayer=true]
│           ├── Keyboard (layer=shift)
│           │   ├── KeyboardRow[]
│           │   │   └── Key[]
│           │   └── GraphOverlay (layer=shift)  # SVG: nodes + edges for shift layer
│           └── MouseKeys (layer=shift)
│               └── MouseKey[]
└── HelpModal                     # Fixed ? button (bottom-right), modal overlay
```

## State Management

**Context + useReducer** (no external library). Single `AppProvider` wraps entire app.

### Primary State Shape

```typescript
interface AppState {
  // Main layer (keyboard + mouse)
  keyAssignments: Record<PhysicalKeyCode, KeyAssignment>
  mouseAssignments: Record<string, string | null>

  // Shift layer (independent keyboard + mouse)
  shiftKeyAssignments: Record<PhysicalKeyCode, KeyAssignment>
  shiftMouseAssignments: Record<string, string | null>

  // Word list
  wordEntries: Array<{ id, text, isOverridden }>

  // Settings
  flags: Record<FlagType, boolean>  // 7 detection flags
  sfsGap: number

  // UI state
  showShiftLayer: boolean
  showArrows: boolean
}

interface KeyAssignment {
  character: string | null
  finger: FingerEnum | null
}
```

### Derived State (computed, not stored)

```typescript
// Computed via useMemo in AppContext
interface DerivedData {
  // Combined char-to-keyCode mapping (main + shift layers)
  charToKey: Map<string, string>

  // All mouse-bound characters (transparent in SFS)
  mouseChars: Set<string>
}

// Per-layer in GraphOverlay
interface LayerGraph {
  nodes: Map<string, { frequency, badnessWeight }>
  edges: Map<string, { source, target, weight }>
}

// Per-word in sidebar
interface WordAnalysis {
  id: string
  flaggedPatterns: Array<{ type, charIndices }>
  isFlagged: boolean
}
```

Derived data recomputes via `useMemo` when primary state changes. Graph construction and bad-word detection are pure functions.

## Data Flow

```
User action (click key / edit word / toggle flag)
  ↓
dispatch(action) to reducer
  ↓
new primary state
  ↓
useMemo recomputes derived state (charToKey, mouseChars)
  ↓
GraphOverlay builds layer-specific graph + analyzeWords
  ↓
components re-render
  ↓
useEffect in AppProvider saves state to LocalStorage
```

## Key Data Flows in Detail

### 1. Finger Assignment (right-click on key, select from dropdown)

```
Key right-click → portal dropdown opens
  ↓
Select finger from dropdown
  ↓
dispatch({ type: 'SET_FINGER', keyCode, finger })
  ↓
reducer updates keyAssignments[keyCode].finger
  ↓
GraphOverlay re-renders (badness may change if finger-unassigned → assigned)
  ↓
WordList re-renders (flagged words may change)
```

### 2. Character Assignment (click key, inline edit)

```
Key click → inline input opens
  ↓
Type character, press Enter or click away
  ↓
dispatch({ type: 'SET_CHARACTER', keyCode, character })
  ↓
reducer: clear character from any other key, set on target key
  ↓
charToKey re-computed
  ↓
Graph fully recomputed (all nodes + edges may change)
```

### 3. Word List Change

```
Textarea input (debounced 300ms)
  ↓
dispatch({ type: 'SET_WORD_LIST', rawText })
  ↓
reducer: split lines, trim, lowercase, preserve spaces
  ↓
wordEntries updated
  ↓
buildGraph called with new entries + charToKey
  ↓
analyzeWords called (detections re-run)
  ↓
WordList re-renders, nodes re-color
```

### 4. Flag Toggle (checkbox change)

```
Checkbox click
  ↓
dispatch({ type: 'TOGGLE_FLAG', flag })
  ↓
reducer: toggle flag, handle master roll logic
  ↓
(graph unchanged, but analysis re-runs)
  ↓
WordList re-renders (flagged words may change)
  ↓
nodes re-color (badness recalculated)
```

### 5. Shift Layer Toggle

```
Button click
  ↓
dispatch({ type: 'TOGGLE_SHIFT_LAYER' })
  ↓
reducer: showShiftLayer flipped
  ↓
MainLayout conditionally renders shift panel
```

## Rendering Layers

Each keyboard has 3 visual layers:

```
┌─────────────────────────────────────┐
│ SVG/Canvas: GraphOverlay            │  ← arrows (edges) between keys
│  ┌───────────────────────────────┐  │
│  │ HTML: Keyboard + Key divs      │  │  ← colored key backgrounds, char labels
│  │  ┌─────────────────────────┐  │  │
│  │  │ SVG: GraphOverlay Nodes  │  │  │  ← circles (freq-sized, badness-tinted)
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Pointer events:** SVG has `pointer-events: none`, so clicks pass through to keys. Edge/node hovers would need explicit event handling (not implemented).

## Per-Layer Graph System

### Main Layer Graph

- **Keyboard source:** `state.keyAssignments`
- **Mouse source:** `state.mouseAssignments`
- **charToKey map:** Includes only main layer chars
- **GraphOverlay:** Renders nodes + edges from main keyboard + main mouse

### Shift Layer Graph

- **Keyboard source:** `state.shiftKeyAssignments`
- **Mouse source:** `state.shiftMouseAssignments`
- **charToKey map:** Includes only shift layer chars
- **GraphOverlay:** Renders nodes + edges from shift keyboard + shift mouse

### Unified Analysis

`analyzeWords()` receives **all 4 sources** (both keyboard layers + both mouse layers) to build a complete `charToKey` for detection. This allows:
- Same character on different keys in different layers (detected as different)
- Badness aggregated across both layers (unified weight)
- Word flagging applies to global analysis, not per-layer

## Data Structures

### Keyboard Layout Data

Static array in `src/data/keyboard-layout.ts`:

```typescript
const KEYBOARD_LAYOUT: PhysicalKeyDef[] = [
  { code: 'KeyQ', label: 'Q', row: 1, column: 1, width: 1.0 },
  // ... 80+ keys total
]

const KEYBOARD_ROWS: PhysicalKeyDef[][] = [
  // row -1: [Escape, F1, F2, ...]
  // row 0: [Backquote, Digit1, ...]
  // ...
]

const KEYS_BY_CODE: Record<string, PhysicalKeyDef>
```

Every key knows its physical position. Graph visualization uses this for pixel math (no DOM measurement).

### Mouse Layout Data

Static in `src/data/mouse-layout.ts`:

```typescript
const MOUSE_KEYS: MouseKeyDef[] = [
  { code: 'MouseLClick', label: 'LClick' },
  { code: 'MouseRClick', label: 'RClick' },
  { code: 'MouseMB4', label: 'MB4' },
  { code: 'MouseMB5', label: 'MB5' },
  { code: 'MouseScroll', label: 'Scroll' },
]
```

### Default Assignments

Static in `src/data/default-assignments.ts`:

```typescript
const DEFAULT_ASSIGNMENTS = {
  'KeyQ': { character: 'q', finger: 'L_PINKY' },
  'KeyW': { character: 'w', finger: 'L_RING' },
  // ... standard QWERTY left-hand defaults
}
```

### Key Pixel Information

Computed once per session in `keyboard-utils.ts`:

```typescript
const keyPixelMap = buildKeyPixelMap()
// Returns Map<keyCode, { x, y, width, height, centerX, centerY }>

// Key positions determined by:
// - layout column position
// - layout width multiplier
// - KEY_UNIT_PX (44px) and KEY_GAP_PX (3px) constants
```

No `useRef` + `getBoundingClientRect()` — all positions computed mathematically from layout data.

## Pure Function Modules

All business logic lives in `src/lib/`, completely separate from React:

| Module | Responsibility | Input | Output |
|--------|---|---|---|
| **graph.ts** | Build directed character graph from word list + charToKey mapping | wordEntries[], charToKey | { nodes, edges } |
| **detection.ts** | 5 independent detectors (SFB, SFS, Roll, Redirect, Scissor) | chars[], fingerOf fn, [rowOf fn], [sfsGap], [mouseChars] | FlaggedPattern[] |
| **analysis.ts** | Orchestrate all detectors across all words, aggregate badness | wordEntries[], assignments (all 4 layers), flags, sfsGap | { wordAnalysis[], nodeBadness } |
| **keyboard-utils.ts** | Pixel math, finger cycling, layout constants | layout data, KEY_UNIT_PX | keyPixelMap, dimensions, cycleFingerForward() |

**No external state**, no side effects. Pure functions = easy testing + predictable behavior.

## LocalStorage Sync

Single `useEffect` in `AppProvider`:

```typescript
useEffect(() => {
  saveState(state)  // Writes all 9 keys to localStorage
}, [state])
```

On app init: `loadState()` reads from localStorage, falls back to `getDefaultState()` on parse error.

All keys JSON-serializable. Date.now() used for word entry IDs (not critical for persistence).

## Reducer Actions

12 action types cover all state mutations:

| Action | Payload | Effect |
|--------|---------|--------|
| `SET_FINGER` | keyCode, finger | Update main keyboard finger |
| `SET_CHARACTER` | keyCode, character | Update main keyboard character (enforce uniqueness) |
| `SET_SHIFT_FINGER` | keyCode, finger | Update shift keyboard finger |
| `SET_SHIFT_CHARACTER` | keyCode, character | Update shift keyboard character |
| `SET_MOUSE_CHARACTER` | keyCode, character, layer | Update mouse assignment (either layer) |
| `SET_WORD_LIST` | rawText | Parse lines, rebuild wordEntries |
| `TOGGLE_FLAG` | flag | Toggle flag (with master roll logic) |
| `SET_SFS_GAP` | gap | Set SFS gap (clamped 1–5) |
| `TOGGLE_OVERRIDE` | id | Toggle override on specific word |
| `RESET_DEFAULTS` | — | Restore main layer to defaults (word list unchanged) |
| `RESET_SHIFT_DEFAULTS` | — | Clear all shift layer assignments |
| `TOGGLE_SHIFT_LAYER` | — | Toggle showShiftLayer |
| `TOGGLE_SHOW_ARROWS` | — | Toggle showArrows |

**Master roll logic** (in reducer):
- `TOGGLE_FLAG('roll')` → sets/clears both outward + inward
- `TOGGLE_FLAG('outward_roll' or 'inward_roll')` → updates roll flag based on both

**Character uniqueness** (in SET_CHARACTER):
- Clear target char from ALL other keys before assigning
- Both keyboard and mouse respect per-layer uniqueness

## Component Responsibilities

### Header.tsx
- Title, description
- "Reset to Defaults" button (dispatches RESET_DEFAULTS)

### FingerLegend.tsx
- 6 colored swatches (5 fingers + unassigned)
- Static, no interaction

### Keyboard.tsx
- Container for keyboard rows + graph overlay
- Manages `editingKeyCode` state (which key is in edit mode)
- Passes dispatch actions to rows/keys

### Key.tsx
- Single key rendering
- **Click:** Opens inline character edit
- **Right-click:** Opens finger dropdown (via portal)
- **Inline edit:** Text input with Enter/Escape handlers
- **Finger dropdown:** Portal to document.body (avoids overflow:hidden clipping)

### KeyboardRow.tsx
- Renders a horizontal row of Key components
- No logic, just layout

### GraphOverlay.tsx
- SVG layer overlaid on keyboard
- Builds layer-specific charToKey (only from that layer)
- Calls buildGraph() + analyzeWords() (both layers + both mouse for unified analysis)
- Renders GraphNode + GraphEdge components
- Updates live on any state change

### GraphNode.tsx
- SVG circle positioned at key center
- Size: frequency-based (15–100% of max allowed)
- Color: normal + red tint (badness-based)

### GraphEdge.tsx
- SVG path + arrowhead marker
- Opacity: weight-based (15–70%)
- Curve offset for bidirectional edges
- Self-loop handled as circular arrow

### MouseKeys.tsx
- Container for 5 mouse key buttons (per layer)

### MouseKey.tsx
- Single mouse key rendering
- **Click:** Opens inline character edit
- Character label or empty
- No finger selector

### Sidebar.tsx
- Container for word list + flags + settings
- Imports all sidebar components

### WordListInput.tsx
- Textarea with 300ms parse debounce
- Dispatches SET_WORD_LIST on input change

### WordListStats.tsx
- Line count + unique char count
- Computed from current wordEntries + charToKey

### WordList.tsx
- Container for all WordItem components

### WordItem.tsx
- Single word display
- Red highlight if flagged (and not overridden)
- Strikethrough + muted if overridden
- Green ✓ checkmark if clean (and analyzed)
- "ignore warning" / "enable warning" button (toggles override)

### FlagToggles.tsx
- 7 checkboxes (roll, outward_roll, inward_roll, redirect, sfb, sfs, scissor)
- "Show Arrows" checkbox (toggles showArrows)
- Master roll logic: toggling "roll" auto-enables/disables both sub-flags

### SFSGapInput.tsx
- Numeric input, clamped 1–5
- Dispatches SET_SFS_GAP

### MainLayout.tsx
- Horizontal flex: Sidebar | KeyboardArea
- Keyboard area contains: FingerLegend + [main keyboard + mouse] + [shift button] + [shift panel if visible]

### App.tsx
- AppProvider wrapper
- Renders Header + MainLayout + HelpModal

### HelpModal.tsx
- Fixed "?" button (bottom-right)
- Click opens modal with help content
- Click outside or "close" button closes

## Key Pixel Position Math

Computed in `keyboard-utils.ts`:

```typescript
buildKeyPixelMap(): Map<keyCode, KeyPixelInfo> {
  for each row:
    let xCursor = 0
    for each key:
      width = key.width * KEY_UNIT_PX
      x = xCursor
      y = row_index * (KEY_UNIT_PX + KEY_GAP_PX)
      centerX = x + width / 2
      centerY = y + KEY_UNIT_PX / 2
      xCursor += width + KEY_GAP_PX
}
```

**No dynamic resizing.** Key positions are fixed based on layout. If window resizes, keyboard scales via CSS transform or container width — pixel math still valid.

## Graph Visualization Formulas

### Node Size

```
max_allowed = min(key.width, key.height) * 0.8  // 80% key cap
relative = (frequency / maxFrequency) * (1.0 - 0.15) + 0.15  // 15–100% range
diameter = relative * max_allowed
```

Special case: spacebar uses `height * 0.8` (not width).

### Edge Opacity

```
opacity = (weight / maxWeight) * (0.70 - 0.15) + 0.15  // 15–70% range
```

### Badness Tint

```
intensity = max(0.10, (badnessWeight / maxBadness))  // 10–100%
tint_color = rgba(200, 0, 0, intensity * 0.5)  // max 50% opacity on red overlay
```

## Memoization Strategy

**GraphOverlay.tsx** is the most expensive component:

```typescript
const { nodes, edges, keyPixelMap, dimensions } = useMemo(() => {
  const keyPixelMap = buildKeyPixelMap()
  const dimensions = getKeyboardDimensions()
  const graph = buildGraph(wordEntries, charToKey)
  const analysis = analyzeWords(...)
  
  // Apply badness to graph
  for (const [char, badness] of analysis.nodeBadness) {
    graph.nodes.get(char).badnessWeight = badness
  }
  
  return { nodes, edges, keyPixelMap, dimensions }
}, [
  wordEntries,
  keyAssignments,
  shiftKeyAssignments,
  mouseAssignments,
  shiftMouseAssignments,
  flags,
  sfsGap,
  charToKey
])
```

Dependency array ensures recompute on any relevant state change. Building keyPixelMap every render is cheap (80 keys, linear time), so OK to exclude from memo.

## Error Handling

- **localStorage parse failure:** Log warning, use defaults
- **Invalid character input:** Rejected in reducer (isPrintableChar check)
- **SFS gap out of range:** Clamped in reducer (min 1, max 5)
- **Missing key code in pixel map:** Null checks in GraphOverlay prevent crashes
- **Word parsing edge cases:** Empty lines skipped, unrecognized chars ignored

No external error boundary needed (SPA, no async calls).

## Performance Characteristics

- **Graph build:** O(total_chars + edges) — linear in word list size
- **Detection:** O(chars * flagged_patterns) — worst case all patterns active
- **Node sizing:** O(unique_chars) — small set
- **Rendering:** React handles with memoization; 500+ word lists tested ≤500ms

**Debounce:** Word list input debounced at 300ms to avoid rapid rebuilds on each keystroke.

**LocalStorage:** Async writes (not awaited), max ~50KB data (all 9 keys combined).
