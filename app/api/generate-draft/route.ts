import { NextResponse } from 'next/server'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5'
const FALLBACK_CONSTRAINTS = [
  'Do not invent new experiences or awards.',
  'Preserve anchor sentences from the base story.',
  'Avoid over-polished or unnatural phrasing.',
]

type DraftRequestPayload = {
  baseStory?: string
  scholarship?: {
    id: string
    name: string
    type: string
    priorities: string[]
  }
  focus?: string
  wordLimit?: number
  constraints?: string[]
  scholarships?: unknown
  studentProfiles?: unknown
}

const extractTextFromClaude = (content: Array<{ text?: string }> = []) =>
  content
    .map((block) => block?.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n')
    .trim()

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not set in the environment.' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as DraftRequestPayload
  const baseStory = body.baseStory?.trim()
  const scholarship = body.scholarship

  if (!baseStory || !scholarship) {
    return NextResponse.json(
      { error: 'Missing base story or scholarship metadata.' },
      { status: 400 }
    )
  }

  const sanitizedWordLimit =
    typeof body.wordLimit === 'number' && body.wordLimit > 0
      ? Math.round(body.wordLimit)
      : 650

  const constraints =
    body.constraints && Array.isArray(body.constraints) && body.constraints.length > 0
      ? body.constraints
          .map((rule) => (typeof rule === 'string' ? rule.trim() : ''))
          .filter(Boolean)
      : FALLBACK_CONSTRAINTS

  const structuredBrief = {
    objective: 'Generate a scholarship-ready essay draft.',
    baseStory,
    scholarship,
    controls: {
      focus: body.focus ?? 'balanced',
      targetWordLimit: sanitizedWordLimit,
      constraints,
    },
    context: {
      scholarships: body.scholarships,
      studentProfiles: body.studentProfiles,
    },
  }

  const claudeRequest = {
    model: DEFAULT_MODEL,
    max_tokens: 3000,
    system:
      'You are Claude, an expert scholarship essay strategist. Keep drafts grounded, truthful, and specific to the given scholarship priorities. Do not pad your response with any context. The output should only contain the essay draft.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Use the JSON brief below to produce a cohesive scholarship essay.',
              'Respect the word limit and constraints. Return polished paragraphs only.',
              'JSON:',
              JSON.stringify(structuredBrief, null, 2),
            ].join('\n\n'),
          },
        ],
      },
    ],
  }

  const response = await fetch(CLAUDE_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(claudeRequest),
  })

  if (!response.ok) {
    const errorPayload = await response.text()
    return NextResponse.json(
      {
        error: 'Claude API request failed.',
        details: errorPayload,
      },
      { status: response.status }
    )
  }

  const claudeData = await response.json()
  const draft = extractTextFromClaude(claudeData?.content ?? [])

  return NextResponse.json({
    draft,
    metadata: {
      id: claudeData?.id,
      model: claudeData?.model,
      wordLimit: sanitizedWordLimit,
    },
  })
}
