import { useState, useEffect } from 'react'

const LS_KEY = 'skp-help-seen'

export function HelpModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Auto-open on first load
    const hasSeenHelp = localStorage.getItem(LS_KEY)
    if (!hasSeenHelp) {
      setIsOpen(true)
    }
  }, [])

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
      closeModal()
    }
  }

  const closeModal = () => {
    localStorage.setItem(LS_KEY, 'true')
    setIsOpen(false)
  }

  return (
    <>
      <button className="help-btn" onClick={() => setIsOpen(true)}>
        ?
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
          <div className="modal-dialog">
            <button className="modal-close" onClick={closeModal}>
              ✕
            </button>
            
            <h2>How to Use</h2>

            <h3>Overview</h3>
            <p>This tool simulates all your searchcrafts with a keyboard layout and evaluates its ergonomics. You can use it to plan a new layout or tweak your existing one.</p>
            
            <h3>Controls</h3>
            <ul>
              <li>Click any key to set bindings. To assign [LSHIFT]/[RSHIFT]/[HOME]/[BS], just type them exactly as listed. You can also drag and drop keys to swap bindings. </li>
              <li>Right-click a key to assign a finger. See <b>Advanced</b> at the bottom to see what to do if you use multiple fingers on one key.</li>
              <li>Put all the searchcrafting terms you use into the sidebar. Each term should be on a new line.</li>
            </ul>

            <h3>Visualization</h3>
            <ul>
              <li>By default, a graph overlay visualizes how all your searchcrafts are typed.</li>
              <li>Keys used frequently are more prominent.</li>
              <li>Crafts that aren't ergonomic are red. Keys involved in multiple inefficient crafts are redder.</li>
              <li>You can hover or click on a craft to see how it contributes to the graph.</li>
              <li>You can disable certain visualizations using the sidebar.</li>
            </ul>            

            <h3>Bad Patterns</h3>
            <ul>
              <li>This is a set of patterns taken from theory on full keyboard layouts, filtered down to one handed searchcrafting:
                <ul>
                  <li>SFB (Same Finger Bigram): Two adjacent keys typed by the same finger. An example is TG on QWERTY (all examples will be on QWERTY).</li>
                  <li>SFS (Same Finger Skipgram): An SFB interrupted with some characters in between. An example is MAY (M to Y) with 1 character of separation. You can configure the threshold of separation it takes to cause an SFS. *tbh these are pretty niche especially if you don't have many 3 letter crafts but it's there as an option</li>
                  <li>Rolls: Sequences of characters on different fingers moving consistently in one direction. An example of an outward roll would be DSA, and an inward one would be ASD.</li>
                  <li>Redirects: Sequences of characters on different fingers that change direction in the mid-stream. An example would be ADS.</li>
                  <li>Scissors: When finger length leads to awkward sequences of 2 keystrokes. For example, try TC/CT and compare it to EV/VE.</li>
                  <li>For more information, check out <a href="https://docs.google.com/document/d/1W0jhfqJI2ueJ2FNseR4YAFpNfsUM-_FlREHbpNGmC2o/edit?tab=t.gqpvotadxlgh#heading=h.y8oxmpenmccj" target="_blank" rel="noopener noreferrer">this guide</a></li>
                </ul>
              </li>
            </ul>

            <h3>Advanced:</h3>
            <ul>
              <li>If you alt finger on a key (using multiple fingers for a single key depending on the craft), just assign the most frequently used finger to that key. If you want full confidence over the ergonomics of that key, you can switch between both fingerings to see if you get any warnings. You can also hover over that key to highlight which crafts use it, and go over each craft yourself.</li>
              <li>To avoid scissors, you should follow this ordering where middle is the highest finger: 1. middle 2. ring 3. pinky 4. index</li>
            </ul>

            <h3>Misc:</h3>
            <ul>
              <li>Saves are stored in your browser, which means that they won't transfer to other devices.</li>
              <li>Created by @h0541yomi on Discord.</li>
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
