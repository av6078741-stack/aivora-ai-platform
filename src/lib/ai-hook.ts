import { useMemo } from 'react'
import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'
import type { InferChatMessages, UIMessage } from '@tanstack/ai-react'
import type { AssistantMode, ReplyLanguage } from './assistant-modes'

export const chatConnection = {
  async *connect(
    ...args: Parameters<ReturnType<typeof fetchServerSentEvents>['connect']>
  ) {
    let responseError: Error | undefined
    const connection = fetchServerSentEvents('/api/chat', {
      fetchClient: async (input, init) => {
        const response = await fetch(input, init)
        if (!response.ok) {
          const body: unknown = await response
            .clone()
            .json()
            .catch(() => null)
          const message =
            body &&
            typeof body === 'object' &&
            'error' in body &&
            typeof body.error === 'string'
              ? body.error
              : 'The chat request failed. Please try again.'
          responseError = new Error(message)
        }
        return response
      },
    })
    try {
      yield* connection.connect(...args)
    } catch (error) {
      throw responseError ?? error
    }
  },
}

const defaultChatOptions = createChatClientOptions({
  connection: chatConnection,
})

export type ChatMessages = InferChatMessages<typeof defaultChatOptions>

export const useAIChat = (options: {
  id: string
  mode: AssistantMode
  language: ReplyLanguage
  initialMessages?: Array<UIMessage>
}) => {
  const forwardedProps = useMemo(
    () => ({ mode: options.mode, language: options.language }),
    [options.mode, options.language],
  )
  return useChat({
    ...defaultChatOptions,
    threadId: options.id,
    initialMessages: options.initialMessages,
    forwardedProps,
  })
}
