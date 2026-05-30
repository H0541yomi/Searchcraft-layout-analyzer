# SearchCraft Keybind Planner — Product Requirements Document

**Version:** 4.0
**Last Updated:** 2025-05-29
**Status:** Implemented

---

## 1. Overview

SearchCraft Keybind Planner is a browser-based tool for Minecraft speedrunners optimizing left-hand keyboard layouts for searchcrafting. Right hand stays on mouse — only left-hand keys are assignable. Players input word lists, assign characters and fingers to keys across two independent layers (main and shift), and get real-time visual + analytic feedback on ergonomic problem areas (SFBs, redirects, scissors, etc.).

The app features a directed character graph overlaid on both the main and shift layer keyboards. A second panel displays assignable mouse keys (LClick, RClick, MB4, MB5, Scroll) that can bind characters independently per layer.

**Platform:** Web SPA, no backend
**Target Browsers:** Chrome, Firefox, Edge (latest 2 versions)
**Persistence:** LocalStorage (9 keys for keyboard layers, mouse layers, word list, flags, SFS gap, layer visibility, edge toggle)
**Visual Mode:** Light mode only. Calm, muted color palette.

---

## 2. Glossary

All definitions below are **canonical** — UI labels, tooltips, and documentation must use these exact terms.

| Term | Definition |
|------|-----------|
| **Bigram** | A 2-character sequence derived from two adjacent characters in a word. |
| **Roll** | A sequence of ≥2 adjacent characters typed one finger at a time, moving consistently in one lateral direction (L→R or R→L). Non-consecutive fingers allowed (e.g., pinky→middle skipping ring). All characters must be on the left hand (right hand is on mouse). |
| **Outward Roll** | A roll moving from thumb toward pinky (center of keyboard → left edge). On the left hand: L-Thumb → L-Index → L-Middle → L-Ring → L-Pinky (decreasing finger lateral index). |
| **Inward Roll** | A roll moving from pinky toward thumb (left edge → center). On the left hand: L-Pinky → L-Ring → L-Middle → L-Index → L-Thumb (increasing finger lateral index). |
| **Redirect** | A sequence of ≥3 adjacent characters on the left hand that changes lateral direction mid-sequence. E.g., finger sequence [middle, index, ring] = inward then outward = redirect. |
| **SFB (Single Finger Bigram)** | Two adjacent characters in a word typed with the same finger. |
| **SFS (Single Finger Skipgram)** | Two characters separated by a configurable gap (default: 1 intervening character) typed with the same finger. E.g., with gap=1, characters at positions i and i+2. |
| **Scissor** | A bigram where one character is ≥2 rows higher than the other on the keyboard, AND the two fingers involved violate the natural height guide (middle > ring > pinky > index). Thumb keys excluded from scissor detection. |
| **Directed Character Graph** | A graph where characters are nodes and adjacent character pairs in words are directed edges. Edge weight = frequency of that ordered bigram across all words. a→r and r→a are distinct edges. |
| **Badness Weight** | Per-node accumulated weight from characters participating in flagged bad patterns. Drives red tint intensity on graph nodes. |
| **Word Override** | User-applied flag on a specific word instance that exempts it from all bad-word detection. |
| **Unassigned Key** | A key with no finger and/or no character assigned. Characters on unassigned keys cannot participate in ergonomic analysis. |
| **Shift Layer** | A second, independent keyboard layer accessible via toggle. Separate character + finger assignments, separate mouse bindings. Analyzed together with main layer for graph construction. |
| **Mouse Key** | One of 5 bindable mouse actions (LClick, RClick, MB4, MB5, Scroll). No finger assignment. Characters bound to mouse keys are transparent in SFS gap detection but participate in other patterns. |

### Height Guide Reference (Scissor Detection)

Natural finger height ordering (highest to lowest resting position):

```
middle > ring > pinky > index
```

Thumbs are **excluded** from scissor detection entirely. A scissor is detected when the finger that naturally rests *lower* strikes a key ≥2 rows *higher* than the other finger in the bigram.

---

## 3. Feature Requirements

---

### 3.1 Interactive Keyboard (Main + Shift Layer)

#### Description

A visual keyboard rendered in the UI representing the full physical keyboard. Function keys render at the same size as alpha keys. Left-hand keys can be assigned characters + fingers on the main layer. The shift layer is a fully independent copy with its own character and finger assignments. Users can reassign both **characters** and **fingers** to any key, including modifier keys (Shift, Ctrl, Alt, Tab, CapsLock).

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| KB-1 | Render a full ANSI keyboard layout including: function row (F1–F12, rendered same size as alpha keys), number row (`` ` ``, 1–9, 0, `-`, `=`), top alpha row, home alpha row, bottom alpha row, modifier keys (Tab, CapsLock, LShift, LCtrl, LAlt, RShift, RCtrl, RAlt), and spacebar. | ✅ Implemented |
| KB-2 | Function keys render at the same physical size as standard alpha keys (not smaller). | ✅ Implemented |
| KB-3 | Each key displays: (a) its assigned character (if any), and (b) its finger assignment color (if any). Unassigned keys render in neutral gray with a dimmed physical key label. | ✅ Implemented |
| KB-4 | **Finger assignment:** Clicking a key opens a finger dropdown (right-click). Select specific finger or "Unassigned." Portal-based dropdown avoids z-index clipping. | ✅ Implemented (right-click opens portal dropdown) |
| KB-5 | **Character assignment:** Clicking a key opens an inline text input to type a new character for that key. Pressing Enter or clicking away confirms. Pressing Escape cancels. | ✅ Implemented |
| KB-6 | Character reassignment removes that character from any previous key it was assigned to (each character can exist on at most one key per layer). | ✅ Implemented |
| KB-7 | Assigning a character that was on another key: the old key becomes character-unassigned (keeps its finger assignment). | ✅ Implemented |
| KB-8 | A key can have a finger but no character, or a character but no finger, or both, or neither. All four states are valid. | ✅ Implemented |
| KB-9 | Default left-hand finger+character assignments follow standard QWERTY (see table below). All other keys default to unassigned (no finger, no character). | ✅ Implemented |
| KB-10 | Modifier keys (Tab, CapsLock, LShift, LCtrl, LAlt) are assignable — users can assign both characters and fingers to them, just like any other key. They default to unassigned. | ✅ Implemented |
| KB-11 | A "Reset to Defaults" button restores all keys to default state. | ✅ Implemented |
| KB-12 | All assignments (finger + character) persist to LocalStorage on every change. | ✅ Implemented |
| KB-13 | A visible legend maps each finger color. Unassigned = gray. | ✅ Implemented |
| KB-14 | Space key is assignable and defaults to L-Thumb with character `" "` (space). | ✅ Implemented |
| KB-15 | **Shift Layer:** Second keyboard panel accessible via "Shift Layer" toggle button. Fully independent character + finger assignments. All KB-1 through KB-14 apply to shift layer as well. | ✅ Implemented |

#### Finger Color Palette

Light mode. All colors calm and muted (not saturated/neon):

| Finger | Color | Hex |
|--------|-------|-----|
| L-Pinky | Muted Orange | `#E8A87C` |
| L-Ring | Muted Yellow | `#D4C36A` |
| L-Middle | Muted Blue | `#7BA7C9` |
| L-Index | Muted Green | `#7CB98F` |
| L-Thumb | Muted Purple | `#A388BF` |
| Unassigned | Light Gray | `#D4D4D4` |

These colors must pass WCAG AA contrast against white background with dark text labels.

#### Default Assignments (Left Hand Only)

```
L-Pinky:  ` 1 Q A Z
L-Ring:   2 W S X
L-Middle: 3 E D C
L-Index:  4 5 R T F G V B
L-Thumb:  Space
```

All keys to the right of `B/G/T/5` on each row: **unassigned** by default (no finger, no character).

Function keys (F1–F12): rendered same size as alpha keys, all **unassigned** by default.

Modifier keys (Tab, CapsLock, LShift, LCtrl, LAlt, RShift, RCtrl, RAlt): rendered, all **unassigned** by default.

Shift Layer: all keys **unassigned** by default (independent from main layer).

---

### 3.2 Word List & Graph Construction

#### Description

A sidebar panel where users input words (spaces included as characters). The system parses each word into a directed character graph: nodes = unique characters, edges = ordered pairs of **adjacent** characters in each word.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| WL-1 | Sidebar text input accepting one word/phrase per line. | ✅ Implemented |
| WL-2 | **Spaces are characters.** A line `"iron sword"` contains a space character between `n` and `s`. That space is a node, and edges `n→[space]` and `[space]→s` are created. | ✅ Implemented |
| WL-3 | Duplicate lines allowed — each occurrence increases edge weights. | ✅ Implemented |
| WL-4 | Parsing is case-insensitive. All characters normalized to lowercase before graph construction. | ✅ Implemented |
| WL-5 | Characters not assigned to any key on the keyboard are silently ignored during parsing. They are skipped, and the characters on either side do NOT form an edge (the ignored character breaks adjacency). | ✅ Implemented |
| WL-6 | **Edges represent strictly adjacent characters.** For word `"cart"`: edges are `c→a`, `a→r`, `r→t`. There is NO edge `c→r` (they are not adjacent). | ✅ Implemented |
| WL-7 | **Edges are directed.** `a→r` and `r→a` are distinct edges with independent weights. | ✅ Implemented |
| WL-8 | Duplicate directed edges increment weight by 1 per occurrence. | ✅ Implemented |
| WL-9 | Self-loops allowed (e.g., `"oo"` in `"wood"` creates edge `o→o`). | ✅ Implemented |
| WL-10 | Node frequency = total number of times that character appears across all words (simple character count). | ✅ Implemented |
| WL-11 | Graph recalculates on every word list change (debounced 300ms). | ✅ Implemented |
| WL-12 | Word list persists to LocalStorage. | ✅ Implemented |
| WL-13 | "Clear All" button empties word list and graph. | ✅ Implemented |
| WL-14 | Display total line count and unique character count above input. | ✅ Implemented |
| WL-15 | Empty lines are ignored (no nodes, no edges, not counted). | ✅ Implemented |

---

### 3.3 Graph Visualization (Per Layer)

#### Description

Overlay the directed character graph onto the interactive keyboard. Each layer (main and shift) has its own graph overlay. Nodes appear as semi-transparent circles on their assigned keys. Edges appear as directed arrows between keys. Nodes must never exceed the visual boundary of their key.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| GV-1 | Nodes rendered as semi-transparent circles centered on their keyboard key. | ✅ Implemented |
| GV-2 | **Node size is capped by key size.** The maximum node diameter equals 80% of the key's smaller dimension (width or height). No node may overflow its key boundary. | ✅ Implemented |
| GV-3 | Node size scales proportionally by frequency within the capped range. Floor = 15% of max allowed size, ceiling = 100% of max allowed size. | ✅ Implemented |
| GV-4 | Max and floor size percentages configurable in source code (constants, not UI). | ✅ Implemented |
| GV-5 | Edges rendered as directed arrows (arrowhead at target). | ✅ Implemented |
| GV-6 | Edge opacity scales by weight. Max opacity = 70%, floor = 15%. | ✅ Implemented |
| GV-7 | Edge max/floor opacity configurable in source code. | ✅ Implemented |
| GV-8 | **Edge visibility toggle:** "Show Arrows" checkbox in sidebar controls edge rendering. All edges shown or all hidden (no weight-based threshold). | ✅ Implemented |
| GV-9 | Graph visualization updates live when character assignments change. | ✅ Implemented |
| GV-10 | Graph visualization updates live when finger assignments change (triggers re-analysis of badness). | ✅ Implemented |
| GV-11 | Graph visualization updates live when word list changes. | ✅ Implemented |
| GV-12 | Self-loop edges rendered as a small circular arrow on the key. | ✅ Implemented (SVG path) |
| GV-13 | Edges between same two keys in opposite directions rendered with slight curve offset to avoid overlap. | ✅ Implemented |
| GV-14 | Hovering a node highlights all connected edges (increase opacity to 100%). | ⏳ Not implemented (low priority) |
| GV-15 | Hovering an edge shows a tooltip with: source char, target char, weight. | ⏳ Not implemented (low priority) |
| GV-16 | Characters assigned to keys that are finger-unassigned still render graph nodes (they participate in the graph, just not in ergonomic analysis). | ✅ Implemented |
| GV-17 | Space character node renders on the spacebar key, sized proportionally like any other node but capped to spacebar height (not width, since spacebar is very wide). | ✅ Implemented |
| GV-18 | **Per-layer graphs:** Main layer graph only includes main keyboard + main mouse. Shift layer graph only includes shift keyboard + shift mouse. Both layers analyzed together for unified badness. | ✅ Implemented |

#### Sizing Formula

```
max_allowed = min(key_width, key_height) * 0.8  // physical pixel cap per key
                                                  // for spacebar: use key_height * 0.8

relative_size = floor + (frequency / max_frequency) × (1.0 - floor)

node_diameter = relative_size × max_allowed
```

Where `floor = 0.15`. If all nodes have equal frequency, all render at 100% of their key's max allowed size. If only one node exists, it renders at 100%.

#### Opacity Formula

```
edge_opacity = opacity_floor + (weight / max_weight) × (opacity_max - opacity_floor)
```

Where `opacity_floor = 0.15`, `opacity_max = 0.70`.

---

### 3.4 Bad Word Detection (Multi-Layer)

#### Description

Analyze words against toggled ergonomic flags. Words matching any active flag are highlighted red. Characters involved in flagged patterns accumulate "badness weight" visualized as red tint on nodes. Only characters with **both** a key assignment and a finger assignment can participate in ergonomic analysis. Mouse-bound characters are transparent in SFS gap but participate in other patterns.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| BD-1 | Toggle flags (checkboxes) for: Rolls, Outward Rolls, Inward Rolls, Redirects, SFBs, SFSs, Scissors. | ✅ Implemented |
| BD-2 | All flags default to OFF on fresh load. | ✅ Implemented |
| BD-3 | Flag state persists to LocalStorage. | ✅ Implemented |
| BD-4 | **Rolls master flag:** Toggling "Rolls" ON automatically enables both "Outward Rolls" and "Inward Rolls." Toggling "Rolls" OFF automatically disables both. | ✅ Implemented |
| BD-5 | "Outward Rolls" and "Inward Rolls" can be toggled individually. When both are ON, "Rolls" also shows as ON. When either is turned OFF, "Rolls" shows as OFF. | ✅ Implemented |
| BD-6 | A word is flagged (highlighted red in sidebar) if ANY portion of it matches ANY active flag. | ✅ Implemented |
| BD-7 | Flagged words appear with red background/text in the word list sidebar. | ✅ Implemented |
| BD-8 | Characters involved in the specific flagged pattern accumulate badness weight on their graph node. | ✅ Implemented |
| BD-9 | Badness weight visualization: node gains red tint. Any nonzero badness = visible tint (≥10% intensity). Tint intensity proportional to badness weight relative to max badness across all nodes. | ✅ Implemented |
| BD-10 | Badness weight recalculates on: word list change, flag toggle, finger reassignment, character reassignment. | ✅ Implemented |
| BD-11 | Tooltip on flagged word shows which flag(s) triggered and which character positions are involved. | ⏳ Not implemented (low priority) |
| BD-12 | Characters on keys with no finger assignment are **skipped** in ergonomic analysis. They break sequences for roll/redirect detection (same as unrecognized characters). They cannot participate in SFB/SFS/scissor checks. | ✅ Implemented |
| BD-13 | **Mouse characters transparent in SFS gap.** Mouse-bound characters do not break intervening checks for SFS. They still participate in SFB, rolls, redirects, scissors. | ✅ Implemented |
| BD-14 | SFS gap is user-configurable via a numeric input (labeled "SFS Gap"). Default = 1. Minimum = 1. Maximum = 5. | ✅ Implemented |
| BD-15 | SFS gap setting persists to LocalStorage. | ✅ Implemented |

#### Detection Algorithms

**Important constraint:** All detection only considers characters that have both a character assignment AND a finger assignment (on the main layer assignment at detection time). Characters without a finger assignment are treated as breaks in the sequence. Mouse-bound characters are treated specially: they do NOT break SFS gap intervening checks, but they can only trigger SFB if the other character is also a mouse key.

**SFB Detection:**
For each pair of adjacent characters in a word, check if both characters' keys are assigned to the same finger. If yes → SFB. Both characters accumulate badness.

**SFS Detection:**
For characters at positions `i` and `i + gap + 1` (where `gap` is the configurable SFS gap), check if both characters' keys are assigned to the same finger. If yes → SFS. Both endpoint characters accumulate badness. Intervening characters do NOT.

All characters between positions `i` and `i + gap + 1` must either have valid finger assignments OR be mouse-bound characters — if any non-mouse character is finger-unassigned, this skipgram is skipped (the sequence is broken).

**Roll Detection:**
A roll is a maximal sequence of ≥2 adjacent characters where:
1. All characters have finger assignments on the **left hand** (the only hand).
2. Each consecutive pair uses a **different** finger.
3. All transitions move consistently in one lateral direction.

Finger ordering for left hand (lateral position):
```
L-Pinky(0) < L-Ring(1) < L-Middle(2) < L-Index(3) < L-Thumb(4)
```

- All transitions with increasing finger index → **Inward roll** (pinky→thumb, edge→center)
- All transitions with decreasing finger index → **Outward roll** (thumb→pinky, center→edge)

All characters in a detected roll accumulate badness.

**Redirect Detection:**
A redirect requires ≥3 adjacent characters all with left-hand finger assignments, where lateral direction changes. E.g., finger sequence [ring(1), index(3), middle(2)] = inward then outward = redirect.

Detection: scan each maximal same-hand sequence for direction changes. All characters in the redirect window accumulate badness.

**Scissor Detection:**
For each pair of adjacent characters:
1. Both must have finger assignments. Neither finger may be L-Thumb (thumbs excluded from scissor detection).
2. Determine row of each key. See row assignments below.
3. If `|row_a - row_b| >= 2`:
4. Check if the finger assignments violate the height guide. Height guide values: middle(3) > ring(2) > pinky(1) > index(0). A scissor occurs when the finger with the *lower* height-guide value is on the *higher* (lower row number) row.

Both characters in the scissor bigram accumulate badness.

#### Row Assignments

```
Row -1: F1–F12 (function row)
Row 0:  ` 1 2 3 4 5 6 7 8 9 0 - =
Row 1:  Tab Q W E R T Y U I O P [ ] \
Row 2:  CapsLock A S D F G H J K L ; '
Row 3:  LShift Z X C V B N M , . / RShift
Row 4:  LCtrl LAlt [Space] RAlt RCtrl (bottom modifier row)
```

#### Badness Weight Calculation

```
For each node N:
  badness(N) = count of flagged-pattern instances where N participates

Red tint intensity = max(BADNESS_TINT_FLOOR, badness(N) / max(badness across all nodes))
```

If `max(badness) == 0`, no tint on any node. If `badness(N) > 0`, tint ≥ 10% intensity.

---

### 3.5 Word Override

#### Description

Users can mark specific word instances to be ignored by bad-word detection entirely.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| WO-1 | Each word in sidebar has a toggle/button to mark it as "overridden." | ✅ Implemented |
| WO-2 | Overridden words display with distinct visual treatment (e.g., strikethrough + muted color) instead of red highlighting. | ✅ Implemented |
| WO-3 | Overridden words completely excluded from bad-word detection — they do not contribute to any node's badness weight. | ✅ Implemented |
| WO-4 | Overridden words still contribute to graph construction (nodes + edges + weights). | ✅ Implemented |
| WO-5 | Override state persists to LocalStorage. | ✅ Implemented |
| WO-6 | "Clear All Overrides" button available. | ⏳ Not implemented (low priority) |
| WO-7 | If word appears multiple times, override applies per-instance (per line). Other instances still subject to detection. | ✅ Implemented |

---

### 3.6 Mouse Keys (Main + Shift Layer)

#### Description

Five bindable mouse actions (LClick, RClick, MB4, MB5, Scroll) available on both main and shift layers. Each mouse key can bind a single character. Mouse keys have no finger assignment. Mouse-bound characters are transparent in SFS gap detection.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| MK-1 | Five mouse keys rendered in a horizontal panel: LClick, RClick, MB4, MB5, Scroll. | ✅ Implemented |
| MK-2 | Each mouse key displays its assigned character (if any). | ✅ Implemented |
| MK-3 | Left-click on mouse key opens inline character edit field (same as keyboard keys). | ✅ Implemented |
| MK-4 | Mouse keys have NO finger assignment — they exist only as character containers. | ✅ Implemented |
| MK-5 | Character uniqueness enforced per layer: moving a character from keyboard to mouse (or vice versa) clears it from the source key. | ✅ Implemented |
| MK-6 | Mouse key assignments persist to LocalStorage (2 keys: main + shift). | ✅ Implemented |
| MK-7 | Mouse-bound characters participate in graph construction (nodes + edges). | ✅ Implemented |
| MK-8 | Mouse-bound characters are transparent in SFS gap detection (do not break intervening checks). | ✅ Implemented |
| MK-9 | Mouse-bound characters DO participate in SFB, rolls, redirects, scissors (like any character). | ✅ Implemented |

---

### 3.7 Shift Layer

#### Description

A second, fully independent keyboard layer accessible via toggle button. Shift layer has its own character + finger assignments, its own mouse key bindings, and its own graph visualization.

#### Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| SL-1 | "Shift Layer" button toggles panel visibility. Button shows ▼ (collapsed) or ▲ (expanded). | ✅ Implemented |
| SL-2 | Shift layer renders identical keyboard layout to main layer. | ✅ Implemented |
| SL-3 | Shift layer has independent character + finger assignments (no shared state with main layer). | ✅ Implemented |
| SL-4 | Shift layer has independent mouse key assignments. | ✅ Implemented |
| SL-5 | Shift layer default: all keys unassigned (no char, no finger). | ✅ Implemented |
| SL-6 | Shift layer has its own GraphOverlay rendered directly below shift keyboard. | ✅ Implemented |
| SL-7 | Bad-word detection uses UNIFIED character mapping from both layers (main + shift). Characters can only exist on one key per layer, but same character could exist on different keys in different layers. | ✅ Implemented |
| SL-8 | Shift layer persists to LocalStorage independently. | ✅ Implemented |

---

## 4. Data Model

```
KeyboardLayout {
  keys: Array<{
    code: PhysicalKeyCode,      // e.g., "KeyQ", "Digit1", "F5"
    label: string,              // "Q", "1", "F5"
    row: number,                // -1 to 4
    column: number,             // physical column index
    width: number,              // relative width multiplier
  }>
}

MouseKeyLayout {
  keys: Array<{
    code: string,               // "MouseLClick", "MouseRClick", etc.
    label: string,              // "LClick", "RClick", etc.
  }>
}

KeyAssignment {
  character: string | null,     // null = no character assigned
  finger: FingerEnum | null,    // null = unassigned
}

MouseKeyAssignment {
  character: string | null      // null = no character assigned (no finger field)
}

AppState {
  keyAssignments: Record<PhysicalKeyCode, KeyAssignment>,      // main layer
  shiftKeyAssignments: Record<PhysicalKeyCode, KeyAssignment>, // shift layer
  mouseAssignments: Record<string, string | null>,             // main layer
  shiftMouseAssignments: Record<string, string | null>,        // shift layer
  wordEntries: Array<{
    id: string,
    text: string,               // lowercase, spaces preserved
    isOverridden: boolean,
  }>,
  flags: Record<FlagType, boolean>,  // 7 flags
  sfsGap: number,                    // 1-5
  showShiftLayer: boolean,           // shift panel visibility
  showArrows: boolean,               // graph edges visibility
}

WordAnalysis {
  id: string,
  flaggedPatterns: Array<{
    type: FlagType,
    charIndices: number[]       // positions in word
  }>,
  isFlagged: boolean,
}

CharacterGraph {
  nodes: Map<string, {
    character: string,
    frequency: number,
    badnessWeight: number       // accumulates from all flagged patterns
  }>,
  edges: Map<string, {           // key = "source→target"
    source: string,
    target: string,
    weight: number               // count of edge occurrences
  }>
}

FingerEnum = "L_PINKY" | "L_RING" | "L_MIDDLE" | "L_INDEX" | "L_THUMB"
FlagType = "roll" | "outward_roll" | "inward_roll" | "redirect" | "sfb" | "sfs" | "scissor"
PhysicalKeyCode = string (e.g., "KeyQ", "Digit1", "Space")
```

---

## 5. LocalStorage Schema

| Key | Value Type | Purpose | Written On |
|-----|-----------|---------|-----------|
| `skp-key-assignments` | `Record<PhysicalKeyCode, KeyAssignment>` | Main layer keyboard | Any main layer assignment change |
| `skp-shift-key-assignments` | `Record<PhysicalKeyCode, KeyAssignment>` | Shift layer keyboard | Any shift layer assignment change |
| `skp-mouse-assignments` | `Record<string, string\|null>` | Main layer mouse keys | Any main mouse assignment change |
| `skp-shift-mouse-assignments` | `Record<string, string\|null>` | Shift layer mouse keys | Any shift mouse assignment change |
| `skp-word-list` | `Array<{id, text, isOverridden}>` | Word list entries | Word list or override change |
| `skp-flags` | `Record<FlagType, boolean>` | 7 detection flags | Flag toggle |
| `skp-sfs-gap` | `number` | SFS gap setting (1–5) | SFS gap change |
| `skp-show-shift-layer` | `boolean` | Shift panel visibility | Shift layer toggle |
| `skp-show-arrows` | `boolean` | Graph edge visibility | Show Arrows toggle |

All values JSON-serialized. On parse failure → reset to defaults, log warning to console.

---

## 6. Configuration Constants

Source-code constants only, not exposed in UI (except SFS gap which has its own UI control):

```javascript
const CONFIG = {
  // Graph visualization
  NODE_SIZE_FLOOR: 0.15,        // minimum node size as fraction of key-capped max
  NODE_SIZE_MAX: 1.0,           // maximum = full key-capped size (80% of key)
  EDGE_OPACITY_FLOOR: 0.15,     // minimum edge opacity
  EDGE_OPACITY_MAX: 0.70,       // maximum edge opacity
  EDGE_WEIGHT_THRESHOLD: 2,     // no longer used in rendering
  BADNESS_TINT_FLOOR: 0.10,     // minimum red tint when badness > 0

  // Timing
  DEBOUNCE_MS: 300,             // word list parse debounce

  // SFS default (user-configurable via UI)
  SFS_GAP_DEFAULT: 1,
  SFS_GAP_MIN: 1,
  SFS_GAP_MAX: 5,

  // Height guide for scissor detection
  // Higher number = naturally higher resting position
  FINGER_HEIGHT: {
    L_MIDDLE: 3,
    L_RING: 2,
    L_PINKY: 1,
    L_INDEX: 0,
    // L_THUMB excluded from scissor detection entirely
  },

  // Finger ordering for roll/redirect direction detection (left hand)
  FINGER_LATERAL_ORDER: {
    L_PINKY: 0,
    L_RING: 1,
    L_MIDDLE: 2,
    L_INDEX: 3,
    L_THUMB: 4,
  },

  // Finger colors (calm, muted, light-mode friendly)
  FINGER_COLORS: {
    L_PINKY:  '#E8A87C',   // muted orange
    L_RING:   '#D4C36A',   // muted yellow
    L_MIDDLE: '#7BA7C9',   // muted blue
    L_INDEX:  '#7CB98F',   // muted green
    L_THUMB:  '#A388BF',   // muted purple
    UNASSIGNED: '#D4D4D4', // light gray
  },
};
```

---

## 7. Non-Functional Requirements

| ID | Requirement | Status |
|----|-------------|--------|
| NF-1 | Pure client-side SPA. No server, no accounts, no network calls. | ✅ Implemented |
| NF-2 | Graph rerender ≤500ms for word lists up to 500 lines. | ✅ Implemented |
| NF-3 | All state recoverable from LocalStorage on reload. | ✅ Implemented |
| NF-4 | Accessible: keyboard-navigable, ARIA labels on interactive elements, sufficient color contrast (WCAG AA). | ⏳ Partial |
| NF-5 | Responsive down to 1024px viewport width. Below that, horizontal scroll acceptable. | ✅ Implemented |
| NF-6 | 5 left-hand finger colors must be visually distinct from each other, from gray (unassigned), and from red (badness tint). | ✅ Implemented |
| NF-7 | Light mode only. No dark mode toggle in v1. | ✅ Implemented |

---

## 8. Out of Scope (v1)

- Right-hand finger assignments (right hand on mouse)
- Import/export layout files
- Bulk import word lists (file upload)
- Multi-layout comparison
- Score/ranking system across layouts
- Custom keyboard geometries (ortholinear, split, etc.)
- Backend, user accounts, sharing
- Mobile support below 1024px
- Undo/redo for assignments
- Non-ANSI keyboard layouts (ISO, JIS)
- Dark mode
- UI-exposed edge weight threshold control
- Node/edge tooltips (on hover)
- "Clear All Overrides" button

---

## 9. Resolved Decisions

| # | Question | Resolution |
|---|----------|------------|
| 1 | Modifier keys assignable? | Yes — Tab, CapsLock, Shift, Ctrl, Alt all assignable with characters and fingers. |
| 2 | Finger colors? | Orange, yellow, blue, green, purple — calm/muted variants. Light mode only. |
| 3 | Bulk word list import? | No. Manual paste only. |
| 4 | Edge weight threshold filter? | No UI control. All edges shown or all hidden via "Show Arrows" toggle. |
| 5 | Function key sizing? | Same size as alpha keys. |
| 6 | Right hand? | Not used. Right hand on mouse. Only left-hand fingers available. |
| 7 | Unassigned keys? | Allowed. Right-side keys unassigned by default. |
| 8 | Directed edges? | Yes. a→r ≠ r→a. |
| 9 | Adjacent-only edges? | Yes. Only consecutive character pairs in a word create edges. |
| 10 | Spaces in words? | Counted as characters. Create nodes and edges. |
| 11 | Rolls master flag? | Auto-enables/disables both Outward and Inward. |
| 12 | Scissor + thumbs? | Thumbs excluded from scissor detection. |
| 13 | Character reassignment? | Users can reassign characters to keys via click. Each character on at most one key per layer. |
| 14 | SFS gap? | User-configurable, default 1, range 1–5. |
| 15 | Shift layer? | Yes. Fully independent, accessible via toggle button. |
| 16 | Mouse keys? | Yes. 5 keys (LClick, RClick, MB4, MB5, Scroll). Transparent in SFS. |
| 17 | Finger dropdown? | Portal-based (right-click), avoids z-index clipping. |
| 18 | Character edit? | Click opens inline text input (not double-click, not cycling). |
| 19 | Graph per layer? | Yes. Each layer has independent graph visualization. |
| 20 | Mouse char uniqueness? | Per-layer. Chars can't exist on both keyboard and mouse in same layer. |
