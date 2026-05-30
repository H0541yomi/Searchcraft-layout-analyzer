import { useState, useEffect } from 'react'

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button className="help-btn" onClick={() => setIsOpen(true)}>
        ?
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-dialog">
            <button className="modal-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
            
            <h2>SearchCraft Keybind Planner — How to Use</h2>
            
            <h3>Keyboard</h3>
            <ul>
              <li>Click any key to set its character binding (type and press Enter)</li>
              <li>Right-click a key to assign a finger (Pinky, Ring, Middle, Index, Thumb) or leave unassigned</li>
              <li>Keys are colored by their finger assignment</li>
              <li>Use the Shift Layer button to configure a second keyboard layer for shift-key bindings</li>
            </ul>
            
            <h3>Word List</h3>
            <ul>
              <li>Paste your Minecraft item names / phrases (one per line) in the word list</li>
              <li>Words are automatically parsed into a directed character graph overlaid on the keyboard</li>
              <li>Arrows show how often you transition from one key to another</li>
              <li>Heavier arrows = more frequent transitions</li>
            </ul>
            
            <h3>Bad Pattern Detection</h3>
            <ul>
              <li>Enable flag checkboxes to highlight ergonomically bad patterns:
                <ul>
                  <li>SFB: two adjacent keys typed by the same finger</li>
                  <li>SFS: same finger used at a configurable gap distance</li>
                  <li>Rolls: sequences moving consistently inward or outward</li>
                  <li>Redirects: sequences that change direction mid-stream</li>
                  <li>Scissors: large row jumps that violate natural finger height</li>
                </ul>
              </li>
              <li>Flagged words are highlighted red in the word list</li>
              <li>Graph nodes turn red based on how often that character is involved in bad patterns</li>
              <li>Click the override button on any word to exempt it from detection</li>
            </ul>
            
            <h3>Graph Nodes</h3>
            <ul>
              <li>Circle size = how often that character appears across all words</li>
              <li>Red tint intensity = how often that character participates in flagged patterns</li>
            </ul>
            
            <h3>Tips</h3>
            <ul>
              <li>Space is treated as a character — assign it to a key (Thumb by default) for space analysis</li>
              <li>Use the Shift Layer to plan both normal and shifted character layouts</li>
              <li>All settings are saved automatically in your browser</li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
