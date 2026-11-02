import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Download, MessageSquare, Pencil, Pin, Plus, Search, Trash2 } from 'lucide-react'
import { z } from 'zod'

import { ConfirmDialog, Dialog } from '@/components/Dialog'
import { NewChatButton } from '@/components/NewChatButton'
import {
  deleteConversation,
  exportConversation,
  renameConversation,
  searchConversations,
  sortConversations,
  togglePin,
  useConversations,
} from '@/lib/store'
import type { Conversation } from '@/lib/store'
import { toast } from '@/lib/toast'
import { toolForMode } from '@/lib/tools'

export const Route = createFileRoute('/history')({
  validateSearch: z.object({
    filter: z.enum(['all', 'pinned']).optional().catch(undefined),
  }),
  head: () => ({ meta: [{ title: 'Chat history — AIVORA AI' }] }),
  component: HistoryPage,
})

function HistoryPage() {
  const { filter = 'all' } = Route.useSearch()
  const all = useConversations()
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [renaming, setRenaming] = useState<Conversation | null>(null)
  const [renameText, setRenameText] = useState('')
  const [deleting, setDeleting] = useState<Conversation | null>(null)
  useEffect(() => setMounted(true), [])

  const list = searchConversations(
    sortConversations(filter === 'pinned' ? all.filter((c) => c.pinned) : all),
    query,
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            {filter === 'pinned' ? 'Saved chats' : 'Chat history'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Stored in this browser only. Clearing site data removes them.
          </p>
        </div>
        <NewChatButton className="btn-primary">
          <Plus className="h-4 w-4" /> New chat
        </NewChatButton>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search conversations</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            className="field !pl-10"
            placeholder="Search by keyword in titles and messages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </label>
        <div className="flex rounded-xl border border-line-strong p-1" role="tablist" aria-label="Filter">
          {(['all', 'pinned'] as const).map((f) => (
            <Link
              key={f}
              to="/history"
              search={{ filter: f === 'all' ? undefined : f }}
              role="tab"
              aria-selected={filter === f}
              className={`flex min-h-9 items-center rounded-lg px-4 text-sm ${filter === f ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'}`}
            >
              {f === 'all' ? 'All' : 'Pinned'}
            </Link>
          ))}
        </div>
      </div>

      {!mounted ? (
        <div className="mt-10 space-y-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
          <MessageSquare className="h-8 w-8 text-faint" />
          <p className="mt-3 font-medium">
            {query
              ? 'No conversations match your search.'
              : filter === 'pinned'
                ? 'No saved chats yet.'
                : 'No conversations yet.'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {filter === 'pinned' && !query
              ? 'Pin a chat with the pin button in its header to keep it here.'
              : 'Start a chat and it will show up here.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((c) => {
            const tool = toolForMode(c.mode)
            return (
              <li key={c.id} className="group flex items-center gap-2 rounded-2xl border border-line bg-surface/70 p-2 pl-4 transition hover:border-line-strong">
                <Link to="/chat" search={{ c: c.id }} className="flex min-w-0 flex-1 items-center gap-3 py-1.5">
                  <tool.icon className="h-4 w-4 shrink-0 text-cyan" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {c.pinned && <Pin className="h-3 w-3 shrink-0 text-cyan" aria-label="Pinned" />}
                      <span className="truncate">{c.title}</span>
                    </p>
                    <p className="truncate text-xs text-faint">
                      {tool.name} · {c.messages.length} messages · {new Date(c.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center">
                  <button className={`icon-btn ${c.pinned ? '!text-cyan' : ''}`} onClick={() => togglePin(c.id)} aria-label={c.pinned ? `Unpin ${c.title}` : `Pin ${c.title}`} aria-pressed={c.pinned}>
                    <Pin className="h-4 w-4" />
                  </button>
                  <button className="icon-btn" onClick={() => { setRenaming(c); setRenameText(c.title) }} aria-label={`Rename ${c.title}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="icon-btn hidden sm:inline-flex" onClick={() => { exportConversation(c, 'md'); toast('Chat exported as Markdown', 'success') }} aria-label={`Export ${c.title}`}>
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="icon-btn hover:!text-danger" onClick={() => setDeleting(c)} aria-label={`Delete ${c.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={Boolean(renaming)} onClose={() => setRenaming(null)} title="Rename chat">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (renaming && renameConversation(renaming.id, renameText)) {
              toast('Chat renamed', 'success')
              setRenaming(null)
            }
          }}
        >
          <label htmlFor="history-rename" className="mb-1.5 block text-sm text-muted">Chat name</label>
          <input id="history-rename" className="field" value={renameText} maxLength={80} onChange={(e) => setRenameText(e.target.value)} autoFocus />
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setRenaming(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!renameText.trim()}>Save</button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this chat?"
        message={<>“{deleting?.title}” will be permanently removed from this browser.</>}
        onConfirm={() => {
          if (deleting && deleteConversation(deleting.id)) toast('Chat deleted', 'success')
          else toast('Could not delete the chat from browser storage.', 'error')
        }}
      />
    </div>
  )
}
