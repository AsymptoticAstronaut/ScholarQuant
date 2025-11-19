'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  SlidersHorizontal,
  KeyRound,
  ShieldCheck,
  MonitorCog,
  Presentation,
  AlertTriangle,
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
import { Switch } from '@/components/ui/switch'

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

export default function SettingsPage() {
  const [demoMode, setDemoMode] = useState<'judge' | 'builder'>('judge')
  const [storeLocally, setStoreLocally] = useState(true)
  const [anonymize, setAnonymize] = useState(true)
  const [telemetry, setTelemetry] = useState(false)
  const [strictSafety, setStrictSafety] = useState(true)
  const [mockClaude, setMockClaude] = useState(true)

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
              Settings
            </h1>
            <p className="text-xs text-zinc-500">
              Configure Claude, data handling, and demo behaviour in one place.
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
            {/* Row 1: Claude/API + Demo mode */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]"
            >
              {/* Claude / API configuration */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <KeyRound className="h-4 w-4 text-sky-300" />
                    Claude API configuration
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    In the real system, this would be wired to environment variables or
                    a secure secrets store. Here it serves as a configuration mock.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Claude API key (demo placeholder)
                    </label>
                    <Input
                      type="password"
                      value="sk-••••••••••••••••••••••••"
                      readOnly
                      className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500">
                      For security, the demo does not store real keys. For production,
                      you would inject this via environment variables or a secrets
                      manager.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <ToggleRow
                      label="Use mock Claude responses"
                      description="Keep the UI responsive even when the API is offline during the hackathon."
                      checked={mockClaude}
                      onCheckedChange={setMockClaude}
                    />
                    <ToggleRow
                      label="Enable strict safety configuration"
                      description="Instructs Claude to prioritise conservative outputs and detailed reasoning."
                      checked={strictSafety}
                      onCheckedChange={setStrictSafety}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Default Claude system prompt (demo only)
                    </label>
                    <Textarea
                      readOnly
                      rows={4}
                      value={
                        'You are an assistant helping students craft scholarship applications. Preserve their authentic voice while optimising for the priorities inferred from each scholarship personality.'
                      }
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500">
                      In the real app, edits here would propagate to Draft Studio and
                      Pattern Lab, so you can experiment with different alignment
                      strategies.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Demo / presentation mode */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Presentation className="h-4 w-4 text-emerald-300" />
                    Demo & presentation mode
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Control how much internal detail you reveal when judges are watching.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] text-zinc-400">
                      Presentation mode preset
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {[
                        {
                          key: 'judge' as const,
                          label: 'Judge-facing',
                          desc: 'Highlights impact, hides noisy debug details.',
                        },
                        {
                          key: 'builder' as const,
                          label: 'Builder / dev',
                          desc: 'Shows more technical metrics and debug states.',
                        },
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setDemoMode(preset.key)}
                          className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left ${
                            demoMode === preset.key
                              ? 'border-emerald-500/80 bg-emerald-900/30 text-emerald-100'
                              : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          <span className="text-[11px] font-medium">
                            {preset.label}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {preset.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      What this changes in the UI
                    </p>
                    <ul className="list-disc pl-4 text-[11px] text-zinc-400">
                      <li>
                        In Judge-facing mode, hide raw tokens, long logs, and experimental
                        controls.
                      </li>
                      <li>
                        In Builder mode, keep Pattern Lab and internal metrics fully
                        visible to explain methodology.
                      </li>
                      <li>
                        Both modes still surface explainability: why a student matched a
                        scholarship and why a draft was framed in a certain way.
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/20 px-3 py-2 text-[11px] text-emerald-100">
                    <p className="mb-1 font-medium text-emerald-100">
                      Demo tip
                    </p>
                    <p>
                      Open this page briefly during the pitch to show that you thought
                      about real deployment: API keys, safety, privacy, and how you
                      configure the system for different audiences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Row 2: Data & privacy + system status */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]"
            >
              {/* Data & privacy */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Data & privacy
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Make it explicit how you would handle real profiles, essays, and
                    scholarship content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ToggleRow
                      label="Store student data locally only"
                      description="For the hackathon demo, all profiles and drafts remain in browser memory or an ephemeral database."
                      checked={storeLocally}
                      onCheckedChange={setStoreLocally}
                    />
                    <ToggleRow
                      label="Anonymise names in logs"
                      description="Replace student names with pseudonyms when logging internal events and metrics."
                      checked={anonymize}
                      onCheckedChange={setAnonymize}
                    />
                    <ToggleRow
                      label="Allow aggregate telemetry (opt-in)"
                      description="Collect anonymous stats on which features are used most. Disabled by default."
                      checked={telemetry}
                      onCheckedChange={setTelemetry}
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Consent & human-in-the-loop
                    </p>
                    <p>
                      In a real deployment, students would explicitly opt into AI
                      assistance and be able to download, edit, or delete their data.
                      Claude is positioned as a drafting assistant, not an automated
                      decision-maker.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Ethical guardrails
                    </p>
                    <p>
                      You can note in the pitch that the system avoids fabricating
                      achievements, and uses Pattern Lab signals to shape emphasis, not
                      to invent content. Students stay in control of the final essay.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* System status and environment */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-zinc-500/40 via-zinc-400/20 to-zinc-300/10 blur-2xl"
                  size={90}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <MonitorCog className="h-4 w-4 text-zinc-200" />
                    System status & environment
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    A small panel you can flash during the demo to prove robustness and
                    realistic deployment thinking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatusTile
                      label="Environment"
                      value="Hackathon demo"
                      badge="Local / Dev"
                    />
                    <StatusTile
                      label="Claude integration"
                      value={mockClaude ? 'Mocked for demo' : 'Live API calls'}
                      badge={mockClaude ? 'Mock' : 'Live'}
                    />
                    <StatusTile
                      label="Last sync with Pattern Lab"
                      value="Today · 12:24"
                      badge="Up to date"
                    />
                    <StatusTile
                      label="Draft Studio status"
                      value="Online"
                      badge="Healthy"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-500/70 bg-amber-900/20 px-3 py-2 text-[11px] text-amber-100">
                    <div className="mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="font-medium">Inline caveats</span>
                    </div>
                    <p>
                      You can use this card to be honest about current limitations
                      (small dataset, mocked calls, simplified scoring) while showing
                      clearly where production APIs, databases, and auth would plug in.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      One-liner for judges
                    </p>
                    <p>
                      “Settings is where we prove this is more than a demo – we already
                      know how we would wire Claude, privacy, and deployment in a real
                      product.”
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

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
      <div className="space-y-1">
        <p className="text-[11px] font-medium text-zinc-100">{label}</p>
        <p className="text-[11px] text-zinc-500">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
    </div>
  )
}

function StatusTile({
  label,
  value,
  badge,
}: {
  label: string
  value: string
  badge: string
}) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 py-2">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <span className="mt-1 text-[13px] font-semibold text-zinc-50">
        {value}
      </span>
      <Badge
        variant="outline"
        className="mt-1 w-fit border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-300"
      >
        {badge}
      </Badge>
    </div>
  )
}
