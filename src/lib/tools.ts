import {
  BookOpen,
  Code2,
  FileText,
  Globe,
  ImageIcon,
  Languages,
  Layers,
  Lightbulb,
  MessageSquare,
  Mic,
  PenLine,
  ScanSearch,
  Smartphone,
  Sigma,
  Sparkles,
  Table2,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { AssistantMode } from './assistant-modes'

/**
 * live    – works today through the AIVORA chat backend.
 * browser – works today using the visitor's browser APIs (no server).
 * planned – on the roadmap (see PLAN.md); the UI says so instead of faking it.
 */
export type ToolStatus = 'live' | 'browser' | 'planned'

export type Tool = {
  id: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  status: ToolStatus
  /** Chat mode for live text tools. */
  mode?: AssistantMode
  prompts?: string[]
  /** Roadmap milestone for planned tools (matches PLAN.md). */
  milestone?: number
  /** What the planned tool needs before it can go live. */
  requires?: string
  accent: 'cyan' | 'blue' | 'violet'
}

export const tools: Tool[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    tagline: 'Ask anything, get clear answers',
    description:
      'Real-time conversations with full context, Markdown answers, code blocks, regenerate, edit and resend.',
    icon: MessageSquare,
    status: 'live',
    mode: 'chat',
    accent: 'cyan',
    prompts: [
      'Explain quantum computing like I am 15',
      'What are the pros and cons of electric cars?',
      'Plan a 3-day trip to Jaipur on a student budget',
    ],
  },
  {
    id: 'writing',
    name: 'Writing Assistant',
    tagline: 'Emails, essays, captions, scripts',
    description:
      'Draft and polish essays, emails, letters, applications, blogs, stories, YouTube scripts and captions. Rewrite, shorten, expand, fix grammar or change tone.',
    icon: PenLine,
    status: 'live',
    mode: 'writing',
    accent: 'violet',
    prompts: [
      'Write a professional leave application for 2 days',
      'Rewrite this to sound more confident: "I think I can maybe help"',
      'Give me 5 YouTube titles for a budget phone review',
    ],
  },
  {
    id: 'study',
    name: 'Study Assistant',
    tagline: 'Learn step by step',
    description:
      'Simple explanations, step-by-step maths, science, history, grammar, Hindi learning, notes, quizzes, flashcards and study plans.',
    icon: BookOpen,
    status: 'live',
    mode: 'study',
    accent: 'blue',
    prompts: [
      'Explain photosynthesis in simple words with an example',
      'Solve step by step: 2x² − 5x + 2 = 0',
      'Make 5 flashcards on the French Revolution',
    ],
  },
  {
    id: 'coding',
    name: 'Coding Assistant',
    tagline: 'Generate, explain and debug code',
    description:
      'Write and explain code in HTML, CSS, JavaScript, React, Python and more. Find bugs, explain error messages, and plan project structures.',
    icon: Code2,
    status: 'live',
    mode: 'coding',
    accent: 'cyan',
    prompts: [
      'Write a responsive navbar in HTML and CSS',
      'Explain this error: TypeError: Cannot read properties of undefined',
      'Write a Python function to check if a string is a palindrome',
    ],
  },
  {
    id: 'translate',
    name: 'Translation',
    tagline: 'Hindi ⇄ English and more',
    description:
      'Translate between languages with formal and informal variants, word meanings, grammar notes and pronunciation help.',
    icon: Languages,
    status: 'live',
    mode: 'translate',
    accent: 'blue',
    prompts: [
      'Translate to Hindi: "Where is the nearest railway station?"',
      'Translate to English and explain the grammar: "मुझे पढ़ना पसंद है"',
      'Formal and informal ways to say "thank you" in Spanish',
    ],
  },
  {
    id: 'summarize',
    name: 'Text Summarizer',
    tagline: 'Long text to key points',
    description:
      'Paste any long text and get a TL;DR, key points and action items without invented details.',
    icon: Layers,
    status: 'live',
    mode: 'summarize',
    accent: 'violet',
    prompts: ['Summarize the following text into 5 bullet points:\n\n'],
  },
  {
    id: 'ideas',
    name: 'Idea Generator',
    tagline: 'Brainstorm business and content ideas',
    description:
      'Business ideas, names, marketing angles, content calendars, to-do lists and presentation outlines.',
    icon: Lightbulb,
    status: 'live',
    mode: 'ideas',
    accent: 'cyan',
    prompts: [
      'Brainstorm 10 small business ideas I can start with ₹20,000',
      'Suggest 10 names for a modern tea café',
      'Create a 7-day Instagram content plan for a bakery',
    ],
  },
  {
    id: 'voice',
    name: 'Voice Assistant',
    tagline: 'Speak your prompt, hear the answer',
    description:
      'Speech-to-text input and read-aloud answers using your browser’s built-in speech features. Availability depends on your browser.',
    icon: Mic,
    status: 'browser',
    mode: 'chat',
    accent: 'violet',
  },
  {
    id: 'image',
    name: 'Image Generator',
    tagline: 'Text to image',
    description:
      'Generate logos, app icons, thumbnails, banners, wallpapers and illustrations from a prompt, with styles, sizes, history and downloads.',
    icon: ImageIcon,
    status: 'planned',
    milestone: 4,
    requires: 'Image model via Netlify AI Gateway (Gemini image) and file storage for history.',
    accent: 'violet',
  },
  {
    id: 'video',
    name: 'Video Generator',
    tagline: 'Text to short video',
    description:
      'Describe a scene and generate a short clip with progress tracking, previews and downloads.',
    icon: Video,
    status: 'planned',
    milestone: 8,
    requires: 'A paid external video-generation provider and background job processing.',
    accent: 'blue',
  },
  {
    id: 'website',
    name: 'Website Builder',
    tagline: 'Describe a site, get the code',
    description:
      'Generate multi-page responsive websites, preview them in a sandbox, edit files and download a ZIP.',
    icon: Globe,
    status: 'planned',
    milestone: 7,
    requires: 'Structured code generation, a sandboxed preview frame and ZIP export.',
    accent: 'cyan',
  },
  {
    id: 'app',
    name: 'App Builder',
    tagline: 'Plan screens and generate code',
    description:
      'Turn an app idea into screens, navigation and source code with documentation and ZIP export.',
    icon: Smartphone,
    status: 'planned',
    milestone: 7,
    requires: 'The same code-generation workspace as the Website Builder.',
    accent: 'violet',
  },
  {
    id: 'vision',
    name: 'Image Analysis',
    tagline: 'Ask about any picture',
    description:
      'Upload a photo, screenshot or diagram and ask questions, read visible text and explain what is shown.',
    icon: ScanSearch,
    status: 'planned',
    milestone: 5,
    requires: 'Validated uploads and a vision-capable model.',
    accent: 'blue',
  },
  {
    id: 'docs',
    name: 'PDF & Document Assistant',
    tagline: 'Summarize and question documents',
    description:
      'Upload PDFs and documents to summarize, extract information, explain paragraphs and create notes.',
    icon: FileText,
    status: 'planned',
    milestone: 5,
    requires: 'Server-side document text extraction and secure file storage.',
    accent: 'cyan',
  },
  {
    id: 'data',
    name: 'Data Analysis',
    tagline: 'CSV and Excel insights',
    description:
      'Preview spreadsheets, compute real summaries, chart trends and explain the results.',
    icon: Table2,
    status: 'planned',
    milestone: 5,
    requires: 'Spreadsheet parsing with real calculations (not model guesses).',
    accent: 'violet',
  },
  {
    id: 'research',
    name: 'Web Research',
    tagline: 'Answers with real sources',
    description:
      'Search the web, summarize findings and cite the sources actually retrieved, with links and dates.',
    icon: Sparkles,
    status: 'planned',
    milestone: 6,
    requires: 'A real web-search API key (for example Brave, Tavily or Bing).',
    accent: 'blue',
  },
  {
    id: 'math',
    name: 'Math & Calculators',
    tagline: 'Exact calculations',
    description:
      'Calculator, percentages and unit conversion using exact arithmetic, plus step-by-step explanations.',
    icon: Sigma,
    status: 'planned',
    milestone: 6,
    requires: 'No external service — deterministic calculation logic.',
    accent: 'cyan',
  },
]

export const liveTools = tools.filter((t) => t.status !== 'planned')
export const getTool = (id: string | undefined) =>
  tools.find((t) => t.id === id)
export const toolForMode = (mode: AssistantMode | undefined) =>
  tools.find((t) => t.mode === mode && t.status === 'live') ?? tools[0]!

export const accentClass: Record<Tool['accent'], string> = {
  cyan: 'text-cyan bg-cyan/10 ring-cyan/25',
  blue: 'text-blue bg-blue/10 ring-blue/25',
  violet: 'text-violet bg-violet/10 ring-violet/25',
}
