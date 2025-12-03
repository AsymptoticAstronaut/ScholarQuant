// app/api/generate-draft/route.ts
import { NextResponse } from 'next/server'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5'

const MAX_JSON_BODY_BYTES = 100 * 1024
const MAX_TEXT_FIELD_LENGTH = 10_000
const MAX_CONSTRAINTS = 12

// If Claude is unavailable, return a safe demo draft (so UI can stay clean).
const DEMO_DRAFT =
  `When I began building practical robotics systems for middle-school classrooms, I was motivated by a simple mismatch: many students were curious about engineering, but their schools lacked the equipment and mentorship to make it feel reachable. I set out to design low-cost kits that could be assembled with everyday materials, then paired them with workshops that made the underlying concepts clear and exciting.

In the first pilot, I worked with teachers to identify where students were getting stuck—mostly at the moment a concept turned into a circuit or a line of code. I iterated on the kit design three times to reduce setup time and failure points, and built short lesson modules that connected each build step to a real-world purpose. Participation in the program grew steadily, and by the final workshop series we had more than doubled the number of students who completed a full build and demo.

This project shaped how I approach technical work: start with a concrete problem, test quickly, learn from failure, and make sure the result is usable by others. I have carried that mindset into my undergraduate research in swarm robotics, where I improved coordination reliability by tightening sensor-drift filtering and validating changes across repeated trials. The same pattern holds—clarity of problem framing, disciplined iteration, and measurable improvement.

I’m applying for this scholarship because it aligns with both my academic direction and my commitment to building engineering access. I want to keep developing systems that are rigorous in method but accessible in impact, and to scale learning tools that help more students see themselves as builders.`

const FALLBACK_CONSTRAINTS = [
  'Do not invent new experiences or awards.',
  'Preserve anchor sentences from the base story.',
  'Avoid over-polished or unnatural phrasing.',
]

type DraftRequestPayload = {
  // Core inputs
  baseStory?: string
  positiveSignals?: string
  negativeSignals?: string
  focus?: string
  wordLimit?: number
  constraints?: string[]

  // Selection context (full objects expected)
  scholarship?: unknown
  studentProfile?: unknown
  scholarships?: unknown
  studentProfiles?: unknown
  studentId?: string

  // Iteration context
  revisionRequests?: Array<{
    id: string
    paragraphIndex?: number
    instruction: string
    createdAt: string
  }>
  lastDraft?: string | null
  workingDraft?: string

  // GREEN text segments extracted from editor
  lockedSegments?: string[]

  // Optional: serialized directives from client (ignored if absent)
  draftWithDirectives?: string
  userMemory?: string
}

const extractTextFromClaude = (content: Array<{ text?: string }> = []) =>
  content
    .map((block) => block?.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n\n')
    .trim()

const safeTrim = (value: unknown, max = MAX_TEXT_FIELD_LENGTH): string => {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(request: Request) {
  const contentLength = request.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_JSON_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request body too large' },
      { status: 413 }
    )
  }

  let body: DraftRequestPayload
  try {
    body = (await request.json()) as DraftRequestPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const baseStory = safeTrim(body.baseStory)
  const scholarship = body.scholarship
  const studentProfile = body.studentProfile

  if (!baseStory || !scholarship || !studentProfile) {
    return NextResponse.json(
      { error: 'Missing base story, scholarship, or student profile.' },
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
          .slice(0, MAX_CONSTRAINTS)
          .map((rule) => safeTrim(rule, 1_000))
          .filter(Boolean)
      : FALLBACK_CONSTRAINTS

  const positiveSignals = safeTrim(body.positiveSignals)
  const negativeSignals = safeTrim(body.negativeSignals)
  const userMemory = safeTrim(body.userMemory)
  const memoryNotes = Array.isArray(body.revisionRequests)
    ? body.revisionRequests.map((r) => ({
        paragraphIndex: r.paragraphIndex ?? null,
        instruction: r.instruction,
        createdAt: r.createdAt,
      }))
    : []

  const lockedSegments =
    Array.isArray(body.lockedSegments) && body.lockedSegments.length
      ? body.lockedSegments
          .map((s) => safeTrim(s, MAX_TEXT_FIELD_LENGTH))
          .filter(Boolean)
      : []

  const structuredBrief = {
    objective: 'Generate or revise a scholarship-ready essay draft.',
    controls: {
      focus: body.focus ?? 'balanced',
      targetWordLimit: sanitizedWordLimit,
      constraints,
    },
    student: studentProfile, // FULL JSON
    scholarship, // FULL JSON
    inputs: {
      baseStory,
      positiveSignals,
      negativeSignals,
      userMemory,
    },
    memoryNotes, // user Memory notes
    iteration: {
      lastDraft: body.lastDraft ?? null,
      workingDraft: body.workingDraft?.trim() ?? '',
      draftWithDirectives: body.draftWithDirectives?.trim() ?? '',
    },
    lockedSegments, // GREEN spans that must persist verbatim
    context: {
      scholarships: body.scholarships,
      studentProfiles: body.studentProfiles,
      studentId: body.studentId ?? null,
    },
  }

  // --- ENV CHECK ---
  const apiKey = process.env.ANTHROPIC_API_KEY
  const isDev = process.env.NODE_ENV === 'development'

  if (!apiKey) {
    // In dev, return a real error so you see it in the UI/terminal.
    if (isDev) {
      return NextResponse.json(
        {
          error:
            'ANTHROPIC_API_KEY is not set. Add it to .env.local in project root and restart dev server.',
        },
        { status: 500 }
      )
    }

    // In prod, keep UI clean and fall back.
    return NextResponse.json({
      draft: DEMO_DRAFT,
      metadata: {
        id: 'demo',
        model: 'demo',
        wordLimit: sanitizedWordLimit,
      },
    })
  }

  const systemPrompt = [
    'You are Claude, an expert scholarship essay strategist.',
    'Write a truthful, scholarship-specific essay using ONLY the provided JSON brief.',
    '',
    'Hard safety rules you must follow:',
    '1) Do not invent experiences, awards, metrics, or timelines not present in baseStory, student profile stories, or Memory notes.',
    '2) The field lockedSegments contains GREEN text spans from the user.',
    '   - You MUST include every locked segment EXACTLY verbatim (character-for-character).',
    '   - You may NOT paraphrase, edit, or partially reword any locked segment.',
    '   - You may place new text around locked segments, but do not alter their internal wording.',
    '   - Keep their relative order whenever possible.',
    '3) Anything not in lockedSegments may be rewritten for clarity and impact.',
    '4) Respect targetWordLimit ±10%. If there is tension, keep lockedSegments and cut elsewhere.',
    '',
    'Output rules:',
    '- Return only the polished essay draft.',
    '- No headings, no bullet points, no preamble.',
  ].join('\n')

  const userPrompt = [
    'Use the JSON brief below to produce a cohesive scholarship essay draft.',
    'If iteration.workingDraft is non-empty, treat it as the user’s current draft and revise it.',
    'Otherwise, generate a fresh draft from inputs.baseStory.',
    'You must obey all constraints and lockedSegments rules.',
    '',
    'JSON BRIEF:',
    JSON.stringify(structuredBrief, null, 2),
  ].join('\n\n')

  const claudeRequest = {
    model: DEFAULT_MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: userPrompt }],
      },
    ],
  }

  let response: Response
  try {
    response = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(claudeRequest),
    })
  } catch (err) {
    if (isDev) {
      return NextResponse.json(
        {
          error: 'Network error calling Claude.',
          details: String(err),
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      draft: DEMO_DRAFT,
      metadata: { id: 'demo-network', model: 'demo', wordLimit: sanitizedWordLimit },
    })
  }

  if (!response.ok) {
    const errorPayload = await response.text().catch(() => '')
    if (isDev) {
      return NextResponse.json(
        {
          error: 'Claude API request failed.',
          details: errorPayload,
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      draft: DEMO_DRAFT,
      metadata: {
        id: 'demo-fallback',
        model: 'demo',
        wordLimit: sanitizedWordLimit,
      },
    })
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
