import { useEffect, useRef } from 'react'
import { ArrowUp, Mic, MicOff, Square } from 'lucide-react'
import { useSpeechInput } from '@/lib/speech'
import { toast } from '@/lib/toast'
import { useSettings } from '@/lib/store'

export const MAX_PROMPT_CHARS = 8000

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy = false,
  placeholder = 'Message AIVORA AI…',
  autoFocus = false,
  large = false,
  label = 'Message',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (text: string) => void
  onStop?: () => void
  busy?: boolean
  placeholder?: string
  autoFocus?: boolean
  large?: boolean
  label?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const settings = useSettings()
  const voice = useSpeechInput({
    lang: settings.speechLang,
    onText: (text) => onChange(value ? `${value.trimEnd()} ${text}` : text),
    onError: (m) => toast(m, 'error'),
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, large ? 280 : 220)}px`
  }, [value, large])

  useEffect(() => {
    if (autoFocus && window.matchMedia('(pointer: fine)').matches)
      ref.current?.focus()
  }, [autoFocus])

  const tooLong = value.length > MAX_PROMPT_CHARS
  const canSend = value.trim().length > 0 && !busy && !tooLong

  const submit = () => {
    if (!canSend) return
    onSubmit(value.trim())
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={`group relative rounded-[1.4rem] border bg-surface/90 shadow-[0_20px_60px_-30px_rgba(59,130,246,0.55)] backdrop-blur transition focus-within:border-blue/60 ${tooLong ? 'border-danger/70' : 'border-line-strong'}`}
    >
      <label className="sr-only" htmlFor="composer-input">
        {label}
      </label>
      <textarea
        id="composer-input"
        ref={ref}
        rows={large ? 3 : 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing &&
            settings.enterToSend
          ) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={voice.listening ? 'Listening…' : placeholder}
        className={`block w-full resize-none bg-transparent px-4 text-ink placeholder:text-faint focus:outline-none sm:px-5 ${large ? 'pt-4 pb-2 text-base sm:text-[1.05rem]' : 'pt-3.5 pb-1 text-[0.95rem]'}`}
        aria-invalid={tooLong}
        aria-describedby={tooLong ? 'composer-error' : undefined}
      />
      <div className="flex items-center gap-1.5 px-2.5 pb-2.5 sm:px-3">
        {voice.supported && (
          <button
            type="button"
            onClick={voice.listening ? voice.stop : voice.start}
            className={`icon-btn !h-10 !w-10 ${voice.listening ? '!bg-danger/15 !text-danger' : ''}`}
            aria-label={voice.listening ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={voice.listening}
            disabled={busy}
          >
            {voice.listening ? (
              <MicOff className="h-[18px] w-[18px]" />
            ) : (
              <Mic className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
        <span
          id="composer-error"
          className={`ml-1 text-xs ${tooLong ? 'text-danger' : 'text-faint'}`}
          aria-live="polite"
        >
          {tooLong
            ? `Too long: ${value.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()} characters`
            : value.length > MAX_PROMPT_CHARS * 0.8
              ? `${value.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`
              : settings.enterToSend
                ? <span className="hidden sm:inline">Enter to send · Shift+Enter for new line</span>
                : null}
        </span>
        <div className="flex-1" />
        {busy && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 text-sm font-medium hover:bg-surface"
            aria-label="Stop generating"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            className="bg-brand inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </form>
  )
}
