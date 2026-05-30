import { AppProvider } from './state/AppContext'
import { WordHighlightProvider } from './state/WordHighlightContext'
import { Header } from './components/Header'
import { MainLayout } from './components/MainLayout'
import { HelpModal } from './components/HelpModal'
import './App.css'

function App() {
  return (
    <AppProvider>
      <WordHighlightProvider>
      <div className="app">
        <Header />
        <MainLayout />
        <HelpModal />
      </div>
      </WordHighlightProvider>
    </AppProvider>
  )
}

export default App
