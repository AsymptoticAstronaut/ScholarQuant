import type { DimensionId } from '@/types/dimensions'

export type StudentStory = {
  id: string
  title: string
  summary: string
  dimensionTags: DimensionId[]
}

export type StudentStats = {
  scholarshipsMatched: number
  draftsGenerated: number
  avgAlignment: number
  lastActiveAt?: string
  topMatchIds?: string[]
}

export type StudentContextFile = {
  id: string
  name: string
  label: string
}

export type StudentProfile = {
  id: string
  name: string
  program: string
  year: string
  tags: string[]

  gpa?: number
  gpaScale?: 4 | 12 | 100
  location?: string
  university?: string
  campus?: string
  degreeLevel?: 'Undergraduate' | 'Graduate' | 'College' | 'Other'
  enrollmentStatus?: 'Full-time' | 'Part-time' | 'Co-op/PEY' | 'Other'
  citizenshipStatus?: 'Domestic' | 'International' | 'Permanent Resident' | 'Other'
  firstGen?: boolean
  languages?: string[]
  workStatus?: 'Not working' | 'Part-time' | 'Full-time'
  financialNeedLevel?: 'Low' | 'Medium' | 'High' | 'Prefer not to say'
  awards?: string[]
  testScores?: Partial<{
    sat: number
    act: number
    gre: number
    gmat: number
    toefl: number
    ielts: number
  }>

  recommendedScholarshipIds: string[]

  features: Record<DimensionId, number>
  stories: StudentStory[]
  baseStory?: string
  contextFiles?: StudentContextFile[]
  stats: StudentStats
}

export const EMPTY_FEATURES: Record<DimensionId, number> = {
  academics: 0,
  leadership: 0,
  community: 0,
  need: 0,
  innovation: 0,
  research: 0,
  adversity: 0,
}

export const isProfileComplete = (profile: StudentProfile | null | undefined) => {
  if (!profile) return false
  if (!profile.name?.trim()) return false
  if (!profile.university?.trim()) return false
  if (!profile.program?.trim()) return false
  if (!profile.year?.trim()) return false
  if (profile.gpa == null) return false
  return true
}
