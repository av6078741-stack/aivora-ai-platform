import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { AssistantMode } from '@/lib/assistant-modes'

/**
 * Starts a fresh chat. A button (not a Link) so the unique `new` timestamp is
 * created on click rather than baked into server-rendered HTML.
 */
export function NewChatButton({
  mode,
  className,
  children,
  ...rest
}: {
  mode?: AssistantMode
  className?: string
  children: ReactNode
  'aria-label'?: string
}) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        navigate({ to: '/chat', search: { mode, new: Date.now() } })
      }
      {...rest}
    >
      {children}
    </button>
  )
}
