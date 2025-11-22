'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  Sparkles,
  Network,
  BrainCircuit,
  BarChart3,
  FlaskConical,
  GraduationCap,
  Crown,
  Users,
  BadgeDollarSign,
  Lightbulb,
  Microscope,
  ShieldAlert,
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
import { Separator } from '@/components/ui/separator'

/**
 * Pan/zoom + force layout
 * Install:
 *   pnpm add react-zoom-pan-pinch d3-force
 */
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceCollide,
} from 'd3-force'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = { duration: 0.3 }

type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

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

/* =========================
   HARD-CODED JSON INPUTS
   ========================= */

const HEATMAP_INPUTS: {
  dimensions: Dimension[]
  scholarshipTypes: ScholarshipType[]
  matrix: Record<ScholarshipType, Record<DimensionId, number>>
} = {
  dimensions: [
    { id: 'academics', label: 'Academics' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'community', label: 'Community Impact' },
    { id: 'need', label: 'Financial Need' },
    { id: 'innovation', label: 'Innovation' },
    { id: 'research', label: 'Research' },
    { id: 'adversity', label: 'Adversity / Resilience' },
  ],
  scholarshipTypes: ['Merit', 'Community', 'STEM', 'Access'],
  matrix: {
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
  },
}

type Theme = {
  phrase: string
  type: ScholarshipType
  lift: number
  frequency: number
}

const NGRAM_INPUTS: Theme[] = [
  // Merit (6)
  { phrase: 'research project', type: 'Merit', lift: 2.1, frequency: 0.62 },
  { phrase: 'dean’s list', type: 'Merit', lift: 1.9, frequency: 0.54 },
  { phrase: 'capstone thesis', type: 'Merit', lift: 2.3, frequency: 0.48 },
  { phrase: 'faculty nomination', type: 'Merit', lift: 1.7, frequency: 0.43 },
  { phrase: 'academic excellence', type: 'Merit', lift: 1.6, frequency: 0.57 },
  { phrase: 'published paper', type: 'Merit', lift: 2.6, frequency: 0.36 },

  // Community (6)
  { phrase: 'community clinic', type: 'Community', lift: 2.7, frequency: 0.58 },
  {
    phrase: 'grassroots initiative',
    type: 'Community',
    lift: 2.3,
    frequency: 0.51,
  },
  { phrase: 'youth mentorship', type: 'Community', lift: 2.0, frequency: 0.47 },
  { phrase: 'local partners', type: 'Community', lift: 1.8, frequency: 0.42 },
  {
    phrase: 'accessibility program',
    type: 'Community',
    lift: 2.4,
    frequency: 0.39,
  },
  { phrase: 'served families', type: 'Community', lift: 1.9, frequency: 0.45 },

  // STEM (6)
  { phrase: 'prototype built', type: 'STEM', lift: 2.8, frequency: 0.67 },
  {
    phrase: 'technical challenge',
    type: 'STEM',
    lift: 2.2,
    frequency: 0.49,
  },
  { phrase: 'iteration cycle', type: 'STEM', lift: 2.5, frequency: 0.46 },
  { phrase: 'benchmarked model', type: 'STEM', lift: 2.1, frequency: 0.41 },
  { phrase: 'experimental setup', type: 'STEM', lift: 2.0, frequency: 0.44 },
  { phrase: 'validated results', type: 'STEM', lift: 1.8, frequency: 0.38 },

  // Access (6)
  { phrase: 'first-generation', type: 'Access', lift: 3.3, frequency: 0.71 },
  {
    phrase: 'financial barriers',
    type: 'Access',
    lift: 2.9,
    frequency: 0.64,
  },
  { phrase: 'worked part-time', type: 'Access', lift: 2.2, frequency: 0.52 },
  { phrase: 'family obligations', type: 'Access', lift: 2.1, frequency: 0.48 },
  { phrase: 'systemic obstacles', type: 'Access', lift: 2.6, frequency: 0.46 },
  { phrase: 'resilience journey', type: 'Access', lift: 2.4, frequency: 0.55 },
]

type Correlation = {
  id: string
  label: string
  value: number
  explanation: string
}

const CORRELATION_INPUTS: Correlation[] = [
  {
    id: 'leadership_community',
    label: 'Leadership × Community Impact',
    value: 0.82,
    explanation:
      'Scholarships that prioritize leadership often also look for clear, measurable community outcomes.',
  },
  {
    id: 'need_adversity',
    label: 'Financial Need × Adversity',
    value: 0.87,
    explanation:
      'Need-focused scholarships frequently include language about obstacles or hardship, so these themes tend to appear together.',
  },
  {
    id: 'innovation_research',
    label: 'Innovation × Research',
    value: 0.76,
    explanation:
      'Innovation is usually backed by evidence of testing, iteration, or research rather than being presented as an isolated idea.',
  },
  {
    id: 'academics_leadership',
    label: 'Academics × Leadership',
    value: 0.61,
    explanation:
      'Academic awards often still value some leadership, but typically with a lower bar than leadership-first scholarships.',
  },
]

type ExperimentEvent = {
  time: string
  label: string
  effect: string
}

const EXPERIMENT_LOG: ExperimentEvent[] = [
  {
    time: '12:18',
    label: 'Clustered scholarships into personality groups using embeddings.',
    effect: 'Improved matching by separating Merit, Community, STEM, and Access styles.',
  },
  {
    time: '12:07',
    label: 'Ran n-gram analysis on winner essays and prompts for STEM awards.',
    effect: 'Identified high-signal phrases winners use more often.',
  },
  {
    time: '11:54',
    label: 'Compared generic drafts with pattern-aware drafts.',
    effect: 'Raised alignment scores across scholarship types.',
  },
  {
    time: '11:39',
    label: 'Split “Need” and “Adversity” into distinct dimensions.',
    effect: 'Made the model more accurate for equity-focused scholarships.',
  },
]

const DIMENSION_COLORS: Record<DimensionId, string> = {
  academics: 'hsl(190 95% 55%)',
  leadership: 'hsl(280 90% 62%)',
  community: 'hsl(145 95% 50%)',
  need: 'hsl(35 95% 55%)',
  innovation: 'hsl(210 95% 60%)',
  research: 'hsl(315 90% 60%)',
  adversity: 'hsl(0 90% 58%)',
}

const DIMENSION_ICONS: Record<DimensionId, React.ComponentType<{ className?: string }>> =
  {
    academics: GraduationCap,
    leadership: Crown,
    community: Users,
    need: BadgeDollarSign,
    innovation: Lightbulb,
    research: Microscope,
    adversity: ShieldAlert,
  }

function typeLabel(t: ScholarshipType) {
  const map: Record<ScholarshipType, string> = {
    Merit: 'Merit',
    Community: 'Community',
    STEM: 'STEM / Research',
    Access: 'Access / Equity',
  }
  return map[t]
}

/* Vibrant flame heat color */
function heatHsl(v: number) {
  const clamped = Math.max(0, Math.min(1, v))
  const hue = 210 - clamped * 205
  const saturation = 100
  const lightness = 32 + clamped * 30
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

export default function PatternLabPage() {
  const [selectedType, setSelectedType] = useState<ScholarshipType>('Merit')

  const DIMENSIONS = HEATMAP_INPUTS.dimensions
  const SCHOLARSHIP_TYPES = HEATMAP_INPUTS.scholarshipTypes
  const TYPE_DIMENSION_MATRIX = HEATMAP_INPUTS.matrix
  const THEMES = NGRAM_INPUTS
  const CORRELATIONS = CORRELATION_INPUTS

  const themesForType = useMemo(
    () => THEMES.filter((t) => t.type === selectedType),
    [selectedType, THEMES]
  )

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
              Pattern Lab
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Scholarship Patterns
            </h1>
            <p className="text-xs text-zinc-500">
              Explore what different scholarships value, which phrases winners use,
              and how dimensions tend to appear together.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>System Status: Ready</span>
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

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          <motion.div
            className="space-y-6"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
          >
            {/* Row 1: Heatmap + Theme explorer */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]"
            >
              {/* Heatmap */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BarChart3 className="h-4 w-4 text-sky-300" />
                    Priority heatmap by scholarship type
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Each row is a scholarship type. Hotter cells mean that dimension is
                    more commonly emphasized in that type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-zinc-400">
                        Choose a scholarship type
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {SCHOLARSHIP_TYPES.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedType(t)}
                            className={`flex items-center gap-1 rounded-full border px-2 py-1 ${
                              selectedType === t
                                ? 'border-sky-500/80 bg-sky-900/40 text-sky-100'
                                : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-400 hover:bg-zinc-900'
                            }`}
                          >
                            {typeLabel(t)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Use this to understand what a scholarship type usually rewards,
                      so you can highlight the right parts of your story.
                    </p>
                  </div>

                  {/* Heat legend */}
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px]">
                    <span className="text-zinc-500">Low</span>
                    <div className="h-1.5 flex-1 rounded-full bg-zinc-900 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          background:
                            'linear-gradient(90deg, hsl(210 100% 44%) 0%, hsl(195 100% 52%) 25%, hsl(55 100% 58%) 55%, hsl(20 100% 56%) 75%, hsl(5 100% 52%) 100%)',
                        }}
                      />
                    </div>
                    <span className="text-zinc-300">High</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/90">
                    <table className="min-w-full border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-950/90">
                          <th className="px-3 py-2 text-left text-zinc-500">Type</th>
                          {DIMENSIONS.map((dim) => (
                            <th
                              key={dim.id}
                              className="px-3 py-2 text-left text-zinc-500"
                            >
                              {dim.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SCHOLARSHIP_TYPES.map((t) => (
                          <tr
                            key={t}
                            className={`border-t border-zinc-800/80 ${
                              t === selectedType ? 'bg-zinc-900/90' : 'bg-zinc-950/80'
                            }`}
                          >
                            <td className="px-3 py-2 align-top text-zinc-200">
                              {typeLabel(t)}
                            </td>
                            {DIMENSIONS.map((dim) => {
                              const value = TYPE_DIMENSION_MATRIX[t][dim.id]
                              const intensity = Math.round(value * 100)
                              return (
                                <td key={dim.id} className="px-3 py-2 align-middle">
                                  <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${intensity}%`,
                                          backgroundColor: heatHsl(value),
                                          opacity: 0.42 + 0.58 * value,
                                          boxShadow:
                                            value > 0.6
                                              ? '0 0 8px rgba(255,120,80,0.45)'
                                              : value > 0.3
                                              ? '0 0 6px rgba(255,220,120,0.35)'
                                              : '0 0 5px rgba(90,190,255,0.25)',
                                        }}
                                      />
                                    </div>
                                    <span className="w-8 text-right text-[10px] text-zinc-500">
                                      {intensity}
                                    </span>
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-lg border border-sky-500/50 bg-sky-950/20 px-3 py-2 text-[11px] text-sky-100">
                    <p className="mb-1 font-medium text-sky-100">
                      What this means for your application
                    </p>
                    <p>
                      If a type is hot on a dimension, you should put that evidence
                      early and clearly in your essay. If it’s cooler, mention it only
                      if it supports your main message.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Theme explorer */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-indigo-500/40 via-sky-400/20 to-cyan-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-sky-300" />
                    Theme explorer
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Phrases that appear more often in winning essays for the selected
                    scholarship type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 flex items-center gap-1 text-[11px] text-zinc-400">
                      <BrainCircuit className="h-3.5 w-3.5 text-sky-300" />
                      <span>Selected type: {typeLabel(selectedType)}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      These are common “signals” winners tend to include. Use them as
                      inspiration for framing, not as wording to copy.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {themesForType.map((theme) => (
                      <div
                        key={theme.phrase}
                        className="rounded-lg bg-zinc-950/90 px-3 py-2"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-[13px] font-medium text-zinc-100">
                            “{theme.phrase}”
                          </p>
                          <Badge
                            variant="outline"
                            className="border-zinc-700 bg-zinc-900/70 px-1.5 py-0.5 text-[10px] text-zinc-200"
                          >
                            Lift ×{theme.lift.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-900">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-300"
                              style={{ width: `${theme.frequency * 100}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-[10px] text-zinc-500">
                            {(theme.frequency * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Using themes well
                    </p>
                    <p>
                      If a phrase matches something you genuinely did, state it
                      plainly and add specifics (what you built, changed, measured, or
                      learned). Authentic detail is what makes these themes work.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Correlations + experiment log (60/40) */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            >
              <ForceCorrelationCard
                dimensions={DIMENSIONS}
                correlations={CORRELATIONS}
              />

              {/* Experiment log */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <FlaskConical className="h-4 w-4 text-emerald-300" />
                    Analysis log
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A short history of the steps used to learn these patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <ul className="space-y-2">
                    {EXPERIMENT_LOG.map((event) => (
                      <li key={event.time} className="flex gap-3">
                        <div className="flex flex-col items-center pt-0.5">
                          <span className="text-[10px] text-zinc-500">
                            {event.time}
                          </span>
                          <span className="mt-1 h-6 w-px bg-zinc-800" />
                        </div>
                        <div className="flex-1 rounded-lg bg-zinc-950/90 px-3 py-2">
                          <p className="text-[11px] text-zinc-200">{event.label}</p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            Result: {event.effect}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Why this matters
                    </p>
                    <p>
                      The patterns you see above come from real scholarship data, not
                      guesses. The system updates these signals as more scholarships
                      and winner essays are added.
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

/* =========================
   INTERPRETABLE FORCE MAP
   ========================= */

type ForceNode = Dimension & {
  x: number
  y: number
  vx?: number
  vy?: number
}

type ForceLink = {
  id: string
  label: string
  value: number
  explanation: string
  source: DimensionId
  target: DimensionId
  isExplicit: boolean
}

function ForceCorrelationCard({
  dimensions,
  correlations,
}: {
  dimensions: Dimension[]
  correlations: Correlation[]
}) {
  const [active, setActive] = useState<Correlation | null>(null)
  const [nodes, setNodes] = useState<ForceNode[]>([])
  const [links, setLinks] = useState<ForceLink[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  const WIDTH = 620
  const HEIGHT = 420
  const PADDING = 48
  const center = { x: WIDTH / 2, y: HEIGHT / 2 }

  useEffect(() => {
    const BASE_SIM = 0.18

    const sim: Record<string, number> = {}
    dimensions.forEach((a) => {
      dimensions.forEach((b) => {
        if (a.id === b.id) return
        const k = a.id < b.id ? `${a.id}_${b.id}` : `${b.id}_${a.id}`
        sim[k] = BASE_SIM
      })
    })
    correlations.forEach((c) => {
      const [a, b] = c.id.split('_') as DimensionId[]
      const k = a < b ? `${a}_${b}` : `${b}_${a}`
      sim[k] = c.value
    })

    const initNodes: ForceNode[] = dimensions.map((d, i) => {
      const angle = (2 * Math.PI * i) / dimensions.length
      const r = 85
      return {
        ...d,
        x: center.x + r * Math.cos(angle) + (Math.random() - 0.5) * 10,
        y: center.y + r * Math.sin(angle) + (Math.random() - 0.5) * 10,
      }
    })

    const allLinks: ForceLink[] = []
    for (let i = 0; i < dimensions.length; i++) {
      for (let j = i + 1; j < dimensions.length; j++) {
        const a = dimensions[i].id
        const b = dimensions[j].id
        const k = a < b ? `${a}_${b}` : `${b}_${a}`
        const explicit = correlations.find((c) => {
          const [x, y] = c.id.split('_')
          return (x === a && y === b) || (x === b && y === a)
        })
        allLinks.push({
          id: k,
          label:
            explicit?.label ??
            `${dimensions[i].label} × ${dimensions[j].label}`,
          value: sim[k],
          explanation: explicit?.explanation ?? '',
          source: a,
          target: b,
          isExplicit: Boolean(explicit),
        })
      }
    }

    const simForce = forceSimulation(initNodes as any)
      .force(
        'link',
        forceLink(allLinks as any)
          .id((d: any) => d.id)
          .distance((l: any) => {
            const v = Math.max(0.05, Math.min(1, l.value ?? BASE_SIM))
            const minDist = 55
            const maxDist = 175
            return maxDist - v * (maxDist - minDist)
          })
          .strength((l: any) => (l.isExplicit ? 1.0 : 0.1))
      )
      .force('charge', forceManyBody().strength(-175))
      .force('collide', forceCollide(26))
      .force('center', forceCenter(center.x, center.y))

    for (let i = 0; i < 260; i++) simForce.tick()
    simForce.stop()

    setNodes([...initNodes])
    setLinks([...allLinks])

    return () => simForce.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, correlations])

  const gridLines = useMemo(() => {
    const step = 70
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (let x = PADDING; x <= WIDTH - PADDING; x += step) {
      lines.push({ x1: x, y1: PADDING, x2: x, y2: HEIGHT - PADDING })
    }
    for (let y = PADDING; y <= HEIGHT - PADDING; y += step) {
      lines.push({ x1: PADDING, y1: y, x2: WIDTH - PADDING, y2: y })
    }
    return lines
  }, [WIDTH, HEIGHT, PADDING])

  const explicitLinks = links.filter((l) => l.isExplicit)

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
      <Spotlight
        className="from-zinc-500/35 via-zinc-400/15 to-zinc-300/10 blur-2xl"
        size={120}
      />
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
          <Network className="h-4 w-4 text-zinc-200" />
          Dimension correlation map
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          An interactive map showing which dimensions tend to show up together across
          scholarships. Stronger correlations pull dimensions closer.
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-3 text-xs">
        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Node color/icon:</span>
              <span className="text-zinc-200">dimension</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Line color/thickness:</span>
              <span className="text-zinc-200">correlation strength r</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Line length:</span>
              <span className="text-zinc-200">shorter means stronger</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div
            ref={containerRef}
            className="relative rounded-lg border border-zinc-800/80 bg-zinc-950/90 p-2"
          >
            <div className="pointer-events-none absolute inset-0 opacity-45">
              <div className="absolute -left-12 top-8 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
              <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl" />
              <div className="absolute bottom-8 right-20 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />
            </div>

            <TransformWrapper
              initialScale={1}
              minScale={0.7}
              maxScale={3}
              centerOnInit
              wheel={{ step: 0.12 }}
              panning={{ velocityDisabled: true }}
              doubleClick={{ disabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => zoomIn()}
                      className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] text-zinc-200 hover:bg-zinc-900"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => zoomOut()}
                      className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] text-zinc-200 hover:bg-zinc-900"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      onClick={() => resetTransform()}
                      className="rounded-md border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] text-zinc-200 hover:bg-zinc-900"
                    >
                      reset
                    </button>
                  </div>

                  <TransformComponent wrapperClass="w-full" contentClass="w-full">
                    <svg
                      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                      className="h-[360px] w-full"
                      role="img"
                      aria-label="Correlation similarity map"
                    >
                      {gridLines.map((g, i) => (
                        <line
                          key={i}
                          x1={g.x1}
                          y1={g.y1}
                          x2={g.x2}
                          y2={g.y2}
                          stroke="rgba(255,255,255,0.04)"
                          strokeWidth="1"
                        />
                      ))}

                      <line
                        x1={PADDING}
                        y1={center.y}
                        x2={WIDTH - PADDING}
                        y2={center.y}
                        stroke="rgba(255,255,255,0.11)"
                        strokeWidth="1"
                      />
                      <line
                        x1={center.x}
                        y1={PADDING}
                        x2={center.x}
                        y2={HEIGHT - PADDING}
                        stroke="rgba(255,255,255,0.11)"
                        strokeWidth="1"
                      />
                      <text
                        x={WIDTH - PADDING}
                        y={center.y - 10}
                        textAnchor="end"
                        fontSize="16"
                        fill="rgba(228,228,231,0.9)"
                      >
                        Similarity X
                      </text>
                      <text
                        x={center.x + 8}
                        y={PADDING + 14}
                        textAnchor="start"
                        fontSize="16"
                        fill="rgba(228,228,231,0.9)"
                      >
                        Similarity Y
                      </text>

                      {explicitLinks.map((l) => {
                        const a = nodes.find((n) => n.id === l.source)
                        const b = nodes.find((n) => n.id === l.target)
                        if (!a || !b) return null
                        const w = 2.1 + l.value * 6.0
                        const midX = (a.x + b.x) / 2
                        const midY = (a.y + b.y) / 2
                        return (
                          <g key={l.id}>
                            <line
                              x1={a.x}
                              y1={a.y}
                              x2={b.x}
                              y2={b.y}
                              stroke={heatHsl(l.value)}
                              strokeWidth={w}
                              strokeLinecap="round"
                              opacity={0.6}
                              onMouseEnter={() => setActive(l)}
                              onMouseLeave={() => setActive(null)}
                            />
                            <g opacity={0.7}>
                              <rect
                                x={midX - 18}
                                y={midY - 11}
                                width={36}
                                height={20}
                                rx={5}
                                fill="rgba(9,9,11,0.92)"
                                stroke="rgba(255,255,255,0.18)"
                              />
                              <text
                                x={midX}
                                y={midY + 6}
                                textAnchor="middle"
                                fontSize="14"
                                fill="rgba(244,244,245,0.98)"
                              >
                                {l.value.toFixed(2)}
                              </text>
                            </g>
                          </g>
                        )
                      })}

                      {nodes.map((n) => {
                        const c = DIMENSION_COLORS[n.id]
                        const Icon = DIMENSION_ICONS[n.id]
                        return (
                          <g key={n.id}>
                            <circle cx={n.x} cy={n.y} r="24" fill={c} opacity="0.14" />
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r="17"
                              fill="rgba(9,9,11,0.96)"
                              stroke={c}
                              strokeWidth="2.5"
                            />
                            <circle cx={n.x} cy={n.y} r="7" fill={c} opacity="0.8" />
                            <foreignObject
                              x={n.x - 6}
                              y={n.y - 6}
                              width={12}
                              height={12}
                            >
                              <Icon className="h-3 w-3 text-white/90" />
                            </foreignObject>
                            <text
                              x={n.x}
                              y={n.y - 28}
                              textAnchor="middle"
                              fontSize="17.5"
                              fontWeight="600"
                              fill="rgba(244,244,245,0.98)"
                            >
                              {n.label}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            {active && (
              <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-lg border border-zinc-700/80 bg-zinc-950/95 px-3 py-2 text-[16px]">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: heatHsl(active.value) }}
                  />
                  <p className="font-medium text-zinc-100">{active.label}</p>
                </div>
                <p className="mt-0.5 text-zinc-400">r ≈ {active.value.toFixed(2)}</p>
                <p className="mt-1 text-zinc-500">{active.explanation}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 p-3">
            <p className="mb-2 text-[11px] font-medium text-zinc-200">
              Strongest pairs in the dataset
            </p>
            <ul className="space-y-2">
              {correlations
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((c) => (
                  <li
                    key={c.id}
                    className="rounded-md border border-zinc-800/70 bg-zinc-950/70 px-2.5 py-2"
                    onMouseEnter={() => setActive(c)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: heatHsl(c.value) }}
                        />
                        <p className="text-[11px] font-medium text-zinc-100">
                          {c.label}
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        r≈{c.value.toFixed(2)}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {c.explanation}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
          <p className="mb-1 font-medium text-zinc-100">How to read this map</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Each node is a scholarship dimension.</li>
            <li>
              Visible lines show measured correlations. Hotter and thicker lines mean
              stronger relationships.
            </li>
            <li>
              Dimensions connected by strong lines sit closer together because the
              layout uses correlation strength as attraction.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
