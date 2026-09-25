import type { View } from '../types'

interface HeaderProps {
  view: View
  onNavigate: (view: View) => void
}

const NAV_ITEMS: Array<{ view: View; label: string }> = [
  { view: 'race', label: 'race' },
  { view: 'settings', label: 'settings' },
]

export default function Header({ view, onNavigate }: HeaderProps) {
  return (
    <header className="flex select-none items-center justify-between gap-4 px-6 py-4">
      <div className="flex cursor-pointer items-center" onClick={() => onNavigate('race')}>
        <img src="/logo.svg" alt="keytap logo" className="h-[38px] w-auto" />
      </div>

      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            className={`bg-transparent text-[0.95rem] cursor-pointer rounded-[5px] px-[10px] py-1 transition-colors duration-150 ${view === item.view ? 'text-[var(--caret)]' : 'text-[var(--sub)] hover:text-[var(--fg)]'}`}
            onClick={() => onNavigate(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}