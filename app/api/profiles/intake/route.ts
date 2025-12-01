import { NextResponse } from 'next/server'

import type { DimensionId } from '@/types/dimensions'
import type { StudentStats } from '@/types/student-profile'
import { EMPTY_FEATURES } from '@/types/student-profile'

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-5'

type IntakePayload = {
  basics?: {
    name?: string
    university?: string
    program?: string
    year?: string
    gpa?: number
    gpaScale?: number
  }
  baseStory?: string
  answers?: Partial<Record<'motivations' | 'academics' | 'leadership' | 'challenges' | 'goals', string>>
  files?: Array<{ name: string; label: string; text?: string }>
}

type ClaudeProfileSynthesis = {
  baseStory?: string
  tags?: string[]
  features?: Partial<Record<DimensionId, number>>
  recommendedScholarshipIds?: string[]
  stats?: Partial<StudentStats>
}

const DIMENSIONS: DimensionId[] = [
  'academics',
  'leadership',
  'community',
  'need',
  'innovation',
  'research',
  'adversity',
]

const FALLBACK_STATS: StudentStats = {
  scholarshipsMatched: 3,
  draftsGenerated: 0,
  avgAlignment: 72,
}

const FALLBACK_SCHOLARSHIPS = ['merit-excellence', 'community-builder', 'innovation-challenge']

const extractTextFromClaude = (content: Array<{ text?: string }> = []) =>
  content
    .map((block) => block?.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()

const clamp01 = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0
  return Math.max(0, Math.min(1, value))
}

const sanitizeFeatures = (features: Partial<Record<DimensionId, number>> | undefined) => {
  const cleaned: Record<DimensionId, number> = { ...EMPTY_FEATURES }
  DIMENSIONS.forEach((dim) => {
    cleaned[dim] = clamp01(features?.[dim])
  })
  return cleaned
}

const sanitizeStats = (stats: Partial<StudentStats> | undefined) => ({
  scholarshipsMatched:
    typeof stats?.scholarshipsMatched === 'number' && stats.scholarshipsMatched >= 0
      ? Math.round(stats.scholarshipsMatched)
      : FALLBACK_STATS.scholarshipsMatched,
  draftsGenerated:
    typeof stats?.draftsGenerated === 'number' && stats.draftsGenerated >= 0
      ? Math.round(stats.draftsGenerated)
      : FALLBACK_STATS.draftsGenerated,
  avgAlignment:
    typeof stats?.avgAlignment === 'number' && stats.avgAlignment >= 0
      ? Math.round(Math.min(100, stats.avgAlignment))
      : FALLBACK_STATS.avgAlignment,
})

const composeBaseStory = (answers: IntakePayload['answers']) => {
  const pieces = [
    answers?.motivations && `Motivation: ${answers.motivations.trim()}`,
    answers?.academics && `Academic highlight: ${answers.academics.trim()}`,
    answers?.leadership && `Leadership/impact: ${answers.leadership.trim()}`,
    answers?.challenges && `Challenges: ${answers.challenges.trim()}`,
    answers?.goals && `Goals: ${answers.goals.trim()}`,
  ].filter(Boolean)

  return pieces.join(' ').trim()
}

const heuristicFeatures = (payload: IntakePayload) => {
  const features: Record<DimensionId, number> = { ...EMPTY_FEATURES }

  const gpaRatio =
    payload.basics?.gpa && payload.basics?.gpaScale
      ? Math.min(1, payload.basics.gpa / payload.basics.gpaScale)
      : null

  features.academics = gpaRatio ? Math.max(0.6, gpaRatio) : payload.answers?.academics ? 0.68 : 0.48
  features.leadership = payload.answers?.leadership ? 0.7 : 0.45
  features.community = (payload.answers?.leadership || payload.answers?.challenges) ? 0.62 : 0.42
  features.need = payload.answers?.challenges ? 0.55 : 0.35
  features.innovation = payload.answers?.academics ? 0.58 : 0.36
  features.research = payload.answers?.academics ? 0.52 : 0.3
  features.adversity = payload.answers?.challenges ? 0.6 : 0.4

  return features
}

const normalizeTags = (tags: string[] | undefined) =>
  Array.isArray(tags)
    ? tags
        .map((t) => (typeof t === 'string' ? t.trim() : ''))
        .filter(Boolean)
        .slice(0, 6)
    : []

export async function POST(req: Request) {
  const payload = (await req.json()) as IntakePayload
  const baseFallback = payload.baseStory?.trim() || composeBaseStory(payload.answers) || ''

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      baseStory: baseFallback,
      tags: normalizeTags([]),
      features: heuristicFeatures(payload),
      recommendedScholarshipIds: FALLBACK_SCHOLARSHIPS,
      stats: FALLBACK_STATS,
      source: 'fallback',
    })
  }

  const claudeRequest = {
    model: DEFAULT_MODEL,
    max_tokens: 700,
    temperature: 0.3,
    system: [
      'You are Claude, an expert in profiling students for scholarships.',
      'Return a compact JSON object with these fields: baseStory (paragraph), tags (array of up to 6 short labels),',
      'features (object with academics, leadership, community, need, innovation, research, adversity as numbers 0-1),',
      'recommendedScholarshipIds (array of 2-4 short ids), and stats {scholarshipsMatched, draftsGenerated, avgAlignment}.',
      'Use ONLY the provided intake information and avoid inventing achievements not implied by the notes.',
    ].join('\n'),
    messages: [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text',
            text: [
              'STUDENT INTAKE JSON (do not add code fences). baseStory may already exist; refine it, do not ignore it:',
              JSON.stringify(payload, null, 2),
              '',
              'Respond with JSON matching: {"baseStory": string, "tags": string[], "features": {<dimension>: number}, "recommendedScholarshipIds": string[], "stats": {"scholarshipsMatched": number, "draftsGenerated": number, "avgAlignment": number}}',
              'Keep numbers in [0,1] for features and [0,100] for avgAlignment.',
            ].join('\n'),
          },
        ],
      },
    ],
  }

  let claudeData: ClaudeProfileSynthesis | null = null

  try {
    const response = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(claudeRequest),
    })

    if (response.ok) {
      const json = await response.json()
      const text = extractTextFromClaude(json?.content ?? [])
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
      claudeData = JSON.parse(cleaned) as ClaudeProfileSynthesis
    }
  } catch (err) {
    // ignore and fall through to fallback data below
    console.error('Claude intake failed', err)
  }

  const features = claudeData?.features
    ? sanitizeFeatures(claudeData.features)
    : heuristicFeatures(payload)

  const stats = sanitizeStats(claudeData?.stats)

  return NextResponse.json({
    baseStory: claudeData?.baseStory?.trim() || baseFallback,
    tags: normalizeTags(claudeData?.tags) || [],
    features,
    recommendedScholarshipIds:
      Array.isArray(claudeData?.recommendedScholarshipIds) && claudeData?.recommendedScholarshipIds?.length
        ? claudeData.recommendedScholarshipIds.slice(0, 4)
        : FALLBACK_SCHOLARSHIPS,
    stats,
    source: claudeData ? 'claude' : 'fallback',
  })
}
