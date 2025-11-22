'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  Sparkles,
  Settings2,
  BookOpenCheck,
  Loader2,
  Wand2,
  ChevronRight,
  PenLine,
  RotateCcw,
  MessageSquarePlus,
  FilePenLine,
} from 'lucide-react'

import { AnimatedBackground } from '@/components/ui/animated-background'
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

import { useScholarshipStore } from '@/lib/stores/scholarships-store'
import {
  useStudentProfileStore,
  type StudentProfile,
} from '@/lib/stores/student-profiles-store'

type DimensionId =
  | 'academics'
  | 'leadership'
  | 'community'
  | 'need'
  | 'innovation'
  | 'research'
  | 'adversity'

type Dimension = { id: DimensionId; label: string }

const DIMENSIONS: Dimension[] = [
  { id: 'academics', label: 'Academics' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'community', label: 'Community impact' },
  { id: 'need', label: 'Financial need' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'research', label: 'Research' },
  { id: 'adversity', label: 'Adversity / resilience' },
]

type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

type ScholarshipOption = {
  id: string
  name: string
  type: ScholarshipType
  priorities: DimensionId[]
  weights?: Record<DimensionId, number>
  description?: string
  winnerPatterns?: {
    id: string
    label: string
    description: string
    relatedDimensions: DimensionId[]
    strength: number
    evidenceCount: number
    preferredMetrics: string[]
    do: string[]
    dont: string[]
    length: number
  }[]
}

type DraftFocus = 'balanced' | 'impact' | 'technical' | 'resilience'

type RevisionRequest = {
  id: string
  paragraphIndex?: number
  instruction: string
  createdAt: string
}

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = { duration: 0.3 }

const DIMENSION_IDS: DimensionId[] = [
  'academics',
  'leadership',
  'community',
  'need',
  'innovation',
  'research',
  'adversity',
]

const AUTHENTICITY_CONSTRAINTS = [
  'Do not add experiences that are not in my base story.',
  'Keep my voice natural and specific.',
  'Preserve key facts, timelines, and outcomes.',
]

function typeBadge(type: ScholarshipType) {
  const map: Record<ScholarshipType, string> = {
    Merit: 'Merit',
    Community: 'Community',
    STEM: 'STEM / Research',
    Access: 'Access / Equity',
  }
  return map[type]
}

function buildWeights(
  weights: Record<DimensionId, number> | undefined,
  priorities: DimensionId[]
): Record<DimensionId, number> {
  if (weights) return weights
  const base = DIMENSION_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0.05 }),
    {} as Record<DimensionId, number>
  )
  priorities.forEach((dimension, index) => {
    const emphasis = Math.max(0.22 - index * 0.04, 0.08)
    base[dimension] = Math.max(base[dimension], emphasis)
  })
  return base
}

function computeCompatibilityScore(
  student: StudentProfile | null,
  scholarship: ScholarshipOption
) {
  if (!student) return 0
  const weights = buildWeights(scholarship.weights, scholarship.priorities)
  return DIMENSION_IDS.reduce((score, dimension) => {
    const feature = student.features?.[dimension] ?? 0
    return score + feature * (weights[dimension] ?? 0)
  }, 0)
}

function getTopContributors(
  student: StudentProfile | null,
  scholarship: ScholarshipOption
) {
  if (!student) return []
  const weights = buildWeights(scholarship.weights, scholarship.priorities)
  return DIMENSION_IDS.map((id) => {
    const s = student.features?.[id] ?? 0
    const w = weights[id] ?? 0
    return {
      id,
      label: DIMENSIONS.find((d) => d.id === id)?.label ?? id,
      student: s,
      weight: w,
      contribution: s * w,
      gap: w - s,
    }
  }).sort((a, b) => b.contribution - a.contribution)
}

function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function DraftStudioPage() {
  const scholarshipsData = useScholarshipStore((s) => s.scholarships)
  const studentProfiles = useStudentProfileStore((s) => s.profiles)
  const updateProfile = useStudentProfileStore((s) => s.updateProfile)

  const scholarshipOptions = useMemo<ScholarshipOption[]>(
    () =>
      scholarshipsData.map((sch) => ({
        id: sch.id,
        name: sch.name,
        type: sch.type,
        priorities: sch.priorities,
        weights: sch.weights,
        description: sch.description,
        winnerPatterns: sch.winnerPatterns,
      })),
    [scholarshipsData]
  )

  const selectedProfileId = useStudentProfileStore((s) => s.selectedProfileId)
  const setSelectedProfileId = useStudentProfileStore((s) => s.setSelectedProfileId)
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(
    scholarshipOptions[0]?.id ?? ''
  )

  const selectedStudent =
    useMemo(
      () =>
        studentProfiles.find((p) => p.id === selectedProfileId) ??
        studentProfiles[0] ??
        null,
      [selectedProfileId, studentProfiles]
    ) ?? null

  const selectedScholarship =
    useMemo(
      () =>
        scholarshipOptions.find((s) => s.id === selectedScholarshipId) ??
        scholarshipOptions[0] ??
        null,
      [selectedScholarshipId, scholarshipOptions]
    ) ?? null

  useEffect(() => {
    if (!scholarshipOptions.length) return
    if (!selectedScholarshipId) setSelectedScholarshipId(scholarshipOptions[0].id)
    if (!scholarshipOptions.some((s) => s.id === selectedScholarshipId)) {
      setSelectedScholarshipId(scholarshipOptions[0].id)
    }
  }, [scholarshipOptions, selectedScholarshipId])

  const recommendedScholarships = useMemo(() => {
    if (!selectedStudent || !scholarshipOptions.length) return []
    const explicit = selectedStudent.recommendedScholarshipIds?.length
      ? selectedStudent.recommendedScholarshipIds
          .map((id) => scholarshipOptions.find((s) => s.id === id))
          .filter(Boolean)
          .map((s) => ({
            ...(s as ScholarshipOption),
            compatibility: computeCompatibilityScore(selectedStudent, s as ScholarshipOption),
          }))
      : null

    const computed = scholarshipOptions
      .map((sch) => ({
        ...sch,
        compatibility: computeCompatibilityScore(selectedStudent, sch),
      }))
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3)

    return explicit && explicit.length >= 3 ? explicit.slice(0, 3) : computed
  }, [selectedStudent, scholarshipOptions])

  const contributors = useMemo(() => {
    if (!selectedStudent || !selectedScholarship) return []
    return getTopContributors(selectedStudent, selectedScholarship)
  }, [selectedStudent, selectedScholarship])

  const [baseStoryDraft, setBaseStoryDraft] = useState('')
  const [baseStoryDirty, setBaseStoryDirty] = useState(false)
  const [storyAutosaveAt, setStoryAutosaveAt] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedStudent) return
    if (baseStoryDirty) return
    setBaseStoryDraft(selectedStudent.baseStory ?? '')
  }, [selectedStudent?.id, selectedStudent?.baseStory, baseStoryDirty])

  useEffect(() => {
    if (!baseStoryDirty || !selectedStudent) return
    const t = window.setTimeout(() => {
      updateProfile(selectedStudent.id, { baseStory: baseStoryDraft.trim() })
      setBaseStoryDirty(false)
      setStoryAutosaveAt(Date.now())
    }, 800)
    return () => window.clearTimeout(t)
  }, [baseStoryDirty, baseStoryDraft, selectedStudent, updateProfile])

  const [positiveSignals, setPositiveSignals] = useState('')
  const [negativeSignals, setNegativeSignals] = useState('')
  const [extraContext, setExtraContext] = useState('')
  const [focus, setFocus] = useState<DraftFocus>('balanced')
  const [wordLimit, setWordLimit] = useState('650')

  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([])
  const [openRevisionFor, setOpenRevisionFor] = useState<number | null>(null)
  const [revisionText, setRevisionText] = useState('')

  const [generatedDrafts, setGeneratedDrafts] = useState<Record<string, string>>(
    {}
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const draftKey =
    selectedScholarship && selectedStudent
      ? `${selectedStudent.id}:${selectedScholarship.id}`
      : ''

  const latestDraft = draftKey ? generatedDrafts[draftKey] : undefined
  const displayedDraft = latestDraft ?? ''

  const paragraphList = useMemo(
    () => splitParagraphs(displayedDraft),
    [displayedDraft]
  )

  const handleAddRevision = (paragraphIndex?: number) => {
    const instruction = revisionText.trim()
    if (!instruction) return
    setRevisionRequests((prev) => [
      {
        id: crypto.randomUUID(),
        paragraphIndex,
        instruction,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setRevisionText('')
    setOpenRevisionFor(null)
  }

  const handleRemoveRevision = (id: string) => {
    setRevisionRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleClearRevisions = () => {
    setRevisionRequests([])
  }

  const handleResetInputs = () => {
    setPositiveSignals('')
    setNegativeSignals('')
    setExtraContext('')
    setFocus('balanced')
    setWordLimit('650')
    setRevisionRequests([])
  }

  const handleGenerateDraft = async () => {
    if (!selectedScholarship || !selectedStudent) return

    if (!baseStoryDraft.trim()) {
      setGenerationError('Add a base story before generating a draft.')
      return
    }

    const parsedWordLimit = Number.parseInt(wordLimit, 10)

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseStory: baseStoryDraft,
          scholarship: selectedScholarship,
          focus,
          wordLimit: Number.isFinite(parsedWordLimit) ? parsedWordLimit : undefined,
          constraints: AUTHENTICITY_CONSTRAINTS,
          scholarships: scholarshipsData,
          studentProfiles,
          studentId: selectedStudent.id,
          positiveSignals,
          negativeSignals,
          extraContext,
          revisionRequests,
          lastDraft: latestDraft ?? null,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(
          errorPayload?.error ?? 'Draft generation failed. Please try again.'
        )
      }

      const payload = await response.json()
      if (!payload?.draft) throw new Error('No draft was returned.')

      setGeneratedDrafts((prev) => ({
        ...prev,
        [draftKey]: payload.draft as string,
      }))
    } catch (e) {
      setGenerationError(
        e instanceof Error ? e.message : 'Draft generation failed.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const baseWordCount = useMemo(() => {
    const t = baseStoryDraft.trim()
    if (!t) return 0
    return t.split(/\s+/).length
  }, [baseStoryDraft])

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <AnimatedBackground children={[]} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Draft Studio
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Scholarship-specific drafts
            </h1>
            <p className="text-xs text-zinc-500">
              Provide your base story and a few guiding inputs. Claude returns a tailored draft and lets you iterate with targeted revisions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Claude ready</span>
            </div>

            <Separator orientation="vertical" className="h-6 bg-zinc-700" />

            <Magnetic intensity={0.3} springOptions={{ bounce: 0 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 gap-1 rounded-full border-zinc-700 bg-zinc-900/80 text-xs text-zinc-200 hover:bg-zinc-800"
              >
                <Link
                  href="https://github.com/AsymptoticAstronaut/Claude"
                  target="_blank"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>Repo</span>
                </Link>
              </Button>
            </Magnetic>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          <motion.div className="space-y-6" variants={VARIANTS_CONTAINER}>
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-emerald-300" />
                    Choose a student and scholarship
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Your profile data helps Claude draft in a way that fits each scholarship’s priorities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Student profile
                    </label>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {studentProfiles.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProfileId(p.id)}
                          className={`flex w-full flex-col items-start rounded-lg border px-2.5 py-2.5 transition ${
                            p.id === selectedProfileId
                              ? 'border-emerald-500/70 bg-emerald-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[12px] font-medium text-zinc-100">
                            {p.name}
                          </span>
                          <span className="mt-0.5 text-[10px] text-zinc-500">
                            {p.program} · {p.year}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedStudent && (
                    <div className="grid gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 md:grid-cols-2">
                      <MiniStat
                        label="GPA"
                        value={
                          selectedStudent.gpa != null
                            ? `${selectedStudent.gpa.toFixed(2)} / ${
                                selectedStudent.gpaScale ?? 4
                              }`
                            : 'Not set'
                        }
                      />
                      <MiniStat
                        label="University"
                        value={selectedStudent.university ?? 'Not set'}
                      />
                      <MiniStat
                        label="Location"
                        value={selectedStudent.location ?? 'Not set'}
                      />
                      <MiniStat
                        label="Enrollment"
                        value={selectedStudent.enrollmentStatus ?? 'Not set'}
                      />
                    </div>
                  )}

                  <Separator className="bg-zinc-800/70" />

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Scholarship
                    </label>

                    {/* UPDATED: vertical-only scroll, no chevron, badge on right */}
                    <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto overflow-x-hidden pr-1">
                      {scholarshipOptions.map((sch) => (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => setSelectedScholarshipId(sch.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition ${
                            sch.id === selectedScholarshipId
                              ? 'border-sky-500/70 bg-sky-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-[12px] font-medium text-zinc-100">
                              {sch.name}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-[10px] border-sky-500/60 bg-sky-900/30 text-sky-100"
                          >
                            {typeBadge(sch.type)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Recommended fits
                    </p>
                    <div className="space-y-1.5">
                      {recommendedScholarships.map((sch, i) => (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => setSelectedScholarshipId(sch.id)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                            sch.id === selectedScholarshipId
                              ? 'border-emerald-500/70 bg-emerald-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-medium text-zinc-100">
                                {sch.name}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {typeBadge(sch.type)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`px-1.5 py-0.5 text-[10px] ${
                                i === 0
                                  ? 'border-emerald-500/60 text-emerald-200'
                                  : 'border-zinc-700 text-zinc-200'
                              }`}
                            >
                              {Math.round(sch.compatibility * 100)}%
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <FilePenLine className="h-4 w-4 text-sky-300" />
                    Inputs for Claude
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Add what you want emphasized, what to avoid, and any context the committee should understand.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] text-zinc-400">
                        Base story
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                        >
                          {baseWordCount} words
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-emerald-500/60 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        >
                          Autosave {storyAutosaveAt ? 'on' : 'ready'}
                        </Badge>
                      </div>
                    </div>
                    <Textarea
                      value={baseStoryDraft}
                      onChange={(e) => {
                        setBaseStoryDirty(true)
                        setBaseStoryDraft(e.target.value)
                      }}
                      rows={8}
                      placeholder="Write your core story here. Include real events, outcomes, and why they matter."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                    <p className="text-[10px] text-zinc-500">
                      This story is saved to the selected profile and reused for every draft.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Positive signals to highlight
                      </label>
                      <Textarea
                        value={positiveSignals}
                        onChange={(e) => setPositiveSignals(e.target.value)}
                        rows={5}
                        placeholder="Example: leadership outcomes, specific academic proof, community metrics, research artifacts."
                        className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Signals to downplay or avoid
                      </label>
                      <Textarea
                        value={negativeSignals}
                        onChange={(e) => setNegativeSignals(e.target.value)}
                        rows={5}
                        placeholder="Example: avoid repeating job titles, avoid jargon, don’t over-focus on awards."
                        className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Additional context (optional)
                    </label>
                    <Textarea
                      value={extraContext}
                      onChange={(e) => setExtraContext(e.target.value)}
                      rows={4}
                      placeholder="Anything the draft should assume or explain briefly."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    Claude will follow your authenticity rules and use your profile fit signals to choose emphasis and structure.
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                    Fit signals
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A quick read on what this scholarship rewards and how your profile aligns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  {selectedScholarship && (
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                      <p className="text-[12px] font-medium text-zinc-100">
                        {selectedScholarship.name}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {selectedScholarship.description ?? 'Scholarship details are available in your library.'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedScholarship.priorities.map((pid) => (
                          <Badge
                            key={pid}
                            variant="outline"
                            className="border-emerald-600/60 bg-emerald-900/30 px-2 py-0.5 text-[10px] text-emerald-100"
                          >
                            {DIMENSIONS.find((d) => d.id === pid)?.label ?? pid}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {contributors.slice(0, 5).map((c) => (
                      <div key={c.id} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{c.label}</span>
                          <span>
                            You {Math.round(c.student * 100)} · Scholarship {Math.round(c.weight * 100)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-900/80">
                          <div
                            className="h-2 rounded-full bg-zinc-600"
                            style={{ width: `${c.student * 100}%` }}
                          />
                          <div
                            className="mt-[-8px] h-2 rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-violet-400 opacity-70"
                            style={{ width: `${c.weight * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {!!selectedScholarship?.winnerPatterns?.length && (
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                      <p className="text-[11px] font-medium text-zinc-100">
                        Patterns from past winners
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-zinc-400">
                        {selectedScholarship.winnerPatterns.slice(0, 2).map((p) => (
                          <li key={p.id}>
                            <span className="text-zinc-200">{p.label}:</span>{' '}
                            {p.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Settings2 className="h-4 w-4 text-zinc-200" />
                    Draft settings
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Control tone, emphasis, and length.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Focus
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
                      {([
                        ['balanced', 'Balanced'],
                        ['impact', 'Impact-heavy'],
                        ['technical', 'Technical depth'],
                        ['resilience', 'Resilience / need'],
                      ] as [DraftFocus, string][]).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFocus(value)}
                          className={`flex items-center justify-center rounded-full border px-2 py-1 text-[11px] ${
                            focus === value
                              ? 'border-sky-500/70 bg-sky-900/40 text-sky-100'
                              : 'border-zinc-700/70 bg-zinc-950/70 text-zinc-400 hover:bg-zinc-900/80'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Word limit
                    </label>
                    <Input
                      value={wordLimit}
                      onChange={(e) => setWordLimit(e.target.value)}
                      className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      placeholder="650"
                    />
                    <p className="text-[10px] text-zinc-500">
                      Claude will aim for ±10% of this limit.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Authenticity rules
                    </label>
                    <div className="space-y-1.5">
                      {AUTHENTICITY_CONSTRAINTS.map((label) => (
                        <CheckboxRow key={label} label={label} />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResetInputs}
                      className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[11px] text-zinc-200 hover:bg-zinc-800"
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset inputs
                    </Button>
                    {!!revisionRequests.length && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClearRevisions}
                        className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[11px] text-zinc-200 hover:bg-zinc-800"
                      >
                        Clear revision notes
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Wand2 className="h-4 w-4 text-sky-300" />
                    Claude output
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Generate a draft, then refine specific paragraphs with targeted revision notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/80 px-3 py-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-sky-600 bg-sky-950/40 px-2 py-0.5 text-[10px] text-sky-100"
                      >
                        {selectedScholarship ? selectedScholarship.name : 'Scholarship'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship?.type ?? 'Merit')}
                      </Badge>
                      {!!revisionRequests.length && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/60 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        >
                          {revisionRequests.length} revision note
                          {revisionRequests.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    <Magnetic intensity={0.25} springOptions={{ bounce: 0 }}>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-full bg-sky-600/80 px-3 text-[11px] font-medium text-white hover:bg-sky-500/80"
                        onClick={handleGenerateDraft}
                        disabled={isGenerating || !selectedScholarship || !selectedStudent}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 h-3 w-3 text-sky-200" />
                            Generate draft
                          </>
                        )}
                      </Button>
                    </Magnetic>
                  </div>

                  {generationError && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                      {generationError}
                    </div>
                  )}

                  {!displayedDraft ? (
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-6 text-center text-[11px] text-zinc-400">
                      No draft yet. Add inputs above and click “Generate draft”.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paragraphList.map((p, idx) => (
                        <div
                          key={`${idx}-${p.slice(0, 16)}`}
                          className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                              Paragraph {idx + 1}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                              onClick={() => {
                                setOpenRevisionFor(idx)
                                setRevisionText('')
                              }}
                            >
                              <PenLine className="mr-1 h-3 w-3" />
                              Revise this
                            </Button>
                          </div>

                          <p className="text-[12px] leading-relaxed text-zinc-100">
                            {p}
                          </p>

                          {openRevisionFor === idx && (
                            <div className="mt-3 space-y-2 rounded-md border border-zinc-800/70 bg-zinc-950/70 px-2.5 py-2">
                              <label className="text-[10px] text-zinc-400">
                                Revision note for paragraph {idx + 1}
                              </label>
                              <Textarea
                                value={revisionText}
                                onChange={(e) => setRevisionText(e.target.value)}
                                rows={3}
                                placeholder="Example: tighten the opening, add a specific metric, clarify impact, reduce technical detail."
                                className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 rounded-full bg-emerald-600/80 px-3 text-[10px] text-white hover:bg-emerald-500/80"
                                  onClick={() => handleAddRevision(idx)}
                                >
                                  Add note
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                                  onClick={() => setOpenRevisionFor(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-zinc-100">
                          Revision notes queue
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                          onClick={() => {
                            setOpenRevisionFor(null)
                            setRevisionText('')
                            setOpenRevisionFor(-1)
                          }}
                        >
                          <MessageSquarePlus className="mr-1 h-3 w-3" />
                          Add general note
                        </Button>
                      </div>

                      {openRevisionFor === -1 && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={revisionText}
                            onChange={(e) => setRevisionText(e.target.value)}
                            rows={3}
                            placeholder="General note (applies to whole draft)."
                            className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 rounded-full bg-emerald-600/80 px-3 text-[10px] text-white hover:bg-emerald-500/80"
                              onClick={() => handleAddRevision(undefined)}
                            >
                              Add note
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                              onClick={() => setOpenRevisionFor(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {!revisionRequests.length ? (
                        <p className="mt-2 text-[11px] text-zinc-500">
                          No notes yet. Add notes to refine the next generation.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {revisionRequests.map((r) => (
                            <li
                              key={r.id}
                              className="rounded-md border border-zinc-800/70 bg-zinc-950/70 px-2.5 py-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-zinc-500">
                                    {r.paragraphIndex != null
                                      ? `Paragraph ${r.paragraphIndex + 1}`
                                      : 'General'}
                                  </p>
                                  <p className="text-[11px] text-zinc-200">
                                    {r.instruction}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRevision(r.id)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-lg border border-sky-700/60 bg-sky-950/30 px-3 py-2 text-[11px] text-sky-100">
                      <p className="mb-1 font-medium">
                        How iteration works
                      </p>
                      <p className="text-sky-100/90">
                        Generate a draft, add paragraph-specific notes, then generate again. Claude will preserve what works and only adjust what you flagged.
                      </p>
                      <div className="mt-2">
                        <Magnetic intensity={0.25} springOptions={{ bounce: 0 }}>
                          <Button
                            asChild
                            size="sm"
                            className="h-8 gap-1 rounded-full bg-sky-600 text-xs text-white hover:bg-sky-500"
                          >
                            <Link href="/profiles">
                              View profiles
                              <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </Magnetic>
                      </div>
                    </div>
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

function CheckboxRow({ label }: { label: string }) {
  return (
    <label className="flex items-start gap-2 text-[11px] text-zinc-300">
      <span className="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border border-zinc-700 bg-zinc-950/80 text-[9px] text-zinc-300">
        ✓
      </span>
      <span>{label}</span>
    </label>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-md border border-zinc-800/80 bg-zinc-950/80 px-2 py-1.5">
      <span className="text-[9px] uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="mt-0.5 text-[11px] text-zinc-100">{value}</span>
    </div>
  )
}
