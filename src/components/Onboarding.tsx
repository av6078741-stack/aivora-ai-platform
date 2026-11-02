import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Moon, ShieldCheck, Sun } from 'lucide-react'
import { Dialog } from './Dialog'
import { LogoFull } from './Logo'
import { getSettings, updateSettings, useSettings } from '@/lib/store'
import { replyLanguages } from '@/lib/assistant-modes'
import type { ReplyLanguage } from '@/lib/assistant-modes'

/** Short, skippable first-run welcome. Shown once per browser. */
export function Onboarding() {
  const [open, setOpen] = useState(false)
  const settings = useSettings()

  useEffect(() => {
    if (!getSettings().onboarded) setOpen(true)
  }, [])

  const finish = () => {
    updateSettings({ onboarded: true })
    setOpen(false)
  }

  return (
    <Dialog open={open} onClose={finish} title="Welcome to AIVORA AI">
      <div className="-mt-2 flex justify-center">
        <LogoFull size={168} eager className="rounded-2xl" />
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        One place for answers, writing, study, coding, translation and ideas.
        Image, video, website and app creation are on the roadmap.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            onClick={() => updateSettings({ theme: t })}
            aria-pressed={settings.theme === t}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm capitalize transition ${settings.theme === t ? 'border-blue bg-blue/10 text-ink' : 'border-line-strong text-muted hover:text-ink'}`}
          >
            {t === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {t} theme
          </button>
        ))}
      </div>

      <label className="mt-3 block text-sm">
        <span className="mb-1.5 block text-muted">Preferred reply language</span>
        <select
          className="field"
          value={settings.language}
          onChange={(e) =>
            updateSettings({ language: e.target.value as ReplyLanguage })
          }
        >
          {replyLanguages.map((l) => (
            <option key={l} value={l}>
              {l === 'auto' ? 'Same as my message' : l}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-3 text-xs text-muted">
        <ShieldCheck className="h-4 w-4 shrink-0 text-cyan" />
        <p>
          Your chats are saved only in this browser and disappear if you clear
          site data. Messages are sent to an AI provider to generate answers.{' '}
          <Link to="/privacy" onClick={finish} className="text-cyan underline">
            Privacy details
          </Link>
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="btn-ghost flex-1" onClick={finish}>
          Skip
        </button>
        <button className="btn-primary flex-1" onClick={finish}>
          Get started
        </button>
      </div>
    </Dialog>
  )
}
