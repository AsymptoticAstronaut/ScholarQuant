'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  KeyRound,
  ShieldCheck,
  MonitorCog,
  Presentation,
  AlertTriangle,
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
  const [interfaceMode, setInterfaceMode] = useState<'simple' | 'detailed'>(
    'simple'
  )
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
              Settings
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Preferences & integrations
            </h1>
            <p className="text-xs text-zinc-500">
              Manage your AI connection, privacy choices, and interface preferences.
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
            {/* Row 1: Claude/API + Interface */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]"
            >
              {/* Claude / API configuration */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                {/* Nebula ambient background */}
                <NebulaBackdrop />

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
                    Connect your Claude key to enable personalized analysis and
                    scholarship-aware drafting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Claude API key
                    </label>
                    <Input
                      type="password"
                      value="sk-••••••••••••••••••••••••"
                      readOnly
                      className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Your key is always hidden in full. You can replace or remove it
                      anytime from this page.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <ToggleRow
                      label="Use offline responses"
                      description="Keeps features available even if Claude is temporarily unreachable."
                      checked={mockClaude}
                      onCheckedChange={setMockClaude}
                    />
                    <ToggleRow
                      label="Enable strict safety"
                      description="Adds extra checks to reduce risky or low-quality outputs."
                      checked={strictSafety}
                      onCheckedChange={setStrictSafety}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Default drafting style
                    </label>
                    <Textarea
                      readOnly
                      rows={4}
                      value={
                        'You are an assistant helping students craft scholarship applications. Preserve their authentic voice while optimizing for the priorities inferred from each scholarship.'
                      }
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                    <p className="text-[11px] text-zinc-500">
                      This guides how Draft Studio frames your stories across
                      scholarships.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Interface preferences */}
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={100}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Presentation className="h-4 w-4 text-emerald-300" />
                    Interface preferences
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Choose how much detail you want to see while browsing and drafting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] text-zinc-400">
                      Detail level
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {[
                        {
                          key: 'simple' as const,
                          label: 'Simple view',
                          desc: 'Focus on the main insights and writing guidance.',
                        },
                        {
                          key: 'detailed' as const,
                          label: 'Detailed view',
                          desc: 'Show extra metrics and deeper pattern breakdowns.',
                        },
                      ].map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => setInterfaceMode(preset.key)}
                          className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left ${
                            interfaceMode === preset.key
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
                      What changes with each view
                    </p>
                    <ul className="list-disc pl-4 text-[11px] text-zinc-400">
                      <li>
                        Simple view highlights your strongest matches and top essay
                        angles.
                      </li>
                      <li>
                        Detailed view adds Pattern Lab diagnostics and more granular
                        explanations.
                      </li>
                      <li>
                        You can switch anytime without losing work.
                      </li>
                    </ul>
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
                    Control how your profiles, drafts, and scholarship data are handled.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ToggleRow
                      label="Store data on this device"
                      description="Keep your profiles and drafts in your browser so they’re not uploaded by default."
                      checked={storeLocally}
                      onCheckedChange={setStoreLocally}
                    />
                    <ToggleRow
                      label="Hide names in internal logs"
                      description="Replaces personal names with placeholders in analytics views."
                      checked={anonymize}
                      onCheckedChange={setAnonymize}
                    />
                    <ToggleRow
                      label="Share anonymous usage stats"
                      description="Helps improve the product by sending aggregate, non-identifying telemetry."
                      checked={telemetry}
                      onCheckedChange={setTelemetry}
                    />
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Your control
                    </p>
                    <p>
                      You can download, edit, or delete your data at any time. AI tools
                      help with drafting, but you always decide what to submit.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Authenticity guardrails
                    </p>
                    <p>
                      The system avoids inventing achievements. It uses scholarship
                      patterns to help you emphasize true experiences more effectively.
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
                    System health
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Live status of key features and integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatusTile
                      label="Environment"
                      value="Local app"
                      badge="Private"
                    />
                    <StatusTile
                      label="Claude integration"
                      value={mockClaude ? 'Offline mode' : 'Live API'}
                      badge={mockClaude ? 'Offline' : 'Live'}
                    />
                    <StatusTile
                      label="Pattern Lab"
                      value="Up to date"
                      badge="Synced"
                    />
                    <StatusTile
                      label="Draft Studio"
                      value="Online"
                      badge="Healthy"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-500/70 bg-amber-900/20 px-3 py-2 text-[11px] text-amber-100">
                    <div className="mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span className="font-medium">Connection notes</span>
                    </div>
                    <p>
                      If Claude is set to offline mode, drafting still works using your
                      saved patterns, and will switch back to live calls automatically
                      when re-enabled.
                    </p>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-300">
                    <p className="mb-1 font-medium text-zinc-100">
                      Troubleshooting
                    </p>
                    <p>
                      If something feels out of date, refresh Pattern Lab or re-paste a
                      scholarship description to re-analyze it.
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

/* -------------------------------------------------------------------------- */
/*                               NEBULA BACKDROP                              */
/* -------------------------------------------------------------------------- */

function NebulaBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-55">
      <div className="absolute -left-12 top-8 h-52 w-52 rounded-full bg-sky-500/22 blur-3xl" />
      <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-fuchsia-500/22 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-500/18 blur-3xl" />
      <div className="absolute bottom-8 right-20 h-44 w-44 rounded-full bg-amber-400/12 blur-3xl" />
    </div>
  )
}
