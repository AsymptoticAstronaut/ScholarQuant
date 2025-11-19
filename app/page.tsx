'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Github } from 'lucide-react'

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
import { Separator } from '@/components/ui/separator'

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
  frequency: number // 0–100, across all scholarships
}

const DIMENSIONS: Dimension[] = [
  { id: 'academics', label: 'Academics', frequency: 68 },
  { id: 'leadership', label: 'Leadership', frequency: 81 },
  { id: 'community', label: 'Community Impact', frequency: 77 },
  { id: 'need', label: 'Financial Need', frequency: 54 },
  { id: 'innovation', label: 'Innovation', frequency: 46 },
  { id: 'research', label: 'Research', frequency: 39 },
  { id: 'adversity', label: 'Adversity / Resilience', frequency: 61 },
]

type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

type Scholarship = {
  id: string
  name: string
  type: ScholarshipType
  priorities: DimensionId[]
  weights: Record<DimensionId, number> // 0–1
  genericScore: number // 0–100
  tailoredScore: number // 0–100
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sch1',
    name: 'Merit Excellence Grant',
    type: 'Merit',
    priorities: ['academics', 'leadership', 'research'],
    weights: {
      academics: 0.45,
      leadership: 0.25,
      community: 0.1,
      need: 0.05,
      innovation: 0.05,
      research: 0.08,
      adversity: 0.02,
    },
    genericScore: 58,
    tailoredScore: 86,
  },
  {
    id: 'sch2',
    name: 'Community Builder Scholarship',
    type: 'Community',
    priorities: ['community', 'leadership', 'adversity'],
    weights: {
      academics: 0.1,
      leadership: 0.25,
      community: 0.4,
      need: 0.1,
      innovation: 0.05,
      research: 0.02,
      adversity: 0.08,
    },
    genericScore: 52,
    tailoredScore: 81,
  },
  {
    id: 'sch3',
    name: 'STEM Innovator Award',
    type: 'STEM',
    priorities: ['innovation', 'research', 'academics'],
    weights: {
      academics: 0.25,
      leadership: 0.12,
      community: 0.06,
      need: 0.03,
      innovation: 0.32,
      research: 0.16,
      adversity: 0.06,
    },
    genericScore: 61,
    tailoredScore: 84,
  },
  {
    id: 'sch4',
    name: 'First-Gen Access Bursary',
    type: 'Access',
    priorities: ['need', 'adversity', 'community'],
    weights: {
      academics: 0.12,
      leadership: 0.12,
      community: 0.2,
      need: 0.3,
      innovation: 0.04,
      research: 0.02,
      adversity: 0.2,
    },
    genericScore: 55,
    tailoredScore: 79,
  },
]

type ScholarshipDashboardProps = {
  // optional props later if you want to pass data from server
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

export default function ScholarshipDashboard(_props: ScholarshipDashboardProps) {
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(
    SCHOLARSHIPS[0]?.id ?? ''
  )

  const selectedScholarship = useMemo(
    () => SCHOLARSHIPS.find((s) => s.id === selectedScholarshipId) ?? SCHOLARSHIPS[0],
    [selectedScholarshipId]
  )

  const totalScholarships = SCHOLARSHIPS.length
  const totalProfiles = 3
  const totalDrafts = 18

  const avgGenericScore =
    SCHOLARSHIPS.reduce((acc, s) => acc + s.genericScore, 0) / totalScholarships
  const avgTailoredScore =
    SCHOLARSHIPS.reduce((acc, s) => acc + s.tailoredScore, 0) / totalScholarships
  const avgGain = Math.round(avgTailoredScore - avgGenericScore)

  const maxFreq = Math.max(...DIMENSIONS.map((d) => d.frequency))

  const topDimension = useMemo(
    () => DIMENSIONS.slice().sort((a, b) => b.frequency - a.frequency)[0],
    []
  )

  const sortedWeights = useMemo(
    () =>
      Object.entries(selectedScholarship.weights)
        .map(([id, weight]) => {
          const dim = DIMENSIONS.find((d) => d.id === id)!
          return { id: id as DimensionId, label: dim.label, weight }
        })
        .sort((a, b) => b.weight - a.weight),
    [selectedScholarship]
  )

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >


      {/* main area shifts right because Sidebar adds md:ml-64 to #app-root */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Claude Project · Track 3
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Scholarship Control Center
            </h1>
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
            {/* Row 1: KPIs + Pattern Lab */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            >
              {/* KPIs + Next Best Action */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/30 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    System summary
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    End-to-end view of scholarships, profiles, and draft performance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <KpiTile label="Scholarships analyzed" value={totalScholarships} />
                    <KpiTile label="Student profiles" value={totalProfiles} />
                    <KpiTile label="Drafts generated" value={totalDrafts} />
                    <KpiTile
                      label="Avg. alignment gain"
                      value={`+${avgGain}`}
                      subtle="pts over generic"
                      accent
                    />
                  </div>

                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 py-2.5 text-xs text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Next best action
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Two scholarships have lower tailored scores (&lt;80). Generate or
                      refine drafts for them to close the gap versus generic
                      applications.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Pattern Lab Overview */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Pattern Lab overview
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Scholarship priorities detected across the dataset.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="space-y-1.5">
                    {DIMENSIONS.map((dim) => (
                      <div key={dim.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span>{dim.label}</span>
                          <span>{dim.frequency}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-300"
                            style={{
                              width: `${(dim.frequency / maxFreq) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-800/80 pt-2 text-[11px] text-zinc-400">
                    <p>
                      Claude insight:{' '}
                      <span className="text-zinc-200">
                        {topDimension.label} appears most frequently in this dataset.
                        Drafts should consistently surface it when relevant.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Scholarships + Comparison + Explainability */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]"
            >
              {/* Scholarship Library Snapshot */}
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
                    Personality tags and detected priorities per scholarship.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  <div className="space-y-1.5 text-xs">
                    {SCHOLARSHIPS.map((sch) => (
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
                          <Badge
                            variant="outline"
                            className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0 text-[10px] text-zinc-200"
                          >
                            {typeBadge(sch.type)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {sch.priorities.map((pid) => {
                            const dim = DIMENSIONS.find((d) => d.id === pid)!
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
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Draft Quality & Comparison */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Draft performance vs generic
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Alignment scores comparing generic essays to AI-tailored drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p>
                      Average generic score:{' '}
                      <span className="font-semibold text-zinc-50">
                        {Math.round(avgGenericScore)}
                      </span>
                      {' · '}
                      Tailored:{' '}
                      <span className="font-semibold text-emerald-300">
                        {Math.round(avgTailoredScore)}
                      </span>
                      {' · '}
                      Gain:{' '}
                      <span className="font-semibold text-emerald-300">
                        +{avgGain}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {SCHOLARSHIPS.map((sch) => {
                      const gain = sch.tailoredScore - sch.genericScore
                      return (
                        <div
                          key={sch.id}
                          className="rounded-lg bg-zinc-950/90 px-2.5 py-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[11px] text-zinc-200">
                              {sch.name}
                            </p>
                            <span className="text-[11px] text-emerald-300">
                              +{gain}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="mr-1 text-[10px] text-zinc-500">
                              Generic
                            </span>
                            <div className="h-1.5 flex-1 rounded-full bg-zinc-900">
                              <div
                                className="h-full rounded-full bg-zinc-600"
                                style={{ width: `${sch.genericScore}%` }}
                              />
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="mr-1 text-[10px] text-zinc-500">
                              Tailored
                            </span>
                            <div className="h-1.5 flex-1 rounded-full bg-zinc-900">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-300"
                                style={{ width: `${sch.tailoredScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Explainable Messaging Panel */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Explainable messaging
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Why the draft emphasizes certain parts of the student story.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="text-[11px] text-zinc-400">Selected scholarship</p>
                    <p className="text-[13px] font-medium text-zinc-100">
                      {selectedScholarship.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship.type)}
                      </Badge>
                      {selectedScholarship.priorities.map((pid) => {
                        const dim = DIMENSIONS.find((d) => d.id === pid)!
                        return (
                          <Badge
                            key={pid}
                            variant="outline"
                            className="border-emerald-600/70 bg-emerald-900/30 px-1.5 py-0 text-[10px] text-emerald-200"
                          >
                            {dim.label}
                          </Badge>
                        )
                      })}
                    </div>
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
                      Messaging strategy
                    </p>
                    <p className="mb-1">
                      {`Claude suggests leading with ${
                        sortedWeights[0].label
                      }, then supporting with ${sortedWeights[1].label.toLowerCase()} and ${sortedWeights[2].label.toLowerCase()}.`}
                    </p>
                    <p className="text-emerald-200/80">
                      Open with a concrete example illustrating{' '}
                      {sortedWeights[0].label.toLowerCase()}. Follow with a paragraph
                      emphasizing {sortedWeights[1].label.toLowerCase()} and close by
                      tying {sortedWeights[2].label.toLowerCase()} to your long-term
                      goals.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 3: Activity + Claude insight */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Activity timeline
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    End-to-end pipeline events for the demo dataset.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <ul className="space-y-2">
                    <TimelineItem
                      time="12:04"
                      label="Generated tailored draft for Community Builder Scholarship."
                    />
                    <TimelineItem
                      time="11:57"
                      label="Extracted priority weights for First-Gen Access Bursary."
                    />
                    <TimelineItem
                      time="11:49"
                      label="Imported 10 new STEM scholarships and ran Pattern Lab analysis."
                    />
                    <TimelineItem
                      time="11:32"
                      label="Created base student profile: 3 anchor stories added."
                    />
                    <TimelineItem
                      time="11:20"
                      label="Loaded demo dataset (25 scholarships, 3 profiles)."
                    />
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm text-zinc-50">
                    Claude insight capsule
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    High-level guidance derived from pattern and draft analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Portfolio-level guidance
                    </p>
                    <p>
                      {`Across this dataset, ${topDimension.label.toLowerCase()} appears more often than traditional GPA language. Applications that open with a concrete story about impact tend to align best with the detected patterns.`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
                    <p className="mb-1 font-medium text-sky-100">
                      Demo callout
                    </p>
                    <p>
                      In your live demo, highlight how the same base student story can be
                      reframed for the Merit Excellence Grant and the Community Builder
                      Scholarship using these weight profiles.
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

function TimelineItem({ time, label }: { time: string; label: string }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <span className="text-[10px] text-zinc-500">{time}</span>
        <span className="mt-1 h-6 w-px bg-zinc-800" />
      </div>
      <p className="flex-1 text-[11px] text-zinc-300">{label}</p>
    </li>
  )
}
