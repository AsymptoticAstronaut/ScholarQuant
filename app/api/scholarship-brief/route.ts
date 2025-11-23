import { NextResponse } from 'next/server'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5'

type BriefRequestBody = {
  name?: string
  description?: string
  type?: string
  priorities?: string[]
  weights?: Record<string, number>
}

const extractTextFromClaude = (content: Array<{ text?: string }> = []) =>
  content
    .map((block) => block?.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  const body = (await request.json()) as BriefRequestBody
  if (!body.name || !body.description || !body.type) {
    return NextResponse.json(
      {
        error:
          'Missing scholarship name, type, or description. Provide all three fields.',
      },
      { status: 400 }
    )
  }

  const structuredBrief = {
    name: body.name,
    description: body.description,
    type: body.type,
    priorities: body.priorities ?? [],
    weights: body.weights ?? {},
  }

  const claudeRequest = {
    model: DEFAULT_MODEL,
    max_tokens: 600,
    temperature: 0.2,
    system:
      'You are Claude, an expert scholarship analyst. Summarize the scholarship crisply and outline a recommended application strategy. Always respond with valid JSON containing "summary" and "strategy" fields.',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: [
              'Use the JSON description below to produce a concise scholarship summary and a suggested writing strategy. Return valid JSON that matches this schema:',
              '{ "summary": "one or two paragraphs", "strategy": "bullet-friendly paragraph with guidance" }',
              'JSON input:',
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
  const message = extractTextFromClaude(claudeData?.content ?? [])
  let summary = ''
  let strategy = ''

  try {
    // Strip markdown code blocks if present
    const cleanMessage = message.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleanMessage)
    summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''
    strategy = typeof parsed.strategy === 'string' ? parsed.strategy.trim() : ''
  } catch (e) {
    console.error('Failed to parse Claude response:', message, e)
    // Fallback: try to use the whole message as summary if it looks like text
    summary = message
    strategy = ''
  }

  return NextResponse.json({
    summary,
    strategy,
  })
}
