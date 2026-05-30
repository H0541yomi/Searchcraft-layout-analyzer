# Progress Log

## 2026-05-29: Drag-and-Drop Key Swap Feature

### Branch: drag-swap

Implemented click-and-drag functionality to swap keybinds between keys.

### Changes Made

#### 1. New Reducer Actions (src/types.ts)
- Added `SWAP_CHARACTERS` action type for swapping characters between two keys in main layer
- Added `SWAP_SHIFT_CHARACTERS` action type for swapping characters between two keys in shift layer

#### 2. Reducer Implementation (src/state/reducer.ts)
- Implemented `SWAP_CHARACTERS` case: swaps characters between keyCodeA and keyCodeB in main layer
- Implemented `SWAP_SHIFT_CHARACTERS` case: swaps characters between keyCodeA and keyCodeB in shift layer
- Both actions preserve all other key properties (finger assignments remain unchanged)

#### 3. Keyboard Component (src/components/Keyboard/Keyboard.tsx)
- Added drag state management:
  - `draggedKeyCode`: tracks which key is being dragged
  - `dragOverKeyCode`: tracks which key the drag is hovering over
- Added drag handlers:
  - `handleDragStart`: initiates drag operation
  - `handleDragEnd`: cleans up drag state
  - `handleDragEnter`: highlights drop target
  - `handleDragLeave`: removes highlight
  - `handleDrop`: dispatches swap action
- Passes drag state and handlers down to KeyboardRow

#### 4. KeyboardRow Component (src/components/Keyboard/KeyboardRow.tsx)
- Updated to accept drag-related props
- Passes drag state to individual Key components:
  - `isDragging`: true for the key being dragged
  - `isDragOver`: true for the current drop target
  - `isDragActive`: true for all keys when any drag is in progress

#### 5. Key Component (src/components/Keyboard/Key.tsx)
- Added HTML5 drag API handlers:
  - `draggable={!isEditing}`: keys are draggable except when editing
  - `onDragStart`, `onDragEnd`, `onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`
- Dynamic className based on drag state
- Swap icon (⇄) overlay shown on valid drop targets when hovering

#### 6. Visual Styles (src/App.css)
- `.key--dragging`: semi-transparent (opacity 0.4) for dragged key
- `.key--drag-active`: subtle blue glow on all keys during drag (signals droppable state)
- `.key--drag-over`: strong blue glow border + scale transform on hovered drop target
- `.key-swap-icon`: centered swap icon (⇄) with white text-shadow for visibility

### Behavior

- **Within layer only**: Drag swaps only work within the same layer (main-to-main, shift-to-shift)
- **Character swap**: Only characters are swapped; finger assignments stay with their original keys
- **Null-safe**: Can drag keys with no character; swapping null is valid
- **Edit mode disabled**: Dragging is disabled while editing a key character

### Build Status

✅ TypeScript compilation successful
✅ Vite build successful
✅ No errors or warnings

### Commit

```
feat: drag-and-drop key swap on drag-swap branch
```

Git hash: c0b4b89
