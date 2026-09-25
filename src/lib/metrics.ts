export const CHARS_PER_WORD = 5

export function calcWpm(chars: number, ms: number): number {
  const minutes = ms / 60000
  if (minutes <= 0) return 0
  return Math.round(chars / CHARS_PER_WORD / minutes)
}

export function calcAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect
  if (total <= 0) return 100
  return Math.round((correct / total) * 100)
}