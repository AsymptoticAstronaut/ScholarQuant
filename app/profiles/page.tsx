'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  UserCircle2,
  Target,
  Sparkles,
  Wand2,
  ChevronRight,
  BookOpenCheck,
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
import { Separator } from '@/components/ui/separator'

import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'
import type { DimensionId } from '@/lib/stores/scholarships-store'

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

type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

const SCHOLARSHIP_TYPES: ScholarshipType[] = [
  'Merit',
  'Community',
  'STEM',
  'Access',
]

function typeLabel(t: ScholarshipType) {
  const map: Record<ScholarshipType, string> = {
    Merit: 'Merit',
    Community: 'Community',
    STEM: 'STEM / Research',
    Access: 'Access / Equity',
  }
  return map[t]
}

/**
 * Personality shapes from Pattern Lab (copied/consistent with Pattern Lab page).
 * 0–1 scale for how much each dimension matters in that scholarship cluster.
 */
const TYPE_DIMENSION_MATRIX: Record<ScholarshipType, Record<DimensionId, number>> = {
  Merit: {
    academics: 0.9,
    leadership: 0.7,
    community: 0.3,
    need: 0.1,
    innovation: 0.35,
    research: 0.6,
    adversity: 0.15,
  },
  Community: {
    academics: 0.3,
    leadership: 0.75,
    community: 1.0,
    need: 0.4,
    innovation: 0.3,
    research: 0.15,
    adversity: 0.55,
  },
  STEM: {
    academics: 0.7,
    leadership: 0.45,
    community: 0.25,
    need: 0.15,
    innovation: 0.9,
    research: 0.8,
    adversity: 0.25,
  },
  Access: {
    academics: 0.45,
    leadership: 0.3,
    community: 0.6,
    need: 1.0,
    innovation: 0.1,
    research: 0.1,
    adversity: 0.9,
  },
}

export default function StudentProfilesPage() {
  const profiles = useStudentProfileStore((s) => s.profiles)

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    profiles[0]?.id ?? ''
  )
  const [targetType, setTargetType] = useState<ScholarshipType>('Merit')

  const selectedStudent = useMemo(() => {
    if (profiles.length === 0) return undefined
    if (!selectedStudentId) return profiles[0]
    return profiles.find((s) => s.id === selectedStudentId) ?? profiles[0]
  }, [profiles, selectedStudentId])

  const featureComparison = useMemo(() => {
    if (!selectedStudent) return []

    const studentFeatures = selectedStudent.features
    const typeShape = TYPE_DIMENSION_MATRIX[targetType]

    return DIMENSIONS.map((dim) => {
      const studentValue = studentFeatures[dim.id]
      const scholarshipWeight = typeShape[dim.id]
      const alignment = studentValue * scholarshipWeight // simple product for demo
      return {
        id: dim.id,
        label: dim.label,
        studentValue,
        scholarshipWeight,
        alignment,
      }
    }).sort((a, b) => b.alignment - a.alignment)
  }, [selectedStudent, targetType])

  if (!selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No student profiles in store. Try resetting the store or adding profiles.
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
              Student Profiles
            </h1>
            <p className="text-xs text-zinc-500">
              Store varied student profiles, anchor their core stories, and see how
              they align with different scholarship personalities.
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
            {/* Row 1: Profile selector + overview */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]"
            >
              {/* Profile selector & stories */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <UserCircle2 className="h-4 w-4 text-sky-300" />
                    Profile details & story anchors
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    For demo, this shows a read-only view. In the real system, Claude
                    would help extract features from these stories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Selected student
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {profiles.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`flex items-center justify-between rounded-lg border px-2 py-2 ${
                              selectedStudent.id === student.id
                                ? 'border-sky-500/80 bg-sky-900/40 text-sky-100'
                                : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            <span className="truncate">{student.name}</span>
                            <span className="ml-2 text-[10px] text-zinc-500">
                              {student.year}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Program & tags
                      </label>
                      <Input
                        readOnly
                        value={`${selectedStudent.program}`}
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedStudent.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedStudent.stories.map((story) => (
                      <div
                        key={story.id}
                        className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2"
                      >
                        <p className="mb-1 text-[12px] font-medium text-zinc-100">
                          {story.title}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {story.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {story.dimensionTags.map((dimId) => {
                            const dim = DIMENSIONS.find((d) => d.id === dimId)!
                            return (
                              <Badge
                                key={dimId}
                                variant="outline"
                                className="border-emerald-600/70 bg-emerald-900/20 px-1.5 py-0.5 text-[10px] text-emerald-200"
                              >
                                {dim.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      How this connects to the rest of the system
                    </p>
                    <p>
                      In the full build, Claude parses these stories and maps them onto
                      the same dimensions used in Scholarships and Pattern Lab. That
                      mapping then drives matching, alignment scores, and draft
                      generation in Draft Studio.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Profile overview + quick stats */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Target className="h-4 w-4 text-emerald-300" />
                    Profile summary & readiness
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Summary stats for the selected student and a direct path into Draft
                    Studio.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <KpiTile
                      label="Scholarships matched"
                      value={selectedStudent.stats.scholarshipsMatched}
                    />
                    <KpiTile
                      label="Drafts generated"
                      value={selectedStudent.stats.draftsGenerated}
                    />
                    <KpiTile
                      label="Avg. alignment"
                      value={`${selectedStudent.stats.avgAlignment}%`}
                      accent
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] font-medium text-zinc-100">
                      Recommended next step
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Pick a scholarship personality below and send {selectedStudent.name}
                      into Draft Studio to generate a tailored essay variant.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {SCHOLARSHIP_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTargetType(t)}
                          className={`flex items-center gap-1 rounded-full border px-2 py-1 ${
                            targetType === t
                              ? 'border-sky-500/80 bg-sky-900/40 text-sky-100'
                              : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          {typeLabel(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                      <span>Profiles power pattern-aware drafting, not just matching.</span>
                    </div>

                    <Magnetic intensity={0.3} springOptions={{ bounce: 0 }}>
                      <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1 rounded-full bg-sky-600 text-xs text-white hover:bg-sky-500"
                      >
                        <Link href="/drafts">
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>Open in Draft Studio</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </Magnetic>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Feature vector vs scholarship personality + messaging angles */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]"
            >
              {/* Alignment chart */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-sky-300" />
                    Feature alignment vs scholarship personality
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Compares this student&apos;s profile to the selected scholarship
                    cluster from Pattern Lab.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] text-zinc-400">
                      Target scholarship type
                    </p>
                    <p className="text-[13px] font-medium text-zinc-100">
                      {typeLabel(targetType)}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      For demo: you can say “Now we ask Claude to treat{' '}
                      {selectedStudent.name} as a
                      candidate for a {typeLabel(targetType)} scholarship. The bars
                      below show where their existing stories already line up.”
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {featureComparison.map((row) => (
                      <div key={row.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{row.label}</span>
                          <span>
                            Student {Math.round(row.studentValue * 100)} · Scholarship{' '}
                            {Math.round(row.scholarshipWeight * 100)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="w-16 text-[10px] text-zinc-500">
                                Student
                              </span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                                <div
                                  className="h-full rounded-full bg-zinc-600"
                                  style={{ width: `${row.studentValue * 100}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-16 text-[10px] text-zinc-500">
                                Scholarship
                              </span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-300"
                                  style={{ width: `${row.scholarshipWeight * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="w-16 text-right text-[10px] text-emerald-300">
                            {Math.round(row.alignment * 100)} alignment
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      Judge-facing interpretation
                    </p>
                    <p>
                      This view proves that the system is not just matching keywords.
                      It is aligning a structured profile to a structured scholarship
                      personality, and the drafting engine uses those bars to decide
                      which parts of the student&apos;s story to emphasize.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Messaging angles */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                    Messaging angles for Draft Studio
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    How the same student gets reframed for different scholarship
                    personalities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      For this demo student
                    </p>
                    <p>
                      In the real app, Claude would generate these messaging angles
                      dynamically. Here you can explain them verbally while Draft
                      Studio renders the full essay.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {renderMessagingCards(selectedStudent.name)}
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      How to use this in the pitch
                    </p>
                    <p>
                      On demo day, you can pick one student and show how the angles
                      change when you flip between Merit, Community, STEM, and Access.
                      Then you switch to Draft Studio to show a full essay for one of
                      those angles.
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

function renderMessagingCards(studentName: string) {
  return (
    <>
      <MessagingCard
        title="Merit scholarship angle"
        bullets={[
          `${studentName}'s narrative opens with a specific academic milestone (e.g., research poster, top exam performance) and only later mentions leadership.`,
          'Claude favors precise metrics (GPA bands, rankings, research outputs) and keeps community work as supporting evidence instead of the headline.',
        ]}
      />
      <MessagingCard
        title="Community scholarship angle"
        bullets={[
          `${studentName}'s story starts with a single community project and its outcomes (people reached, sessions run, resources created).`,
          'Leadership is framed as “serving a group” rather than titles, and academic details are compressed into one supporting paragraph.',
        ]}
      />
      <MessagingCard
        title="STEM / innovation scholarship angle"
        bullets={[
          'The draft foregrounds experimentation, prototypes, and failure/iteration loops before discussing awards or positions.',
          'Technical language is present but at a level readable by non-experts, tying every detail back to the problem being solved.',
        ]}
      />
      <MessagingCard
        title="Access / equity scholarship angle"
        bullets={[
          `${studentName} leads with financial and structural barriers, then connects them to persistence, work, and impact on others.`,
          'Academics appear as “despite” evidence (grades under constraint), and community work is positioned as giving back to a context they know personally.',
        ]}
      />
    </>
  )
}

function MessagingCard({
  title,
  bullets,
}: {
  title: string
  bullets: string[]
}) {
  return (
    <div className="rounded-lg bg-zinc-950/90 px-3 py-2">
      <p className="mb-1 text-[12px] font-medium text-zinc-100">{title}</p>
      <ul className="list-disc pl-4 text-[11px] text-zinc-400">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
