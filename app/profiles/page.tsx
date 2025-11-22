'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  UserCircle2,
  Sparkles,
  Wand2,
  ChevronRight,
  BookOpenCheck,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

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

const TYPE_DIMENSION_MATRIX: Record<
  ScholarshipType,
  Record<DimensionId, number>
> = {
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
  const updateProfile = useStudentProfileStore((s) => s.updateProfile)

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    profiles[0]?.id ?? ''
  )
  const [targetType, setTargetType] = useState<ScholarshipType>('Merit')
  const [baseStoryDraft, setBaseStoryDraft] = useState<string>('')
  const [baseStoryDirty, setBaseStoryDirty] = useState(false)

  const selectedStudent = useMemo(() => {
    if (profiles.length === 0) return undefined
    if (!selectedStudentId) return profiles[0]
    return profiles.find((s) => s.id === selectedStudentId) ?? profiles[0]
  }, [profiles, selectedStudentId])

  useEffect(() => {
    if (!profiles.find((p) => p.id === selectedStudentId) && profiles[0]?.id) {
      setSelectedStudentId(profiles[0].id)
    }
  }, [profiles, selectedStudentId])

  useEffect(() => {
    if (!selectedStudent) return
    if (baseStoryDirty) return
    setBaseStoryDraft(selectedStudent.baseStory ?? '')
  }, [selectedStudent?.id, selectedStudent?.baseStory, baseStoryDirty])

  const radarData = useMemo(() => {
    if (!selectedStudent) return []
    const studentFeatures = selectedStudent.features
    const typeShape = TYPE_DIMENSION_MATRIX[targetType]

    return DIMENSIONS.map((d) => ({
      id: d.id,
      label: d.label,
      student: Math.round((studentFeatures[d.id] ?? 0) * 100),
      scholarship: Math.round((typeShape[d.id] ?? 0) * 100),
    }))
  }, [selectedStudent, targetType])

  if (!selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No student profiles found. Add a profile to get started.
      </div>
    )
  }

  const stats = selectedStudent.stats

  const handleBaseStoryChange = (value: string) => {
    setBaseStoryDirty(true)
    setBaseStoryDraft(value)
  }

  const handleBaseStorySave = () => {
    updateProfile(selectedStudent.id, {
      baseStory: baseStoryDraft.trim(),
    })
    setBaseStoryDirty(false)
  }

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              ScholarQuant
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Student profiles
            </h1>
            <p className="text-xs text-zinc-500">
              Manage profiles, keep a reusable base story, and see how each profile aligns with different scholarship types.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>System status: Online</span>
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
                  <span>View repo</span>
                </Link>
              </Button>
            </Magnetic>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          <motion.div
            className="space-y-6"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
          >
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />

                <div className="pointer-events-none absolute inset-0 z-0 opacity-75">
                  <div className="absolute inset-0 bg-[radial-gradient(95%_85%_at_0%_0%,rgba(16,185,129,0.16),transparent_60%),radial-gradient(105%_90%_at_100%_15%,rgba(56,189,248,0.16),transparent_60%),radial-gradient(115%_95%_at_42%_100%,rgba(129,140,248,0.14),transparent_64%),radial-gradient(85%_75%_at_60%_40%,rgba(217,70,239,0.13),transparent_66%)]" />
                  <div className="absolute -left-10 top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.34),transparent_60%)] blur-[58px]" />
                  <div className="absolute right-[-48px] top-32 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.32),transparent_62%)] blur-[64px]" />
                  <div className="absolute bottom-[-70px] left-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.3),transparent_64%)] blur-[70px]" />
                  <div className="absolute bottom-10 right-4 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.28),transparent_62%)] blur-[56px]" />
                </div>

                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <UserCircle2 className="h-4 w-4 text-sky-300" />
                    Profile Details
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    Select a profile to review key details and the stories used for tailored applications.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Select a profile
                      </label>
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        {profiles.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(student.id)
                              setBaseStoryDirty(false)
                            }}
                            className={`flex w-full flex-col items-start rounded-lg border px-2.5 py-2.5 transition ${
                              selectedStudent.id === student.id
                                ? 'border-sky-500/80 bg-sky-900/50 text-sky-50'
                                : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900'
                            }`}
                          >
                            <span className="text-[12px] font-medium">
                              {student.name}
                            </span>
                            <span className="mt-0.5 text-[10px] text-zinc-400">
                              {student.program} · {student.year}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Academic summary
                      </label>
                      <Input
                        readOnly
                        value={selectedStudent.program}
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-1">
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
                          label="Location"
                          value={selectedStudent.location ?? 'Not set'}
                        />
                        <MiniStat
                          label="University"
                          value={selectedStudent.university ?? 'Not set'}
                        />
                        <MiniStat
                          label="Enrollment"
                          value={selectedStudent.enrollmentStatus ?? 'Not set'}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
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
                                className="border-emerald-600/70 bg-emerald-900/25 px-1.5 py-0.5 text-[10px] text-emerald-200"
                              >
                                {dim.label}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Base story for this profile
                    </label>
                    <Textarea
                      rows={6}
                      value={baseStoryDraft}
                      onChange={(e) => handleBaseStoryChange(e.target.value)}
                      placeholder="Write a single, reusable story that captures background, goals, and key experiences. Draft Studio will tailor this for each scholarship."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        Your base story is saved privately to this profile.
                      </span>
<Button
  size="sm"
  variant={baseStoryDirty ? 'default' : 'outline'}
  className={`mt-4 h-7 rounded-full px-3 text-[11px] transition-all ${
    baseStoryDirty
      ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 hover:shadow-md'
      : 'border-zinc-600 bg-zinc-800/70 text-zinc-200 backdrop-blur-sm hover:bg-zinc-700'
  }`}
  onClick={handleBaseStorySave}
  disabled={!baseStoryDirty}
>
  Save story
</Button>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-sky-300" />
                    Alignment constellation
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    Two overlaid profiles show how closely this student matches the selected scholarship type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] text-zinc-400">
                      Scholarship type
                    </p>
                    <p className="text-[13px] font-medium text-zinc-100">
                      {typeLabel(targetType)}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      The closer the shapes overlap, the stronger the fit.
                    </p>
                  </div>

                  <div className="h-[320px] w-full rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-2 py-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} outerRadius="75%">
                        <defs>
                          <filter id="studentGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <filter id="scholarGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <linearGradient id="studentFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.55)" />
                            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.45)" />
                          </linearGradient>
                          <linearGradient id="scholarFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(217, 70, 239, 0.5)" />
                            <stop offset="100%" stopColor="rgba(56, 189, 248, 0.38)" />
                          </linearGradient>
                        </defs>

                        <PolarGrid stroke="rgba(63,63,70,0.6)" />
                        <PolarAngleAxis
                          dataKey="label"
                          tick={{ fill: '#e4e4e7', fontSize: 11 }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          axisLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background: 'rgba(9,9,11,0.95)',
                            border: '1px solid rgba(63,63,70,0.8)',
                            borderRadius: 8,
                            fontSize: 11,
                            color: '#e4e4e7',
                          }}
                          formatter={(value: any, name: any) =>
                            name === 'student'
                              ? [`${value}%`, 'Student profile']
                              : [`${value}%`, 'Scholarship type']
                          }
                        />
                        <Legend
                          verticalAlign="top"
                          height={18}
                          wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }}
                          formatter={(v: any) =>
                            v === 'student' ? 'Student profile' : 'Scholarship type'
                          }
                        />

                        <Radar
                          name="student"
                          dataKey="student"
                          stroke="rgba(45, 212, 191, 0.95)"
                          fill="url(#studentFill)"
                          fillOpacity={0.55}
                          strokeWidth={1.6}
                          filter="url(#studentGlow)"
                        />
                        <Radar
                          name="scholarship"
                          dataKey="scholarship"
                          stroke="rgba(217, 70, 239, 0.95)"
                          fill="url(#scholarFill)"
                          fillOpacity={0.45}
                          strokeWidth={1.4}
                          filter="url(#scholarGlow)"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      How to interpret this chart
                    </p>
                    <p>
                      If the student shape extends beyond the scholarship shape, you already have strong evidence to lead with. Gaps point to areas where reframing or adding a story could improve fit.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-emerald-300" />
                    Summary and messaging ideas
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    A quick snapshot of progress, plus guidance for tailoring drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <KpiTile label="Scholarships matched" value={stats.scholarshipsMatched} />
                    <KpiTile label="Drafts generated" value={stats.draftsGenerated} />
                    <KpiTile
                      label="Average alignment"
                      value={`${stats.avgAlignment}%`}
                      accent
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] font-medium text-zinc-100">
                      Scholarship focus
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Switch scholarship type to see how messaging changes.
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

                  <div className="space-y-1.5">
                    {renderMessagingCards(selectedStudent.name)}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                      <span>Draft Studio uses these angles to tailor your story.</span>
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
      {subtle && <span className="mt-0.5 text-[10px] text-zinc-500">{subtle}</span>}
    </div>
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

function renderMessagingCards(studentName: string) {
  return (
    <>
      <MessagingCard
        title="Merit scholarship angle"
        bullets={[
          `${studentName}'s story opens with a clear academic milestone and follows with leadership that amplifies it.`,
          'Community work and broader involvement become focused proof points rather than a full list of activities.',
        ]}
      />
      <MessagingCard
        title="Community scholarship angle"
        bullets={[
          `${studentName} leads with one community initiative and its outcomes.`,
          'Academic details are concise and positioned as reliability and commitment.',
        ]}
      />
      <MessagingCard
        title="STEM / innovation scholarship angle"
        bullets={[
          'Emphasise problem-solving, experimentation, and what was learned through iteration.',
          'Explain technical work in plain language tied to real-world impact.',
        ]}
      />
      <MessagingCard
        title="Access / equity scholarship angle"
        bullets={[
          'Begin with structural or financial barriers, then show persistence and concrete progress.',
          'Frame academics and community work as achievements under real constraints.',
        ]}
      />
    </>
  )
}

function MessagingCard({ title, bullets }: { title: string; bullets: string[] }) {
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
