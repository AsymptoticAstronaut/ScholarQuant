'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { Github } from 'lucide-react'

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
    headline: 'Academics is the most common signal in your scholarship pool.',
    youHave:
      'You already look strong here. Your profile suggests consistent performance and credible academic growth signals.',
    improve:
      'Sharpen with 1–2 concrete “proof points” (top course results, awards, publications, difficult projects). Winners usually anchor Academics with a specific moment of excellence or persistence.',
  },
  leadership: {
    headline: 'Leadership is heavily rewarded across this dataset.',
    youHave:
      'You show solid leadership potential, especially through initiative and responsibility in group settings.',
    improve:
      'Convert “roles” into outcomes. Add one example where you led people toward a measurable result (team shipped X, grew membership by Y, organized Z). Judges want impact, not titles.',
  },
  community: {
    headline: 'Community Impact appears in many scholarships you fit.',
    youHave:
      'You have meaningful community exposure, but it reads broader than it is deep.',
    improve:
      'Pick a single project and quantify it. Winners usually show sustained commitment + measurable change (people served, hours, resources raised, policy change, etc.).',
  },
  need: {
    headline: 'Financial Need is mid-frequency, but decisive for Access awards.',
    youHave:
      'Your profile indicates limited financial-need signaling right now.',
    improve:
      'If relevant, add context clearly and respectfully: barriers faced, costs, and how you’ve worked through them. Tie need to perseverance and future goals; avoid leaving it implicit.',
  },
  innovation: {
    headline: 'Innovation is a high-leverage differentiator for STEM pools.',
    youHave:
      'You already align well with Innovation through building, experimenting, or creating new approaches.',
    improve:
      'Show novelty + stakes. Explain what was new, why it mattered, and what changed because of it. A short “before → after” framing is ideal.',
  },
  research: {
    headline: 'Research is less common overall, but a tiebreaker for winners.',
    youHave:
      'You have strong research alignment: curiosity + evidence of real technical or scholarly work.',
    improve:
      'Make the throughline explicit: question → method → result → why it matters. Even small projects read big if you show rigor and learning.',
  },
  adversity: {
    headline: 'Resilience shows up strongly in winners even when not explicit.',
    youHave:
      'You signal some adversity/resilience, but it isn’t yet central.',
    improve:
      'Add one story where a real obstacle forced growth. Judges look for: challenge, action you took, and how it shaped your direction.',
  },
}

export default function ScholarshipDashboard(_props: ScholarshipDashboardProps) {
  const scholarships = useScholarshipStore((s) => s.scholarships)

  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>('')

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
  const totalProfiles = 3
  const totalDrafts = 18

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

  if (!selectedScholarship) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No scholarships in store. Try refreshing or resetting the store.
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
              className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            >
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
<div className="rounded-lg border border-cyan-500/60 bg-cyan-900/20 px-3 py-2 text-[11px] text-cyan-100 mt-5">
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

              {/* Improvement Lab (VERTICAL-only scroll) */}
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
                    Click a dimension to compare scholarship demand vs your current strength.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
         

         {/* Legend with dots */}
<div className="flex items-center gap-4 text-[11px] text-zinc-400">
  <div className="flex items-center gap-1.5">
    {/* DEMAND (dataset) – solid neon sky */}
    <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
    <span>Demand (dataset)</span>
  </div>
  <div className="flex items-center gap-1.5">
    {/* YOU (profile) – cyan → sky → fuchsia gradient */}
    <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400 shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
    <span>You (profile)</span>
  </div>
</div>

{/* Clickable list, vertical scroll only */}
<div className="max-h-[260px] overflow-y-auto overflow-x-hidden pr-1 space-y-1.5">
  {improvementRows.map((dim) => {
    const isActive = dim.id === selectedImproveDim
    return (
      <button
        key={dim.id}
        type="button"
        onClick={() => setSelectedImproveDimId(dim.id)}
        className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
          isActive
            ? 'border-sky-400/80 bg-zinc-900/90 ring-1 ring-sky-400/60'
            : 'border-zinc-800/80 bg-zinc-950/80 hover:bg-zinc-900/70'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-medium text-zinc-100">
            {dim.label}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span>Demand {dim.frequency}%</span>
            <span>·</span>
            <span>You {dim.userLevel}%</span>
            {dim.gap > 0 && (
              <>
                <span>·</span>
                <span className="text-fuchsia-300">Gap {dim.gap}%</span>
              </>
            )}
          </div>
        </div>

        {/* Two-layer bar: DEMAND (sky) under, YOU (neon gradient) over */}
        <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-900">
          {/* Demand bar */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-sky-500/60"
            style={{ width: `${(dim.frequency / maxFreq) * 100}%` }}
          />
          {/* You bar (gradient) */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-300 to-fuchsia-400"
            style={{ width: `${dim.userLevel}%` }}
          />
        </div>
      </button>
    )
  })}
</div>

                  {/* Blurb */}
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
                    Scholarship library
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Personality tags and detected priorities per scholarship.
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
                    Suggested scholarships for you
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Ranked based on your personal weights and past-winner traits.
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
                                  {overall} fit
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
                              <span>Personality: {personality}</span>
                              <span>·</span>
                              <span>Winner-pattern: {winner}</span>
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
                      These are the scholarships where your profile naturally fits the
                      scholarship’s personality and aligns with what past winners tend
                      to emphasize. Click one to see its weight profile on the right.
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
                    Explainable fit
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    How this scholarship’s personality weights map to your strongest story signals.
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
                      Suggested story angle
                    </p>
                    {sortedWeights.length >= 3 && (
                      <>
                        <p className="mb-1">
                          {`Claude recommends you foreground ${
                            sortedWeights[0].label
                          }, then reinforce with ${sortedWeights[1].label.toLowerCase()} and ${sortedWeights[2].label.toLowerCase()}.`}
                        </p>
                        <p className="text-emerald-200/80">
                          Open with a concrete example illustrating{' '}
                          {sortedWeights[0].label.toLowerCase()}. Follow with a paragraph
                          emphasizing {sortedWeights[1].label.toLowerCase()} and close by
                          tying {sortedWeights[2].label.toLowerCase()} to your long-term
                          goals.
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
                      {`Across this dataset, ${topDimension?.label.toLowerCase() ?? 'academics'} appears more often than traditional GPA language. Applications that open with a concrete story about impact tend to align best with the detected patterns.`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-sky-600/60 bg-sky-900/20 px-3 py-2 text-[11px] text-sky-100">
                    <p className="mb-1 font-medium text-sky-100">
                      Demo callout
                    </p>
                    <p>
                      In your live demo, highlight how the same base student story can be
                      reframed for a Merit scholarship and a Community scholarship using
                      these weight profiles.
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
