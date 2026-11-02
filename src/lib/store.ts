import type { UIMessage } from '@tanstack/ai-react'
import type { AssistantMode, ReplyLanguage } from './assistant-modes'
import { createLocalStore } from './local-store'

export type StoredMessage = Omit<UIMessage, 'createdAt'> & {
  createdAt?: string | Date
}

export type Conversation = {
  id: string
  title: string
  mode: AssistantMode
  pinned: boolean
  createdAt: number
  updatedAt: number
  messages: StoredMessage[]
}

const conversationStore = createLocalStore<{ items: Conversation[] }>(
  'aivora.conversations.v1',
  { items: [] },
)

export const useConversations = () => conversationStore.useStore().items

export const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export function getConversation(id: string) {
  return conversationStore.get().items.find((c) => c.id === id)
}

export function textOf(message: Pick<UIMessage, 'parts'>) {
  return message.parts
    .map((p) => (p.type === 'text' ? p.content : ''))
    .join('')
    .trim()
}

function titleFrom(messages: StoredMessage[]) {
  const first = messages.find((m) => m.role === 'user')
  const text = first ? textOf(first as UIMessage).replace(/\s+/g, ' ') : ''
  if (!text) return 'New chat'
  return text.length > 48 ? `${text.slice(0, 48)}…` : text
}

export function saveConversation(
  id: string,
  mode: AssistantMode,
  messages: StoredMessage[],
) {
  if (!messages.length) return true
  return conversationStore.set(({ items }) => {
    const existing = items.find((c) => c.id === id)
    const now = Date.now()
    const next: Conversation = existing
      ? { ...existing, messages, updatedAt: now }
      : {
          id,
          mode,
          title: titleFrom(messages),
          pinned: false,
          createdAt: now,
          updatedAt: now,
          messages,
        }
    return { items: [next, ...items.filter((c) => c.id !== id)] }
  })
}

export function renameConversation(id: string, title: string) {
  const clean = title.trim().slice(0, 80)
  if (!clean) return false
  return conversationStore.set(({ items }) => ({
    items: items.map((c) => (c.id === id ? { ...c, title: clean } : c)),
  }))
}

export function togglePin(id: string) {
  return conversationStore.set(({ items }) => ({
    items: items.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
  }))
}

export function deleteConversation(id: string) {
  return conversationStore.set(({ items }) => ({
    items: items.filter((c) => c.id !== id),
  }))
}

export function clearConversations() {
  return conversationStore.set({ items: [] })
}

export function sortConversations(items: Conversation[]) {
  return [...items].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt,
  )
}

export function searchConversations(items: Conversation[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => textOf(m as UIMessage).toLowerCase().includes(q)),
  )
}

export function conversationToMarkdown(c: Conversation) {
  const lines = [
    `# ${c.title}`,
    '',
    `_Exported from AIVORA AI on ${new Date().toLocaleString()}_`,
    '',
  ]
  for (const m of c.messages) {
    const when = m.createdAt ? ` · ${new Date(m.createdAt).toLocaleString()}` : ''
    lines.push(
      `## ${m.role === 'user' ? 'You' : 'AIVORA AI'}${when}`,
      '',
      textOf(m as UIMessage),
      '',
    )
  }
  return lines.join('\n')
}

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportConversation(c: Conversation, format: 'md' | 'json') {
  const safe =
    c.title.replace(/[^\p{L}\p{N}\- ]/gu, '').trim().slice(0, 40) || 'chat'
  if (format === 'md')
    downloadFile(`${safe}.md`, conversationToMarkdown(c), 'text/markdown')
  else
    downloadFile(
      `${safe}.json`,
      JSON.stringify(c, null, 2),
      'application/json',
    )
}

export type Settings = {
  theme: 'dark' | 'light' | 'system'
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  language: ReplyLanguage
  saveHistory: boolean
  sounds: boolean
  enterToSend: boolean
  voiceURI: string
  speechRate: number
  speechLang: string
  onboarded: boolean
}

export const defaultSettings: Settings = {
  theme: 'dark',
  fontSize: 'md',
  language: 'auto',
  saveHistory: true,
  sounds: false,
  enterToSend: true,
  voiceURI: '',
  speechRate: 1,
  speechLang: 'en-IN',
  onboarded: false,
}

const settingsStore = createLocalStore<Settings>(
  'aivora.settings.v1',
  defaultSettings,
)

export const useSettings = settingsStore.useStore
export const getSettings = settingsStore.get
export const updateSettings = (patch: Partial<Settings>) =>
  settingsStore.set((s) => ({ ...s, ...patch }))
