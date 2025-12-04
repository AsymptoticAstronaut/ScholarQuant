'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Github } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
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
import { Separator } from '@/components/ui/separator'

import {
  useScholarshipStore,
  type ScholarshipType,
  type DimensionId,
} from '@/lib/stores/scholarships-store'
import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'

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
  frequency: number // 0–100, across all scholarships
}

const DIMENSION_LABELS: Omit<Dimension, 'frequency'>[] = [
  { id: 'academics', label: 'Academics' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'community', label: 'Community Impact' },
  { id: 'need', label: 'Financial Need' },
  { id: 'innovation', label: 'Innovation' },
  { id: 'research', label: 'Research' },
  { id: 'adversity', label: 'Adversity / Resilience' },
]

type ScholarshipDashboardProps = {}

type ActivityEvent = {
  id: string
  type: string
  description: string
  createdAt: string
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

// Demo-only stand-in for a student profile.
// Later: replace with real student store / onboarding form.
const USER_PROFILE: Record<DimensionId, number> = {
  academics: 0.82,
  leadership: 0.66,
  community: 0.58,
  need: 0.25,
  innovation: 0.74,
  research: 0.7,
  adversity: 0.4,
}

// Demo improvement blurbs keyed by dimension.
// Later: swap this for real onboarding + Claude analysis.
type ImprovementBlurb = {
  headline: string
  youHave: string
  improve: string
}

const IMPROVEMENT_BLURBS: Record<DimensionId, ImprovementBlurb> = {
  academics: {
    headline: 'Academics shows up most often in your scholarship list.',
    youHave:
      'You already look strong here. Your profile suggests consistent performance and real academic growth.',
    improve:
      'Sharpen with 1–2 concrete proof points (top grades, awards, publications, difficult projects). Winners usually anchor Academics with a specific moment of excellence or persistence.',
  },
  leadership: {
    headline: 'Leadership is heavily rewarded across your scholarships.',
    youHave:
      'You show solid leadership potential, especially through initiative and responsibility in groups.',
    improve:
      'Convert roles into outcomes. Add one example where you led people toward a measurable result (team shipped X, grew membership by Y, organized Z). Judges want impact, not titles.',
  },
  community: {
    headline: 'Community Impact appears in many scholarships you fit.',
    youHave:
      'You have meaningful community exposure, but it reads broader than it is deep.',
    improve:
      'Pick a single project and quantify it. Winners usually show sustained commitment plus measurable change (people served, hours, resources raised, policy change, etc.).',
  },
  need: {
    headline: 'Financial Need matters most for access-focused awards.',
    youHave:
      'Your profile shows limited financial-need signaling right now.',
    improve:
      'If relevant, add context clearly and respectfully: barriers faced, costs, and how you’ve worked through them. Tie need to perseverance and future goals; avoid leaving it implicit.',
  },
  innovation: {
    headline: 'Innovation is a high-leverage differentiator in STEM pools.',
    youHave:
      'You already align well with Innovation through building, experimenting, or creating new approaches.',
    improve:
      'Show novelty plus stakes. Explain what was new, why it mattered, and what changed because of it. A short “before → after” framing is ideal.',
  },
  research: {
    headline: 'Research is rarer, but often a tiebreaker.',
    youHave:
      'You have strong research alignment: curiosity and real technical or scholarly work.',
    improve:
      'Make the throughline explicit: question → method → result → why it matters. Even small projects read big if you show rigor and learning.',
  },
  adversity: {
    headline: 'Resilience helps winners stand out, even when not required.',
    youHave:
      'You signal some resilience, but it isn’t yet central.',
    improve:
      'Add one story where a real obstacle forced growth. Judges look for: challenge, action you took, and how it shaped your direction.',
  },
}

// Custom bar shape to kill focus outlines on SVG rects
const NoFocusShape = (props: any) => (
  <Rectangle
    {...props}
    tabIndex={-1}
    className="outline-none focus:outline-none"
    style={{ outline: 'none' }}
  />
)

export default function ScholarshipDashboard(_props: ScholarshipDashboardProps) {
  const scholarships = useScholarshipStore((s) => s.scholarships)

  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('')

  const profiles = useStudentProfileStore((s) => s.profiles)
  const loadProfiles = useStudentProfileStore((s) => s.loadProfiles)
  const hasFetchedProfiles = useStudentProfileStore((s) => s.hasFetched)

  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])

  useEffect(() => {
    if (!hasFetchedProfiles) {
      void loadProfiles()
    }
  }, [hasFetchedProfiles, loadProfiles])

  useEffect(() => {
    void fetch('/api/activity', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<ActivityEvent[]>
      })
      .then((events) => setActivityEvents(events))
      .catch(() => setActivityEvents([]))
  }, [])

  const selectedScholarship = useMemo(() => {
    if (scholarships.length === 0) return undefined
    if (!selectedScholarshipId) return scholarships[0]
    return scholarships.find((s) => s.id === selectedScholarshipId) ?? scholarships[0]
  }, [scholarships, selectedScholarshipId])

  const DIMENSIONS: Dimension[] = useMemo(() => {
    const total = scholarships.length || 1
    return DIMENSION_LABELS.map((d) => {
      const count = scholarships.filter((s) => s.priorities?.includes(d.id)).length
      return {
        ...d,
        frequency: Math.round((count / total) * 100),
      }
    })
  }, [scholarships])

  const totalScholarships = scholarships.length
  const totalProfiles = profiles.length
  const totalDrafts = activityEvents.filter((e) => e.type === 'draft_generated').length

  const avgGenericScore =
    scholarships.reduce((acc, s) => acc + s.genericScore, 0) /
    (scholarships.length || 1)
  const avgTailoredScore =
    scholarships.reduce((acc, s) => acc + s.tailoredScore, 0) /
    (scholarships.length || 1)
  const avgGain = Math.round(avgTailoredScore - avgGenericScore)

  const maxFreq = Math.max(1, ...DIMENSIONS.map((d) => d.frequency))

  const topDimension = useMemo(
    () => DIMENSIONS.slice().sort((a, b) => b.frequency - a.frequency)[0],
    [DIMENSIONS]
  )

  const [selectedImproveDimId, setSelectedImproveDimId] = useState<DimensionId | ''>('')

  const selectedImproveDim = useMemo(() => {
    if (!selectedImproveDimId) return topDimension?.id ?? 'academics'
    return selectedImproveDimId
  }, [selectedImproveDimId, topDimension])

  const sortedWeights = useMemo(() => {
    if (!selectedScholarship) return []
    return Object.entries(selectedScholarship.weights)
      .map(([id, weight]) => {
        const dim = DIMENSIONS.find((d) => d.id === id)!
        return { id: id as DimensionId, label: dim.label, weight }
      })
      .sort((a, b) => b.weight - a.weight)
  }, [selectedScholarship, DIMENSIONS])

  function computeFit(
    weights: Record<DimensionId, number>,
    profile: Record<DimensionId, number>
  ) {
    return (Object.keys(weights) as DimensionId[]).reduce(
      (acc, d) => acc + (weights[d] ?? 0) * (profile[d] ?? 0),
      0
    )
  }

  function winnerTiltedWeights(
    weights: Record<DimensionId, number>
  ): Record<DimensionId, number> {
    const entries = (Object.entries(weights) as [DimensionId, number][])
      .slice()
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    const sum = entries.reduce((acc, [, w]) => acc + w, 0) || 1
    const out: Record<DimensionId, number> = {
      academics: 0,
      leadership: 0,
      community: 0,
      need: 0,
      innovation: 0,
      research: 0,
      adversity: 0,
    }
    entries.forEach(([d, w]) => {
      out[d] = w / sum
    })
    return out
  }

  const recommendations = useMemo(() => {
    return scholarships
      .map((sch) => {
        const personalityFit = computeFit(sch.weights, USER_PROFILE) * 100
        const winnerWeights = winnerTiltedWeights(sch.weights)
        const winnerFit = computeFit(winnerWeights, USER_PROFILE) * 100
        const overallFit = 0.6 * personalityFit + 0.4 * winnerFit

        const top3 = (Object.entries(sch.weights) as [DimensionId, number][])
          .slice()
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id)

        return {
          scholarship: sch,
          personalityFit,
          winnerFit,
          overallFit,
          top3,
        }
      })
      .sort((a, b) => b.overallFit - a.overallFit)
  }, [scholarships])

  const improvementRows = useMemo(() => {
    return DIMENSIONS.slice()
      .sort((a, b) => b.frequency - a.frequency)
      .map((d) => {
        const userLevel = Math.round((USER_PROFILE[d.id] ?? 0) * 100)
        const gap = Math.max(0, d.frequency - userLevel)
        return { ...d, userLevel, gap }
      })
  }, [DIMENSIONS])

  const improvementChartData = useMemo(() => {
    return improvementRows.map((d) => ({
      id: d.id,
      label: d.label,
      demand: d.frequency,
      you: d.userLevel,
      gap: d.gap,
    }))
  }, [improvementRows])

  const handleImproveBarClick = (data: any) => {
    if (data?.id) setSelectedImproveDimId(data.id)
  }

  if (!selectedScholarship) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No scholarships found. Try refreshing or resetting your list.
      </div>
    )
  }

  const improveBlurb = IMPROVEMENT_BLURBS[selectedImproveDim]

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
              Scholarship Tools
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Your Scholarship Dashboard
            </h1>
          </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Online</span>
              </div>
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
              className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            >
              {/* Overview (System Summary, smaller) */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/30 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />

                {/* Nebula ambient background */}
                <div className="pointer-events-none absolute inset-0 z-0">
                  <div className="absolute -top-24 -left-24 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.35),transparent_65%)] blur-3xl opacity-60" />
                  <div className="absolute top-6 -right-28 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.35),transparent_66%)] blur-3xl opacity-55" />
                  <div className="absolute bottom-[-120px] left-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.32),transparent_68%)] blur-3xl opacity-55" />
                  <div className="absolute bottom-6 right-2 h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_70%)] blur-3xl opacity-50" />
                </div>

                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Overview
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A quick snapshot of your scholarships and progress so far.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <KpiTile label="Scholarships in your list" value={totalScholarships} />
                    <KpiTile label="Profiles compared" value={totalProfiles} />
                    <KpiTile label="Drafts created" value={totalDrafts} />
                    <KpiTile
                      label="Average improvement"
                      value={`+${avgGain}`}
                      subtle="better than a generic draft"
                      accent
                    />
                  </div>
                  <div className="rounded-lg border border-cyan-500/60 bg-cyan-900/20 px-3 py-2 text-[11px] text-cyan-100 mt-5">
                    <p className="mb-1 font-medium text-zinc-100">
                      Next step
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Two scholarships still have lower personalized scores (under 80). Create or refine drafts for those to close the gap.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Lab (vertical grouped bars) */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-violet-500/40 via-violet-400/20 to-amber-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    What to improve next
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    What scholarships look for vs what you currently show. Click any bar for tips.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-3 text-xs">
                  {/* prevent focus on click (outer ring) */}
                  <div
                    className="h-[280px] w-full outline-none focus:outline-none"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={improvementChartData}
                        margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                        barCategoryGap={18}
                        barGap={6}
                      >
                        <defs>
                          {/* less-vibrant neon gradient for YOU */}
                          <linearGradient id="youGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(45, 212, 191, 0.8)" />
                            <stop offset="55%" stopColor="rgba(99, 102, 241, 0.78)" />
                            <stop offset="100%" stopColor="rgba(217, 70, 239, 0.82)" />
                          </linearGradient>
                        </defs>

                        <CartesianGrid stroke="rgba(63,63,70,0.55)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          interval={0}
                          tick={{ fill: '#e4e4e7', fontSize: 10 }}
                          axisLine={{ stroke: 'rgba(63,63,70,0.7)' }}
                          tickLine={false}
                          angle={-18}
                          textAnchor="end"
                          height={48}
                        />
                        <YAxis
                          domain={[0, maxFreq]}
                          tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={36}
                          label={{
                            value: 'Importance (%)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 6,
                            fill: '#a1a1aa',
                            fontSize: 10,
                          }}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                          contentStyle={{
                            background: 'rgba(9,9,11,0.95)',
                            border: '1px solid rgba(63,63,70,0.8)',
                            borderRadius: 8,
                            fontSize: 11,
                            color: '#e4e4e7',
                          }}
                          labelStyle={{ color: '#a1a1aa' }}
                          formatter={(value: any, name: any) => {
                            if (name === 'demand') return [`${value}%`, 'Scholarship demand']
                            if (name === 'you') return [`${value}%`, 'You']
                            return [`${value}%`, name]
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={18}
                          formatter={(value: any) =>
                            value === 'demand' ? 'Scholarship demand' : 'You'
                          }
                          wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }}
                        />

                        {/* Demand bars: colder muted neon indigo */}
                        <Bar
                          dataKey="demand"
                          name="demand"
                          barSize={10}
                          radius={[6, 6, 2, 2]}
                          fill="rgba(129, 140, 248, 0.45)"
                          stroke="rgba(129, 140, 248, 0.85)"
                          strokeWidth={0.6}
                          onClick={handleImproveBarClick}
                          shape={NoFocusShape}
                          style={{ cursor: 'pointer', outline: 'none' }}
                        />

                        {/* You bars: neon gradient */}
                        <Bar
                          dataKey="you"
                          name="you"
                          barSize={10}
                          radius={[6, 6, 2, 2]}
                          fill="url(#youGradient)"
                          stroke="rgba(217, 70, 239, 0.7)"
                          strokeWidth={0.5}
                          onClick={handleImproveBarClick}
                          shape={NoFocusShape}
                          style={{ cursor: 'pointer', outline: 'none' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Blurb updates on bar click */}
                  <div className="rounded-lg border border-violet-600/60 bg-violet-950/25 px-3 py-2 text-[11px] text-violet-100">
                    <p className="mb-1 font-medium text-violet-100">
                      {improveBlurb.headline}
                    </p>

                    <p className="mb-1 text-violet-200/90">
                      <span className="font-medium text-violet-100">What you have:</span>{' '}
                      {improveBlurb.youHave}
                    </p>

                    <p className="text-violet-200/90">
                      <span className="font-medium text-violet-100">What to improve:</span>{' '}
                      {improveBlurb.improve}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2 */}
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
                    Your scholarships
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    What each scholarship values most.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  <div className="max-h-[360px] overflow-y-auto pr-1">
                    <div className="space-y-1.5 text-xs">
                      {scholarships.map((sch) => (
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
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggested scholarships for you */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Best matches for you
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Ranked by your fit and what past winners emphasized.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  <div className="max-h-[360px] overflow-y-auto overflow-x-hidden pr-1">
                    <div className="space-y-1.5 text-[11px]">
                      {recommendations.map((rec, idx) => {
                        const sch = rec.scholarship
                        const overall = Math.round(rec.overallFit)
                        const personality = Math.round(rec.personalityFit)
                        const winner = Math.round(rec.winnerFit)

                        return (
                          <button
                            key={sch.id}
                            type="button"
                            onClick={() => setSelectedScholarshipId(sch.id)}
                            className={`w-full rounded-lg bg-zinc-950/90 px-2.5 py-2 text-left transition ${
                              sch.id === selectedScholarship.id
                                ? 'ring-1 ring-emerald-500/60 bg-zinc-900/90'
                                : 'hover:bg-zinc-900/80'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-[10px] text-zinc-500 shrink-0">
                                  #{idx + 1}
                                </span>
                                <p className="truncate text-[12px] text-zinc-100 min-w-0">
                                  {sch.name}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge
                                  variant="outline"
                                  className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0 text-[10px] text-zinc-200"
                                >
                                  {typeBadge(sch.type)}
                                </Badge>
                                <span className="text-[11px] font-medium text-emerald-300">
                                  {overall} match
                                </span>
                              </div>
                            </div>

                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-400 to-emerald-300"
                                style={{ width: `${overall}%` }}
                              />
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                              <span>Your fit: {personality}</span>
                              <span>·</span>
                              <span>Winner style: {winner}</span>
                            </div>

                            <div className="mt-1 flex flex-wrap gap-1">
                              {rec.top3.map((pid) => {
                                const dim = DIMENSIONS.find((d) => d.id === pid)
                                if (!dim) return null
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
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100 mt-5">
                    <p className="mb-0.5 font-medium text-sky-100">
                      What this means
                    </p>
                    <p>
                      These are the scholarships where your profile naturally fits and matches what past winners tend to highlight. Click one to see why.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Explainable Fit Panel */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-sm text-zinc-50">
                    Why this is a good match
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    How this scholarship lines up with your strengths.
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
                        const dim = DIMENSIONS.find((d) => d.id === pid)
                        if (!dim) return null
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

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100 mt-5">
                    <p className="mb-1 font-medium text-emerald-100">
                      Suggested essay angle
                    </p>
                    {sortedWeights.length >= 3 && (
                      <>
                        <p className="mb-1">
                          {`Lead with ${sortedWeights[0].label}, then support with ${sortedWeights[1].label.toLowerCase()} and ${sortedWeights[2].label.toLowerCase()}.`}
                        </p>
                        <p className="text-emerald-200/80">
                          Open with a concrete story showing{' '}
                          {sortedWeights[0].label.toLowerCase()}. Add a second example tied to{' '}
                          {sortedWeights[1].label.toLowerCase()}, and close by connecting{' '}
                          {sortedWeights[2].label.toLowerCase()} to your longer-term goals.
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 3 */}
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
                    Recent activity
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Latest actions in your workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <ul className="space-y-2">
                    {activityEvents.slice(0, 5).length ? (
                      activityEvents.slice(0, 5).map((event) => (
                        <TimelineItem
                          key={event.id}
                          time={new Date(event.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          label={event.description}
                        />
                      ))
                    ) : (
                      <li className="text-[11px] text-zinc-500">
                        Activity will appear here as you start using the app.
                      </li>
                    )}
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
                    Key insights
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    High-level guidance based on your scholarship list.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Overall guidance
                    </p>
                    <p>
                      {`Across your scholarships, ${topDimension?.label.toLowerCase() ?? 'academics'} comes up most often. Applications that open with a concrete story of impact tend to align best with what these scholarships reward.`}
                    </p>
                  </div>

<div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
  <p className="mb-1 font-medium text-sky-100">
    Advisory
  </p>
  <p>
    Many scholarships reward applicants who adapt their stories to highlight the traits most valued by each program. Reviewing the weight profiles helps you decide which strengths to emphasize in each application.
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
      {subtle && <span className="mt-0.5 text-[10px] text-zinc-500">{subtle}</span>}
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

