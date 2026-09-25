import { useCallback, useState } from 'react'
import Header from './components/Header'
import RaceView from './views/RaceView'
import ResultsView from './views/ResultsView'
import SettingsView from './components/settings/SettingsView'
import Keyboard from './components/ui/keyboard'
import { useSettings } from './app/SettingsContext'
import type { LiveMetrics, View, WpmSample } from './types'

export default function App() {
  const [view, setView] = useState<View>('race')
  const [result, setResult] = useState<{ metrics: LiveMetrics; samples: WpmSample[] } | null>(null)
  const { settings } = useSettings()

  const navigate = useCallback((next: View) => setView(next), [])

  const goRace = useCallback(() => {
    setResult(null)
    setView('race')
  }, [])

  const handleComplete = useCallback((metrics: LiveMetrics, samples: WpmSample[]) => {
    setResult({ metrics, samples })
    setView('results')
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <Header view={view} onNavigate={navigate} />

<main
        className={`flex min-h-0 flex-1 items-center justify-center ${view === 'settings' ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        <div className="flex flex-col items-center gap-[58px]">
          {view === 'race' && <RaceView onComplete={handleComplete} />}
          {view === 'results' && (
            <ResultsView
              metrics={result?.metrics ?? null}
              samples={result?.samples ?? []}
              onRestart={goRace}
              onNewText={goRace}
            />
          )}
          {view === 'settings' && (
            <SettingsView onNavigate={(next) => navigate(next as View)} />
          )}

          {view === 'race' && (
            <Keyboard
              theme={settings.keyboardTheme}
              enableHaptics
              enableSound
            />
          )}
          <div className="text-[0.75rem] tracking-[0.5px] text-[var(--sub)]">
            <span className="text-[var(--caret)]">tab</span> + <span className="text-[var(--caret)]">restart</span> · <span className="text-[var(--caret)]">esc</span> + <span className="text-[var(--caret)]">restart</span> ·
            made for keyboards
          </div>
        </div>
      </main>
    </div>
  )
}