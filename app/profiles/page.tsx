'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { UserCircle2, Sparkles, Wand2, ChevronRight, BookOpenCheck, Upload } from 'lucide-react'
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
import { Spotlight } from '@/components/ui/spotlight'
import { NebulaBackdrop } from '@/components/ui/nebula-backdrop'

import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'
import type { DimensionId } from '@/types/dimensions'
import { EMPTY_FEATURES, type StudentProfile, type StudentStory } from '@/types/student-profile'

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
type StarterFile = { id: string; name: string; label: string; file: File; previewText: string }

const SCHOLARSHIP_TYPES: ScholarshipType[] = ['Merit', 'Community', 'STEM', 'Access']

const STARTER_DEFAULT = {
  name: '',
  university: '',
  program: '',
  year: '',
  gpa: '',
  gpaScale: '4',
  motivations: '',
  academics: '',
  leadership: '',
  challenges: '',
  goals: '',
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
  const updateProfile = useStudentProfileStore((s) => s.updateProfile)
  const addProfile = useStudentProfileStore((s) => s.addProfile)
  const loadMockProfiles = useStudentProfileStore((s) => s.loadMockProfiles)
  const removeProfile = useStudentProfileStore((s) => s.removeProfile)
  const selectedProfileId = useStudentProfileStore((s) => s.selectedProfileId)
  const setSelectedProfileId = useStudentProfileStore((s) => s.setSelectedProfileId)
  const searchParams = useSearchParams()

  const [targetType, setTargetType] = useState<ScholarshipType>('Merit')
  const [baseStoryDraft, setBaseStoryDraft] = useState<string>('')
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [stage, setStage] = useState<'basics1' | 'basics2' | 'questions'>('basics1')
  const [starter, setStarter] = useState({ ...STARTER_DEFAULT })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingFileLabel, setPendingFileLabel] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<StarterFile[]>([])
  const [profilePendingFile, setProfilePendingFile] = useState<File | null>(null)
  const [profileFileLabel, setProfileFileLabel] = useState('')
  const [profileFileLoading, setProfileFileLoading] = useState(false)
  const [profileFileError, setProfileFileError] = useState<string | null>(null)
  const [pendingSave, setPendingSave] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenError, setRegenError] = useState<string | null>(null)

  const steps = [
    {
      key: 'motivations',
      label: 'What drives you?',
      placeholder: 'Why this path, what matters to you, what sparked it.',
    },
    {
      key: 'academics',
      label: 'Academic highlight',
      placeholder: 'Project, GPA trend, research, a class win.',
    },
    {
      key: 'leadership',
      label: 'Leadership / impact',
      placeholder: 'Teams, community, teaching, initiatives you led.',
    },
    {
      key: 'challenges',
      label: 'Challenges',
      placeholder: 'Constraints you navigated: time, finances, access, resilience.',
    },
    {
      key: 'goals',
      label: 'Goals',
      placeholder: 'What you want next: internships, research, launches, impact.',
    },
  ] as const

  const [currentStep, setCurrentStep] = useState(0)

  const selectedStudent = useMemo(() => {
    if (profiles.length === 0) return undefined
    if (!selectedProfileId) return profiles[0]
    return profiles.find((s) => s.id === selectedProfileId) ?? profiles[0]
  }, [profiles, selectedProfileId])

  useEffect(() => {
    const unsub = useStudentProfileStore.persist?.onFinishHydration?.(() => setHydrated(true))
    if (useStudentProfileStore.persist?.hasHydrated?.()) setHydrated(true)
    return () => unsub?.()
  }, [])

  useEffect(() => {
    if (!profiles.find((p) => p.id === selectedProfileId) && profiles[0]?.id) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, selectedProfileId, setSelectedProfileId])

  useEffect(() => {
    if (!selectedStudent) return
    setBaseStoryDraft(selectedStudent.baseStory ?? '')
  }, [selectedStudent?.id, selectedStudent?.baseStory])

  const onProfileFieldChange = (field: keyof StudentProfile, value: any) => {
    if (!selectedStudent) return
    setPendingSave(true)
    const updated = { ...selectedStudent, [field]: value }
    setSelectedProfileId(updated.id)
    // local-only update
    const nextProfiles = profiles.map((p) => (p.id === updated.id ? updated : p))
    // we don't want to mutate store directly; rely on explicit save
    // but keep local view consistent
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    useStudentProfileStore.setState({ profiles: nextProfiles })
  }

  const showMissingNotice = searchParams?.get('missing') === '1'
  const profileIncomplete =
    !selectedStudent ||
    !selectedStudent.name?.trim() ||
    !selectedStudent.program?.trim() ||
    !selectedStudent.year?.trim() ||
    !selectedStudent.university?.trim() ||
    selectedStudent.gpa == null

  const parseGpa = (value: string) => {
    if (!value.trim()) return undefined
    const num = parseFloat(value)
    return Number.isFinite(num) ? num : undefined
  }

  const buildStoriesFromStarter = (): StudentStory[] => {
    const stories: StudentStory[] = []
    const idBase = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    if (starter.leadership || starter.challenges || starter.motivations) {
      const dims: DimensionId[] = []
      if (starter.leadership) dims.push('leadership', 'community')
      if (starter.challenges) dims.push('adversity', 'need')
      if (!dims.length) dims.push('community')

      stories.push({
        id: `${idBase}-impact`,
        title: starter.leadership ? 'Leadership & community impact' : 'Impact under constraints',
        summary: [
          starter.leadership?.trim(),
          starter.challenges?.trim(),
          starter.motivations?.trim(),
        ]
          .filter(Boolean)
          .join(' '),
        dimensionTags: Array.from(new Set(dims)),
      })
    }

    if (starter.academics || starter.goals || starter.program) {
      const dims: DimensionId[] = ['academics']
      dims.push('innovation')
      if (starter.program) dims.push('research')
      stories.push({
        id: `${idBase}-academics`,
        title: starter.academics ? 'Academic highlight' : 'Academic direction',
        summary: [
          starter.academics?.trim(),
          starter.program?.trim(),
          starter.goals?.trim(),
        ]
          .filter(Boolean)
          .join(' '),
        dimensionTags: Array.from(new Set(dims)),
      })
    }

    return stories.slice(0, 2)
  }

  const normalizeFeatures = (features: Record<string, number> | undefined) => {
    const safe: Record<DimensionId, number> = { ...EMPTY_FEATURES }
    Object.entries(features ?? {}).forEach(([key, val]) => {
      if (key in safe && typeof val === 'number' && Number.isFinite(val)) {
        safe[key as DimensionId] = Math.min(1, Math.max(0, val))
      }
    })
    return safe
  }

  const normalizeStats = (stats: any): StudentProfile['stats'] => ({
    scholarshipsMatched:
      typeof stats?.scholarshipsMatched === 'number' && stats.scholarshipsMatched >= 0
        ? Math.round(stats.scholarshipsMatched)
        : 0,
    draftsGenerated:
      typeof stats?.draftsGenerated === 'number' && stats.draftsGenerated >= 0
        ? Math.round(stats.draftsGenerated)
        : 0,
    avgAlignment:
      typeof stats?.avgAlignment === 'number' && stats.avgAlignment >= 0
        ? Math.min(100, Math.round(stats.avgAlignment))
        : 0,
  })

  const onChange =
    (field: keyof typeof starter) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setStarter((prev) => ({ ...prev, [field]: e.target.value }))

  const renderSaveStatus = () => {
    if (pendingSave) return <span className="text-[11px] text-amber-200">Unsaved changes</span>
    if (lastSavedAt) return <span className="text-[11px] text-emerald-300">Saved</span>
    return <span className="text-[11px] text-zinc-500">No changes</span>
  }

  const handleStepChange = (value: string) => {
    const key = steps[currentStep]?.key
    if (!key) return
    const nextVal = value.slice(0, 500)
    setStarter((prev) => ({ ...prev, [key]: nextVal }))
  }

  const handleAddFile = async () => {
    if (!pendingFile || !pendingFileLabel.trim()) return
    const textContent = await pendingFile.text()
    const previewText = textContent.slice(0, 4000)
    setUploadedFiles((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: pendingFile.name,
        label: pendingFileLabel.trim(),
        file: pendingFile,
        previewText,
      },
    ])
    setPendingFile(null)
    setPendingFileLabel('')
  }

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleProfileAddFile = async () => {
    if (!selectedStudent || !profilePendingFile || !profileFileLabel.trim()) return
    setProfileFileLoading(true)
    setProfileFileError(null)
    try {
      const formData = new FormData()
      formData.append('file', profilePendingFile)
      formData.append('label', profileFileLabel.trim())

      const res = await fetch(`/api/profiles/${selectedStudent.id}/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const files = (await res.json()) as StudentProfile['contextFiles']
      updateProfile(selectedStudent.id, { contextFiles: files ?? [] })
      setProfilePendingFile(null)
      setProfileFileLabel('')
    } catch (err: any) {
      setProfileFileError(err?.message ?? 'Failed to upload file')
    } finally {
      setProfileFileLoading(false)
    }
  }

  const handleProfileRemoveFile = async (fileId: string) => {
    if (!selectedStudent) return
    setProfileFileLoading(true)
    setProfileFileError(null)
    try {
      const res = await fetch(`/api/profiles/${selectedStudent.id}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      const files = (await res.json()) as StudentProfile['contextFiles']
      updateProfile(selectedStudent.id, { contextFiles: files ?? [] })
    } catch (err: any) {
      setProfileFileError(err?.message ?? 'Failed to remove file')
    } finally {
      setProfileFileLoading(false)
    }
  }

  const handleAdvance = async () => {
    if (creatingProfile) return

    if (stage === 'basics1') {
      if (!starter.name.trim() || !starter.university.trim()) return
      setStage('basics2')
      return
    }
    if (stage === 'basics2') {
      if (
        !starter.program.trim() ||
        !starter.year.trim() ||
        starter.gpa === '' ||
        starter.gpaScale === ''
      )
        return
      setStage('questions')
      return
    }
    const currentVal = starter[steps[currentStep].key].trim()
    if (!currentVal) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
      return
    }
    await createProfileFromStarter()
  }

  const composeBaseStory = () => {
    const parts = [
      starter.motivations && `Motivation: ${starter.motivations.trim()}`,
      starter.academics && `Academic highlight: ${starter.academics.trim()}`,
      starter.leadership && `Leadership/impact: ${starter.leadership.trim()}`,
      starter.challenges && `Challenges: ${starter.challenges.trim()}`,
      starter.goals && `Goals: ${starter.goals.trim()}`,
    ].filter(Boolean)
    return parts.join(' ')
  }

  const resetStarterForm = () => {
    setStarter({ ...STARTER_DEFAULT })
    setPendingFile(null)
    setPendingFileLabel('')
    setUploadedFiles([])
    setCurrentStep(0)
    setStage('basics1')
  }

  const uploadContextFiles = async (profileId: string, files: StarterFile[]) => {
    if (!files.length) return
    let latestFiles: StudentProfile['contextFiles'] | null = null

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('label', file.label)

      const res = await fetch(`/api/profiles/${profileId}/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }
      latestFiles = (await res.json()) as StudentProfile['contextFiles']
    }

    if (latestFiles) {
      useStudentProfileStore.setState((state) => ({
        profiles: state.profiles.map((p) =>
          p.id === profileId ? { ...p, contextFiles: latestFiles ?? [] } : p
        ),
      }))
    }
  }

  const createProfileFromStarter = async () => {
    const gpa = parseGpa(starter.gpa)
    const gpaScale = starter.gpaScale ? (parseInt(starter.gpaScale, 10) as 4 | 12 | 100) : undefined
    setCreateError(null)
    setCreatingProfile(true)

    try {
      const response = await fetch('/api/profiles/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          basics: {
            name: starter.name.trim(),
            university: starter.university.trim(),
            program: starter.program.trim(),
            year: starter.year.trim(),
            gpa,
            gpaScale,
          },
          answers: {
            motivations: starter.motivations,
            academics: starter.academics,
            leadership: starter.leadership,
            challenges: starter.challenges,
            goals: starter.goals,
          },
          files: uploadedFiles.map((f) => ({
            name: f.name,
            label: f.label,
            text: f.previewText,
          })),
        }),
      })

      const aiData = (await response.json()) as Partial<StudentProfile> & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(aiData?.error ?? 'Failed to generate profile')
      }

      const nextBaseStory = aiData.baseStory?.trim() || composeBaseStory() || undefined
      const nextFeatures = normalizeFeatures(aiData.features)
      const nextStats = normalizeStats(aiData.stats)
      const starterStories = buildStoriesFromStarter()

      const created = await addProfile({
        name: starter.name.trim(),
        university: starter.university.trim(),
        program: starter.program.trim(),
        year: starter.year.trim(),
        gpa,
        gpaScale,
        tags: Array.isArray(aiData.tags) ? aiData.tags : [],
        features: nextFeatures,
        stories: starterStories,
        recommendedScholarshipIds: Array.isArray(aiData.recommendedScholarshipIds)
          ? aiData.recommendedScholarshipIds
          : [],
        baseStory: nextBaseStory,
        stats: nextStats,
      })

      if (!created) {
        throw new Error('Profile could not be saved')
      }

      // Upload any supporting files to S3 and sync local store
      if (uploadedFiles.length > 0) {
        await uploadContextFiles(created.id, uploadedFiles)
      }

      resetStarterForm()
      setShowQuickCreate(false)
    } catch (err: any) {
      setCreateError(err?.message ?? 'Could not create profile')
    } finally {
      setCreatingProfile(false)
    }
  }

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

  const renderStarterPanel = () => {
    const currentKey = steps[currentStep].key
    const currentValue = starter[currentKey]
    const wordCount = currentValue.trim() ? currentValue.trim().split(/\s+/).length : 0
    const charCount = currentValue.length

    return (
      <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black px-4 py-10 text-zinc-50">
        <NebulaBackdrop />
        <Card className="text-card-foreground relative z-10 w-full max-w-4xl overflow-hidden border border-zinc-800/70 bg-zinc-950/95 py-6 shadow-2xl shadow-black/40">
          <CardHeader className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Profiles</p>
            <CardTitle className="text-2xl font-semibold text-zinc-50">Get started</CardTitle>
            <CardDescription className="text-sm text-zinc-400">
              Add your basics, then answer a few prompts. We&apos;ll compose your base story. Or
              load a mock to see a demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Left: onboarding flow */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/85 p-4 shadow-lg shadow-black/30">
              <Spotlight className="pointer-events-none from-fuchsia-500/35 via-purple-500/25 to-sky-400/15 blur-3xl" size={260} />
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(147,51,234,0.32),transparent_60%),radial-gradient(120%_120%_at_100%_0%,rgba(236,72,153,0.25),transparent_60%),radial-gradient(120%_120%_at_50%_120%,rgba(59,130,246,0.18),transparent_70%)]" />
              </div>

              <div className="relative z-10 space-y-3">
                {stage === 'basics1' && (
                  <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 backdrop-blur-sm">
                    <p className="text-sm font-medium text-zinc-50">Start with your name and school</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Full name</label>
                        <Input value={starter.name} onChange={onChange('name')} placeholder="Full name" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">University</label>
                        <Input value={starter.university} onChange={onChange('university')} placeholder="University" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        className="border border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                        onClick={() => setStage('basics2')}
                        disabled={!starter.name.trim() || !starter.university.trim()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {stage === 'basics2' && (
                  <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 backdrop-blur-sm">
                    <p className="text-sm font-medium text-zinc-50">Add program details</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Program</label>
                        <Input value={starter.program} onChange={onChange('program')} placeholder="Program" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">Year</label>
                        <Input value={starter.year} onChange={onChange('year')} placeholder="Year (e.g., 3rd year)" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">GPA</label>
                        <Input type="number" step="0.01" value={starter.gpa} onChange={onChange('gpa')} placeholder="GPA" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-zinc-400">GPA scale</label>
                        <Input type="number" step="1" value={starter.gpaScale} onChange={onChange('gpaScale')} placeholder="GPA scale (4, 12, 100)" className="h-9 border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="ghost"
                        className="text-zinc-300 hover:bg-zinc-900"
                        onClick={() => setStage('basics1')}
                      >
                        Back
                      </Button>
                      <Button
                        className="border border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                        onClick={() => setStage('questions')}
                        disabled={
                          !starter.program.trim() ||
                          !starter.year.trim() ||
                          starter.gpa === '' ||
                          starter.gpaScale === ''
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {stage === 'questions' && (
                  <div className="space-y-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm text-zinc-200">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step {currentStep + 1} of {steps.length}</p>
                        <p className="text-sm font-medium text-zinc-50">{steps[currentStep].label}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {steps.map((_, idx) => (
                          <span
                            key={idx}
                            className={`h-2 w-2 rounded-full ${idx === currentStep ? 'bg-pink-500' : 'bg-zinc-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{steps[currentStep].placeholder}</span>
                        <span>{wordCount} words | {charCount}/500 chars</span>
                      </div>
                      <Textarea value={starter[steps[currentStep].key]} onChange={(e) => handleStepChange(e.target.value)} placeholder={steps[currentStep].placeholder} className="min-h-[140px] border-zinc-800 bg-zinc-900/80 text-sm text-zinc-100" />
                      <div className="flex h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full bg-pink-500 transition-all"
                          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="ghost"
                        className="text-zinc-300 hover:bg-zinc-900"
                        onClick={() => setStage('basics2')}
                      >
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          className="border border-fuchsia-300/60 bg-fuchsia-500/15 text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                          onClick={() => void handleAdvance()}
                          disabled={
                            !starter.name.trim() ||
                            !starter.university.trim() ||
                            !starter[steps[currentStep].key].trim() ||
                            creatingProfile
                          }
                        >
                          {currentStep === steps.length - 1 ? (
                            <div className="flex items-center gap-2">
                              {creatingProfile ? (
                                <span className="h-3 w-3 animate-spin rounded-full border border-fuchsia-200/70 border-t-transparent" />
                              ) : null}
                              <span>{creatingProfile ? 'Creating profile...' : 'Create my profile'}</span>
                            </div>
                          ) : (
                            'Next'
                          )}
                        </Button>
                      </div>
                    </div>
                    {createError ? (
                      <p className="text-[11px] text-rose-200">{createError}</p>
                    ) : null}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button variant="outline" className="border-zinc-700 text-zinc-100 hover:bg-zinc-900" onClick={() => { loadMockProfiles(); setShowQuickCreate(false) }}>
                    Load a mock profile
                  </Button>
                  {profiles.length > 0 ? (
                    <Button variant="ghost" className="text-zinc-300 hover:bg-zinc-900" onClick={() => { setShowQuickCreate(false) }}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right: explainer */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-800/70 bg-zinc-950/85 p-4 text-sm text-zinc-200 shadow-lg shadow-black/30 backdrop-blur-sm">
              <Spotlight className="pointer-events-none absolute bottom-[-70px] right-[-40px] from-fuchsia-500/35 via-purple-500/25 to-sky-400/15 blur-3xl" size={260} />
              <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(147,51,234,0.32),transparent_60%),radial-gradient(120%_120%_at_100%_0%,rgba(236,72,153,0.25),transparent_60%),radial-gradient(120%_120%_at_50%_120%,rgba(59,130,246,0.18),transparent_70%)]" />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-50">
                    Contextual files
                  </p>
                </div>

                <div className="mt-1 space-y-2">
                  <p className="text-xs text-zinc-100">Add files to include in your base story.</p>
                  <div className="space-y-2 text-xs">
                    <div className="space-y-1">
                      <Input
                        id="starter-support-file"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setPendingFile(file)
                        }}
                      />
                      <label
                        htmlFor="starter-support-file"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-fuchsia-300/60 bg-fuchsia-500/15 px-3 py-1.5 text-[11px] text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Upload</span>
                      </label>
                      {pendingFile ? (
                        <p className="text-[11px] text-zinc-400">
                          Selected: <span className="text-zinc-100">{pendingFile.name}</span>
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-zinc-400">Label for this file</p>
                      <Input
                        placeholder="e.g., Transcript or Resume"
                        value={pendingFileLabel}
                        onChange={(e) => setPendingFileLabel(e.target.value)}
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-fuchsia-300/60 bg-fuchsia-500/15 px-3 text-[11px] text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                      onClick={() => void handleAddFile()}
                      disabled={!pendingFile || !pendingFileLabel.trim()}
                    >
                      Add file
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {uploadedFiles.map((file) => (
                        <Badge
                          key={file.id}
                          variant="outline"
                          className="flex items-center gap-1 border-fuchsia-500/70 bg-fuchsia-950/50 px-2 py-0.5 text-[10px] text-fuchsia-100"
                        >
                          <span className="font-medium">{file.label}</span>
                          <span className="ml-1 text-[10px] text-fuchsia-200/80">
                            ({file.name})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="ml-1 rounded-full px-1 text-[10px] text-fuchsia-200/80 hover:bg-fuchsia-800/60 hover:text-fuchsia-50"
                            aria-label="Remove file"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hydrated) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-200">
        <NebulaBackdrop />
        <div className="relative z-10 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 shadow-lg shadow-black/40">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-white" />
          <span className="text-sm">Loading profile data...</span>
        </div>
      </div>
    )
  }

  if (!profiles.length || showQuickCreate) {
    return renderStarterPanel()
  }

  if (!selectedStudent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-200">
        No profiles found. Create one to continue.
      </div>
    )
  }

  const stats = selectedStudent.stats

  const handleBaseStoryChange = (value: string) => {
    setBaseStoryDraft(value)
    setPendingSave(true)
  }

  const handleRegenerateBaseStory = async () => {
    if (!selectedStudent || regenLoading) return
    setRegenError(null)
    setRegenLoading(true)
    try {
      const response = await fetch('/api/profiles/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          baseStory: baseStoryDraft.trim() || selectedStudent.baseStory || '',
          basics: {
            name: selectedStudent.name,
            university: selectedStudent.university,
            program: selectedStudent.program,
            year: selectedStudent.year,
            gpa: selectedStudent.gpa,
            gpaScale: selectedStudent.gpaScale,
          },
          files: (selectedStudent.contextFiles ?? []).map((f) => ({
            name: f.name,
            label: f.label,
          })),
        }),
      })

      const data = (await response.json()) as Partial<StudentProfile> & { error?: string }
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to regenerate')
      }

      const nextBase = data.baseStory?.trim() || baseStoryDraft
      setBaseStoryDraft(nextBase)
      await updateProfile(selectedStudent.id, {
        baseStory: nextBase,
        features: data.features ? normalizeFeatures(data.features as any) : selectedStudent.features,
        recommendedScholarshipIds: Array.isArray(data.recommendedScholarshipIds)
          ? data.recommendedScholarshipIds
          : selectedStudent.recommendedScholarshipIds,
        stats: data.stats ? normalizeStats(data.stats) : selectedStudent.stats,
      })
      setPendingSave(false)
      setLastSavedAt(new Date().toISOString())
    } catch (err: any) {
      setRegenError(err?.message ?? 'Could not regenerate story')
    } finally {
      setRegenLoading(false)
    }
  }

  return (
    <motion.div
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050013] via-[#050010] to-black text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial={false}
      animate="visible"
    >
      <NebulaBackdrop />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4 backdrop-blur-sm">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">Profiles</h1>
            <p className="text-xs text-zinc-500">
              Manage profiles, keep a reusable base story, and see how each profile aligns with
              different scholarship types.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>System status: Online</span>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 rounded-full border-fuchsia-500/60 bg-fuchsia-900/30 text-xs font-medium text-fuchsia-100 hover:bg-fuchsia-900/50"
              onClick={() => setShowQuickCreate(true)}
            >
              + New profile
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          {showMissingNotice ? (
            <div className="mb-4 rounded-md border border-amber-500/50 bg-amber-900/30 px-4 py-3 text-sm text-amber-50">
              Complete your profile basics (name, university, program, year, GPA) to unlock the rest
              of the app.
            </div>
          ) : null}
          <motion.div
            className="space-y-6"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="visible"
          >
            {/* SECTION 1 – PROFILE DETAILS (spotlight local to card) */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/75 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
                  <div className="absolute inset-0 bg-[radial-gradient(95%_85%_at_0%_0%,rgba(168,85,247,0.26),transparent_60%),radial-gradient(105%_90%_at_100%_15%,rgba(236,72,153,0.26),transparent_60%),radial-gradient(115%_95%_at_42%_100%,rgba(59,130,246,0.22),transparent_64%),radial-gradient(85%_75%_at_60%_40%,rgba(244,114,182,0.22),transparent_66%)]" />
                </div>
                <Spotlight
                  className="pointer-events-none from-fuchsia-500/35 via-purple-500/25 to-sky-300/18 blur-3xl"
                  size={240}
                />

                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <UserCircle2 className="h-4 w-4 text-fuchsia-300" />
                    Profile Details
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    Select a profile to review key details and the stories used for tailored
                    applications.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Select a profile</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 border-fuchsia-500/70 bg-zinc-950/70 px-2 text-[11px] text-fuchsia-100 hover:bg-fuchsia-900/40"
                            onClick={() => setShowQuickCreate(true)}
                          >
                            + New
                          </Button>
                          {selectedStudent ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 border border-rose-500/70 bg-rose-950/50 px-2 text-[11px] text-rose-100 hover:bg-rose-900/60"
                              onClick={() => {
                                removeProfile(selectedStudent.id)
                              }}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1 text-[11px]">
                        {profiles.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedProfileId(student.id)
                            }}
                            className={`flex w-full flex-col items-start rounded-lg border px-2.5 py-2.5 text-left transition ${
                              selectedStudent.id === student.id
                                ? 'border-fuchsia-500/80 bg-fuchsia-950/60 text-fuchsia-50'
                                : 'border-zinc-700/70 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900'
                            }`}
                          >
                            <span className="text-[12px] font-medium">{student.name}</span>
                            <span className="mt-0.5 text-[10px] text-zinc-400">
                              {student.program} · {student.year}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-zinc-300">Profile basics</label>
                        {renderSaveStatus()}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={selectedStudent.name}
                          onChange={(e) => onProfileFieldChange('name', e.target.value)}
                          placeholder="Full name"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          value={selectedStudent.university ?? ''}
                          onChange={(e) => onProfileFieldChange('university', e.target.value)}
                          placeholder="University"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          value={selectedStudent.program}
                          onChange={(e) => onProfileFieldChange('program', e.target.value)}
                          placeholder="Program"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          value={selectedStudent.year}
                          onChange={(e) => onProfileFieldChange('year', e.target.value)}
                          placeholder="Year"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={selectedStudent.gpa ?? ''}
                          onChange={(e) =>
                            onProfileFieldChange(
                              'gpa',
                              e.target.value === '' ? undefined : parseFloat(e.target.value),
                            )
                          }
                          placeholder="GPA"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          type="number"
                          step="1"
                          value={selectedStudent.gpaScale ?? 4}
                          onChange={(e) =>
                            onProfileFieldChange(
                              'gpaScale',
                              e.target.value === ''
                                ? undefined
                                : (parseInt(e.target.value, 10) as 4 | 12 | 100),
                            )
                          }
                          placeholder="GPA scale"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          value={selectedStudent.location ?? ''}
                          onChange={(e) => onProfileFieldChange('location', e.target.value)}
                          placeholder="Location"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        />
                        <Input
                          value={selectedStudent.enrollmentStatus ?? ''}
                          onChange={(e) =>
                            onProfileFieldChange('enrollmentStatus', e.target.value as any)
                          }
                          placeholder="Enrollment"
                          className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
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
                      {profileIncomplete ? (
                        <p className="text-[11px] text-amber-200">
                          Complete the basics to unlock other sections.
                        </p>
                      ) : null}
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
                        <p className="text-[11px] text-zinc-400">{story.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {story.dimensionTags.map((dimId) => {
                            const dim = DIMENSIONS.find((d) => d.id === dimId)!
                            return (
                              <Badge
                                key={dimId}
                                variant="outline"
                                className="border-fuchsia-500/70 bg-fuchsia-950/40 px-1.5 py-0.5 text-[10px] text-fuchsia-100"
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
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-zinc-300">
                        Base story for this profile
                      </label>
                    </div>
                    <Textarea
                      rows={6}
                      value={baseStoryDraft}
                      onChange={(e) => handleBaseStoryChange(e.target.value)}
                      placeholder="Write a single, reusable story that captures background, goals, and key experiences. Draft Studio will tailor this for each scholarship."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                    />
                <div className="flex justify-end">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 border border-zinc-700 bg-zinc-950/70 px-3 text-[11px] text-zinc-100 hover:bg-zinc-900"
                      disabled={regenLoading || profileFileLoading}
                      onClick={() => void handleRegenerateBaseStory()}
                    >
                      {regenLoading ? (
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 animate-spin rounded-full border border-zinc-300/80 border-t-transparent" />
                          <span>Regenerating</span>
                        </div>
                      ) : (
                        'Regenerate'
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 border border-emerald-400/60 bg-emerald-500/15 px-3 text-[11px] text-emerald-100 hover:bg-emerald-500/25 hover:border-emerald-300/80"
                        disabled={!pendingSave}
                        onClick={async () => {
                          if (!selectedStudent) return
                          setPendingSave(false)
                          try {
                            await updateProfile(selectedStudent.id, {
                              baseStory: baseStoryDraft.trim(),
                              name: selectedStudent.name,
                              university: selectedStudent.university,
                              program: selectedStudent.program,
                              year: selectedStudent.year,
                              gpa: selectedStudent.gpa,
                              gpaScale: selectedStudent.gpaScale,
                            })
                            setLastSavedAt(new Date().toISOString())
                          } catch (err) {
                            setPendingSave(true)
                          }
                        }}
                    >
                      Save changes
                    </Button>
                  </div>
                </div>
                {regenError ? (
                  <p className="text-[11px] text-rose-200">{regenError}</p>
                ) : null}
              </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-300">Context files</label>
                    <p className="text-[11px] text-zinc-500">
                      Keep track of essays or resumes you want to reference with this profile.
                    </p>
                    {profileFileError ? (
                      <p className="text-[11px] text-red-300">{profileFileError}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.contextFiles && selectedStudent.contextFiles.length > 0 ? (
                        selectedStudent.contextFiles.map((file) => (
                          <Badge
                            key={file.id}
                            variant="outline"
                            className="flex items-center gap-1 border-fuchsia-500/70 bg-fuchsia-950/40 px-2 py-0.5 text-[10px] text-fuchsia-100"
                          >
                            <span className="font-medium">{file.label}</span>
                            <span className="ml-1 text-[10px] text-fuchsia-200/80">
                              ({file.name})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleProfileRemoveFile(file.id)}
                              className="ml-1 rounded-full px-1 text-[10px] text-fuchsia-200/80 hover:bg-fuchsia-800/60 hover:text-fuchsia-50"
                              aria-label="Remove file"
                              disabled={profileFileLoading}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-zinc-500">
                          No files added yet.
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      <div className="space-y-1">
                        <Input
                          id="profile-context-file"
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            setProfilePendingFile(file)
                          }}
                        />
                        <label
                          htmlFor="profile-context-file"
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-fuchsia-300/60 bg-fuchsia-500/15 px-3 py-1.5 text-[11px] text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                        >
                          <Upload className="h-3 w-3" />
                          <span>Upload</span>
                        </label>
                        {profilePendingFile ? (
                          <p className="text-[11px] text-zinc-400">
                            Selected:{' '}
                            <span className="text-zinc-100">{profilePendingFile.name}</span>
                          </p>
                        ) : null}
                      </div>
                      <Input
                        placeholder="Label (e.g., Main essay)"
                        value={profileFileLabel}
                        onChange={(e) => setProfileFileLabel(e.target.value)}
                        className="h-8 max-w-[180px] border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100"
                        disabled={profileFileLoading}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 border border-fuchsia-300/60 bg-fuchsia-500/15 px-3 text-[11px] text-fuchsia-50 backdrop-blur-md hover:bg-fuchsia-500/25 hover:border-fuchsia-200/80"
                        onClick={handleProfileAddFile}
                        disabled={profileFileLoading || !profilePendingFile || !profileFileLabel.trim()}
                      >
                        {profileFileLoading ? 'Uploading...' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* SECTION 2 – RADAR + MESSAGING (unchanged layout, nebula/spotlights) */}
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/75 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
                  <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(129,140,248,0.22),transparent_60%),radial-gradient(120%_120%_at_100%_0%,rgba(244,114,182,0.22),transparent_60%),radial-gradient(120%_120%_at_50%_120%,rgba(59,130,246,0.26),transparent_70%)]" />
                </div>
                <Spotlight
                  className="pointer-events-none absolute bottom-[-70px] right-[-40px] z-0 from-fuchsia-500/35 via-purple-500/25 to-sky-300/20 blur-3xl"
                  size={200}
                />

                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-fuchsia-300" />
                    Alignment constellation
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    Two overlaid profiles show how closely this student matches the selected
                    scholarship type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3 text-xs">
                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                    <p className="mb-1 text-[11px] text-zinc-400">Scholarship type</p>
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
                            <stop offset="0%" stopColor="rgba(56,189,248,0.6)" />
                            <stop offset="100%" stopColor="rgba(129,140,248,0.5)" />
                          </linearGradient>
                          <linearGradient id="scholarFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(244,114,182,0.55)" />
                            <stop offset="100%" stopColor="rgba(217,70,239,0.45)" />
                          </linearGradient>
                        </defs>

                        <PolarGrid stroke="rgba(63,63,70,0.7)" />
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
                          stroke="rgba(56,189,248,0.95)"
                          fill="url(#studentFill)"
                          fillOpacity={0.6}
                          strokeWidth={1.6}
                          filter="url(#studentGlow)"
                        />
                        <Radar
                          name="scholarship"
                          dataKey="scholarship"
                          stroke="rgba(244,114,182,0.95)"
                          fill="url(#scholarFill)"
                          fillOpacity={0.5}
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
                      If the student shape extends beyond the scholarship shape, you already have
                      strong evidence to lead with. Gaps point to areas where reframing or adding a
                      story could improve fit.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/75 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
                  <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(244,114,182,0.22),transparent_60%),radial-gradient(120%_120%_at_100%_0%,rgba(147,51,234,0.26),transparent_60%),radial-gradient(120%_120%_at_50%_120%,rgba(59,130,246,0.22),transparent_70%)]" />
                </div>
                <Spotlight
                  className="pointer-events-none absolute bottom-[-70px] left-[-40px] z-0 from-fuchsia-500/35 via-purple-500/25 to-sky-300/18 blur-3xl"
                  size={200}
                />

                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Sparkles className="h-4 w-4 text-fuchsia-300" />
                    Summary and messaging ideas
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-300">
                    A quick snapshot of progress, plus guidance for tailoring drafts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 text-xs">
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
                    <p className="mb-1 text-[11px] font-medium text-zinc-100">Scholarship focus</p>
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
                              ? 'border-fuchsia-500/80 bg-fuchsia-950/50 text-fuchsia-100'
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
                      <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
                      <span>Draft Studio uses these angles to tailor your story.</span>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      className="h-8 gap-1 rounded-full bg-fuchsia-600 text-xs text-white hover:bg-fuchsia-500"
                    >
                      <Link href="/drafts">
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>Open in Draft Studio</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
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
          accent ? 'text-fuchsia-300' : 'text-zinc-50'
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
      <span className="text-[9px] uppercase tracking-wide text-zinc-500">{label}</span>
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
