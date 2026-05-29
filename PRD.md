# SearchCraft Keybind Planner — Product Requirements Document

**Version:** 3.0
**Last Updated:** 2025-05-29
**Status:** Final Draft

---

## 1. Overview

SearchCraft Keybind Planner is a browser-based tool for Minecraft speedrunners optimizing left-hand keyboard layouts for searchcrafting. Right hand stays on mouse — only left-hand keys are assignable. Players input word lists, assign characters and fingers to keys, and get real-time visual + analytic feedback on ergonomic problem areas (SFBs, redirects, scissors, etc.).

**Platform:** Web (SPA, no backend required)
**Target Browsers:** Chrome, Firefox, Edge (latest 2 versions)
**Persistence:** LocalStorage for layouts, character assignments, and word lists
**Visual Mode:** Light mode. Calm, muted color palette throughout.

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

### Height Guide Reference (Scissor Detection)

Natural finger height ordering (highest to lowest resting position):

```
middle > ring > pinky > index
```

Thumbs are **excluded** from scissor detection entirely. A scissor is detected when the finger that naturally rests *lower* strikes a key ≥2 rows *higher* than the other finger in the bigram.

---

## 3. Feature Requirements

---

### 3.1 Interactive Keyboard

#### Description

A visual keyboard rendered in the UI representing the full physical keyboard. Function keys render at the same size as alpha keys. Only left-hand keys are assigned by default. Users can reassign both **characters** and **fingers** to any key, including modifier keys (Shift, Ctrl, Alt, Tab, CapsLock). Right-side keys default to unassigned.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| KB-1 | Render a full ANSI keyboard layout including: function row (F1–F12, rendered same size as alpha keys), number row (`` ` ``, 1–9, 0, `-`, `=`), top alpha row, home alpha row, bottom alpha row, modifier keys (Tab, CapsLock, LShift, LCtrl, LAlt, RShift, RCtrl, RAlt), and spacebar. | P0 |
| KB-2 | Function keys render at the same physical size as standard alpha keys (not smaller). | P0 |
| KB-3 | Each key displays: (a) its assigned character (if any), and (b) its finger assignment color (if any). Unassigned keys render in neutral gray with a dimmed physical key label. | P0 |
| KB-4 | **Finger assignment:** Clicking a key cycles its finger assignment through: Unassigned → L-Pinky → L-Ring → L-Middle → L-Index → L-Thumb → Unassigned. Right-click opens a dropdown to select a specific finger or "Unassigned." | P0 |
| KB-5 | **Character assignment:** Double-clicking a key opens an inline text input to type a new character for that key. Pressing Enter or clicking away confirms. Pressing Escape cancels. | P0 |
| KB-6 | Character reassignment removes that character from any previous key it was assigned to (each character can exist on at most one key). | P0 |
| KB-7 | Assigning a character that was on another key: the old key becomes character-unassigned (keeps its finger assignment). | P0 |
| KB-8 | A key can have a finger but no character, or a character but no finger, or both, or neither. All four states are valid. | P0 |
| KB-9 | Default left-hand finger+character assignments follow standard QWERTY (see table below). All other keys default to unassigned (no finger, no character). | P0 |
| KB-10 | Modifier keys (Tab, CapsLock, LShift, LCtrl, LAlt) are assignable — users can assign both characters and fingers to them, just like any other key. They default to unassigned. | P0 |
| KB-11 | A "Reset to Defaults" button restores all keys to default state. | P1 |
| KB-12 | All assignments (finger + character) persist to LocalStorage on every change. | P0 |
| KB-13 | A visible legend maps each finger color. Unassigned = gray. | P0 |
| KB-14 | Space key is assignable and defaults to L-Thumb with character `" "` (space). | P0 |

#### Finger Color Palette

Light mode. All colors calm and muted (not saturated/neon):

| Finger | Color | Suggested Hex |
|--------|-------|---------------|
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

#### Edge Cases

- **Character set to space:** Valid. Space is a character like any other.
- **Multiple keys with no character:** Fine — they don't appear in graph.
- **Assigning same character to two keys:** Not allowed. Second assignment moves character to new key, clearing it from old key.
- **Clearing a character:** User can set character to empty (backspace in edit field, then confirm). Key becomes character-unassigned.
- **Non-printable characters:** Reject. Only printable ASCII characters and space are valid assignments.
- **Modifier key characters:** Users might assign characters like `"t"` to the Tab key. This is allowed.

#### Acceptance Criteria

- [ ] Full ANSI layout rendered including F-row (same size as alpha keys), number row with `` ` ``, all alpha rows, modifier keys, spacebar
- [ ] Left-hand keys show correct default fingers + characters
- [ ] Right-hand keys render as gray/unassigned
- [ ] Click cycles finger through 5 left-hand fingers + unassigned
- [ ] Double-click opens character edit; character moves if reassigned from another key
- [ ] Only one key can hold any given character at a time
- [ ] Modifier keys (Tab, CapsLock, Shift, Ctrl, Alt) are fully assignable
- [ ] Finger colors match palette (calm, muted, light mode)
- [ ] Assignments survive page reload (LocalStorage)
- [ ] "Reset to Defaults" clears all custom assignments

---

### 3.2 Word List & Graph Construction

#### Description

A sidebar panel where users input words (spaces included as characters). The system parses each word into a directed character graph: nodes = unique characters, edges = ordered pairs of **adjacent** characters in each word.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| WL-1 | Sidebar text input accepting one word/phrase per line. | P0 |
| WL-2 | **Spaces are characters.** A line `"iron sword"` contains a space character between `n` and `s`. That space is a node, and edges `n→[space]` and `[space]→s` are created. | P0 |
| WL-3 | Duplicate lines allowed — each occurrence increases edge weights. | P0 |
| WL-4 | Parsing is case-insensitive. All characters normalized to lowercase before graph construction. | P0 |
| WL-5 | Characters not assigned to any key on the keyboard are silently ignored during parsing. They are skipped, and the characters on either side do NOT form an edge (the ignored character breaks adjacency). | P0 |
| WL-6 | **Edges represent strictly adjacent characters.** For word `"cart"`: edges are `c→a`, `a→r`, `r→t`. There is NO edge `c→r` (they are not adjacent). | P0 |
| WL-7 | **Edges are directed.** `a→r` and `r→a` are distinct edges with independent weights. | P0 |
| WL-8 | Duplicate directed edges increment weight by 1 per occurrence. | P0 |
| WL-9 | Self-loops allowed (e.g., `"oo"` in `"wood"` creates edge `o→o`). | P0 |
| WL-10 | Node frequency = total number of times that character appears across all words (simple character count). | P0 |
| WL-11 | Graph recalculates on every word list change (debounced 300ms). | P0 |
| WL-12 | Word list persists to LocalStorage. | P1 |
| WL-13 | "Clear All" button empties word list and graph. | P1 |
| WL-14 | Display total line count and unique character count above input. | P2 |
| WL-15 | Empty lines are ignored (no nodes, no edges, not counted). | P0 |

#### Parsing Example

Input:
```
craft
cart
```

**Adjacency breakdown:**

`craft`: c→r, r→a, a→f, f→t
`cart`: c→a, a→r, r→t

**Edges:**

| Edge | Weight |
|------|--------|
| c→r | 1 |
| r→a | 1 |
| a→f | 1 |
| f→t | 1 |
| c→a | 1 |
| a→r | 1 |
| r→t | 1 |

Note: `a→r` (from "cart") and `r→a` (from "craft") are **separate edges**.

**Node frequencies (character counts):**

| Node | Frequency |
|------|-----------|
| c | 2 |
| r | 2 |
| a | 2 |
| f | 1 |
| t | 2 |

#### Space Example

Input:
```
red bed
```

Edges: `r→e`, `e→d`, `d→[space]`, `[space]→b`, `b→e`, `e→d`

Edge `e→d` has weight 2. Space is a node with frequency 1.

#### Ignored Character Example

If `$` is not assigned to any key, input `"a$b"`:
- `$` is skipped. `a` and `b` are NOT adjacent (the unrecognized character breaks the chain).
- No edges created.
- Nodes `a` and `b` still created (frequency 1 each), but with no edges between them.

#### Edge Cases

- **Empty word list:** Graph has zero nodes/edges. Visualization clears.
- **Single-character words:** Node created with frequency 1, zero edges.
- **Word is all spaces:** Creates space node, self-loop edges `[space]→[space]` for consecutive spaces.
- **Word contains only unrecognized characters:** No nodes or edges.
- **Very long words/phrases:** No length limit. Parse normally.

#### Acceptance Criteria

- [ ] Pasting 500+ lines parses without visible lag (<500ms)
- [ ] Duplicate lines correctly increment edge weights
- [ ] Case insensitive — `"Craft"` and `"craft"` produce identical graph contributions
- [ ] `"iron sword"` produces `n→[space]` and `[space]→s` edges
- [ ] `"cart"` does NOT produce `c→r` edge (not adjacent)
- [ ] `a→r` and `r→a` tracked as separate edges
- [ ] Unrecognized characters break adjacency — neighbors don't link
- [ ] Single-char lines create orphan nodes
- [ ] Blank lines ignored
- [ ] Graph updates live as user types (debounced)

---

### 3.3 Graph Visualization

#### Description

Overlay the directed character graph onto the interactive keyboard. Nodes appear as semi-transparent circles on their assigned keys. Edges appear as directed arrows between keys. Nodes must never exceed the visual boundary of their key. Low-weight edges hidden by default via configurable threshold.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| GV-1 | Nodes rendered as semi-transparent circles centered on their keyboard key. | P0 |
| GV-2 | **Node size is capped by key size.** The maximum node diameter equals the smaller dimension (width or height) of the key it sits on. No node may overflow its key boundary. | P0 |
| GV-3 | Node size scales proportionally by frequency within the capped range. Floor = 15% of max allowed size, ceiling = 100% of max allowed size. | P0 |
| GV-4 | Max and floor size percentages configurable in source code (constants, not UI). | P1 |
| GV-5 | Edges rendered as directed arrows (arrowhead at target). | P0 |
| GV-6 | Edge opacity scales by weight. Max opacity = 70%, floor = 15%. | P0 |
| GV-7 | Edge max/floor opacity configurable in source code. | P1 |
| GV-8 | **Edge weight threshold:** Edges with weight below the threshold are hidden. Default: ON. Threshold value configurable in source code (`EDGE_WEIGHT_THRESHOLD`, default = 2). Edges with weight < threshold are not rendered. | P0 |
| GV-9 | Graph visualization updates live when character assignments change. | P0 |
| GV-10 | Graph visualization updates live when finger assignments change (triggers re-analysis of badness). | P0 |
| GV-11 | Graph visualization updates live when word list changes. | P0 |
| GV-12 | Self-loop edges rendered as a small circular arrow on the key. | P1 |
| GV-13 | Edges between same two keys in opposite directions rendered with slight curve offset to avoid overlap. | P1 |
| GV-14 | Hovering a node highlights all connected edges (increase opacity to 100%). | P2 |
| GV-15 | Hovering an edge shows a tooltip with: source char, target char, weight. | P2 |
| GV-16 | Characters assigned to keys that are finger-unassigned still render graph nodes (they participate in the graph, just not in ergonomic analysis). | P0 |
| GV-17 | Space character node renders on the spacebar key, sized proportionally like any other node but capped to spacebar height (not width, since spacebar is very wide — use height as constraining dimension). | P1 |

#### Sizing Formula

```
max_allowed = min(key_width, key_height)  // physical pixel cap per key
                                           // for spacebar: use key_height

relative_size = floor + (frequency / max_frequency) × (1.0 - floor)

node_diameter = relative_size × max_allowed
```

Where `floor = 0.15`. If all nodes have equal frequency, all render at 100% of their key's max allowed size. If only one node exists, it renders at 100%.

#### Opacity Formula

```
edge_opacity = opacity_floor + (weight / max_weight) × (opacity_max - opacity_floor)
```

Where `opacity_floor = 0.15`, `opacity_max = 0.70`.

#### Edge Cases

- **Zero nodes:** No overlay rendered.
- **One node, zero edges:** Single circle, no arrows.
- **All edges same weight:** All arrows at max opacity (70%).
- **All edges below threshold:** No arrows rendered. Nodes still shown.
- **Key with no character:** No node overlay. Key still interactive for assignments.
- **Key with character but no finger:** Node renders normally. No ergonomic analysis for that character.
- **Space node on wide spacebar:** Circle sized by spacebar height, centered on spacebar.
- **Function keys:** Same size as alpha keys, so node sizing works identically.

#### Acceptance Criteria

- [ ] No node circle extends beyond its key's visual boundary
- [ ] Circles appear on correct keys matching character assignments
- [ ] Smallest node visibly ≥15% of largest node's key-capped size
- [ ] Arrows point from source to target with visible arrowheads
- [ ] Faintest visible arrow ≥15% opacity
- [ ] No arrow exceeds 70% opacity
- [ ] Edges below weight threshold are hidden by default
- [ ] Changing a word in sidebar updates arrows within 500ms
- [ ] Reassigning a character to a different key moves node to new key
- [ ] Space node renders on spacebar without overflowing vertically

---

### 3.4 Bad Word Detection

#### Description

Analyze words against toggled ergonomic flags. Words matching any active flag are highlighted red. Characters involved in flagged patterns accumulate "badness weight" visualized as red tint on nodes. Only characters with **both** a key assignment and a finger assignment can participate in ergonomic analysis.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BD-1 | Toggle flags (checkboxes) for: Rolls, Outward Rolls, Inward Rolls, Redirects, SFBs, SFSs, Scissors. | P0 |
| BD-2 | All flags default to OFF on fresh load. | P0 |
| BD-3 | Flag state persists to LocalStorage. | P1 |
| BD-4 | **Rolls master flag:** Toggling "Rolls" ON automatically enables both "Outward Rolls" and "Inward Rolls." Toggling "Rolls" OFF automatically disables both. | P0 |
| BD-5 | "Outward Rolls" and "Inward Rolls" can be toggled individually. When both are ON, "Rolls" also shows as ON. When either is turned OFF, "Rolls" shows as OFF. | P1 |
| BD-6 | A word is flagged (highlighted red in sidebar) if ANY portion of it matches ANY active flag. | P0 |
| BD-7 | Flagged words appear with red background/text in the word list sidebar. | P0 |
| BD-8 | Characters involved in the specific flagged pattern accumulate badness weight on their graph node. | P0 |
| BD-9 | Badness weight visualization: node gains red tint. Any nonzero badness = visible tint (≥10% intensity). Tint intensity proportional to badness weight relative to max badness across all nodes. | P0 |
| BD-10 | Badness weight recalculates on: word list change, flag toggle, finger reassignment, character reassignment. | P0 |
| BD-11 | Tooltip on flagged word shows which flag(s) triggered and which character positions are involved. | P1 |
| BD-12 | Characters on keys with no finger assignment are **skipped** in ergonomic analysis. They break sequences for roll/redirect detection (same as unrecognized characters). They cannot participate in SFB/SFS/scissor checks. | P0 |
| BD-13 | SFS gap is user-configurable via a numeric input (labeled "SFS Gap"). Default = 1. Minimum = 1. Maximum = 5. | P0 |
| BD-14 | SFS gap setting persists to LocalStorage. | P1 |

#### Detection Algorithms

**Important constraint:** All detection only considers characters that have both a character assignment AND a finger assignment. Characters without a finger assignment are treated as breaks in the sequence.

**SFB Detection:**
For each pair of adjacent characters in a word, check if both characters' keys are assigned to the same finger. If yes → SFB. Both characters accumulate badness.

**SFS Detection:**
For characters at positions `i` and `i + gap + 1` (where `gap` is the configurable SFS gap), check if both characters' keys are assigned to the same finger. If yes → SFS. Both endpoint characters accumulate badness. Intervening characters do NOT.

All characters between positions `i` and `i + gap + 1` must also have valid finger assignments — if any is finger-unassigned, this skipgram is skipped (the sequence is broken).

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

#### Rolls Master Flag Logic

| Action | Result |
|--------|--------|
| Toggle Rolls ON | Outward Rolls → ON, Inward Rolls → ON |
| Toggle Rolls OFF | Outward Rolls → OFF, Inward Rolls → OFF |
| Toggle Outward ON (Inward already ON) | Rolls → ON |
| Toggle Outward ON (Inward OFF) | Rolls stays OFF |
| Toggle Outward OFF (Inward ON) | Rolls → OFF |
| Toggle Outward OFF (Inward OFF) | Rolls stays OFF |

**Detection behavior:** When Rolls is ON, any roll (either direction) flags. When only Outward is ON, only outward rolls flag. When only Inward is ON, only inward rolls flag.

#### Badness Weight Calculation

```
For each node N:
  badness(N) = count of flagged-pattern instances where N participates

Red tint intensity = max(BADNESS_TINT_FLOOR, badness(N) / max(badness across all nodes))
```

If `max(badness) == 0`, no tint on any node. If `badness(N) > 0`, tint ≥ 10% intensity.

#### Edge Cases

- **Characters without finger assignment:** Cannot be part of any ergonomic pattern. Break sequences.
- **All flags OFF:** No words flagged, no badness, no red tint.
- **Single-character word:** Cannot contain any bigram pattern. Never flagged.
- **Two-character word:** Can be SFB or scissor. Cannot be redirect (needs 3+). Can be a roll (2 chars qualifies).
- **Overridden word (see 3.5):** Exempt from all flag checks. Does not contribute badness.
- **Word with spaces:** Space character participates in analysis like any other, IF space key has finger assignment.
- **SFS with gap=1:** Check positions i and i+2. With gap=3: check positions i and i+4.
- **SFS where intervening character is finger-unassigned:** Skip that skipgram.

#### Acceptance Criteria

- [ ] All 7 flags render as toggleable checkboxes, all OFF by default
- [ ] Toggling "Rolls" ON auto-enables both Outward and Inward
- [ ] Toggling "Rolls" OFF auto-disables both
- [ ] SFS Gap input visible, default=1, range 1–5, persists to LocalStorage
- [ ] SFB detection correct for same-finger adjacent chars
- [ ] Scissor detection excludes thumb keys
- [ ] Redirect detection requires ≥3 chars with direction change
- [ ] Characters without finger assignments break all sequence detection
- [ ] Changing finger or character assignment immediately recalculates flags
- [ ] Badness tint visible on nodes with any nonzero badness (≥10%)
- [ ] Tint intensity clearly scales — high-badness nodes visibly redder
- [ ] Flagged word tooltip shows specific patterns matched
- [ ] Spaces in words participate in detection when space key has finger assigned

---

### 3.5 Word Override

#### Description

Users can mark specific word instances to be ignored by bad-word detection entirely.

#### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| WO-1 | Each word in sidebar has a toggle/button to mark it as "overridden." | P0 |
| WO-2 | Overridden words display with distinct visual treatment (e.g., strikethrough + muted color) instead of red highlighting. | P0 |
| WO-3 | Overridden words completely excluded from bad-word detection — they do not contribute to any node's badness weight. | P0 |
| WO-4 | Overridden words still contribute to graph construction (nodes + edges + weights). | P0 |
| WO-5 | Override state persists to LocalStorage. | P1 |
| WO-6 | "Clear All Overrides" button available. | P2 |
| WO-7 | If word appears multiple times, override applies per-instance (per line). Other instances still subject to detection. | P1 |

#### Edge Cases

- **Override toggled while flags OFF:** Override state saved, no visual change. When flags turn ON, overridden word stays un-highlighted.
- **Word text edited after override:** Override cleared for that line (new word).
- **Duplicate words:** Each line instance has independent override state.

#### Acceptance Criteria

- [ ] Clicking override on a flagged word removes red highlight immediately
- [ ] Overridden word's characters no longer contribute badness tint
- [ ] Overridden word's characters still appear in graph (nodes + edges intact)
- [ ] Override survives page reload
- [ ] Per-instance override — duplicates handled independently

---

## 4. Data Model

```
KeyboardLayout {
  keys: Map<PhysicalKeyCode, {
    character: string | null,    // null = no character assigned
    finger: FingerEnum | null,   // null = unassigned
    row: number,                 // -1 (fn row) to 4 (bottom modifier row)
    column: number,              // physical column position
    widthPx: number,             // rendered key width (for node cap)
    heightPx: number             // rendered key height (for node cap)
  }>
}

WordList {
  entries: Array<{
    id: string,                  // unique per line instance
    text: string,                // lowercase normalized, spaces preserved
    isOverridden: boolean,
    flaggedPatterns: Array<{
      type: FlagType,
      charIndices: number[]      // positions in word involved
    }>
  }>
}

CharacterGraph {
  nodes: Map<string, {
    character: string,           // includes " " for space
    frequency: number,           // total character count across all words
    badnessWeight: number
  }>,
  edges: Map<string, {           // key = "source→target" (directed)
    source: string,
    target: string,
    weight: number
  }>
}

Settings {
  sfsGap: number,                // default: 1, range: 1-5
  flags: Record<FlagType, boolean>
}

FlagType = "roll" | "outward_roll" | "inward_roll" | "redirect"
         | "sfb" | "sfs" | "scissor"

FingerEnum = "L_PINKY" | "L_RING" | "L_MIDDLE" | "L_INDEX" | "L_THUMB"
// No right-hand fingers — right hand is on mouse.
```

---

## 5. LocalStorage Schema

| Key | Value | Written On |
|-----|-------|-----------|
| `skp-key-assignments` | `Record<PhysicalKeyCode, {character: string\|null, finger: FingerEnum\|null}>` | Any key assignment change |
| `skp-word-list` | `Array<{text: string, isOverridden: boolean}>` | Word list or override change |
| `skp-flags` | `Record<FlagType, boolean>` | Flag toggle |
| `skp-sfs-gap` | `number` | SFS gap change |

All values JSON-serialized. On parse failure → reset to defaults, log warning to console.

---

## 6. Configuration Constants

Source-code constants, not exposed in UI (except SFS gap which has its own UI control):

```javascript
const CONFIG = {
  // Graph visualization
  NODE_SIZE_FLOOR: 0.15,        // minimum node size as fraction of key-capped max
  NODE_SIZE_MAX: 1.0,           // maximum = full key-capped size
  EDGE_OPACITY_FLOOR: 0.15,     // minimum edge opacity
  EDGE_OPACITY_MAX: 0.70,       // maximum edge opacity
  EDGE_WEIGHT_THRESHOLD: 2,     // edges with weight < this are hidden (default: ON)
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

  // Row assignments
  ROWS: {
    FN_ROW: -1,        // F1-F12
    NUMBER_ROW: 0,     // ` 1 2 ... 0 - =
    TOP_ALPHA: 1,      // Tab Q W E R T ...
    HOME_ROW: 2,       // CapsLock A S D F G ...
    BOTTOM_ROW: 3,     // LShift Z X C V B ...
    BOTTOM_MOD: 4,     // LCtrl LAlt Space RAlt RCtrl
  }
};
```

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NF-1 | Pure client-side SPA. No server, no accounts, no network calls. |
| NF-2 | Graph rerender ≤500ms for word lists up to 500 lines. |
| NF-3 | All state recoverable from LocalStorage on reload. |
| NF-4 | Accessible: keyboard-navigable, ARIA labels on interactive elements, sufficient color contrast (WCAG AA). |
| NF-5 | Responsive down to 1024px viewport width. Below that, horizontal scroll acceptable. |
| NF-6 | 5 left-hand finger colors must be visually distinct from each other, from gray (unassigned), and from red (badness tint). |
| NF-7 | Light mode only. No dark mode toggle in v1. |

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
- UI-exposed edge weight threshold control (source-code only in v1)

---

## 9. Resolved Decisions

| # | Question | Resolution |
|---|----------|------------|
| 1 | Modifier keys assignable? | Yes — Tab, CapsLock, Shift, Ctrl, Alt all assignable with characters and fingers. |
| 2 | Finger colors? | Orange, yellow, blue, green, purple — calm/muted variants. Light mode only. |
| 3 | Bulk word list import? | No. Manual paste only. |
| 4 | Edge weight threshold filter? | Yes, default ON, threshold configurable in source code (`EDGE_WEIGHT_THRESHOLD = 2`). |
| 5 | Function key sizing? | Same size as alpha keys. |
| 6 | Right hand? | Not used. Right hand on mouse. Only left-hand fingers available. |
| 7 | Unassigned keys? | Allowed. Right-side keys unassigned by default. |
| 8 | Directed edges? | Yes. a→r ≠ r→a. |
| 9 | Adjacent-only edges? | Yes. Only consecutive character pairs in a word create edges. |
| 10 | Spaces in words? | Counted as characters. Create nodes and edges. |
| 11 | Rolls master flag? | Auto-enables/disables both Outward and Inward. |
| 12 | Scissor + thumbs? | Thumbs excluded from scissor detection. |
| 13 | Character reassignment? | Users can reassign characters to keys via double-click. Each character on at most one key. |
| 14 | SFS gap? | User-configurable, default 1, range 1–5. |
