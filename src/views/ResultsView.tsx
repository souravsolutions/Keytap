import type { LiveMetrics, WpmSample } from '../types'
import Results from '../components/test/Results'

interface ResultsViewProps {
  metrics: LiveMetrics | null
  samples: WpmSample[]
  onRestart: () => void
  onNewText: () => void
}

export default function ResultsView({
  metrics,
  samples,
  onRestart,
  onNewText,
}: ResultsViewProps) {
  if (!metrics) {
    return (
      <div className="flex w-[min(900px,92vw)] flex-col items-center gap-[22px]">
        <div className="px-0 pb-[10px] pt-10 text-center text-[1rem] text-[var(--sub)]">
          No results yet — finish a test to see your score.
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button className="rounded-[6px] border border-[var(--caret)] bg-[var(--caret)] px-[14px] py-[6px] font-bold text-[#1a1a1a]" onClick={onRestart}>
            start typing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-[min(900px,92vw)] flex-col items-center">
      <Results
        metrics={metrics}
        samples={samples}
        onRestart={onRestart}
        onNewText={onNewText}
      />
    </div>
  )
}