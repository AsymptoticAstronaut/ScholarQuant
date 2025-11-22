'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Github,
  Sparkles,
  BookOpenCheck,
  Loader2,
  Wand2,
  ChevronRight,
  RotateCcw,
  MessageSquarePlus,
  FilePenLine,
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

// Tiptap
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mark } from '@tiptap/core'

type DimensionId =
  | 'academics'
  | 'leadership'
  | 'community'
  | 'need'
  | 'innovation'
  | 'research'
  | 'adversity'

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

type ScholarshipOption = {
  id: string
  name: string
  type: ScholarshipType
  priorities: DimensionId[]
  weights?: Record<DimensionId, number>
  description?: string
  winnerPatterns?: {
    id: string
    label: string
    description: string
    relatedDimensions: DimensionId[]
    strength: number
    evidenceCount: number
    preferredMetrics: string[]
    do: string[]
    dont: string[]
    length: number
  }[]
}

type DraftFocus = 'balanced' | 'impact' | 'technical' | 'resilience'

type RevisionRequest = {
  id: string
  paragraphIndex?: number
  instruction: string
  createdAt: string
}

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = { duration: 0.3 }

const DIMENSION_IDS: DimensionId[] = [
  'academics',
  'leadership',
  'community',
  'need',
  'innovation',
  'research',
  'adversity',
]

const AUTHENTICITY_CONSTRAINTS = [
  'Do not add experiences that are not in my base story.',
  'Keep my voice natural and specific.',
  'Preserve key facts, timelines, and outcomes.',
]

// Fallback demo draft if generation fails / API key missing
const DEMO_DRAFT = `Growing up as a first-generation student, I learned early that ambition without community is fragile. In high school I began tutoring classmates who were struggling in math and science, and I kept noticing the same pattern: once someone fell behind, they stopped seeing themselves as “the kind of person” who belonged in STEM. I decided to change that, starting small by running weekly peer-support circles after school and building lightweight study guides that broke concepts into friendly, repeatable steps.

At the University of Toronto, I carried that habit into everything I do. As a teaching assistant with the Gateway Coding Club, I helped over 130 middle-school students build confidence in Python and robotics. Rather than focusing on perfect solutions, we celebrated iterations and real-world problem solving. The result was a 40% increase in returning students the following term, and several of our learners went on to present projects at their school showcase for the first time.

Outside the classroom, I co-founded Wonder, an educational platform that blends literacy and STEM games for younger learners. I led the product build, coordinated a small volunteer team, and worked directly with families to ensure the tool met real needs. We shipped a working prototype in eight weeks and are now piloting with community partners. The project sharpened my technical depth, but more importantly it reinforced my commitment to accessible learning pathways.

This scholarship would let me scale that impact. I want to deepen my research in educational technology and human-centered AI, while continuing to mentor students who don’t yet see themselves reflected in these spaces. I’ve learned that the best outcomes happen when you pair strong execution with empathy for the people you’re serving, and I’m eager to keep building systems that make opportunity feel reachable.`

function typeBadge(type: ScholarshipType) {
  const map: Record<ScholarshipType, string> = {
    Merit: 'Merit',
    Community: 'Community',
    STEM: 'STEM / Research',
    Access: 'Access / Equity',
  }
  return map[type]
}

function buildWeights(
  weights: Record<DimensionId, number> | undefined,
  priorities: DimensionId[]
): Record<DimensionId, number> {
  if (weights) return weights
  const base = DIMENSION_IDS.reduce(
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
  student: StudentProfile | null,
  scholarship: ScholarshipOption
) {
  if (!student) return 0
  const weights = buildWeights(scholarship.weights, scholarship.priorities)
  return DIMENSION_IDS.reduce((score, dimension) => {
    const feature = student.features?.[dimension] ?? 0
    return score + feature * (weights[dimension] ?? 0)
  }, 0)
}

// Convert plain text to simple paragraph HTML for Tiptap
function textToHTML(text: string) {
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (!paras.length) return '<p></p>'
  return paras.map((p) => `<p>${esc(p)}</p>`).join('')
}

// Simple insertion detector between prev and next text.
// Highlights only NEW inserted run (single-run heuristic).
function computeInsertedRun(prev: string, next: string) {
  if (next.length <= prev.length) return null
  let i = 0
  const minLen = Math.min(prev.length, next.length)
  while (i < minLen && prev[i] === next[i]) i++

  let jPrev = prev.length - 1
  let jNext = next.length - 1
  while (jPrev >= i && jNext >= i && prev[jPrev] === next[jNext]) {
    jPrev--
    jNext--
  }

  const from = i
  const to = jNext + 1
  if (from >= to) return null
  return { from, to }
}

// Tiptap marks
const RewriteMark = Mark.create({
  name: 'rewrite',
  inclusive: true,
  addAttributes() {
    return {}
  },
  parseHTML() {
    return [{ tag: 'span[data-rewrite="true"]' }]
  },
  renderHTML() {
    return [
      'span',
      {
        'data-rewrite': 'true',
        class:
          // ~30% more vibrant highlight
          'rounded-[2px] bg-sky-500/40 text-sky-50 px-[1px] -mx-[1px]',
      },
      0,
    ]
  },
})

const LockedMark = Mark.create({
  name: 'locked',
  inclusive: true,
  addAttributes() {
    return {}
  },
  parseHTML() {
    return [{ tag: 'span[data-locked="true"]' }]
  },
  renderHTML() {
    return [
      'span',
      {
        'data-locked': 'true',
        class:
          // ~30% more vibrant highlight
          'rounded-[2px] bg-emerald-500/40 text-emerald-50 px-[1px] -mx-[1px]',
      },
      0,
    ]
  },
})

type EditMode = 'rewrite' | 'locked'

function extractLockedSegments(editor: ReturnType<typeof useEditor>) {
  if (!editor) return []
  const segments: string[] = []
  let current = ''

  editor.state.doc.descendants((node) => {
    if (!node.isText) {
      if (current) {
        segments.push(current)
        current = ''
      }
      return true
    }

    const isLocked = node.marks.some((m) => m.type.name === 'locked')
    const text = node.text ?? ''

    if (isLocked) {
      current += text
    } else {
      if (current) {
        segments.push(current)
        current = ''
      }
    }

    return true
  })

  if (current) segments.push(current)
  return segments.filter((s) => s.trim().length > 0)
}

function reapplyLockedMarks(
  editor: ReturnType<typeof useEditor>,
  lockedSegments: string[]
) {
  if (!editor || !lockedSegments.length) return
  const fullText = editor.getText()
  let cursor = 0

  lockedSegments.forEach((seg) => {
    const idx = fullText.indexOf(seg, cursor)
    if (idx === -1) return
    const from = idx + 1 // ProseMirror positions are 1-based
    const to = idx + seg.length + 1
    editor
      .chain()
      .setTextSelection({ from, to })
      .setMark('locked')
      .run()
    cursor = idx + seg.length
  })

  editor.commands.setTextSelection(editor.state.selection)
}

/**
 * Serialize editor content with directives so the API can enforce
 * REWRITE (blue) and LOCK (green) under any circumstance.
 */
function serializeWithDirectives(editor: ReturnType<typeof useEditor>) {
  if (!editor) return { text: '', locked: [] as string[], rewrites: [] as string[] }

  const locked: string[] = []
  const rewrites: string[] = []
  let out = ''

  editor.state.doc.descendants((node) => {
    if (!node.isText) {
      if (node.isBlock) out += '\n\n'
      return true
    }

    const text = node.text ?? ''
    const isLocked = node.marks.some((m) => m.type.name === 'locked')
    const isRewrite = node.marks.some((m) => m.type.name === 'rewrite')

    if (isLocked) {
      locked.push(text)
      out += `[[LOCK]]${text}[[/LOCK]]`
    } else if (isRewrite) {
      rewrites.push(text)
      out += `[[REWRITE]]${text}[[/REWRITE]]`
    } else {
      out += text
    }
    return true
  })

  return { text: out.trim(), locked, rewrites }
}

export default function DraftStudioPage() {
  const scholarshipsData = useScholarshipStore((s) => s.scholarships)
  const studentProfiles = useStudentProfileStore((s) => s.profiles)
  const updateProfile = useStudentProfileStore((s) => s.updateProfile)

  const scholarshipOptions = useMemo<ScholarshipOption[]>(
    () =>
      scholarshipsData.map((sch) => ({
        id: sch.id,
        name: sch.name,
        type: sch.type,
        priorities: sch.priorities,
        weights: sch.weights,
        description: sch.description,
        winnerPatterns: sch.winnerPatterns,
      })),
    [scholarshipsData]
  )

  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    studentProfiles[0]?.id ?? ''
  )
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(
    scholarshipOptions[0]?.id ?? ''
  )

  const selectedStudent =
    useMemo(
      () =>
        studentProfiles.find((p) => p.id === selectedProfileId) ??
        studentProfiles[0] ??
        null,
      [selectedProfileId, studentProfiles]
    ) ?? null

  const selectedScholarship =
    useMemo(
      () =>
        scholarshipOptions.find((s) => s.id === selectedScholarshipId) ??
        scholarshipOptions[0] ??
        null,
      [selectedScholarshipId, scholarshipOptions]
    ) ?? null

  useEffect(() => {
    if (!studentProfiles.length) return
    if (!selectedProfileId) setSelectedProfileId(studentProfiles[0].id)
    if (!studentProfiles.some((p) => p.id === selectedProfileId)) {
      setSelectedProfileId(studentProfiles[0].id)
    }
  }, [studentProfiles, selectedProfileId])

  useEffect(() => {
    if (!scholarshipOptions.length) return
    if (!selectedScholarshipId)
      setSelectedScholarshipId(scholarshipOptions[0].id)
    if (!scholarshipOptions.some((s) => s.id === selectedScholarshipId)) {
      setSelectedScholarshipId(scholarshipOptions[0].id)
    }
  }, [scholarshipOptions, selectedScholarshipId])

  const recommendedScholarships = useMemo(() => {
    if (!selectedStudent || !scholarshipOptions.length) return []
    const explicit = selectedStudent.recommendedScholarshipIds?.length
      ? selectedStudent.recommendedScholarshipIds
          .map((id) => scholarshipOptions.find((s) => s.id === id))
          .filter(Boolean)
          .map((s) => ({
            ...(s as ScholarshipOption),
            compatibility: computeCompatibilityScore(
              selectedStudent,
              s as ScholarshipOption
            ),
          }))
      : null

    const computed = scholarshipOptions
      .map((sch) => ({
        ...sch,
        compatibility: computeCompatibilityScore(selectedStudent, sch),
      }))
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 3)

    return explicit && explicit.length >= 3 ? explicit.slice(0, 3) : computed
  }, [selectedStudent, scholarshipOptions])

  const [baseStoryDraft, setBaseStoryDraft] = useState('')
  const [baseStoryDirty, setBaseStoryDirty] = useState(false)
  const [storyAutosaveAt, setStoryAutosaveAt] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedStudent) return
    if (baseStoryDirty) return
    setBaseStoryDraft(selectedStudent.baseStory ?? '')
  }, [selectedStudent?.id, selectedStudent?.baseStory, baseStoryDirty])

  useEffect(() => {
    if (!baseStoryDirty || !selectedStudent) return
    const t = window.setTimeout(() => {
      updateProfile(selectedStudent.id, { baseStory: baseStoryDraft.trim() })
      setBaseStoryDirty(false)
      setStoryAutosaveAt(Date.now())
    }, 800)
    return () => window.clearTimeout(t)
  }, [baseStoryDirty, baseStoryDraft, selectedStudent, updateProfile])

  const [positiveSignals, setPositiveSignals] = useState('')
  const [negativeSignals, setNegativeSignals] = useState('')
  const [focus, setFocus] = useState<DraftFocus>('balanced')
  const [wordLimit, setWordLimit] = useState('650')
  const [userMemory, setUserMemory] = useState('')

  // Memory (revision) system (logic unchanged)
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([])
  const [openRevisionFor, setOpenRevisionFor] = useState<number | null>(null)
  const [revisionText, setRevisionText] = useState('')

  const [generatedDrafts, setGeneratedDrafts] = useState<Record<string, string>>(
    {}
  )
  const [aiBaseDrafts, setAiBaseDrafts] = useState<Record<string, string>>({})
  const [hasGeneratedKeys, setHasGeneratedKeys] = useState<
    Record<string, boolean>
  >({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const draftKey =
    selectedScholarship && selectedStudent
      ? `${selectedStudent.id}:${selectedScholarship.id}`
      : ''

  const latestDraft = draftKey ? generatedDrafts[draftKey] : undefined
  const displayedDraft = latestDraft ?? ''
  const hasGenerated = !!hasGeneratedKeys[draftKey]

  // Edit mode buttons (only these control highlight behavior)
  const [editMode, setEditMode] = useState<EditMode>('rewrite')

  // Track previous editor text to mark only newly inserted characters
  const prevEditorTextRef = useRef<string>('')

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          bulletList: false,
          orderedList: false,
          blockquote: false,
          codeBlock: false,
          horizontalRule: false,
        }),
        RewriteMark,
        LockedMark,
      ],
      content: textToHTML(displayedDraft || ''),
      editorProps: {
        attributes: {
          class:
            'min-h-[220px] w-full rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-3 text-[12px] leading-relaxed text-zinc-100 outline-none focus:ring-1 focus:ring-sky-500/40',
        },
      },
      onUpdate: ({ editor }) => {
        const nextText = editor.getText()
        const prevText = prevEditorTextRef.current

        const inserted = computeInsertedRun(prevText, nextText)
        if (inserted) {
          const selection = editor.state.selection
          const from = inserted.from + 1
          const to = inserted.to + 1

          editor
            .chain()
            .setTextSelection({ from, to })
            .setMark(editMode === 'locked' ? 'locked' : 'rewrite')
            .setTextSelection(selection)
            .run()
        }

        prevEditorTextRef.current = nextText
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftKey]
  )

  // Keep editor synced when draftKey or displayedDraft changes
  useEffect(() => {
    if (!editor) return
    const base = displayedDraft || ''
editor.commands.setContent(textToHTML(base), { emitUpdate: false })
    prevEditorTextRef.current = editor.getText()
  }, [editor, draftKey, displayedDraft])

  // Memory system handlers (logic unchanged)
  const handleAddRevision = (paragraphIndex?: number) => {
    const instruction = revisionText.trim()
    if (!instruction) return
    setRevisionRequests((prev) => [
      {
        id: crypto.randomUUID(),
        paragraphIndex,
        instruction,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
    setRevisionText('')
    setOpenRevisionFor(null)
  }

  const handleRemoveRevision = (id: string) => {
    setRevisionRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleClearRevisions = () => {
    setRevisionRequests([])
  }

  const handleResetInputs = () => {
    setPositiveSignals('')
    setNegativeSignals('')
    setFocus('balanced')
    setWordLimit('650')
    setUserMemory('')
    setRevisionRequests([])
  }

  const handleGenerateDraft = async () => {
    if (!selectedScholarship || !selectedStudent || !editor) return

    if (!baseStoryDraft.trim()) {
      setGenerationError('Add a base story before generating a draft.')
      return
    }

    const parsedWordLimit = Number.parseInt(wordLimit, 10)

    setIsGenerating(true)
    setGenerationError(null)

    // Respect highlights: locked segments + directive serialization
    const lockedSegments = extractLockedSegments(editor)
    const workingDraft = editor.getText()
    const { text: draftWithDirectives } = serializeWithDirectives(editor)

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseStory: baseStoryDraft,
          scholarship: selectedScholarship,
          focus,
          wordLimit: Number.isFinite(parsedWordLimit)
            ? parsedWordLimit
            : undefined,
          constraints: AUTHENTICITY_CONSTRAINTS,

          // Full context for Claude
          scholarships: scholarshipsData,
          studentProfiles,
          studentId: selectedStudent.id,

          // Inputs / controls
          positiveSignals,
          negativeSignals,
          userMemory,
          revisionRequests,

          // Revision enforcement
          lastDraft: latestDraft ?? null,
          lockedSegments,
          workingDraft,
          draftWithDirectives,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(
          errorPayload?.error ?? 'Draft generation failed. Please try again.'
        )
      }

      const payload = await response.json()
      const nextDraft =
        typeof payload?.draft === 'string' && payload.draft.trim().length
          ? payload.draft
          : null

      if (!nextDraft) throw new Error('No draft was returned.')

      setGeneratedDrafts((prev) => ({
        ...prev,
        [draftKey]: nextDraft,
      }))

      setAiBaseDrafts((prev) => ({
        ...prev,
        [draftKey]: nextDraft,
      }))

      setHasGeneratedKeys((prev) => ({ ...prev, [draftKey]: true }))

editor.commands.setContent(textToHTML(nextDraft), { emitUpdate: false })
      reapplyLockedMarks(editor, lockedSegments)
      prevEditorTextRef.current = editor.getText()
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Draft generation failed.'
      if (
        !/api key/i.test(message) &&
        !/not set/i.test(message) &&
        !/missing key/i.test(message)
      ) {
        setGenerationError(message)
      }

      if (!latestDraft) {
        setGeneratedDrafts((prev) => ({
          ...prev,
          [draftKey]: DEMO_DRAFT,
        }))
        setAiBaseDrafts((prev) => ({
          ...prev,
          [draftKey]: DEMO_DRAFT,
        }))
        setHasGeneratedKeys((prev) => ({ ...prev, [draftKey]: true }))
editor.commands.setContent(textToHTML(DEMO_DRAFT), { emitUpdate: false })




        prevEditorTextRef.current = editor.getText()
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const baseWordCount = useMemo(() => {
    const t = baseStoryDraft.trim()
    if (!t) return 0
    return t.split(/\s+/).length
  }, [baseStoryDraft])

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-50"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <AnimatedBackground children={[]} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-zinc-800/70 px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Draft Studio
            </p>
            <h1 className="text-lg font-semibold text-zinc-50 md:text-xl">
              Scholarship drafts, tailored to you
            </h1>
            <p className="text-xs text-zinc-500">
              Start with your base story, add a few guiding signals, and
              generate a draft you can refine inline.
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
                  <span>Repo</span>
                </Link>
              </Button>
            </Magnetic>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
          <motion.div className="space-y-6" variants={VARIANTS_CONTAINER}>
            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-emerald-500/40 via-emerald-400/20 to-emerald-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <BookOpenCheck className="h-4 w-4 text-emerald-300" />
                    Choose a student and scholarship
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Drafts are generated using your selected profile and the
                    scholarship’s priorities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-3 text-xs">
                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Student profile
                    </label>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {studentProfiles.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProfileId(p.id)}
                          className={`flex w-full flex-col items-start rounded-lg border px-2.5 py-2.5 transition ${
                            p.id === selectedProfileId
                              ? 'border-emerald-500/70 bg-emerald-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-[12px] font-medium text-zinc-100">
                            {p.name}
                          </span>
                          <span className="mt-0.5 text-[10px] text-zinc-500">
                            {p.program} · {p.year}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedStudent && (
                    <div className="grid gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 md:grid-cols-2">
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
                        label="University"
                        value={selectedStudent.university ?? 'Not set'}
                      />
                      <MiniStat
                        label="Location"
                        value={selectedStudent.location ?? 'Not set'}
                      />
                      <MiniStat
                        label="Enrollment"
                        value={selectedStudent.enrollmentStatus ?? 'Not set'}
                      />
                    </div>
                  )}

                  <Separator className="bg-zinc-800/70" />

                  <div className="space-y-2">
                    <label className="text-[11px] text-zinc-400">
                      Scholarship
                    </label>

                    <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto overflow-x-hidden pr-1">
                      {scholarshipOptions.map((sch) => (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => setSelectedScholarshipId(sch.id)}
                          className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition ${
                            sch.id === selectedScholarshipId
                              ? 'border-sky-500/70 bg-sky-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="text-[12px] font-medium text-zinc-100">
                              {sch.name}
                            </p>
                          </div>

                          <Badge
                            variant="outline"
                            className="px-2 py-0.5 text-[10px] border-sky-500/60 bg-sky-900/30 text-sky-100"
                          >
                            {typeBadge(sch.type)}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-medium text-zinc-300">
                      Recommended fits
                    </p>
                    <div className="space-y-1.5">
                      {recommendedScholarships.map((sch, i) => (
                        <button
                          key={sch.id}
                          type="button"
                          onClick={() => setSelectedScholarshipId(sch.id)}
                          className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                            sch.id === selectedScholarshipId
                              ? 'border-emerald-500/70 bg-emerald-500/10'
                              : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-medium text-zinc-100">
                                {sch.name}
                              </p>
                              <p className="text-[10px] text-zinc-500">
                                {typeBadge(sch.type)}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`px-1.5 py-0.5 text-[10px] ${
                                i === 0
                                  ? 'border-emerald-500/60 text-emerald-200'
                                  : 'border-zinc-700 text-zinc-200'
                              }`}
                            >
                              {Math.round(sch.compatibility * 100)}%
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={120}
                />
                <CardHeader className="relative pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <FilePenLine className="h-4 w-4 text-sky-300" />
                    Inputs for Claude
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Add your base story and guiding signals. Then tune tone,
                    emphasis, and length below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] text-zinc-400">
                        Base story
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-zinc-700 bg-zinc-950/80 px-2 py-0.5 text-[10px] text-zinc-200"
                        >
                          {baseWordCount} words
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-emerald-500/60 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        >
                          Autosave {storyAutosaveAt ? 'on' : 'ready'}
                        </Badge>
                      </div>
                    </div>
                    <Textarea
                      value={baseStoryDraft}
                      onChange={(e) => {
                        setBaseStoryDirty(true)
                        setBaseStoryDraft(e.target.value)
                      }}
                      rows={8}
                      placeholder="Write your real story here: what you did, why it mattered, and what changed because of it."
                      className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                    />
                    <p className="text-[10px] text-zinc-500">
                      This saves to the selected profile and is reused for every
                      draft.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Positive signals to highlight
                      </label>
                      <Textarea
                        value={positiveSignals}
                        onChange={(e) => setPositiveSignals(e.target.value)}
                        rows={5}
                        placeholder="What you want emphasized (metrics, roles, outcomes, values)."
                        className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Signals to downplay or avoid
                      </label>
                      <Textarea
                        value={negativeSignals}
                        onChange={(e) => setNegativeSignals(e.target.value)}
                        rows={5}
                        placeholder="What to avoid or soften (repetition, jargon, overused angles)."
                        className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>


                  <Separator className="bg-zinc-800/70" />

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium text-zinc-300">
                        Focus
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
                        {([
                          ['balanced', 'Balanced'],
                          ['impact', 'Impact-heavy'],
                          ['technical', 'Technical depth'],
                          ['resilience', 'Resilience / need'],
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

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Word limit
                      </label>
                      <Input
                        value={wordLimit}
                        onChange={(e) => setWordLimit(e.target.value)}
                        className="h-8 border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                        placeholder="650"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Drafts aim for about ±10% of this limit.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-zinc-400">
                        Authenticity rules (always enforced)
                      </label>
                      <div className="space-y-1.5">
                        {AUTHENTICITY_CONSTRAINTS.map((label) => (
                          <CheckboxRow key={label} label={label} />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetInputs}
                        className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[11px] text-zinc-200 hover:bg-zinc-800"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Reset inputs
                      </Button>
                      {!!revisionRequests.length && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearRevisions}
                          className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[11px] text-zinc-200 hover:bg-zinc-800"
                        >
                          Clear memory notes
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2 text-[11px] text-zinc-400">
                    Claude drafts from your story and signals, then honors your
                    Memory notes and locked text on every iteration.
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              variants={VARIANTS_SECTION}
              transition={TRANSITION_SECTION}
              className="grid gap-4 lg:grid-cols-[minmax(0,1fr)]"
            >
              <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/70">
                <div className="pointer-events-none absolute inset-0 -z-0">
                  <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
                  <div className="absolute top-10 right-[-80px] h-80 w-80 rounded-full bg-emerald-400/14 blur-3xl" />
                  <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-violet-500/14 blur-3xl" />
                  <div className="absolute bottom-8 right-1/4 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
                </div>

                <Spotlight
                  className="from-sky-500/40 via-sky-400/20 to-sky-300/10 blur-2xl"
                  size={110}
                />
                <CardHeader className="relative pb-3 z-10">
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-50">
                    <Wand2 className="h-4 w-4 text-sky-300" />
                    Draft output
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Generate a draft, then edit inline. Your highlights control
                    what Claude can rewrite next.
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative space-y-3 text-xs z-10">
                  <div className="flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/80 px-3 py-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-sky-600 bg-sky-950/40 px-2 py-0.5 text-[10px] text-sky-100"
                      >
                        {selectedScholarship
                          ? selectedScholarship.name
                          : 'Scholarship'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] text-zinc-200"
                      >
                        {typeBadge(selectedScholarship?.type ?? 'Merit')}
                      </Badge>
                      {!!revisionRequests.length && (
                        <Badge
                          variant="outline"
                          className="border-sky-500/60 bg-sky-900/20 px-2 py-0.5 text-[10px] text-sky-100"
                        >
                          {revisionRequests.length} memory note
                          {revisionRequests.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {hasGenerated && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditMode('rewrite')}
                            className={`h-8 rounded-full border px-3 text-[11px] transition ${
                              editMode === 'rewrite'
                                ? 'border-sky-500/70 bg-sky-900/40 text-sky-100'
                                : 'border-zinc-700/70 bg-zinc-950/70 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                            aria-label="Rewrite mode"
                          >
                            Rewrite mode
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditMode('locked')}
                            className={`h-8 rounded-full border px-3 text-[11px] transition ${
                              editMode === 'locked'
                                ? 'border-emerald-500/70 bg-emerald-900/30 text-emerald-100'
                                : 'border-zinc-700/70 bg-zinc-950/70 text-zinc-400 hover:bg-zinc-900/80'
                            }`}
                            aria-label="Lock mode"
                          >
                            Lock mode
                          </button>
                        </>
                      )}

                      <Magnetic intensity={0.25} springOptions={{ bounce: 0 }}>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-full bg-sky-600/80 px-3 text-[11px] font-medium text-white hover:bg-sky-500/80"
                          onClick={handleGenerateDraft}
                          disabled={
                            isGenerating ||
                            !selectedScholarship ||
                            !selectedStudent ||
                            !editor
                          }
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              Generating…
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-1 h-3 w-3 text-sky-200" />
                              Generate draft
                            </>
                          )}
                        </Button>
                      </Magnetic>
                    </div>
                  </div>

                  {generationError && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
                      {generationError}
                    </div>
                  )}

                  {!hasGenerated &&
                  !displayedDraft &&
                  !editor?.getText().trim() ? (
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-6 text-center text-[11px] text-zinc-400">
                      No draft yet. Add inputs above and click “Generate draft”.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <EditorContent editor={editor} />

                      {hasGenerated && (
                        <div className="rounded-lg border border-zinc-800/70 bg-zinc-950/70 px-3 py-2 text-[11px] text-zinc-400">
                          <p className="text-zinc-200 font-medium mb-1">
                            How Rewrite and Lock work
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>
                              <span className="text-sky-200">
                                Rewrite mode:
                              </span>{' '}
                              anything you add is highlighted blue. Claude can
                              reword or reshape these parts next time.
                            </li>
                            <li>
                              <span className="text-emerald-200">
                                Lock mode:
                              </span>{' '}
                              anything you add is highlighted green. Claude must
                              preserve it and write around it.
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/90 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-zinc-100">
                          Memory notes
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                          onClick={() => {
                            setOpenRevisionFor(null)
                            setRevisionText('')
                            setOpenRevisionFor(-1)
                          }}
                        >
                          <MessageSquarePlus className="mr-1 h-3 w-3" />
                          Add memory
                        </Button>
                      </div>

                      {openRevisionFor === -1 && (
                        <div className="mt-2 space-y-2">
                          <Textarea
                            value={revisionText}
                            onChange={(e) => setRevisionText(e.target.value)}
                            rows={3}
                            placeholder="Add a memory note for the next draft (applies to the whole essay)."
                            className="border-zinc-700 bg-zinc-950/80 text-xs text-zinc-100 placeholder:text-zinc-600"
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 rounded-full bg-sky-600/80 px-3 text-[10px] text-white hover:bg-sky-500/80"
                              onClick={() => handleAddRevision(undefined)}
                            >
                              Add memory
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full border-zinc-700 bg-zinc-900/60 text-[10px] text-zinc-200 hover:bg-zinc-800"
                              onClick={() => setOpenRevisionFor(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {!revisionRequests.length ? (
                        <p className="mt-2 text-[11px] text-zinc-500">
                          No memory notes yet. Add one to guide the next
                          generation.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {revisionRequests.map((r) => (
                            <li
                              key={r.id}
                              className="rounded-md border border-zinc-800/70 bg-zinc-950/70 px-2.5 py-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-zinc-500">
                                    {r.paragraphIndex != null
                                      ? `Paragraph ${r.paragraphIndex + 1}`
                                      : 'General'}
                                  </p>
                                  <p className="text-[11px] text-zinc-200">
                                    {r.instruction}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRevision(r.id)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-200"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-lg border border-sky-700/60 bg-sky-950/30 px-3 py-2 text-[11px] text-sky-100">
                      <p className="mb-1 font-medium">How iteration works</p>
                      <p className="text-sky-100/90">
                        Generate a draft, add Memory notes, then generate again.
                        Locked (green) text is preserved automatically. Rewrite
                        (blue) text may be refined by Claude.
                      </p>
                    </div>
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
    <label className="flex items-start gap-2 text-[11px] text-zinc-300">
      <span className="mt-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border border-zinc-700 bg-zinc-950/80 text-[9px] text-zinc-300">
        ✓
      </span>
      <span>{label}</span>
    </label>
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
