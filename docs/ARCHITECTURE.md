# Architecture

## Component Tree

```
App
├── Header                        # Title + "Reset to Defaults" button
├── MainLayout                    # Horizontal flex: sidebar + keyboard area
│   ├── Sidebar                   # Left panel
│   │   ├── WordListInput         # Textarea, one word/phrase per line
│   │   ├── WordListStats         # Line count + unique char count
│   │   ├── WordList              # Rendered list of parsed words
│   │   │   └── WordItem          # Single word: text, flag highlight, override toggle
│   │   ├── FlagToggles           # 7 checkboxes (Rolls, Outward, Inward, Redirects, SFBs, SFSs, Scissors)
│   │   └── SFSGapInput          # Numeric input for SFS gap (1–5)
│   └── KeyboardArea              # Right panel
│       ├── FingerLegend          # Color legend for 5 fingers + unassigned
│       └── Keyboard              # Full ANSI keyboard
│           ├── KeyboardRow       # One row of keys
│           │   └── Key           # Single key: finger color, character label, click/dblclick handlers
│           └── GraphOverlay      # SVG/Canvas layer on top of keyboard
│               ├── GraphNode     # Circle on key, sized by frequency, red tint by badness
│               └── GraphEdge     # Directed arrow between keys, opacity by weight
```

## State Management

Use React Context + `useReducer` for global state. No external state library needed at this scale.

### Primary State Shape

```typescript
interface AppState {
  // Keyboard
  keyAssignments: Record<PhysicalKeyCode, {
    character: string | null
    finger: FingerEnum | null
  }>

  // Word list
  wordEntries: Array<{
    id: string
    text: string
    isOverridden: boolean
  }>

  // Settings
  flags: Record<FlagType, boolean>
  sfsGap: number
}
```

### Derived State (computed, not stored)

```typescript
interface DerivedState {
  // Graph
  graph: {
    nodes: Map<string, { frequency: number; badnessWeight: number }>
    edges: Map<string, { source: string; target: string; weight: number }>
  }

  // Per-word analysis
  wordAnalysis: Array<{
    id: string
    flaggedPatterns: Array<{ type: FlagType; charIndices: number[] }>
    isFlagged: boolean
  }>

  // Lookup: character → PhysicalKeyCode
  charToKey: Map<string, PhysicalKeyCode>
}
```

Derived state recomputes via `useMemo` whenever primary state changes. Graph construction and bad-word detection are pure functions of primary state.

## Data Flow

```
User action (click key / edit word list / toggle flag)
  → dispatch action to reducer
  → new primary state
  → useMemo recomputes derived state (graph + analysis)
  → components re-render with new data
  → LocalStorage persistence (useEffect on state change)
```

## Key Data Flows in Detail

### 1. Finger Assignment (click key)

```
Key click → dispatch SET_FINGER → reducer cycles finger enum
  → keyAssignments updated → derived state recomputes
  → graph badness recalculated (finger changes affect SFB/roll/etc.)
  → Key re-renders with new color
  → GraphOverlay re-renders (badness tint may change)
  → WordList re-renders (flagged words may change)
```

### 2. Character Assignment (double-click key)

```
Key dblclick → inline edit → confirm
  → dispatch SET_CHARACTER { keyCode, newChar }
  → reducer: if newChar already on another key, clear it there
  → keyAssignments updated → derived state recomputes
  → graph fully recomputed (character positions changed)
```

### 3. Word List Change

```
Textarea input → debounce 300ms → dispatch SET_WORD_LIST
  → parse lines, normalize lowercase, preserve spaces
  → graph recomputed from scratch
  → word analysis recomputed
```

### 4. Flag Toggle

```
Checkbox click → dispatch TOGGLE_FLAG { flag }
  → if flag = "roll": also set outward_roll + inward_roll
  → if flag = outward/inward: update roll master based on both states
  → word analysis recomputed (graph unchanged)
```

## Rendering Layers

Keyboard + graph use a layered approach:

```
┌─────────────────────────────┐
│ SVG/Canvas: GraphOverlay    │  ← arrows (edges) between keys
│  ┌───────────────────────┐  │
│  │ HTML: Keyboard keys   │  │  ← colored key divs with labels
│  │  ┌─────────────────┐  │  │
│  │  │ SVG: GraphNodes  │  │  │  ← circles on keys (absolute positioned)
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

Edges must route between key centers. Use an SVG overlay with `pointer-events: none` so clicks pass through to keys. Nodes can be absolute-positioned divs or SVG circles within each key.

## Keyboard Layout Data

Static data structure defining physical key positions, sizes, and rows. Stored in `src/data/keyboard-layout.ts`:

```typescript
interface PhysicalKey {
  code: PhysicalKeyCode    // e.g., "KeyQ", "Digit1", "F5"
  label: string            // display label: "Q", "1", "F5", "Tab"
  row: number              // -1 to 4
  column: number           // physical column index
  width: number            // relative width (1 = standard key)
  height: number           // relative height (1 = standard key)
}
```

All keys in one flat array, grouped by row for rendering. F-keys use `width: 1, height: 1` (same as alpha).

## LocalStorage Sync

Single `useEffect` in the context provider:

```typescript
useEffect(() => {
  localStorage.setItem('skp-key-assignments', JSON.stringify(state.keyAssignments))
  localStorage.setItem('skp-word-list', JSON.stringify(state.wordEntries))
  localStorage.setItem('skp-flags', JSON.stringify(state.flags))
  localStorage.setItem('skp-sfs-gap', JSON.stringify(state.sfsGap))
}, [state])
```

On init: read from LocalStorage, fallback to defaults on parse error.

## Pure Function Modules

Keep logic out of components. Key modules in `src/lib/`:

| Module | Responsibility |
|--------|---------------|
| `graph.ts` | Build directed character graph from word list + key assignments |
| `detection.ts` | All bad-word detection algorithms (SFB, SFS, roll, redirect, scissor) |
| `analysis.ts` | Orchestrate detection across all words, compute per-node badness weights |
| `keyboard-utils.ts` | Finger cycling, character reassignment logic, default assignments |
