'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Github, Upload, Wand2 } from 'lucide-react'

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
import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'

/* -------------------------------------------------------------------------- */
/*                                    SETUP                                   */
/* -------------------------------------------------------------------------- */

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

/** map of id -> winner pattern */
const WINNER_PATTERNS: Record<string, WinnerPattern> = {
  'merit-excellence': {
    headline: 'Strong academics are usually the main deciding factor.',
    guidance:
      'Successful applicants point to specific achievements, challenging coursework, and clear results. Depth and outcomes matter more than listing many activities.',
  },
  'community-builder': {
    headline: 'Sustained, measurable impact stands out most.',
    guidance:
      'Winning applications focus on one or two consistent community contributions and describe what changed because of them, ideally with concrete numbers or outcomes.',
  },
  'first-gen-access': {
    headline: 'Context and resilience are central to a strong application.',
    guidance:
      'Applicants do well when they explain obstacles clearly, show how they navigated them, and connect that story to their goals for education and growth.',
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

/* -------------------------------------------------------------------------- */
/*                             RANDOM WEIGHTS (TEMP)                          */
/* -------------------------------------------------------------------------- */

function generateRandomWeights() {
  const dims: DimensionId[] = [
    'academics',
    'leadership',
    'community',
    'need',
    'innovation',
    'research',
    'adversity',
  ]

  const raw = dims.map(() => Math.random())
  const total = raw.reduce((a, b) => a + b, 0)

  return Object.fromEntries(dims.map((d, i) => [d, raw[i] / total])) as Record<
    DimensionId,
    number
  >
}

/* -------------------------------------------------------------------------- */
/*                          STUDENT ALIGNMENT SCORING                         */
/* -------------------------------------------------------------------------- */

/**
 * Calculate alignment score between student features and scholarship weights
 * Returns a score from 0-100
 */
function calculateAlignment(
  studentFeatures: Record<DimensionId, number>,
  scholarshipWeights: Record<DimensionId, number>
): number {
  const dims: DimensionId[] = [
    'academics',
    'leadership',
    'community',
    'need',
    'innovation',
    'research',
    'adversity',
  ]

  let score = 0
  dims.forEach((dim) => {
    const studentScore = studentFeatures[dim] ?? 0
    const weight = scholarshipWeights[dim] ?? 0
    score += studentScore * weight
  })

  return Math.round(score * 100)
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default function ScholarshipsPage() {
  const scholarships = useScholarshipStore((s) => s.scholarships)
  const addScholarship = useScholarshipStore((s) => s.addScholarship)

  const selectedProfileId = useStudentProfileStore((s) => s.selectedProfileId)
  const studentProfiles = useStudentProfileStore((s) => s.profiles)
  const selectedStudent = useMemo(
    () => studentProfiles.find((p) => p.id === selectedProfileId),
    [studentProfiles, selectedProfileId]
  )

  const [selectedScholarshipId, setSelectedScholarshipId] =
    useState<string>('')

  const [nameDraft, setNameDraft] = useState('')
  const [typeDraft, setTypeDraft] = useState<ScholarshipType | ''>('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [loadUrl, setLoadUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const selectedScholarship = useMemo(() => {
    if (scholarships.length === 0) return undefined
    if (!selectedScholarshipId) return scholarships[0]
    return (
      scholarships.find((s) => s.id === selectedScholarshipId) ??
      scholarships[0]
    )
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

  const rankedScholarships = useMemo(() => {
    if (!selectedStudent) return []

    return scholarships
      .map((scholarship) => ({
        scholarship,
        alignmentScore: calculateAlignment(
          selectedStudent.features,
          scholarship.weights
        ),
      }))
      .sort((a, b) => b.alignmentScore - a.alignmentScore)
  }, [selectedStudent, scholarships])

  const topMatches = useMemo(() => {
    return rankedScholarships.slice(0, 5)
  }, [rankedScholarships])

  const winnerPattern =
    (selectedScholarship &&
      WINNER_PATTERNS[selectedScholarship.id]) || {
      headline: 'Winner patterns will appear once examples are added.',
      guidance:
        'When past winning essays or summaries are available, this section will highlight recurring themes and what strong applicants typically emphasize.',
    }

  /* ----------------------------- Add scholarship ---------------------------- */

  async function handleAnalyzeAndAdd() {
    if (!nameDraft.trim() || !typeDraft || !descriptionDraft.trim()) return

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const weights = generateRandomWeights()
      const priorities: DimensionId[] = DIMENSIONS.slice(0, 3).map((d) => d.id)

      // Call the scholarship-brief API
      const response = await fetch('/api/scholarship-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameDraft.trim(),
          description: descriptionDraft.trim(),
          type: typeDraft,
          priorities,
          weights,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze scholarship')
      }

      const { summary, strategy } = await response.json()

      addScholarship({
        name: nameDraft.trim(),
        type: typeDraft,
        source: 'Manual',
        description: descriptionDraft.trim(),
        priorities,
        weights,
        genericScore: 50,
        tailoredScore: 80,
        summary,
        strategy,
        stories: [],
        winnerPatterns: [],
      })

      setNameDraft('')
      setTypeDraft('')
      setDescriptionDraft('')
    } catch (error) {
      console.error('Error analyzing scholarship:', error)
      setAnalysisError(
        error instanceof Error ? error.message : 'Failed to analyze scholarship'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 EMPTY STATE                                */
  /* -------------------------------------------------------------------------- */

  if (!selectedScholarship) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        Your library is empty. Add your first scholarship to get started.
      </div>
    )
  }

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Scholarships
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Your scholarship library
            </h1>
            <p className="text-xs text-zinc-500">
              Add scholarships you care about, then explore what each one values.
            </p>
          </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Online</span>
              </div>
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
            {/* -------------------- ROW 1: Add scholarship + dataset -------------------- */}

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]"
            >
              {/* Add Scholarship Panel */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <NebulaBackdrop />

                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Add a scholarship
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Paste in a scholarship description and select its category. We’ll
                    generate a personality profile that explains what it tends to
                    reward.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-3 text-xs">
                  {/* Name + Type */}
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">Name</label>
                      <Input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="e.g. Community Leaders Award"
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Scholarship type
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {(
                          ['Merit', 'Community', 'STEM', 'Access'] as ScholarshipType[]
                        ).map((t) => (
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
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Scholarship description
                    </label>
                    <Textarea
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      rows={6}
                      placeholder="Paste eligibility, selection criteria, and any prompt text..."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Load from URL (disabled for MVP) */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Import from a link (optional)
                    </label>
                    <Input
                      value={loadUrl}
                      onChange={(e) => setLoadUrl(e.target.value)}
                      placeholder="https://example.com/scholarship"
                      className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Link importing will be enabled in a later update.
                    </p>
                  </div>

                  {/* Error message */}
                  {analysisError && (
                    <div className="rounded-lg border border-red-500/50 bg-red-900/20 px-3 py-2 text-[11px] text-red-200">
                      <p className="font-medium">Error analyzing scholarship</p>
                      <p className="mt-0.5">{analysisError}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {isAnalyzing
                          ? 'Analyzing with Claude...'
                          : "We'll extract priorities and weights from your description."}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAnalyzeAndAdd}
                      disabled={isAnalyzing}
                      className="h-8 gap-1 rounded-full bg-sky-600 text-xs text-white hover:bg-sky-500 disabled:opacity-50"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>{isAnalyzing ? 'Analyzing...' : 'Add to library'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dataset Summary */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Your dataset so far
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A quick snapshot based on the scholarships in your library.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <KpiTile
                      label="Total scholarships"
                      value={scholarships.length}
                    />
                    <KpiTile
                      label="Average generic alignment"
                      value={Math.round(avgGenericScore)}
                    />
                    <KpiTile
                      label="Average tailored alignment"
                      value={Math.round(avgTailoredScore)}
                      subtle={
                        scholarships.length > 0
                          ? `About ${avgGain} points higher with tailoring`
                          : undefined
                      }
                      accent
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-3 py-2">
                    <p className="mb-1 text-[11px] font-medium text-zinc-100">
                      Type breakdown
                    </p>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {(
                        ['Merit', 'Community', 'STEM', 'Access'] as ScholarshipType[]
                      ).map((t) => {
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
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      Keep building your library
                    </p>
                    <p>
                      The more scholarships you add, the clearer your pattern insights
                      and drafting guidance become.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* -------------------- Best Matches for Student -------------------- */}
            {selectedStudent && topMatches.length > 0 && (
              <motion.section
                variants={VARIANTS_SECTION}
                transition={TRANSITION_SECTION}
              >
                <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                  <Spotlight
                    className="from-purple-500/40 via-pink-400/20 to-purple-300/10 blur-2xl"
                    size={120}
                  />
                  <CardHeader className="relative pb-3">
                    <CardTitle className="text-sm text-zinc-50">
                      Best matches for {selectedStudent.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400">
                      Top scholarships based on {selectedStudent.name}'s profile strengths
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative space-y-2 text-xs">
                    {topMatches.map(({ scholarship, alignmentScore }) => (
                      <button
                        key={scholarship.id}
                        type="button"
                        onClick={() => setSelectedScholarshipId(scholarship.id)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                          scholarship.id === selectedScholarship?.id
                            ? 'border-purple-500/70 bg-purple-900/30 ring-1 ring-purple-500/40'
                            : 'border-zinc-800/70 bg-zinc-950/60 hover:bg-zinc-900/80'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-zinc-100">
                              {scholarship.name}
                            </p>
                            <Badge
                              variant="outline"
                              className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0 text-[10px] text-zinc-200"
                            >
                              {typeBadge(scholarship.type)}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {scholarship.priorities.slice(0, 3).map((pid) => {
                              const dim = DIMENSIONS.find((d) => d.id === pid)
                              if (!dim) return null
                              return (
                                <Badge
                                  key={pid}
                                  variant="outline"
                                  className="border-purple-700/70 bg-purple-900/30 px-1.5 py-0 text-[10px] text-purple-200"
                                >
                                  {dim.label}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                        <div className="ml-3 flex flex-col items-end">
                          <span className="text-lg font-bold text-emerald-300">
                            {alignmentScore}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            alignment
                          </span>
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* -------------------- ROW 2: Library + About + Personality -------------------- */}

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]"
            >
              {/* Scholarship Library */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />

                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Your scholarships
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Tap one to view its details and profile.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-2 text-xs">
                  <div className="max-h-[360px] overflow-y-auto overflow-x-hidden pr-1">
                    <div className="space-y-1.5 text-xs">
                      {scholarships.map((sch) => {
                        const alignmentScore = selectedStudent
                          ? calculateAlignment(selectedStudent.features, sch.weights)
                          : null
                        return (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => setSelectedScholarshipId(sch.id)}
                            className={`flex w-full flex-col items-start rounded-lg px-2.5 py-1.5 text-left transition ${
                              sch.id === selectedScholarship.id
                                ? 'bg-zinc-900/90 ring-1 ring-sky-500/60'
                                : 'bg-zinc-950/60 hover:bg-zinc-900/80'
                            }`}
                          >
                            <div className="flex w-full items-center justify-between gap-2">
                              <p className="truncate text-[13px] text-zinc-100">
                                {sch.name}
                              </p>
                              <div className="flex items-center gap-1.5">
                                {alignmentScore !== null && (
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      alignmentScore >= 80
                                        ? 'text-emerald-400'
                                        : alignmentScore >= 60
                                        ? 'text-sky-400'
                                        : 'text-zinc-500'
                                    }`}
                                  >
                                    {alignmentScore}
                                  </span>
                                )}
                                <Badge
                                  variant="outline"
                                  className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0 text-[10px] text-zinc-200"
                                >
                                  {typeBadge(sch.type)}
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-1">
                              {(sch.priorities ?? []).map((pid) => {
                                const dim = DIMENSIONS.find((d) => d.id === pid)
                                if (!dim) return null
                                return (
                                  <Badge
                                    key={pid}
                                    variant="outline"
                                    className="border-sky-700/70 bg-sky-900/30 px-1.5 py-0 text-[10px] text-sky-200"
                                  >
                                    {dim.label}
                                  </Badge>
                                )
                              })}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About the Scholarship (moved left of personality) */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />

                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    About this scholarship
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A clear summary of what it asks for, plus how to approach your essay.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-3 text-xs">
                  {/* Content summary box */}
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium text-zinc-100">
                        Scholarship summary
                      </p>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship.type)}
                      </Badge>
                    </div>

                    <p className="mt-1 text-[11px] text-zinc-500">
                      {selectedScholarship.summary || selectedScholarship.description}
                    </p>
                  </div>

                  {/* Strategy box (former winner patterns) */}
                  <div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
                    <p className="mb-1 font-medium text-sky-100">
                      Suggested strategy
                    </p>
                    {selectedScholarship.strategy ? (
                      <p className="whitespace-pre-line text-sky-100/90">{selectedScholarship.strategy}</p>
                    ) : (
                      <>
                        <p className="mb-1 font-medium text-zinc-50">
                          {winnerPattern.headline}
                        </p>
                        <p className="text-sky-100/90">{winnerPattern.guidance}</p>
                      </>
                    )}
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      How to use this section
                    </p>
                    <p>
                      Start by making sure your essay directly answers the description
                      above. Then use the strategy notes to decide which experiences to
                      emphasize first and which to keep as support.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personality Profile (moved right) */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />

                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Personality profile
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    How this scholarship tends to weigh different dimensions.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="text-[11px] text-zinc-400">Selected scholarship</p>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-medium text-zinc-100">
                        {selectedScholarship.name}
                      </p>

                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship.type)}
                      </Badge>
                    </div>

                    <p className="mt-1 text-[11px] text-zinc-500">
                      Higher weights mean that type of evidence is more important here.
                    </p>
                  </div>

                  {/* Weights */}
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
                      Writing tip
                    </p>
                    <p>
                      Lead with evidence in the top-weighted categories, then show how
                      the rest connects to your overall story.
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

/* -------------------------------------------------------------------------- */
/*                                   KPI TILE                                 */
/* -------------------------------------------------------------------------- */

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
        <span className="mt-0.5 text-[10px] text-zinc-500">{subtle}</span>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               NEBULA BACKDROP                              */
/* -------------------------------------------------------------------------- */

function NebulaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-50">
      <div className="absolute -left-10 top-6 h-56 w-56 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="absolute right-4 top-8 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-16 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
    </div>
  )
}
