import { useCallback, useEffect, useRef, useState } from 'react'
import type { TestConfig } from '../types'
import { loadPracticeTexts, type RaceTextBatch } from '../lib/textService'

const WORDS_BUFFER = {
  time: 240,
  words: 0,
}

interface UseRaceWordsResult {
  batch: RaceTextBatch | null
  words: string[]
  reload: () => void
}

function targetWords(config: TestConfig): number {
  if (config.mode === 'time') return WORDS_BUFFER.time
  return Math.min(config.words, 300)
}

export function useRaceWords(config: TestConfig): UseRaceWordsResult {
  const [batch, setBatch] = useState<RaceTextBatch | null>(() =>
    loadPracticeTexts(targetWords(config), !config.punctuation)
  )

  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    setBatch(loadPracticeTexts(targetWords(config), !config.punctuation))
  }, [config.mode, config.words, config.punctuation])

  const reload = useCallback(() => {
    const current = configRef.current
    setBatch(loadPracticeTexts(targetWords(current), !current.punctuation))
  }, [])

  const words = batch?.words ?? []
  return { batch, words, reload }
}