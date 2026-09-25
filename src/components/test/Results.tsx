import type { LiveMetrics, WpmSample } from '../../types'

interface ResultsProps {
  metrics: LiveMetrics
  samples: WpmSample[]
  onRestart: () => void
  onNewText?: () => void
}

export default function Results({ metrics, samples, onRestart, onNewText }: ResultsProps) {
  const maxWpm = Math.max(
    1,
    ...samples.map((sample) => sample.net),
    ...samples.map((sample) => sample.raw)
  )

  return (
    <div className="pt-3 text-center animate-[rise_0.3s_ease]">
      <div className="text-[4.5rem] font-extrabold leading-none text-[var(--caret)]">{metrics.wpm}</div>
      <div className="mt-1 text-[1rem] uppercase tracking-[2px] text-[var(--sub)]">wpm</div>

      <div className="mt-[22px] flex h-20 items-end gap-[3px] px-2">
        {samples.map((sample, index) => (
          <div
            className="flex h-full min-w-[3px] flex-1 items-end gap-0.5"
            key={`${sample.time}-${index}`}
            title={`${sample.net} wpm · ${sample.raw} raw`}
          >
            <div
              className="min-h-0.5 flex-1 rounded-t-[2px] bg-[rgba(100,102,109,0.45)] transition-[height] duration-300 ease-in-out"
              style={{ height: `${(sample.raw / maxWpm) * 100}%` }}
            />
            <div
              className="min-h-0.5 flex-1 rounded-t-[2px] bg-[var(--caret)] transition-[height] duration-300 ease-in-out"
              style={{ height: `${(sample.net / maxWpm) * 100}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-[22px] flex justify-center gap-10">
        <Stat value={metrics.raw} label="raw" />
        <Stat value={`${metrics.accuracy}%`} label="acc" />
        <Stat value={metrics.errors} label="errors" />
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button className="bg-transparent text-[0.8rem] text-[var(--sub)] hover:text-[var(--fg)]" onClick={onRestart}>
          <span className="text-[inherit]">tab</span> / <span className="text-[inherit]">esc</span> to restart
        </button>
        {onNewText && (
          <button className="bg-transparent text-[0.8rem] text-[var(--sub)] hover:text-[var(--fg)]" onClick={onNewText}>
            <span className="text-[inherit]">next text</span>
          </button>
        )}
      </div>
    </div>
  )
}

interface StatProps {
  value: string | number
  label: string
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[1.6rem] font-bold text-[var(--fg)]">{value}</span>
      <span className="text-[0.7rem] uppercase tracking-[1px] text-[var(--sub)]">{label}</span>
    </div>
  )
}