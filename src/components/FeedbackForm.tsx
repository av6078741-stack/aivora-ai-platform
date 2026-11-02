import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'

type State = 'idle' | 'pending' | 'success' | 'error'

export function FeedbackForm() {
  const [state, setState] = useState<State>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'pending') return
    const body = new URLSearchParams()
    new FormData(event.currentTarget).forEach((value, key) =>
      body.append(key, String(value)),
    )
    setState('pending')
    try {
      const response = await fetch('/feedback-form.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error('Submission failed')
      if (/\bdata-netlify\s*=/i.test(await response.text()))
        throw new Error('Form handling is unavailable')
      setState('success')
    } catch {
      setState('error')
    }
  }

  if (state === 'success')
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        <div>
          <p className="font-medium">Thanks — your feedback was received.</p>
          <button className="mt-1 text-cyan underline" onClick={() => setState('idle')}>
            Send more feedback
          </button>
        </div>
      </div>
    )

  return (
    <form
      name="feedback"
      method="POST"
      action="/feedback-form.html"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={submit}
      onChange={() => {
        if (state === 'error') setState('idle')
      }}
    >
      <input type="hidden" name="form-name" value="feedback" />
      <p hidden>
        <label>
          Leave empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <fieldset disabled={state === 'pending'} className="space-y-3">
        <legend className="sr-only">Send feedback</legend>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">Topic</span>
          <select name="topic" className="field" defaultValue="General">
            <option>General</option>
            <option>Bug report</option>
            <option>Feature request</option>
            <option>Answer quality</option>
            <option>Privacy question</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">Message</span>
          <textarea
            name="message"
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            className="field resize-y"
            placeholder="Tell us what worked, what didn’t, or what you’d like next. Please don’t include passwords or private chats."
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted">Email (optional, only if you want a reply)</span>
          <input name="email" type="email" maxLength={254} autoComplete="email" className="field" />
        </label>
        <button type="submit" className="btn-primary w-full sm:w-auto">
          {state === 'pending' ? 'Sending…' : 'Send feedback'}
        </button>
      </fieldset>
      {state === 'error' && (
        <p role="alert" className="mt-3 text-sm text-danger">
          Your feedback could not be confirmed as sent. Your message is still here — please try again.
        </p>
      )}
    </form>
  )
}
