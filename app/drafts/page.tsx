'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  FilePenLine,
  Sparkles,
  History,
  Settings2,
  BookOpenCheck,
  Loader2,
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

type DimensionId =
  | 'academics'
  | 'leadership'
  | 'community'
  | 'need'
  | 'innovation'
  | 'research'
  | 'adversity'

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

type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

type ScholarshipOption = {
  id: string
  name: string
  type: ScholarshipType
  priorities: DimensionId[]
  weights?: Record<DimensionId, number>
}

const FALLBACK_SCHOLARSHIPS: ScholarshipOption[] = [
  {
    id: 'sch1',
    name: 'Merit Excellence Grant',
    type: 'Merit',
    priorities: ['academics', 'leadership', 'research'],
  },
  {
    id: 'sch2',
    name: 'Community Builder Scholarship',
    type: 'Community',
    priorities: ['community', 'leadership', 'adversity'],
  },
  {
    id: 'sch3',
    name: 'STEM Innovator Award',
    type: 'STEM',
    priorities: ['innovation', 'research', 'academics'],
  },
  {
    id: 'sch4',
    name: 'First-Gen Access Bursary',
    type: 'Access',
    priorities: ['need', 'adversity', 'community'],
  },
]

type DraftFocus = 'balanced' | 'impact' | 'technical' | 'resilience'

const BASE_STORY_DEFAULT =
  'I grew up in a neighborhood where our high school had one aging computer lab and no dedicated STEM clubs. In grade 10, a teacher let me borrow an old laptop, and I started rebuilding it, installing Linux, and teaching myself basic programming late at night. When the lab’s machines kept breaking, I put together a small team of classmates to repair them after school so younger students could still finish their assignments.'

const GENERIC_DRAFT =
  'I am a hard-working student who cares deeply about my community and my academic success. Over the past few years, I have balanced school, extracurricular activities, and part-time work while always trying to improve myself. I believe that receiving this scholarship would help me continue my education, give back to others, and eventually make a positive impact on the world. I am passionate about leadership, service, and academic excellence, and I am committed to using any support I receive to keep moving forward and achieving my goals.'

const TAILORED_DRAFTS: Record<string, string> = {
  sch1:
    'From a single failing computer lab to rebuilding our school’s digital infrastructure, my academic journey has always been anchored in curiosity and self-directed learning. When our high school could not afford new machines, I spent evenings teaching myself Linux and basic systems administration so I could keep the lab running. That experience led to independent research on low-cost device recovery, and I now maintain a small cluster of refurbished laptops that my peers use for science projects and coding practice. This scholarship would allow me to formalize that work through a combined computer science and engineering degree, deepening the academic foundations behind the projects I have already started.\n\nRather than treating grades as a finish line, I see them as a signal that I am ready for more advanced work. I consistently pursue courses and projects that exceed the baseline curriculum—from implementing my own scheduling algorithms to mentoring younger students in problem-solving. With your support, I hope to expand this track record of academic initiative into larger-scale research that can be shared openly with schools facing similar resource constraints.',
  sch2:
    'When our school’s only computer lab began failing, students stopped handing in assignments—not because they did not care, but because the tools they relied on had quietly disappeared. Instead of accepting that as inevitable, I organized a small group of classmates to repair the machines and keep the lab open after hours. We logged every repair, tracked which classes were most affected, and worked with teachers to schedule open lab times so students without devices at home could still complete their work.\n\nOver the following year, more than 80 students used that after-school lab at least once. I spent dozens of evenings helping peers troubleshoot software, format resumes, and apply for summer jobs online. The experience taught me that community work is not always about grand gestures—it is about noticing where something small is breaking and bringing people together to fix it. This scholarship would allow me to continue building practical, community-centered solutions: first on campus, and eventually in neighborhoods that face the same digital access gaps I grew up with.',
  sch3:
    'My first serious engineering project started with a pile of discarded school laptops and a question: how much performance could we recover with zero budget? I began by installing lightweight Linux distributions, then experimented with different file systems and process schedulers to squeeze more life out of aging hardware. Early attempts failed—some machines would not boot, and others overheated under minimal load—but those failures pushed me to instrument the systems, measure bottlenecks, and iterate on configuration.\n\nOver several months, I turned the project into a small internal “lab,” where I tested power-saving profiles, automated patching scripts, and containerized environments for different classes. The result was a cluster of refurbished laptops that could reliably run programming workshops, simulations, and data analysis tasks for younger students. This scholarship would help me extend that prototype into a more formal research project—documenting the configurations, evaluating performance across schools with similar hardware, and publishing open guides so other resource-constrained classrooms can replicate our setup.',
  sch4:
    'As a first-generation student from a low-income household, every semester has required careful trade-offs between work, school, and family responsibilities. When our school’s computer lab started failing, I saw how easily those trade-offs could push students like me out of opportunities: classmates who relied on the lab were suddenly missing assignments and losing confidence. I understood that feeling intimately, because I had also been counting on those machines to complete my own coursework.\n\nInstead of letting the problem quietly shrink our options, I took on extra shifts at my part-time job to fund inexpensive replacement parts and organized repair sessions with a few classmates. We restored enough machines to keep the lab usable after hours, and I set aside specific evenings to help younger students with homework before going home to support my own family. This scholarship would reduce the financial pressure that forces me to choose between work and school, and it would allow me to continue building small, practical interventions that keep first-generation students from slipping through the cracks.',
}

const AUTHENTICITY_CONSTRAINTS = [
  'Do not invent new experiences or awards.',
  'Preserve anchor sentences from the base story.',
  'Avoid over-polished or unnatural phrasing.',
]

const DIMENSION_IDS: DimensionId[] = [
  'academics',
  'leadership',
  'community',
  'need',
  'innovation',
  'research',
  'adversity',
]

function buildWeights(
  weights: Record<DimensionId, number> | undefined,
  priorities: DimensionId[]
): Record<DimensionId, number> {
  if (weights) {
    return weights
  }
  const base: Record<DimensionId, number> = DIMENSION_IDS.reduce(
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
  student: StudentProfile | undefined,
  scholarship: ScholarshipOption
) {
  if (!student) {
    return 0
  }
  const weights = buildWeights(scholarship.weights, scholarship.priorities)
  return DIMENSION_IDS.reduce((score, dimension) => {
    const feature = student.features?.[dimension] ?? 0
    return score + feature * (weights[dimension] ?? 0)
  }, 0)
}

function buildStudentStorySummary(student: StudentProfile | undefined) {
  if (!student) {
    return ''
  }
  const signature = `${student.name} — ${student.program} (${student.year})`
  const stories =
    student.stories
      ?.map((story) => `${story.title}: ${story.summary}`)
      .filter(Boolean) ?? []
  return [signature, ...stories].join('\n\n')
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

export default function DraftStudioPage() {
  const [baseStory, setBaseStory] = useState(BASE_STORY_DEFAULT)
  const [focus, setFocus] = useState<DraftFocus>('balanced')
  const [wordLimit, setWordLimit] = useState('650')
  const scholarshipsData = useScholarshipStore((s) => s.scholarships)
  const studentProfiles = useStudentProfileStore((s) => s.profiles)
  const scholarshipOptions = useMemo<ScholarshipOption[]>(
    () =>
      scholarshipsData.length
        ? scholarshipsData.map((sch) => ({
            id: sch.id,
            name: sch.name,
            type: sch.type,
            priorities: sch.priorities,
            weights: sch.weights,
          }))
        : FALLBACK_SCHOLARSHIPS,
    [scholarshipsData]
  )
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(
    scholarshipOptions[0]?.id ?? FALLBACK_SCHOLARSHIPS[0]?.id ?? ''
  )
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    studentProfiles[0]?.id ?? ''
  )
  const [generatedDrafts, setGeneratedDrafts] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  useEffect(() => {
    if (scholarshipOptions.length === 0) {
      return
    }
    if (!selectedScholarshipId) {
      setSelectedScholarshipId(scholarshipOptions[0].id)
      return
    }
    if (!scholarshipOptions.some((sch) => sch.id === selectedScholarshipId)) {
      setSelectedScholarshipId(scholarshipOptions[0].id)
    }
  }, [scholarshipOptions, selectedScholarshipId])

  useEffect(() => {
    if (!studentProfiles.length) {
      return
    }
    if (!selectedProfileId) {
      setSelectedProfileId(studentProfiles[0].id)
      return
    }
    if (!studentProfiles.some((profile) => profile.id === selectedProfileId)) {
      setSelectedProfileId(studentProfiles[0].id)
    }
  }, [selectedProfileId, studentProfiles])

  const selectedScholarship =
    useMemo(
      () =>
        scholarshipOptions.find((s) => s.id === selectedScholarshipId) ??
        scholarshipOptions[0],
      [scholarshipOptions, selectedScholarshipId]
    ) ?? FALLBACK_SCHOLARSHIPS[0]

  const selectedStudent =
    useMemo(
      () =>
        studentProfiles.find((profile) => profile.id === selectedProfileId) ??
        studentProfiles[0],
      [selectedProfileId, studentProfiles]
    ) ?? null

  const recommendedScholarships = useMemo(
    () =>
      selectedStudent
        ? scholarshipOptions
            .map((sch) => ({
              ...sch,
              compatibility: computeCompatibilityScore(selectedStudent, sch),
            }))
            .sort((a, b) => b.compatibility - a.compatibility)
            .slice(0, 3)
        : [],
    [scholarshipOptions, selectedStudent]
  )

  const tailoredDraft =
    selectedScholarship?.id && TAILORED_DRAFTS[selectedScholarship.id]
      ? TAILORED_DRAFTS[selectedScholarship.id]
      : GENERIC_DRAFT
  const liveDraft = generatedDrafts[selectedScholarship.id]
  const displayedDraft = liveDraft ?? tailoredDraft

  const priorities = useMemo(
    () =>
      selectedScholarship.priorities
        .map((pid) => DIMENSIONS.find((d) => d.id === pid)!)
        .filter(Boolean),
    [selectedScholarship]
  )

  const handleSyncBaseStory = () => {
    if (!selectedStudent) {
      return
    }
    const summary = buildStudentStorySummary(selectedStudent)
    if (summary) {
      setBaseStory(summary)
    }
  }

  const handleGenerateDraft = async () => {
    if (!baseStory.trim()) {
      setGenerationError('Enter or paste a base story before generating a draft.')
      return
    }

    const scholarshipId = selectedScholarship.id
    const parsedWordLimit = Number.parseInt(wordLimit, 10)

    setIsGenerating(true)
    setGenerationError(null)

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseStory,
          scholarship: selectedScholarship,
          focus,
          wordLimit: Number.isFinite(parsedWordLimit) ? parsedWordLimit : undefined,
          constraints: AUTHENTICITY_CONSTRAINTS,
          scholarships: scholarshipsData,
          studentProfiles,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(
          errorPayload?.error ?? 'Claude could not generate a draft. Try again.'
        )
      }

      const payload = await response.json()
      if (!payload?.draft) {
        throw new Error('Claude returned an empty draft.')
      }

      setGeneratedDrafts((prev) => ({
        ...prev,
        [scholarshipId]: payload.draft as string,
      }))
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong while generating the draft.'
      )
    } finally {
      setIsGenerating(false)
    }
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
              Draft Studio
            </h1>
            <p className="text-xs text-zinc-500">
              Take one base student story and reframe it into scholarship-specific drafts.
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
            {/* Row 0: Student focus + recommended scholarships */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
            >
              {/* Student focus */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/30 via-emerald-400/15 to-emerald-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-emerald-300" />
                    Select student focus
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Choose whose story Claude is refining, then sync their highlights into
                    the base narrative.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  {studentProfiles.length === 0 ? (
                    <p className="text-[11px] text-zinc-400">
                      Add a student profile first to unlock drafting controls.
                    </p>
                  ) : (
                    <>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {studentProfiles.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedProfileId(student.id)}
                            className={`rounded-lg border px-2.5 py-2 text-left transition ${
                              student.id === selectedProfileId
                                ? 'border-emerald-500/70 bg-emerald-500/10'
                                : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                            }`}
                          >
                            <p className="text-[12px] font-medium text-zinc-100">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {student.program} • {student.year}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {student.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-zinc-800/70 px-1.5 py-0.5 text-[9px] text-zinc-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>

                      {selectedStudent && (
                        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-medium text-emerald-100">
                                Focused student
                              </p>
                              <p className="text-[11px] text-emerald-100/80">
                                {selectedStudent.name} — {selectedStudent.program}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full border-emerald-400/60 bg-emerald-500/10 text-[11px] text-emerald-100"
                              onClick={handleSyncBaseStory}
                            >
                              <Sparkles className="h-3 w-3" />
                              Sync story
                            </Button>
                          </div>
                          <div className="mt-2 grid gap-2 text-[10px] text-emerald-100/80 md:grid-cols-3">
                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-emerald-300/70">
                                Drafts generated
                              </p>
                              <p className="text-[11px] font-semibold">
                                {selectedStudent.stats.draftsGenerated}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-emerald-300/70">
                                Matched scholarships
                              </p>
                              <p className="text-[11px] font-semibold">
                                {selectedStudent.stats.scholarshipsMatched}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-emerald-300/70">
                                Avg alignment
                              </p>
                              <p className="text-[11px] font-semibold">
                                {selectedStudent.stats.avgAlignment}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recommended scholarships */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    Recommended scholarships
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Claude scores each scholarship using this student’s feature profile and
                    surfaces the strongest fit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  {selectedStudent ? (
                    recommendedScholarships.length ? (
                      <div className="space-y-2">
                        {recommendedScholarships.map((sch, index) => (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => setSelectedScholarshipId(sch.id)}
                            className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                              sch.id === selectedScholarshipId
                                ? 'border-sky-500/60 bg-sky-500/10'
                                : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-medium text-zinc-100">
                                  {sch.name}
                                </p>
                                <p className="text-[10px] text-zinc-500">
                                  {typeBadge(sch.type)} •{' '}
                                  {sch.priorities
                                    .map(
                                      (pid) =>
                                        DIMENSIONS.find((d) => d.id === pid)?.label ?? ''
                                    )
                                    .join(', ')}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`px-1.5 py-0.5 text-[10px] ${
                                  index === 0
                                    ? 'border-emerald-500/60 text-emerald-200'
                                    : 'border-zinc-700 text-zinc-200'
                                }`}
                              >
                                {index === 0 ? 'Top match' : 'Good fit'}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                                <span>Compatibility</span>
                                <span className="font-semibold text-zinc-200">
                                  {Math.round(sch.compatibility * 100)} / 100
                                </span>
                              </div>
                              <div className="mt-1 h-1.5 rounded-full bg-zinc-900/80">
                                <div
                                  className="h-full rounded-full bg-sky-500"
                                  style={{ width: `${Math.min(sch.compatibility * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-zinc-400">
                        No recommendations available yet—add more scholarships to your
                        workspace.
                      </p>
                    )
                  ) : (
                    <p className="text-[11px] text-zinc-400">
                      Select a student profile to see tailored recommendations.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 1: Base story + target scholarship context */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            >
              {/* Base story / anchor narrative */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <FilePenLine className="h-4 w-4 text-sky-300" />
                    Base student story
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    This is the canonical story Claude will reuse and reframe across
                    multiple scholarships.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] text-zinc-400">
                        Anchor narrative
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 rounded-full border-zinc-700 bg-zinc-900/80 text-[11px] text-zinc-200 hover:bg-zinc-800"
                        onClick={handleSyncBaseStory}
                        disabled={!selectedStudent}
                      >
                        <Sparkles className="h-3 w-3" />
                        Sync from Profiles
                      </Button>
                    </div>
                    <Textarea
                      value={baseStory}
                      onChange={(e) => setBaseStory(e.target.value)}
                      rows={7}
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Story anchors
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        Low-resource school
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        Self-taught computing
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        Student-led repair team
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        Younger students impact
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    <p className="mb-1 font-medium text-zinc-100">
                      Why this matters for judges
                    </p>
                    <p>
                      Instead of writing a new essay from scratch for every scholarship,
                      the student invests in one high-quality base story. Claude then
                      reframes it according to each scholarship personality and weight
                      profile.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Target scholarship context & priorities */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-emerald-300" />
                    Target scholarship context
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Choose the scholarship personality Claude should draft for.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Scholarship to draft for
                    </label>
                    <div className="grid gap-1.5">
                      {scholarshipOptions.map((sch) => (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => setSelectedScholarshipId(sch.id)}
                          className={`flex w-full items-start justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition ${
                            sch.id === selectedScholarship.id
                              ? 'bg-zinc-900/90 ring-1 ring-sky-500/60'
                              : 'bg-zinc-950/80 hover:bg-zinc-900/80'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-[12px] font-medium text-zinc-100">
                              {sch.name}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {typeBadge(sch.type)} •{' '}
                              {sch.priorities
                                .map(
                                  (pid) =>
                                    DIMENSIONS.find((d) => d.id === pid)?.label ?? ''
                                )
                                .join(', ')}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-zinc-700 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-zinc-200"
                          >
                            {typeBadge(sch.type)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Dominant priorities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {priorities.map((dim) => (
                        <Badge
                          key={dim.id}
                          variant="outline"
                          className="border-emerald-600/60 bg-emerald-900/30 px-2 py-0.5 text-[10px] text-emerald-100"
                        >
                          {dim.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      Drafting objective
                    </p>
                    <p>
                      For this scholarship, Claude will keep the core story the same but
                      re-order emphasis: paragraphs, examples, and transitions are tuned
                      to highlight the priorities shown above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Generic vs tailored drafts */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)]"
            >
              {/* Generic essay baseline */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Generic essay baseline
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    The kind of one-size-fits-all draft many students reuse across
                    scholarships.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200"
                    >
                      Baseline · Generic
                    </Badge>
                    <span className="text-[10px] text-zinc-500">
                      Alignment to {selectedScholarship.name}:{' '}
                      <span className="font-medium text-zinc-200">~55/100</span>
                    </span>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] leading-relaxed text-zinc-200">
                    {GENERIC_DRAFT}
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    <p className="mb-1 font-medium text-zinc-100">
                      What judges see in this baseline
                    </p>
                    <ul className="list-disc pl-4">
                      <li>Vague references to community, leadership, and impact.</li>
                      <li>Little evidence that the student read this specific call.</li>
                      <li>Same opening paragraph reused across many applications.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Scholarship-specific draft */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    Scholarship-specific draft
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    How Claude reframes the same story to target this scholarship.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="border-sky-600 bg-sky-950/40 px-2 py-0.5 text-[10px] text-sky-100"
                      >
                        Tailored · {typeBadge(selectedScholarship.type)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        AI-assisted
                      </Badge>
                      {liveDraft && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/60 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        >
                          Live Claude draft
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-300">
                      Alignment to {selectedScholarship.name}:{' '}
                      <span className="font-medium text-emerald-200">~82/100</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/80 px-3 py-2 text-[11px] text-zinc-400 md:flex-row md:items-center md:justify-between">
                    <p className="text-[10px] text-zinc-500">
                      Sends the local scholarships + student profiles JSON to Claude for a
                      focused draft.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-full bg-sky-600/80 px-3 text-[11px] font-medium text-white hover:bg-sky-500/80"
                      onClick={handleGenerateDraft}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 text-sky-200" />
                          Generate draft
                        </>
                      )}
                    </Button>
                  </div>

                  {generationError && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                      {generationError}
                    </div>
                  )}

                  <div className="rounded-lg border border-sky-700/70 bg-zinc-950/90 px-3 py-2 text-[11px] leading-relaxed text-zinc-200">
                    {displayedDraft}
                  </div>

                  <div className="grid gap-2 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                      <p className="mb-1 font-medium text-zinc-100">
                        Key reframing moves
                      </p>
                      <ul className="list-disc pl-4">
                        <li>Reorders paragraphs to foreground priorities.</li>
                        <li>
                          Highlights specific details (e.g., metrics, leadership,
                          hardship) that match the weight profile.
                        </li>
                        <li>
                          Keeps the core story intact—no invented experiences—while
                          changing emphasis and framing.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                      <p className="mb-1 font-medium text-zinc-100">
                        What to say in the live demo
                      </p>
                      <p>
                        For the Merit scholarship, note how the draft opens with academic
                        initiative. Switch to the Community scholarship and point out how
                        the same story now leads with measurable community impact.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 3: Controls + revision history / demo notes */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]"
            >
              {/* Draft controls */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Settings2 className="h-4 w-4 text-zinc-200" />
                    Draft controls
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Parameters you expose to students for refining AI-generated drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Primary focus for this draft
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
                      {([
                        ['balanced', 'Balanced'],
                        ['impact', 'Impact-heavy'],
                        ['technical', 'More technical'],
                        ['resilience', 'Resilience / Need'],
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

                  <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Target word limit
                      </label>
                      <Input
                        value={wordLimit}
                        onChange={(e) => setWordLimit(e.target.value)}
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                        placeholder="650"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Claude is instructed to keep drafts within ±10% of this limit.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Authenticity & constraints
                      </label>
                      <div className="space-y-1.5">
                        {AUTHENTICITY_CONSTRAINTS.map((label) => (
                          <CheckboxRow key={label} label={label} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    <p className="mb-1 font-medium text-zinc-100">
                      Prompt engineering angle
                    </p>
                    <p>
                      In the full implementation, these controls feed into a prompting
                      layer that constrains Claude: e.g., system prompts encoding
                      authenticity rules and scholarship-specific weight vectors.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Revision history & demo notes */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <History className="h-4 w-4 text-emerald-300" />
                    Revision timeline & demo script
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Show how drafts evolve from generic to sharply targeted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <ul className="space-y-2">
                      <TimelineItem
                        label="v0 · Generic baseline"
                        detail="Single essay written without reading specific scholarship language. Reused across 10 applications."
                      />
                      <TimelineItem
                        label="v1 · Merit-focused draft"
                        detail="Reframed to foreground academic initiative and independent research for the Merit Excellence Grant."
                      />
                      <TimelineItem
                        label="v2 · Community-focused draft"
                        detail="Same base story, now organized around measurable community impact and student-led service."
                      />
                      <TimelineItem
                        label="v3 · First-gen / access draft"
                        detail="Highlights financial context and resilience while keeping technical contribution in the background."
                      />
                    </ul>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    <p className="mb-1 font-medium text-zinc-100">
                      How this maps to success criteria
                    </p>
                    <ul className="list-disc pl-4">
                      <li>
                        <span className="font-medium">Innovation & AI integration:</span>{' '}
                        one base story, multiple AI-generated framings.
                      </li>
                      <li>
                        <span className="font-medium">Drafting quality & relevance:</span>{' '}
                        each version aligns tightly with scholarship priorities.
                      </li>
                      <li>
                        <span className="font-medium">Technical execution:</span> clearly
                        separable stages (ingest → weight → draft → refine).
                      </li>
                    </ul>
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
    <label className="flex cursor-pointer items-start gap-2 text-[11px] text-zinc-300">
      <span className="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border border-zinc-700 bg-zinc-950/80 text-[9px] text-zinc-300">
        ✓
      </span>
      <span>{label}</span>
    </label>
  )
}

function TimelineItem({
  label,
  detail,
}: {
  label: string
  detail: string
}) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="mt-1 h-7 w-px bg-zinc-800" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-[11px] font-medium text-zinc-100">{label}</p>
        <p className="text-[11px] text-zinc-400">{detail}</p>
      </div>
    </li>
  )
}
