import { ConfigManager } from './ConfigManager'

export function Header() {
  return (
    <div className="header">
      <h1>Searchcraft layout analyzer</h1>
      <ConfigManager />
    </div>
  )
}
