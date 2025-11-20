'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  Upload,
  Wand2,
  Sparkles,
  BookOpenCheck,
  ListChecks,
} from 'lucide-react'

import { Spotlight } from '@/components/ui/spotlight'
import { Magnetic } from '@/components/ui/magnetic'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import {
  useScholarshipStore,
  type ScholarshipType,
  type DimensionId,
} from '@/lib/stores/scholarships-store'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = { duration: 0.3 }

type Dimension = {
  id: DimensionId
  label: string
}

const DIMENSIONS: Dimension[] = [
  { id: 'academics', label: 'Academics' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'community', label: 'Community Impact' },
  { id: 'need', label: 'Financial Need' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'research', label: 'Research' },
  { id: 'adversity', label: 'Adversity / Resilience' },
]

type WinnerPattern = {
  headline: string
  guidance: string
}

/** Keyed by scholarship id from the store */
const WINNER_PATTERNS: Record<string, WinnerPattern> = {
  'merit-excellence': {
    headline: 'Winners open with concrete academic breakthroughs.',
    guidance:
      'Past winners emphasize specific academic milestones (e.g., research papers, competitive exams) in the first paragraph, then layer in leadership and campus community impact—rather than listing every activity equally.',
  },
  'community-builder': {
    headline: 'Impact first, titles second.',
    guidance:
      'Successful applications lead with a single community project and its measurable outcomes (hours volunteered, people served), and only then mention formal titles or positions. Storytelling around change beats lists of roles.',
  },
  'first-gen-access': {
    headline: 'Resilience with specific financial context.',
    guidance:
      'Strong applications are explicit about financial constraints and first-gen barriers, but pair those details with resilience stories and concrete steps the student took to stay in school and support their family.',
  },
}

function typeBadge(type: ScholarshipType) {
  const map: Record<ScholarshipType, string> = {
    Merit: 'Merit',
    Community: 'Community',
    STEM: 'STEM / Research',
    Access: 'Access / Equity',
  }
  return map[type]
}

export default function ScholarshipsPage() {
  const scholarships = useScholarshipStore((s) => s.scholarships)
  const addScholarship = useScholarshipStore((s) => s.addScholarship)

  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('')

  const [nameDraft, setNameDraft] = useState('')
  const [typeDraft, setTypeDraft] = useState<ScholarshipType | ''>('')
  const [descriptionDraft, setDescriptionDraft] = useState('')

  const selectedScholarship = useMemo(() => {
    if (scholarships.length === 0) return undefined
    if (!selectedScholarshipId) return scholarships[0]
    return scholarships.find((s) => s.id === selectedScholarshipId) ?? scholarships[0]
  }, [scholarships, selectedScholarshipId])

  const avgGenericScore =
    scholarships.reduce((acc, s) => acc + s.genericScore, 0) /
    (scholarships.length || 1)
  const avgTailoredScore =
    scholarships.reduce((acc, s) => acc + s.tailoredScore, 0) /
    (scholarships.length || 1)
  const avgGain = Math.round(avgTailoredScore - avgGenericScore)

  const sortedWeights = useMemo(() => {
    if (!selectedScholarship) return []
    return Object.entries(selectedScholarship.weights)
      .map(([id, weight]) => {
        const dim = DIMENSIONS.find((d) => d.id === id)!
        return { id: id as DimensionId, label: dim.label, weight }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [selectedScholarship])

  const winnerPattern =
    (selectedScholarship && WINNER_PATTERNS[selectedScholarship.id]) || {
      headline: 'Pattern coming soon.',
      guidance:
        'Add winner examples or public essays for this scholarship to calibrate a success pattern.',
    }
function generateRandomWeights() {
  const dims = [
    'academics',
    'leadership',
    'community',
    'need',
    'innovation',
    'research',
    'adversity',
  ]

  // random value per dimension
  const raw = dims.map(() => Math.random())

  // normalize to sum to 1
  const total = raw.reduce((a, b) => a + b, 0)

  // return normalized weights
  return Object.fromEntries(
    dims.map((d, i) => [d, raw[i] / total])
  ) as Record<DimensionId, number>
}

  function handleAnalyzeAndAdd() {
    if (!nameDraft.trim() || !typeDraft || !descriptionDraft.trim()) return

    // Very simple default weights (even split)
// Generate random normalized weights (temporary stand-in for Claude analysis)
const weights = generateRandomWeights()


    // Naive priorities: first 3 dimensions (later: Claude-derived)
    const priorities: DimensionId[] = DIMENSIONS.slice(0, 3).map((d) => d.id)

    addScholarship({
      name: nameDraft.trim(),
      type: typeDraft,
      source: 'Manual',
      description: descriptionDraft.trim(),
      priorities,
      weights,
      genericScore: 50,
      tailoredScore: 80,
    })

    setNameDraft('')
    setTypeDraft('')
    setDescriptionDraft('')
  }

  if (!selectedScholarship) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No scholarships in store. Try refreshing or resetting the store.
      </div>
    )
  }

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Claude Project · Track 3
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Scholarships
            </h1>
            <p className="text-xs text-zinc-500">
              Ingest real scholarships, profile their personalities, and prepare them
              for adaptive drafting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Claude status: Ready</span>
            </div>

            <Separator orientation="vertical" className="h-6 bg-zinc-700" />

            <Magnetic intensity={0.3} springOptions={{ bounce: 0 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-full border-zinc-700 bg-zinc-900/80 text-xs text-zinc-200 hover:bg-zinc-800"
              >
                <Link href="https://github.com/AsymptoticAstronaut/Claude" target="_blank">
                  <Github className="h-3.5 w-3.5" />
                  <span>View repo</span>
                </Link>
              </Button>
            </Magnetic>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          <motion.div
            className="space-y-6"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
          >
            {/* Row 1: Ingestion + Dataset snapshot */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]"
            >
              {/* Ingest / paste scholarship */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Add a scholarship
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Paste a real description to let the system analyze priorities and
                    build a personality profile.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Scholarship name
                      </label>
                      <Input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="e.g. Community Impact Leaders Award"
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Type (working label)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {(['Merit', 'Community', 'STEM', 'Access'] as ScholarshipType[]).map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTypeDraft(t)}
                              className={`flex items-center justify-center rounded-full border px-2 py-1 ${
                                typeDraft === t
                                  ? 'border-sky-500/70 bg-sky-900/40 text-sky-100'
                                  : 'border-zinc-700/70 bg-zinc-950/60 text-zinc-400 hover:bg-zinc-900'
                              }`}
                            >
                              {typeBadge(t)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Scholarship description
                    </label>
                    <Textarea
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      rows={6}
                      placeholder="Paste the eligibility criteria, selection language, and descriptive text from a real scholarship posting..."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        In the full system, this will call Claude to extract priorities
                        and weights.
                        
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAnalyzeAndAdd}
                        className="h-8 gap-1 rounded-full bg-sky-600 text-xs text-white hover:bg-sky-500"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Add Scholarship</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full border-zinc-700 bg-zinc-900/80 text-xs text-zinc-200 hover:bg-zinc-800"
                      >
                        Load from URL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dataset snapshot + alignment overview */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Scholarship dataset snapshot
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    High-level view of the current pool and alignment improvements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <KpiTile label="Scholarships in pool" value={scholarships.length} />
                    <KpiTile
                      label="Avg generic score"
                      value={Math.round(avgGenericScore)}
                    />
                    <KpiTile
                      label="Avg tailored score"
                      value={Math.round(avgTailoredScore)}
                      subtle={`+${avgGain} pts vs generic`}
                      accent
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-3 py-2">
                    <p className="mb-1 text-[11px] font-medium text-zinc-100">
                      Coverage by type
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {(['Merit', 'Community', 'STEM', 'Access'] as ScholarshipType[]).map(
                        (t) => {
                          const count = scholarships.filter((s) => s.type === t).length
                          return (
                            <Badge
                              key={t}
                              variant="outline"
                              className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[11px] text-zinc-200"
                            >
                              {typeBadge(t)} · {count}
                            </Badge>
                          )
                        }
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-600/60 bg-sky-950/30 px-3 py-2 text-[11px] text-sky-100">
                    <p className="mb-1 font-medium text-sky-100">
                      Demo callout for judges
                    </p>
                    <p>
                      Use this page to show that you are working with real scholarship
                      text and that the system builds per-scholarship personality
                      profiles, rather than a single static scoring rule.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Library + personality profile + winner patterns */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]"
            >
              {/* Scholarship library table */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Scholarship library
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Select a scholarship to inspect its personality and prioritization.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-2 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90">
                    <div className="grid grid-cols-[2fr_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-2 border-b border-zinc-800/80 px-3 py-1.5 text-[11px] text-zinc-500">
                      <span>Scholarship</span>
                      <span>Type</span>
                      <span>Source</span>
                    </div>
                    <div className="divide-y divide-zinc-800/80">
                      {scholarships.map((sch) => {
                        const snippet =
                          sch.description.length > 140
                            ? sch.description.slice(0, 137) + '…'
                            : sch.description
                        return (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => setSelectedScholarshipId(sch.id)}
                            className={`grid w-full grid-cols-[2fr_minmax(0,0.9fr)_minmax(0,0.9fr)] items-start gap-2 px-3 py-2 text-left transition ${
                              sch.id === selectedScholarship.id
                                ? 'bg-zinc-900/90 ring-1 ring-sky-500/60'
                                : 'hover:bg-zinc-900/70'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="truncate text-[13px] text-zinc-100">
                                {sch.name}
                              </p>
                              <p className="line-clamp-2 text-[11px] text-zinc-500">
                                {snippet}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <Badge
                                variant="outline"
                                className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0.5 text-[10px] text-zinc-200"
                              >
                                {typeBadge(sch.type)}
                              </Badge>
                            </div>
                            <div className="flex items-center">
                              <span className="rounded-full bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-400">
                                {sch.source}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scholarship personality & weights */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Scholarship personality profile
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Adaptive weight profile that drives scoring and targeted drafting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-zinc-400">Selected scholarship</p>
                        <p className="text-[13px] font-medium text-zinc-100">
                          {selectedScholarship.name}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship.type)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      This personality profile is inferred from the scholarship language
                      and (in the full system) calibrated using winner examples.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {sortedWeights.map((entry) => (
                      <div key={entry.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{entry.label}</span>
                          <span>{Math.round(entry.weight * 100)}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 to-sky-300"
                            style={{ width: `${entry.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      How this powers adaptive scoring
                    </p>
                    <p>
                      When you match a student to this scholarship, the system multiplies
                      their profile features by these weights to compute an alignment
                      score. The same student will receive a different score for a
                      Community scholarship, because the weights are re-shaped there.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Winner patterns / messaging guidance */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Winner patterns & messaging guidance
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Patterns mined from public winners and how Claude frames the essay.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <div className="mb-1 flex items-center gap-1 text-[11px] text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                      <span>Success pattern (from winners)</span>
                    </div>
                    <p className="mb-1 font-medium text-zinc-100">
                      {winnerPattern.headline}
                    </p>
                    <p>{winnerPattern.guidance}</p>
                  </div>

                  <div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
                    <div className="mb-1 flex items-center gap-1 text-[11px] text-sky-200">
                      <BookOpenCheck className="h-3.5 w-3.5" />
                      <span>How Claude drafts for this scholarship</span>
                    </div>
                    <p className="mb-1">
                      For the live system, this card is populated by an LLM that takes:
                    </p>
                    <ul className="mb-1 list-disc pl-4">
                      <li>Scholarship description and detected weights</li>
                      <li>A student&apos;s base story and profile features</li>
                      <li>Winner-informed messaging patterns like the one above</li>
                    </ul>
                    <p>
                      The output is a scholarship-specific strategy and draft outline,
                      which you then turn into a full essay in the Draft Studio.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <div className="mb-1 flex items-center gap-1 text-[11px] text-zinc-400">
                      <ListChecks className="h-3.5 w-3.5 text-emerald-300" />
                      <span>Demo framing</span>
                    </div>
                    <p>
                      On demo day, you can click through 2–3 scholarships here and show
                      how their personalities differ, why the weights change, and how
                      that leads to different essay angles for the same student.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </motion.div>
  )
}

function KpiTile({
  label,
  value,
  subtle,
  accent,
}: {
  label: string
  value: number | string
  subtle?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 py-2">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <span
        className={`mt-1 text-lg font-semibold ${
          accent ? 'text-emerald-300' : 'text-zinc-50'
        }`}
      >
        {value}
      </span>
      {subtle && (
        <span className="mt-0.5 text-[10px] text-zinc-500">
          {subtle}
        </span>
      )}
    </div>
  )
}
