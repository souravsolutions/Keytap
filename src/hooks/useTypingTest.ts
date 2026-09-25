import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import type { CaretState, LiveMetrics, TestConfig, WpmSample } from '../types'
import { calcAccuracy, calcWpm } from '../lib/metrics'

const TICK_INTERVAL_MS = 100
const ROLLING_WINDOW_MS = 1000
const SAMPLE_INTERVAL_MS = 1000

const RESTART_KEYS = new Set(['Tab', 'Escape'])
const FINISH_RESTART_KEYS = new Set(['Tab', 'Escape', 'Enter'])
const IGNORE_MODIFIER_KEYS = new Set(['Control', 'Meta', 'Alt'])

interface Keystroke {
  time: number
  correct: boolean
}

interface Stats {
  correct: number
  incorrect: number
}

interface UseTypingTestResult {
  wordList: string[]
  typed: string[]
  errFlags: boolean[]
  currentWordIndex: number
  started: boolean
  finished: boolean
  timeLeft: number
  progress: number
  live: LiveMetrics
  samples: WpmSample[]
  caret: CaretState
  innerY: number
  holderRef: RefObject<HTMLDivElement | null>
  innerRef: RefObject<HTMLDivElement | null>
  restart: () => void
  handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

export function useTypingTest(
  config: TestConfig,
  words: string[],
  onFinish?: (metrics: LiveMetrics, samples: WpmSample[]) => void
): UseTypingTestResult {
  const { mode, time } = config

  const [wordList, setWordList] = useState<string[]>(() => words)
  const [typed, setTyped] = useState<string[]>(() => words.map(() => ''))
  const [errFlags, setErrFlags] = useState<boolean[]>(() => words.map(() => false))
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(time)
  const [progress, setProgress] = useState(0)
  const [live, setLive] = useState<LiveMetrics>({ wpm: 0, raw: 0, accuracy: 100, errors: 0 })
  const [samples, setSamples] = useState<WpmSample[]>([])
  const [caret, setCaret] = useState<CaretState>({ x: 520, y: 0, width: 3 })
  const [innerY, setInnerY] = useState(0)

  const holderRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const wordListRef = useRef(words)
  wordListRef.current = words
  const typedRef = useRef(typed)
  typedRef.current = typed
  const errFlagsRef = useRef(errFlags)
  errFlagsRef.current = errFlags
  const currentWordIndexRef = useRef(currentWordIndex)
  currentWordIndexRef.current = currentWordIndex

  const startedRef = useRef(false)
  const finishedRef = useRef(false)
  const startTimeRef = useRef(0)
  const statsRef = useRef<Stats>({ correct: 0, incorrect: 0 })
  const keystrokesRef = useRef<Keystroke[]>([])
  const samplesRef = useRef<WpmSample[]>([])

  // Keep internal word state in sync when the parent supplies new words.
  useEffect(() => {
    setWordList(words)
    setTyped(words.map(() => ''))
    setErrFlags(words.map(() => false))
    setCurrentWordIndex(0)
    setFinished(false)
    setStarted(false)
    setTimeLeft(config.time)
    setProgress(0)
    setLive({ wpm: 0, raw: 0, accuracy: 100, errors: 0 })
    setSamples([])
    setInnerY(0)
    setCaret({ x: 0, y: 0, width: 3 })

    wordListRef.current = words
    typedRef.current = words.map(() => '')
    errFlagsRef.current = words.map(() => false)
    currentWordIndexRef.current = 0
    startedRef.current = false
    finishedRef.current = false
    statsRef.current = { correct: 0, incorrect: 0 }
    keystrokesRef.current = []
    samplesRef.current = []
  }, [words, config.time])

  // ---- restart (same text) --------------------------------------------------
  const restart = useCallback(() => {
    const resets = words.map(() => '')

    setTyped(resets)
    setErrFlags(words.map(() => false))
    setCurrentWordIndex(0)
    setFinished(false)
    setStarted(false)
    setTimeLeft(config.time)
    setProgress(0)
    setLive({ wpm: 0, raw: 0, accuracy: 100, errors: 0 })
    setSamples([])
    setInnerY(0)
    setCaret({ x: 0, y: 0, width: 3 })

    typedRef.current = resets
    errFlagsRef.current = words.map(() => false)
    currentWordIndexRef.current = 0
    startedRef.current = false
    finishedRef.current = false
    statsRef.current = { correct: 0, incorrect: 0 }
    keystrokesRef.current = []
    samplesRef.current = []

    holderRef.current?.focus()
  }, [words, config.time])

  // ---- finish ---------------------------------------------------------------
  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setFinished(true)

    const elapsedMs = Date.now() - startTimeRef.current
    const keystrokes = keystrokesRef.current
    const st = statsRef.current

    const finalMetrics: LiveMetrics = {
      wpm: calcWpm(keystrokes.filter((k) => k.correct).length, elapsedMs),
      raw: calcWpm(keystrokes.length, elapsedMs),
      accuracy: calcAccuracy(st.correct, st.incorrect),
      errors: st.incorrect,
    }

    const recent = samplesRef.current
    const last = recent[recent.length - 1]
    if (!last || Date.now() - last.time >= SAMPLE_INTERVAL_MS) {
      recent.push({ time: Date.now(), net: finalMetrics.wpm, raw: finalMetrics.raw })
      setSamples([...recent])
    }

    setLive(finalMetrics)
    onFinishRef.current?.(finalMetrics, recent)
  }, [])

  // ---- state mutations ------------------------------------------------------
  const commit = useCallback(
    (
      nextTyped: string[],
      nextErrFlags: boolean[],
      wordIndex: number = currentWordIndexRef.current
    ): void => {
      currentWordIndexRef.current = wordIndex
      typedRef.current = nextTyped
      errFlagsRef.current = nextErrFlags
      setTyped(nextTyped)
      setErrFlags(nextErrFlags)
      setCurrentWordIndex(wordIndex)
    },
    []
  )

  const handleBackspace = useCallback(
    (index: number, nextTyped: string[], nextErrFlags: boolean[]): void => {
      let targetIndex = index
      const current = nextTyped[index]

      if (current.length > 0) {
        nextTyped[index] = current.slice(0, -1)
      } else if (index > 0) {
        targetIndex = index - 1
        nextErrFlags[targetIndex] = false
        nextTyped[targetIndex] = nextTyped[targetIndex].slice(0, -1)
      }

      commit(nextTyped, nextErrFlags, targetIndex)
    },
    [commit]
  )

  const handleSpace = useCallback(
    (
      index: number,
      word: string,
      nextTyped: string[],
      nextErrFlags: boolean[]
    ): void => {
      const full = nextTyped[index]

      if (full.length < word.length) return

      const isCorrect = full === word
      nextErrFlags[index] = !isCorrect

      if (!isCorrect && full.length > word.length) {
        statsRef.current.incorrect += full.length - word.length
      }

      if (index >= wordListRef.current.length - 1) {
        commit(nextTyped, nextErrFlags)
        finish()
        return
      }

      const nextIndex = index + 1
      commit(nextTyped, nextErrFlags, nextIndex)

      if (mode === 'words') {
        setProgress(((nextIndex + 1) / wordListRef.current.length) * 100)
      }
    },
    [mode, commit, finish]
  )

  const handleCharacter = useCallback(
    (
      event: KeyboardEvent<HTMLDivElement>,
      index: number,
      word: string,
      nextTyped: string[]
    ): void => {
      event.preventDefault()

      const position = nextTyped[index].length
      const isCorrect = position < word.length && event.key === word[position]

      if (isCorrect) statsRef.current.correct++
      else statsRef.current.incorrect++

      keystrokesRef.current.push({ time: Date.now(), correct: isCorrect })
      nextTyped[index] += event.key

      commit(nextTyped, errFlagsRef.current.slice(), index)

      if (mode === 'words' && index >= wordListRef.current.length - 1 && nextTyped[index] === word) {
        finish()
      }
    },
    [commit, finish, mode]
  )

  const handleKeystroke = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const index = currentWordIndexRef.current
      const word = wordListRef.current[index]
      const nextTyped = typedRef.current.slice()
      const nextErrFlags = errFlagsRef.current.slice()

      switch (event.key) {
        case 'Backspace':
          handleBackspace(index, nextTyped, nextErrFlags)
          break

        case ' ':
          event.preventDefault()
          handleSpace(index, word, nextTyped, nextErrFlags)
          break

        default:
          if (event.key.length === 1) {
            handleCharacter(event, index, word, nextTyped)
          }
      }
    },
    [handleBackspace, handleSpace, handleCharacter]
  )

  // ---- keydown handler ------------------------------------------------------
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.ctrlKey || event.metaKey || IGNORE_MODIFIER_KEYS.has(event.key)) return

      if (finishedRef.current) {
        if (FINISH_RESTART_KEYS.has(event.key)) {
          event.preventDefault()
          restart()
        }
        return
      }

      if (RESTART_KEYS.has(event.key)) {
        event.preventDefault()
        restart()
        return
      }

      if (!startedRef.current && (event.key === 'Backspace' || event.key.length === 1)) {
        startedRef.current = true
        startTimeRef.current = Date.now()
        setStarted(true)
      }

      handleKeystroke(event)
    },
    [restart, handleKeystroke]
  )

  // ---- live ticking ---------------------------------------------------------
  useEffect(() => {
    if (!started || finished) return

    const intervalId = setInterval(() => {
      const now = Date.now()
      const elapsedMs = now - startTimeRef.current

      if (mode === 'time') {
        const remaining = Math.max(0, time - elapsedMs / 1000)
        setTimeLeft(Math.ceil(remaining))
        setProgress(Math.min(100, (elapsedMs / 1000 / time) * 100))
        if (elapsedMs / 1000 >= time) {
          finish()
          return
        }
      }

      const burst = computeBurst(now)
      const st = statsRef.current
      setLive({
        wpm: burst.net,
        raw: burst.raw,
        accuracy: calcAccuracy(st.correct, st.incorrect),
        errors: st.incorrect,
      })

      const recent = samplesRef.current
      const last = recent[recent.length - 1]
      if (!last || now - last.time >= SAMPLE_INTERVAL_MS) {
        recent.push({ time: now, net: burst.net, raw: burst.raw })
        setSamples([...recent])
      }
    }, TICK_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [started, finished, mode, time, finish])

  function computeBurst(now: number): { net: number; raw: number } {
    const cutoff = now - ROLLING_WINDOW_MS
    let rawCount = 0
    let correctCount = 0

    for (const keystroke of keystrokesRef.current) {
      if (keystroke.time >= cutoff) {
        rawCount++
        if (keystroke.correct) correctCount++
      }
    }

    return {
      net: Math.round((correctCount / 5) * 60),
      raw: Math.round((rawCount / 5) * 60),
    }
  }

  // ---- caret + smooth scroll ------------------------------------------------
  useLayoutEffect(() => {
    const inner = innerRef.current
    const index = currentWordIndexRef.current
    if (!inner) return

    const wordElement = mode === 'words'
      ? (inner.querySelector('.word') as HTMLElement | undefined)
      : (inner.querySelectorAll('.word')[index] as HTMLElement | undefined)
    if (!wordElement) return

    const chars = wordElement.querySelectorAll('.char')
    const typedLength = typedRef.current[index]?.length ?? 0
    const wordLength = wordListRef.current[index]?.length ?? 0

    let target: Element | null = null
    let caretIsEnd = false

    if (typedLength < wordLength) {
      target = chars[typedLength] ?? null
    } else if (typedLength > 0) {
      target = chars[typedLength - 1] ?? null
      caretIsEnd = true
    }

    const containerRect = inner.getBoundingClientRect()

    if (target) {
      const targetRect = target.getBoundingClientRect()
      setCaret({
        x: (caretIsEnd ? targetRect.right : targetRect.left) - containerRect.left - 1,
        y: wordElement.getBoundingClientRect().top - containerRect.top,
        width: 3,
      })
    } else {
      const wordRect = wordElement.getBoundingClientRect()
      setCaret({ x: wordRect.left - containerRect.left - 1, y: wordRect.top - containerRect.top, width: 3 })
    }

    const relativeTop = wordElement.getBoundingClientRect().top - containerRect.top
    const lineHeight = wordElement.getBoundingClientRect().height || 46
    const row = Math.max(0, Math.round(relativeTop / lineHeight))
    setInnerY(Math.max(0, row <= 1 ? 0 : (row - 1) * lineHeight))
  }, [wordList, typed, currentWordIndex, finished, mode])

  return {
    wordList,
    typed,
    errFlags,
    currentWordIndex,
    started,
    finished,
    timeLeft,
    progress,
    live,
    samples,
    caret,
    innerY,
    holderRef,
    innerRef,
    restart,
    handleKeyDown,
  }
}