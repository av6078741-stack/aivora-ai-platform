import { useCallback, useEffect, useRef, useState } from 'react'

// Browser-only voice features. Nothing here is sent to AIVORA's server;
// some browsers (e.g. Chrome) process speech recognition on their own servers.

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: any) => void) | null
  onerror: ((e: any) => void) | null
  onend: (() => void) | null
}

function getRecognitionCtor(): (new () => RecognitionLike) | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const recognitionErrors: Record<string, string> = {
  'not-allowed':
    'Microphone access was blocked. Allow microphone permission in your browser settings and try again.',
  'service-not-allowed':
    'Speech recognition is disabled in this browser.',
  'no-speech': 'No speech was detected. Try again and speak clearly.',
  'audio-capture': 'No microphone was found on this device.',
  network: 'Speech recognition needs an internet connection in this browser.',
}

export function useSpeechInput(opts: {
  lang: string
  onText: (text: string) => void
  onError: (message: string) => void
}) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const recRef = useRef<RecognitionLike | null>(null)
  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()))
    return () => recRef.current?.abort()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = optsRef.current.lang
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e) => {
      const text = Array.from(e.results as ArrayLike<any>)
        .map((r) => r[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (text) optsRef.current.onText(text)
    }
    rec.onerror = (e) => {
      if (e.error === 'aborted') return
      optsRef.current.onError(
        recognitionErrors[e.error] ?? 'Voice input stopped unexpectedly.',
      )
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      optsRef.current.onError('Voice input could not start. Try again.')
    }
  }, [])

  const stop = useCallback(() => recRef.current?.stop(), [])

  return { supported, listening, start, stop }
}

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])
  return voices
}

export const ttsSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

/** Strip Markdown syntax so the voice doesn't read symbols aloud. */
export function plainForSpeech(md: string) {
  return md
    .replace(/```[\s\S]*?```/g, ' (code block omitted) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export type SpeechState = 'idle' | 'playing' | 'paused'

export function useSpeaker(settings: {
  voiceURI: string
  speechRate: number
  speechLang: string
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [state, setState] = useState<SpeechState>('idle')

  useEffect(() => () => {
    if (ttsSupported()) window.speechSynthesis.cancel()
  }, [])

  const speak = (id: string, text: string) => {
    if (!ttsSupported()) return
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(plainForSpeech(text))
    const voice = synth.getVoices().find((v) => v.voiceURI === settings.voiceURI)
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? settings.speechLang
    u.rate = settings.speechRate
    u.onend = () => {
      setActiveId(null)
      setState('idle')
    }
    u.onerror = () => {
      setActiveId(null)
      setState('idle')
    }
    setActiveId(id)
    setState('playing')
    synth.speak(u)
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setState('paused')
  }
  const resume = () => {
    window.speechSynthesis.resume()
    setState('playing')
  }
  const cancel = () => {
    window.speechSynthesis.cancel()
    setActiveId(null)
    setState('idle')
  }

  return { activeId, state, speak, pause, resume, cancel }
}

/** Short, quiet chime played when an answer finishes (if enabled). */
export function playChime() {
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.32)
    osc.onended = () => void ctx.close()
  } catch {
    // Audio not available; silently skip the chime.
  }
}
