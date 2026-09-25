export type TestMode = 'time' | 'words'

export interface TestConfig {
  mode: TestMode
  time: number
  words: number
  punctuation: boolean
}

export interface LiveMetrics {
  wpm: number
  raw: number
  accuracy: number
  errors: number
}

export interface WpmSample {
  time: number
  net: number
  raw: number
}

export interface CaretState {
  x: number
  y: number
  width: number
}

export type View = 'race' | 'settings' | 'results'

export type ThemeName = 'dark' | 'light'

export type KeyboardThemeName =
  | 'classic'
  | 'mint'
  | 'royal'
  | 'dolch'
  | 'sand'
  | 'scarlet'

export const KEYBOARD_THEME_OPTIONS: KeyboardThemeName[] = [
  'classic',
  'mint',
  'royal',
  'dolch',
  'sand',
  'scarlet',
]

export interface AppSettings {
  theme: ThemeName
  keyboardTheme: KeyboardThemeName
  defaultMode: TestMode
  time: number
  words: number
  punctuation: boolean
}