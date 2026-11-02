import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ChatView } from '@/components/ChatView'
import { LogoMark } from '@/components/Logo'
import { assistantModes } from '@/lib/assistant-modes'
import { newId } from '@/lib/store'

const searchSchema = z.object({
  /** Existing conversation id. */
  c: z.string().max(100).optional().catch(undefined),
  /** Prompt to send immediately (from the home screen or a tool). */
  q: z.string().max(8000).optional().catch(undefined),
  mode: z.enum(assistantModes).optional().catch(undefined),
  /** Changing this value starts a fresh chat. */
  new: z.number().optional().catch(undefined),
})

export const Route = createFileRoute('/chat')({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: 'AI Chat — AIVORA AI' }] }),
  component: ChatPage,
})

function ChatPage() {
  const search = Route.useSearch()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // A fresh id per "new chat" request; an existing id when reopening.
  const freshId = useMemo(() => newId(), [search.new])
  const id = search.c ?? freshId

  if (!mounted)
    return (
      <div className="flex h-full items-center justify-center" role="status">
        <LogoMark size={44} className="animate-pulse" />
        <span className="sr-only">Loading chat</span>
      </div>
    )

  return (
    <ChatView
      key={id}
      conversationId={id}
      mode={search.mode ?? 'chat'}
      initialPrompt={search.c ? undefined : search.q}
    />
  )
}
