import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowDown,
  Check,
  Copy,
  Download,
  Pause,
  Pencil,
  Pin,
  Play,
  RefreshCw,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Streamdown } from 'streamdown'
import type { UIMessage } from '@tanstack/ai-react'

import { useAIChat } from '@/lib/ai-hook'
import type { AssistantMode } from '@/lib/assistant-modes'
import {
  deleteConversation,
  exportConversation,
  getConversation,
  renameConversation,
  saveConversation,
  textOf,
  togglePin,
  useConversations,
  useSettings,
} from '@/lib/store'
import { copyText, toast } from '@/lib/toast'
import { playChime, ttsSupported, useSpeaker } from '@/lib/speech'
import { accentClass, toolForMode } from '@/lib/tools'
import { Composer } from './Composer'
import { ConfirmDialog, Dialog } from './Dialog'
import { LogoMark } from './Logo'

function formatTime(d: Date | string | undefined) {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
}

function hydrate(id: string): UIMessage[] | undefined {
  const c = getConversation(id)
  return c?.messages.map((m) => ({
    ...m,
    createdAt: m.createdAt ? new Date(m.createdAt) : undefined,
  })) as UIMessage[] | undefined
}

export function ChatView({
  conversationId,
  mode: requestedMode,
  initialPrompt,
}: {
  conversationId: string
  mode: AssistantMode
  initialPrompt?: string
}) {
  const navigate = useNavigate()
  const settings = useSettings()
  const conversations = useConversations()
  const saved = conversations.find((c) => c.id === conversationId)
  const mode = saved?.mode ?? requestedMode
  const tool = toolForMode(mode)
  const initialMessages = useMemo(() => hydrate(conversationId), [conversationId])

  const { messages, sendMessage, isLoading, stop, error, reload, setMessages } =
    useAIChat({
      id: conversationId,
      mode,
      language: settings.language,
      initialMessages,
    })

  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameText, setRenameText] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [atBottom, setAtBottom] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLLIElement>(null)
  const speaker = useSpeaker(settings)
  const wasLoading = useRef(false)
  const sentInitial = useRef(false)

  // Send a prompt handed over from the home screen or a tool card.
  useEffect(() => {
    if (initialPrompt && !sentInitial.current && !initialMessages?.length) {
      sentInitial.current = true
      void sendMessage(initialPrompt)
      navigate({ to: '/chat', search: { c: conversationId, mode }, replace: true })
    }
  }, [initialPrompt, initialMessages, sendMessage, navigate, conversationId, mode])

  // Persist locally once a response settles (never mid-stream).
  useEffect(() => {
    if (isLoading) {
      wasLoading.current = true
      return
    }
    if (!messages.length) return
    // Opening a saved chat shouldn't bump it to the top of the history.
    const untouched =
      !wasLoading.current && messages.length === (initialMessages?.length ?? 0)
    if (settings.saveHistory && !untouched) {
      const ok = saveConversation(conversationId, mode, messages)
      if (!ok)
        toast(
          'Could not save this chat. Browser storage may be full or disabled.',
          'error',
        )
    }
    if (wasLoading.current) {
      wasLoading.current = false
      if (settings.sounds && !error) playChime()
    }
  }, [isLoading, messages, conversationId, mode, settings.saveHistory, settings.sounds, error, initialMessages])

  // Auto-scroll while the user is at the bottom.
  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, atBottom, isLoading])

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80)
  }

  const send = (text: string) => {
    setInput('')
    setAtBottom(true)
    void sendMessage(text)
    if (!saved && settings.saveHistory)
      navigate({ to: '/chat', search: { c: conversationId, mode }, replace: true })
  }

  const regenerateFrom = (index: number) => {
    setMessages(messages.slice(0, index))
    setAtBottom(true)
    void reload()
  }

  const resendEdit = (index: number) => {
    const text = editText.trim()
    if (!text) return
    setEditingId(null)
    setMessages(messages.slice(0, index))
    setAtBottom(true)
    void sendMessage(text)
  }

  const lastMessage = messages.at(-1)
  const awaitingFirstToken =
    isLoading && (lastMessage?.role === 'user' || !textOf(lastMessage ?? { parts: [] }))

  return (
    <div className="flex h-full flex-col">
      {/* Conversation header */}
      <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-line px-3 sm:px-5">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${accentClass[tool.accent]}`}
          aria-hidden
        >
          <tool.icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {saved?.title ?? tool.name}
          </p>
          {saved && (
            <p className="truncate text-[0.7rem] text-faint">{tool.name}</p>
          )}
        </div>
        {saved && (
          <div className="flex items-center">
            <button
              className={`icon-btn ${saved.pinned ? '!text-cyan' : ''}`}
              onClick={() => {
                togglePin(saved.id)
                toast(saved.pinned ? 'Removed from saved chats' : 'Saved to pinned chats', 'success')
              }}
              aria-label={saved.pinned ? 'Unpin chat' : 'Pin chat'}
              aria-pressed={saved.pinned}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                setRenameText(saved.title)
                setRenameOpen(true)
              }}
              aria-label="Rename chat"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className="icon-btn"
              onClick={() => {
                exportConversation(saved, 'md')
                toast('Chat exported as Markdown', 'success')
              }}
              aria-label="Export chat as Markdown"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              className="icon-btn hover:!text-danger"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="relative min-h-0 flex-1 overflow-y-auto scrollbar-thin"
      >
        {messages.length === 0 ? (
          <EmptyChat
            toolName={tool.name}
            description={tool.description}
            prompts={tool.prompts ?? []}
            onPick={(p) => setInput(p)}
          />
        ) : (
          <ol className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:px-6" aria-label="Conversation">
            {messages.map((m, i) => {
              const text = textOf(m)
              const isUser = m.role === 'user'
              const streamingThis = isLoading && i === messages.length - 1 && !isUser
              if (!isUser && !text && !streamingThis) return null
              return (
                <li key={m.id} className={`group flex gap-3 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser && (
                    <LogoMark size={30} className="mt-1 shrink-0" />
                  )}
                  <div className={`min-w-0 ${isUser ? 'max-w-[85%] sm:max-w-[75%]' : 'flex-1'}`}>
                    {editingId === m.id ? (
                      <div className="rounded-2xl border border-blue/50 bg-surface p-3">
                        <label className="sr-only" htmlFor={`edit-${m.id}`}>Edit message</label>
                        <textarea
                          id={`edit-${m.id}`}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={Math.min(8, Math.max(2, editText.split('\n').length))}
                          className="w-full resize-y bg-transparent text-sm focus:outline-none"
                          autoFocus
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button className="btn-ghost !min-h-9" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                          <button
                            className="btn-primary !min-h-9"
                            onClick={() => resendEdit(i)}
                            disabled={!editText.trim() || isLoading}
                          >
                            Save & resend
                          </button>
                        </div>
                      </div>
                    ) : isUser ? (
                      <div className="rounded-2xl rounded-tr-md border border-blue/25 bg-gradient-to-br from-blue/20 to-violet/15 px-4 py-2.5 text-[0.95rem] whitespace-pre-wrap break-words">
                        {text}
                      </div>
                    ) : (
                      <div className="prose-aivora text-[0.95rem]">
                        {text ? (
                          <Streamdown isAnimating={streamingThis}>{text}</Streamdown>
                        ) : null}
                      </div>
                    )}

                    {editingId !== m.id && !(streamingThis && !text) && (
                      <div
                        className={`mt-1.5 flex flex-wrap items-center gap-0.5 text-faint ${isUser ? 'justify-end' : ''}`}
                      >
                        <time className="mr-1 text-[0.7rem]" dateTime={m.createdAt ? new Date(m.createdAt).toISOString() : undefined}>
                          {formatTime(m.createdAt)}
                        </time>
                        <span className="flex items-center opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                          <CopyButton text={text} />
                          {isUser ? (
                            <button
                              className="icon-btn !h-8 !w-8"
                              onClick={() => {
                                setEditingId(m.id)
                                setEditText(text)
                              }}
                              disabled={isLoading}
                              aria-label="Edit and resend message"
                              title="Edit and resend"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <>
                              {!streamingThis && (
                                <button
                                  className="icon-btn !h-8 !w-8"
                                  onClick={() => regenerateFrom(i)}
                                  disabled={isLoading}
                                  aria-label="Regenerate response"
                                  title="Regenerate"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {ttsSupported() && !streamingThis && (
                                <SpeakControls
                                  active={speaker.activeId === m.id}
                                  state={speaker.state}
                                  onSpeak={() => speaker.speak(m.id, text)}
                                  onPause={speaker.pause}
                                  onResume={speaker.resume}
                                  onStop={speaker.cancel}
                                />
                              )}
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}

            {awaitingFirstToken && (
              <li className="flex gap-3" aria-live="polite">
                <LogoMark size={30} className="mt-1 shrink-0" />
                <div className="flex items-center gap-1.5 rounded-2xl px-1 py-3" role="status">
                  <span className="sr-only">AIVORA AI is thinking</span>
                  <span className="typing-dot h-2 w-2 rounded-full bg-cyan" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-blue" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-violet" />
                </div>
              </li>
            )}

            {error && !isLoading && (
              <li role="alert" className="flex items-start gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                <div className="flex-1">
                  <p className="font-medium">The response could not be completed.</p>
                  <p className="mt-0.5 text-muted">{friendlyError(error.message)}</p>
                </div>
                <button className="btn-ghost !min-h-9 shrink-0" onClick={() => void reload()}>
                  <RotateCcw className="h-4 w-4" />
                  Retry
                </button>
              </li>
            )}
            <li ref={endRef} aria-hidden="true" />
          </ol>
        )}
      </div>

      {!atBottom && messages.length > 0 && (
        <div className="pointer-events-none relative">
          <button
            onClick={() => {
              setAtBottom(true)
              endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }}
            className="pointer-events-auto absolute -top-14 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line-strong bg-elev shadow-lg"
            aria-label="Scroll to latest message"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="shrink-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={send}
            onStop={stop}
            busy={isLoading}
            autoFocus
            placeholder={`Message ${tool.name === 'AI Chat' ? 'AIVORA AI' : tool.name}…`}
          />
          <p className="mt-2 text-center text-[0.7rem] text-faint">
            AIVORA AI can make mistakes. Check important information.
            {settings.saveHistory
              ? ' Chats are saved in this browser only.'
              : ' History saving is off.'}
          </p>
        </div>
      </div>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} title="Rename chat">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (saved && renameConversation(saved.id, renameText)) {
              toast('Chat renamed', 'success')
              setRenameOpen(false)
            }
          }}
        >
          <label className="mb-1.5 block text-sm text-muted" htmlFor="rename-input">
            Chat name
          </label>
          <input
            id="rename-input"
            className="field"
            value={renameText}
            maxLength={80}
            onChange={(e) => setRenameText(e.target.value)}
            autoFocus
          />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRenameOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!renameText.trim()}>
              Save
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this chat?"
        message="This permanently removes the conversation from this browser. It cannot be undone."
        onConfirm={() => {
          stop()
          if (deleteConversation(conversationId)) {
            toast('Chat deleted', 'success')
            navigate({ to: '/chat', search: { new: Date.now() } })
          } else toast('Could not delete the chat from browser storage.', 'error')
        }}
      />
    </div>
  )
}

function friendlyError(message: string) {
  if (/not configured/i.test(message))
    return `${message} The AI provider is not connected yet — see the README for setup.`
  if (/too large/i.test(message)) return message
  if (/rate|quota|429/i.test(message))
    return 'The AI provider is rate-limiting requests right now. Wait a moment and retry.'
  if (/fetch|network|Failed to fetch/i.test(message))
    return 'Network error. Check your internet connection and retry.'
  return message || 'Something went wrong. Please retry.'
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="icon-btn !h-8 !w-8"
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        }
      }}
      aria-label="Copy message"
      title="Copy"
    >
      {done ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function SpeakControls({
  active,
  state,
  onSpeak,
  onPause,
  onResume,
  onStop,
}: {
  active: boolean
  state: 'idle' | 'playing' | 'paused'
  onSpeak: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}) {
  if (!active)
    return (
      <button className="icon-btn !h-8 !w-8" onClick={onSpeak} aria-label="Read aloud" title="Read aloud">
        <Volume2 className="h-3.5 w-3.5" />
      </button>
    )
  return (
    <>
      {state === 'paused' ? (
        <button className="icon-btn !h-8 !w-8 !text-cyan" onClick={onResume} aria-label="Resume reading">
          <Play className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button className="icon-btn !h-8 !w-8 !text-cyan" onClick={onPause} aria-label="Pause reading">
          <Pause className="h-3.5 w-3.5" />
        </button>
      )}
      <button className="icon-btn !h-8 !w-8 !text-cyan" onClick={onStop} aria-label="Stop reading">
        <VolumeX className="h-3.5 w-3.5" />
      </button>
    </>
  )
}

function EmptyChat({
  toolName,
  description,
  prompts,
  onPick,
}: {
  toolName: string
  description: string
  prompts: string[]
  onPick: (p: string) => void
}) {
  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-5 py-10 text-center">
      <LogoMark size={64} className="animate-fade-up" />
      <h1 className="font-display animate-fade-up mt-5 text-2xl font-semibold sm:text-3xl">
        {toolName === 'AI Chat' ? (
          <>How can <span className="text-gradient">AIVORA</span> help today?</>
        ) : (
          toolName
        )}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {prompts.length > 0 && (
        <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">
          {prompts.map((p) => (
            <button
              key={p}
              onClick={() => onPick(p)}
              className="card-hover rounded-2xl border border-line bg-surface/70 px-4 py-3 text-left text-sm text-muted hover:text-ink"
            >
              {p.trim()}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
