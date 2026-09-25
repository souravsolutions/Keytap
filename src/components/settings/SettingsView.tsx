import { useSettings } from '../../app/SettingsContext'
import type { TestMode, ThemeName } from '../../types'
import { KEYBOARD_THEME_OPTIONS } from '../../types'

const TIME_OPTIONS = [15, 30, 60]
const WORDS_OPTIONS = [10, 25, 50]

export default function SettingsView({ onNavigate }: { onNavigate: (view: 'race') => void }) {
  const { settings, update } = useSettings()

  return (
    <div className="flex w-[min(760px,92vw)] flex-col gap-5 py-2 pb-5">
      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-5 py-[18px]">
        <h2 className="mb-3.5 text-[0.8rem] uppercase tracking-[1.5px] text-[var(--sub)]">
          appearance
        </h2>
        <div className="flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">theme</span>
          <div className="flex gap-1">
            {(['dark', 'light'] as ThemeName[]).map((theme) => (
              <button
                key={theme}
                className={segClass(settings.theme === theme)}
                onClick={() => update({ theme })}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">keyboard</span>
          <div className="flex flex-wrap gap-1">
            {KEYBOARD_THEME_OPTIONS.map((theme) => (
              <button
                key={theme}
                className={segClass(settings.keyboardTheme === theme)}
                onClick={() => update({ keyboardTheme: theme })}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] px-5 py-[18px]">
        <h2 className="mb-3.5 text-[0.8rem] uppercase tracking-[1.5px] text-[var(--sub)]">
          default test
        </h2>
        <div className="flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">time</span>
          <div className="flex gap-1">
            {TIME_OPTIONS.map((value) => (
              <button
                key={value}
                className={segClass(settings.time === value)}
                onClick={() => update({ time: value })}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">words</span>
          <div className="flex gap-1">
            {WORDS_OPTIONS.map((value) => (
              <button
                key={value}
                className={segClass(settings.words === value)}
                onClick={() => update({ words: value })}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">mode</span>
          <div className="flex gap-1">
            {(['time', 'words'] as TestMode[]).map((mode) => (
              <button
                key={mode}
                className={segClass(settings.defaultMode === mode)}
                onClick={() => update({ defaultMode: mode })}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-[14px]">
          <span className="w-[120px] shrink-0 text-[0.9rem] text-[var(--sub)]">punctuation</span>
          <button
            className={segClass(settings.punctuation)}
            onClick={() => update({ punctuation: !settings.punctuation })}
          >
            {settings.punctuation ? 'on' : 'off'}
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="rounded-[6px] border border-[var(--caret)] bg-[var(--caret)] px-[14px] py-[6px] font-bold text-[#1a1a1a]"
          onClick={() => onNavigate('race')}
        >
          back to race
        </button>
      </div>
    </div>
  )
}

function segClass(active: boolean): string {
  return `bg-transparent text-[0.9rem] cursor-pointer rounded-[5px] px-[10px] py-1 transition-colors duration-150 ${active ? 'bg-[rgba(226,183,20,0.08)] text-[var(--caret)]' : 'text-[var(--sub)] hover:text-[var(--fg)]'}`
}