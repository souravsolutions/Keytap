import { useMemo } from 'react'
import type { CaretState, LiveMetrics, TestConfig, WpmSample } from '../../types'
import { useTypingTest } from '../../hooks/useTypingTest'
import { Word } from './Word'

interface TypingTestProps {
  config: TestConfig
  words: string[]
  id?: string
  onComplete?: (metrics: LiveMetrics, samples: WpmSample[]) => void
}

export default function TypingTest({
  config,
  words,
  id,
  onComplete,
}: TypingTestProps) {
  const { mode } = config
  const { wordList, typed, errFlags, currentWordIndex, started, progress, live, caret, innerY, holderRef, innerRef, handleKeyDown } =
    useTypingTest(config, words, onComplete)

  const wordNodes = useMemo(
    () =>
      wordList.map((word, index) => (
        <Word
          key={index}
          word={word}
          typed={typed[index]}
          active={index === currentWordIndex}
          complete={index < currentWordIndex}
          hasError={errFlags[index]}
        />
      )),
    [wordList, typed, errFlags, currentWordIndex]
  )

  const caretWidth = caret.width

  return (
    <div
      className="flex w-full flex-col gap-[18px] outline-none"
      id={id}
      ref={holderRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => holderRef.current?.focus()}
    >
      <ProgressBar progress={progress} />

      {mode === 'words' ? (
        <div className="flex h-[138px] flex-col items-center justify-center gap-[24px] overflow-hidden lg:h-[168px]">
          <div
            className="relative select-none text-[1.35rem] leading-[46px] tracking-[0.5px] lg:text-[1.6rem] lg:leading-[56px]"
            ref={innerRef}
            style={{ transform: `translateY(${-innerY}px)` }}
          >
            <Caret caret={caret} caretWidth={caretWidth} started={started} />
            <Word
              word={wordList[currentWordIndex] ?? ''}
              typed={typed[currentWordIndex] ?? ''}
              active
              complete={false}
              hasError={errFlags[currentWordIndex] ?? false}
            />
          </div>
          <LiveBar live={live} />
        </div>
      ) : (
        <div className="h-[138px] overflow-hidden lg:h-[168px]">
          <div
            className="relative select-none text-[1.35rem] leading-[46px] tracking-[0.5px] [will-change:transform] lg:text-[1.6rem] lg:leading-[56px]"
            ref={innerRef}
            style={{ transform: `translateY(${-innerY}px)` }}
          >
            <Caret caret={caret} caretWidth={caretWidth} started={started} />
            {wordNodes}
          </div>
        </div>
      )}
    </div>
  )
}

interface LiveBarProps {
  live: LiveMetrics
}

function LiveBar({ live }: LiveBarProps) {
  return (
    <div className="flex select-none items-center justify-center gap-[26px] text-[var(--sub)]">
      <div className="flex items-baseline gap-1.5">
        <ChangeScore value={live.wpm} suffix="wpm" />
      </div>
      <div className="flex items-baseline gap-1.5">
        <ChangeScore value={`${live.accuracy}%`} suffix="acc" />
      </div>
    </div>
  )
}

function ChangeScore({ value, suffix }: { value: number | string; suffix: string }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span key={String(value)} className="inline-block text-[1.4rem] font-bold leading-none text-[var(--fg)] animate-[score-pop_0.3s_ease-out]">
        {value}
      </span>
      <span className="text-[0.75rem] lowercase text-[var(--sub)]">{suffix}</span>
    </span>
  )
}

interface ProgressBarProps {
  progress: number
}

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="h-0.5 overflow-hidden rounded-[2px] bg-[var(--bg2)]">
      <div
        className="h-full w-full bg-[var(--caret)] transition-transform duration-300 ease-in-out"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}

interface CaretProps {
  caret: CaretState
  caretWidth: number
  started: boolean
}

function Caret({ caret, caretWidth, started }: CaretProps) {
  return (
    <span
      className={`absolute h-[38px] w-[3px] translate-y-[8px] rounded-[1px] bg-[var(--caret)] transition-[left,width] duration-150 ease-linear lg:h-[46px] lg:translate-y-[11px] ${started ? 'animate-[caret-blink_1s_infinite]' : 'opacity-0'}`}
      style={{ left: caret.x, top: caret.y, width: caretWidth }}
    />
  )
}