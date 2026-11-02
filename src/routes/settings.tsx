import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Download, Monitor, Moon, Sun, Trash2, UserRound } from 'lucide-react'

import { ConfirmDialog } from '@/components/Dialog'
import { replyLanguages } from '@/lib/assistant-modes'
import type { ReplyLanguage } from '@/lib/assistant-modes'
import {
  clearConversations,
  defaultSettings,
  downloadFile,
  updateSettings,
  useConversations,
  useSettings,
} from '@/lib/store'
import type { Settings } from '@/lib/store'
import { ttsSupported, useVoices } from '@/lib/speech'
import { toast } from '@/lib/toast'

export const Route = createFileRoute('/settings')({
  head: () => ({ meta: [{ title: 'Settings — AIVORA AI' }] }),
  component: SettingsPage,
})

const speechLangs = [
  ['en-IN', 'English (India)'],
  ['en-US', 'English (US)'],
  ['en-GB', 'English (UK)'],
  ['hi-IN', 'Hindi'],
  ['bn-IN', 'Bengali'],
  ['mr-IN', 'Marathi'],
  ['ta-IN', 'Tamil'],
  ['te-IN', 'Telugu'],
  ['gu-IN', 'Gujarati'],
  ['es-ES', 'Spanish'],
  ['fr-FR', 'French'],
  ['de-DE', 'German'],
  ['ar-SA', 'Arabic'],
] as const

function save(patch: Partial<Settings>, label = 'Settings saved') {
  if (updateSettings(patch)) toast(label, 'success')
  else toast('Could not save settings. Browser storage may be disabled.', 'error')
}

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 rounded-3xl border border-line bg-surface/70 p-5 sm:p-6" aria-labelledby={`${id ?? title}-h`}>
      <h2 id={`${id ?? title}-h`} className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  )
}

function Row({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <div className="shrink-0 sm:w-64">{children}</div>
    </div>
  )
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative ml-auto flex h-7 w-12 items-center rounded-full transition sm:ml-auto ${checked ? 'bg-brand' : 'bg-surface-2 ring-1 ring-line-strong'}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function SettingsPage() {
  const s = useSettings()
  const conversations = useConversations()
  const voices = useVoices()
  const [confirmClear, setConfirmClear] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const matchingVoices = voices.filter((v) => v.lang.startsWith(s.speechLang.split('-')[0]!))

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:py-10">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">Preferences are saved in this browser.</p>
      </div>

      <Section id="account" title="Account">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-line-strong">
            <UserRound className="h-5 w-5 text-muted" />
          </span>
          <div>
            <p className="font-medium">Guest mode</p>
            <p className="mt-1 text-sm text-muted">
              Sign-up, sign-in, password reset and synced chat history are coming in the next release.
              Until then, AIVORA works without an account and keeps your chats on this device.
            </p>
          </div>
        </div>
      </Section>

      <Section id="appearance" title="Appearance">
        <Row label="Theme">
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-line-strong p-1" role="radiogroup" aria-label="Theme">
            {([['dark', Moon], ['light', Sun], ['system', Monitor]] as const).map(([t, Icon]) => (
              <button
                key={t}
                role="radio"
                aria-checked={mounted && s.theme === t}
                onClick={() => save({ theme: t }, 'Theme updated')}
                className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs capitalize ${mounted && s.theme === t ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'}`}
              >
                <Icon className="h-3.5 w-3.5" /> {t}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Text size" hint="Scales text across the whole app.">
          <div className="grid grid-cols-4 gap-1 rounded-xl border border-line-strong p-1" role="radiogroup" aria-label="Text size">
            {(['sm', 'md', 'lg', 'xl'] as const).map((f) => (
              <button
                key={f}
                role="radio"
                aria-checked={mounted && s.fontSize === f}
                onClick={() => save({ fontSize: f }, 'Text size updated')}
                className={`min-h-9 rounded-lg text-xs ${mounted && s.fontSize === f ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'}`}
              >
                {{ sm: 'Small', md: 'Default', lg: 'Large', xl: 'X-Large' }[f]}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      <Section id="language" title="Language & chat">
        <Row label="Reply language" hint="AIVORA answers in this language unless you ask otherwise. The interface is in English." htmlFor="reply-lang">
          <select id="reply-lang" className="field" value={s.language} onChange={(e) => save({ language: e.target.value as ReplyLanguage }, 'Reply language updated')}>
            {replyLanguages.map((l) => (
              <option key={l} value={l}>{l === 'auto' ? 'Same as my message' : l}</option>
            ))}
          </select>
        </Row>
        <Row label="Press Enter to send" hint="When off, use the send button. Shift+Enter always adds a new line." htmlFor="enter-send">
          <Toggle id="enter-send" label="Press Enter to send" checked={s.enterToSend} onChange={(v) => save({ enterToSend: v })} />
        </Row>
        <Row label="Sound when an answer is ready" hint="A short, quiet chime." htmlFor="sounds">
          <Toggle id="sounds" label="Sound when an answer is ready" checked={s.sounds} onChange={(v) => save({ sounds: v })} />
        </Row>
      </Section>

      <Section id="voice" title="Voice">
        <Row label="Speech language" hint="Used for voice input and read-aloud." htmlFor="speech-lang">
          <select id="speech-lang" className="field" value={s.speechLang} onChange={(e) => save({ speechLang: e.target.value, voiceURI: '' }, 'Voice language updated')}>
            {speechLangs.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
          </select>
        </Row>
        {mounted && !ttsSupported() ? (
          <p className="text-sm text-muted">Read-aloud isn’t supported in this browser.</p>
        ) : (
          <>
            <Row label="Read-aloud voice" hint={matchingVoices.length ? undefined : 'No voices for this language on your device — the browser default is used.'} htmlFor="voice-select">
              <select id="voice-select" className="field" value={s.voiceURI} onChange={(e) => save({ voiceURI: e.target.value }, 'Voice updated')}>
                <option value="">Browser default</option>
                {matchingVoices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
              </select>
            </Row>
            <Row label={`Speaking speed · ${s.speechRate.toFixed(1)}×`} htmlFor="speech-rate">
              <input id="speech-rate" type="range" min={0.6} max={1.6} step={0.1} value={s.speechRate} onChange={(e) => updateSettings({ speechRate: Number(e.target.value) })} className="w-full accent-[var(--blue)]" />
            </Row>
          </>
        )}
      </Section>

      <Section id="history" title="Chat history & data">
        <Row label="Save chat history on this device" hint="When off, new chats are not stored and disappear when you leave." htmlFor="save-history">
          <Toggle id="save-history" label="Save chat history on this device" checked={s.saveHistory} onChange={(v) => save({ saveHistory: v }, v ? 'History saving turned on' : 'History saving turned off')} />
        </Row>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-ghost"
            disabled={!mounted || conversations.length === 0}
            onClick={() => {
              downloadFile(`aivora-chats-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), conversations }, null, 2), 'application/json')
              toast(`Exported ${conversations.length} chats`, 'success')
            }}
          >
            <Download className="h-4 w-4" /> Export all chats
          </button>
          <button className="btn-ghost hover:!border-danger/50 hover:!text-danger" disabled={!mounted || conversations.length === 0} onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" /> Clear all history
          </button>
          <button
            className="btn-ghost"
            onClick={() => save({ ...defaultSettings, onboarded: true }, 'Settings reset to defaults')}
          >
            Reset preferences
          </button>
        </div>
        <p className="text-xs text-faint">
          {mounted ? `${conversations.length} chats stored in this browser.` : ' '} See the <Link to="/privacy" className="text-cyan underline">privacy page</Link> for what is stored and where.
        </p>
      </Section>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all chat history?"
        message={`All ${conversations.length} conversations will be permanently deleted from this browser. Export them first if you want a copy.`}
        confirmLabel="Clear history"
        onConfirm={() => {
          if (clearConversations()) toast('All chat history cleared', 'success')
          else toast('Could not clear browser storage.', 'error')
        }}
      />
    </div>
  )
}
