import { FINGER_COLORS } from '../config'

export function FingerLegend() {
  const fingers = [
    { key: 'L_PINKY', label: 'Pinky' },
    { key: 'L_RING', label: 'Ring' },
    { key: 'L_MIDDLE', label: 'Middle' },
    { key: 'L_INDEX', label: 'Index' },
    { key: 'L_THUMB', label: 'Thumb' },
    { key: 'UNASSIGNED', label: 'Unassigned' },
  ]

  return (
    <div className="finger-legend">
      {fingers.map(finger => (
        <div key={finger.key} className="finger-legend-item">
          <div
            className="finger-swatch"
            style={{ backgroundColor: FINGER_COLORS[finger.key] }}
          />
          <span>{finger.label}</span>
        </div>
      ))}
    </div>
  )
}
