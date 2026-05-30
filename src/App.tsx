import { AppProvider } from './state/AppContext'
import { Header } from './components/Header'
import { MainLayout } from './components/MainLayout'
import { HelpModal } from './components/HelpModal'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <MainLayout />
        <HelpModal />
      </div>
    </AppProvider>
  )
}

export default App
