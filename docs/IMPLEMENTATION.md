# Implementation Guide

## Build Order

Phases are sequential — each depends on the previous. Within each phase, tasks can be parallelized where noted.

---

### Phase 1: Foundation

**Goal:** Keyboard renders, finger/character assignment works, state persists.

#### Tasks

1. **`src/config.ts`** — All constants from PRD §6 (colors, thresholds, sizing, row assignments, finger ordering). Every magic number lives here.

2. **`src/types.ts`** — TypeScript types: `FingerEnum`, `FlagType`, `PhysicalKeyCode`, `KeyAssignment`, `WordEntry`, `GraphNode`, `GraphEdge`, `AppState`, `AppAction`.

3. **`src/data/keyboard-layout.ts`** — Static array of all physical keys with `code`, `label`, `row`, `column`, `width`. Include:
   - F1–F12 (row -1, width 1)
   - Number row: `` ` ``, 1–0, `-`, `=` (row 0)
   - Alpha rows with Tab, CapsLock, LShift, RShift (rows 1–3)
   - Bottom mod row: LCtrl, LAlt, Space (width ~6), RAlt, RCtrl (row 4)
   
4. **`src/data/default-assignments.ts`** — Default finger + character map for left-hand QWERTY keys. Everything else = `{ character: null, finger: null }`.

5. **`src/state/`** — Context + reducer:
   - `AppContext.tsx` — React context provider
   - `reducer.ts` — Handles: `SET_FINGER`, `SET_CHARACTER`, `SET_WORD_LIST`, `TOGGLE_FLAG`, `SET_SFS_GAP`, `TOGGLE_OVERRIDE`, `CLEAR_OVERRIDES`, `RESET_DEFAULTS`
   - `persistence.ts` — LocalStorage read/write helpers with fallback

6. **`src/components/Keyboard/`** — `Keyboard.tsx`, `KeyboardRow.tsx`, `Key.tsx`
   - Render full ANSI layout from static data
   - Color keys by finger assignment
   - Click → cycle finger
   - Double-click → inline character edit
   - Right-click → finger dropdown

7. **`src/components/FingerLegend.tsx`** — Color swatches + labels for 5 fingers + unassigned

#### Acceptance Gate
- All keys render at correct positions/sizes
- F-keys same size as alpha keys
- Left-hand keys colored, right-hand keys gray
- Click cycles fingers, double-click edits character
- Character uniqueness enforced (moving clears old key)
- State survives page reload

---

### Phase 2: Word List + Graph

**Goal:** Sidebar accepts words, directed graph constructed correctly.

#### Tasks

1. **`src/lib/graph.ts`** — `buildGraph(words: string[], charToKey: Map<string, string>)`:
   - Normalize to lowercase
   - Skip chars not assigned to any key (break adjacency)
   - Only adjacent pairs create directed edges
   - Return `{ nodes, edges }`

2. **`src/components/Sidebar/`** — `Sidebar.tsx`, `WordListInput.tsx`, `WordListStats.tsx`, `WordList.tsx`, `WordItem.tsx`
   - Textarea input, debounced 300ms
   - Display parsed words as list
   - Show line count + unique char count

3. **`src/components/MainLayout.tsx`** — Horizontal flex: sidebar (left, ~300px) + keyboard area (right, flex-grow)

#### Acceptance Gate
- "craft" → edges c→a? No. c→r? No. Edges: c→r, r→a, a→f, f→t. Wait — "craft" adjacency: c-r, r-a, a-f, f-t. So c→r ✓
- "cart" → c→a, a→r, r→t (NOT c→r)
- "iron sword" → `n→[space]`, `[space]→s` edges exist
- Duplicate lines double edge weights
- Spaces create nodes

---

### Phase 3: Graph Visualization

**Goal:** Nodes + edges overlay the keyboard.

#### Tasks

1. **`src/components/GraphOverlay/`** — `GraphOverlay.tsx`, `GraphNode.tsx`, `GraphEdge.tsx`
   - SVG layer positioned absolutely over keyboard
   - Nodes: circles centered on keys, sized by frequency (capped to key dimensions)
   - Edges: directed arrows with arrowhead markers, opacity by weight
   - Self-loops: small circular arrow
   - Bidirectional edges: curve offset to avoid overlap
   - Edges below `EDGE_WEIGHT_THRESHOLD` hidden

2. **Key position resolver** — Need to know pixel coordinates of each key center for edge routing. Options:
   - `useRef` on each `Key` + `getBoundingClientRect()` on mount/resize
   - Or compute from layout data + known key size in px
   - Recommend: layout-based computation (no DOM measurement needed, deterministic)

#### Gotchas
- SVG overlay must have `pointer-events: none` except on hover targets
- Spacebar node: cap to height not width
- ArrowHead SVG marker definition: define once in `<defs>`, reference via `marker-end`
- Recalc on window resize if using DOM measurement approach

#### Acceptance Gate
- Circles never overflow keys
- Arrows visible, directed, opacity varies
- Low-weight edges hidden
- Live update on word list or assignment change

---

### Phase 4: Bad Word Detection

**Goal:** Flag words with ergonomic issues, visualize badness on nodes.

#### Tasks

1. **`src/lib/detection.ts`** — Pure functions for each pattern:
   - `detectSFBs(word, charToFinger)` → `{ charIndices }[]`
   - `detectSFS(word, charToFinger, gap)` → `{ charIndices }[]`
   - `detectRolls(word, charToFinger)` → `{ charIndices, direction }[]`
   - `detectRedirects(word, charToFinger)` → `{ charIndices }[]`
   - `detectScissors(word, charToFinger, charToRow)` → `{ charIndices }[]`

2. **`src/lib/analysis.ts`** — `analyzeWords(words, keyAssignments, flags, sfsGap)`:
   - Run active detectors on each non-overridden word
   - Aggregate badness weights per character
   - Return per-word flag results + per-node badness

3. **`src/components/Sidebar/FlagToggles.tsx`** — 7 checkboxes with master-flag logic:
   - Rolls ON → Outward ON + Inward ON
   - Rolls OFF → Outward OFF + Inward OFF
   - Both sub-flags ON → Rolls shows ON
   - Either sub-flag OFF → Rolls shows OFF

4. **`src/components/Sidebar/SFSGapInput.tsx`** — Number input, min 1, max 5

5. **Badness tint on GraphNode** — Red overlay with opacity = `max(0.10, badness / maxBadness)`

6. **Red highlight on WordItem** — Flagged words get red background. Tooltip shows which flags triggered.

#### Key Implementation Details

**SFB:** Trivial — for each adjacent pair, compare finger assignments.

**SFS:** For each pair at distance `gap + 1`, also verify ALL intervening characters have finger assignments (else skip).

**Roll:** Scan word for maximal same-hand sequences. Within each, check if all finger transitions are consistently increasing (inward) or decreasing (outward). A sequence of ≥2 chars qualifies.

**Redirect:** Within maximal same-hand sequences, find points where direction flips. Flag the 3-char window around each flip (or the full redirect sequence).

**Scissor:** For each adjacent pair, both must have non-thumb finger assignments. Check `|row_a - row_b| >= 2` AND height-guide violation (the finger that naturally rests lower is on the higher row).

#### Acceptance Gate
- All 7 flags work independently
- Master roll flag controls sub-flags
- SFS gap changes detection range
- Flagged words highlighted red
- Badness tint visible and proportional on nodes
- Finger-unassigned characters break all sequences

---

### Phase 5: Word Override

**Goal:** Users can exempt specific word instances from detection.

#### Tasks

1. **Override toggle on `WordItem`** — Button/icon per word line
2. **Visual treatment** — Overridden words: strikethrough + muted, no red highlight
3. **Exclusion from analysis** — Overridden words skipped in `analyzeWords()`
4. **Still in graph** — Overridden words still contribute to `buildGraph()`
5. **Per-instance** — Each line has independent override state
6. **"Clear All Overrides" button** in sidebar

#### Acceptance Gate
- Override removes red highlight + badness contribution
- Graph nodes/edges unchanged by override
- Per-instance for duplicate words
- Persists to LocalStorage

---

### Phase 6: Polish

**Goal:** Tooltips, hover effects, final visual pass.

#### Tasks
- Edge tooltip: hover shows source, target, weight
- Node hover: highlight connected edges at 100% opacity
- Flagged word tooltip: show which patterns triggered + character positions
- Verify WCAG AA contrast for all finger colors against white + dark text
- Test with 500+ word lists for performance
- Clean up any `console.log` or dev artifacts
- Final responsive check at 1024px

---

## Testing Strategy

No test framework in scaffold yet. Recommended: **Vitest** (integrates with Vite).

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Priority test targets:
1. `graph.ts` — Unit tests for edge construction, adjacency, direction, self-loops, ignored chars
2. `detection.ts` — Unit tests for each detector with known inputs
3. `analysis.ts` — Integration tests combining detectors + badness calculation
4. `reducer.ts` — State transition tests (finger cycling, character uniqueness, flag logic)

Graph + detection are pure functions — easy to test without React.

---

## Common Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| Creating edges between non-adjacent chars | `graph.ts` must iterate `i, i+1` pairs ONLY |
| Treating `a→r` and `r→a` as same edge | Edge key = `"${source}→${target}"`, directed |
| Node overflowing key | Size formula uses `min(keyWidth, keyHeight)` as cap |
| Forgetting spaces are chars | Parse lines raw (don't trim/split on space) |
| SFS checking across finger-unassigned gaps | Verify ALL chars in range `[i, i+gap+1]` have fingers |
| Scissor false positive on thumb | Exclude `L_THUMB` from scissor checks explicitly |
| Roll/redirect across hands | Not possible (only left hand exists), but guard anyway |
| Master flag desyncing from sub-flags | Single reducer action handles all three flags atomically |
