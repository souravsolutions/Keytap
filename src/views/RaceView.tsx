import { useCallback, useEffect, useRef } from 'react'
import type { AppSettings, LiveMetrics, TestConfig, WpmSample } from '../types'
import { useSettings } from '../app/SettingsContext'
import { useRaceWords } from '../hooks/useRaceWords'
import TypingTest from '../components/test/TypingTest'

const TIME_OPTIONS = [15, 30, 60]
const WORDS_OPTIONS = [10, 25, 50]

const ID = 'typing-test'

interface RaceViewProps {
  onComplete?: (metrics: LiveMetrics, samples: WpmSample[]) => void
}

export default function RaceView({ onComplete }: RaceViewProps) {
  const { settings, update } = useSettings()

  const config: TestConfig = {
    mode: settings.defaultMode,
    time: settings.time,
    words: settings.words,
    punctuation: settings.punctuation,
  }

  const { words, reload } = useRaceWords(config)
  const focusTimer = useRef<number | null>(null)

  const focusTest = useCallback(() => {
    document.getElementById(ID)?.focus()
  }, [])

  useEffect(() => {
    focusTimer.current = window.setTimeout(focusTest, 30)
    return () => {
      if (focusTimer.current !== null) window.clearTimeout(focusTimer.current)
    }
  }, [focusTest])

  const updateConfig = useCallback(
    (patch: Partial<AppSettings>) => {
      update(patch)
    },
    [update]
  )

  return (
    <div className="flex w-[min(900px,92vw)] flex-col gap-[22px]">
      <ConfigBar config={config} onChange={updateConfig} onNewText={reload} />

      <TypingTest
        key={`${config.mode}-${config.time}-${config.words}-${config.punctuation}`}
        config={config}
        words={words}
        id={ID}
        onComplete={onComplete}
      />
    </div>
  )
}

interface ConfigBarProps {
  config: TestConfig
  onChange: (patch: Partial<AppSettings>) => void
  onNewText: () => void
}

function ConfigBar({ config, onChange, onNewText }: ConfigBarProps) {
  const durationOptions = config.mode === 'time' ? TIME_OPTIONS : WORDS_OPTIONS

  return (
    <div className="flex items-center justify-center gap-1 text-[var(--sub)]">
      {durationOptions.map((value) => {
        const isActive =
          config.mode === 'time' ? config.time === value : config.words === value
        const patch: Partial<AppSettings> =
          config.mode === 'time' ? { time: value } : { words: value }

        return (
          <button
            key={value}
            className={cfgClass(isActive)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange(patch)}
          >
            {value}
          </button>
        )
      })}
      <span className="mx-1.5 text-[var(--sub)] opacity-50">|</span>
      <button
        className={cfgClass(config.mode === 'time')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange({ defaultMode: 'time' })}
      >
        time
      </button>
      <button
        className={cfgClass(config.mode === 'words')}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange({ defaultMode: 'words' })}
      >
        words
      </button>
      <span className="mx-1.5 text-[var(--sub)] opacity-50">|</span>
      <button
        className={cfgClass(config.punctuation)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onChange({ punctuation: !config.punctuation })}
        title="Punctuation in texts"
      >
        punctuation
      </button>
      <span className="mx-1.5 text-[var(--sub)] opacity-50">|</span>
      <button
        className="bg-transparent text-[0.95rem] cursor-pointer rounded-[5px] px-2 py-1 text-[var(--sub)] transition-colors duration-150 hover:text-[var(--fg)]"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onNewText}
        title="Load a new text"
      >
        next
      </button>
    </div>
  )
}

function cfgClass(active: boolean): string {
  return `bg-transparent text-[0.95rem] cursor-pointer rounded-[5px] px-2 py-1 transition-colors duration-150 ${active ? 'text-[var(--caret)]' : 'text-[var(--sub)] hover:text-[var(--fg)]'}`
}