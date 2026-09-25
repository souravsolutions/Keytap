import { BUNDLED_QUOTES, type BundleQuote } from './corpus'

export interface RaceText {
  id: number
  title: string
  author: string
  words: string[]
}

export interface RaceTextBatch {
  words: string[]
  texts: RaceText[]
}

const PUNCTUATION_RE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g

function splitTextKeepPunctuation(text: string): string[] {
  return text.trim().split(/\s+/).filter((word) => word.length > 0)
}

function stripWordPunctuation(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(PUNCTUATION_RE, ''))
    .filter((word) => word.length > 0)
}

function toWords(passage: string, stripPunctuation: boolean): string[] {
  return stripPunctuation
    ? stripWordPunctuation(passage)
    : splitTextKeepPunctuation(passage)
}

function bundledText(quote: BundleQuote, stripPunctuation: boolean): RaceText {
  return {
    id: quote.id,
    title: quote.title,
    author: quote.author,
    words: toWords(quote.text, stripPunctuation),
  }
}

export function loadPracticeTexts(
  targetWords: number,
  stripPunctuation: boolean
): RaceTextBatch {
  const candidates = [...BUNDLED_QUOTES].sort(() => Math.random() - 0.5)
  const texts: RaceText[] = []
  let collected = 0

  for (const quote of candidates) {
    if (texts.length >= 10 || collected >= targetWords) break
    const text = bundledText(quote, stripPunctuation)
    texts.push(text)
    collected += text.words.length
  }

  const words = texts.flatMap((text) => text.words)
  return { words, texts }
}