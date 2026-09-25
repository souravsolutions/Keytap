import { memo } from 'react'

interface WordProps {
  word: string
  typed: string
  active: boolean
  complete: boolean
  hasError: boolean
}

export const Word = memo(function Word({ word, typed, active, complete, hasError }: WordProps) {
  const expected = word
  const typedLength = typed.length

  const renderCharacter = (index: number): string => {
    if (index < typedLength) {
      return typed[index] === expected[index]
        ? 'text-[var(--correct)]'
        : 'text-[var(--wrong)]'
    }
    if (active) return 'text-[var(--sub)]'
    if (complete) return hasError ? 'text-[var(--wrong)]' : 'text-[var(--correct)]'
    return 'text-[var(--sub)]'
  }

  const expectedChars = Array.from({ length: expected.length }, (_, index) => (
    <span key={index} className={`char transition-colors duration-75 ${renderCharacter(index)}`}>
      {expected[index]}
    </span>
  ))

  const extraChars = Array.from({ length: Math.max(0, typedLength - expected.length) }, (_, index) => {
    const position = expected.length + index
    return (
      <span key={`extra-${position}`} className="char transition-colors duration-75 text-[var(--error-extra)]">
        {typed[position]}
      </span>
    )
  })

  return (
    <span className="word mr-2.5 inline-block whitespace-pre tracking-[0.07em] last:mr-0">
      {expectedChars}
      {extraChars}
    </span>
  )
})