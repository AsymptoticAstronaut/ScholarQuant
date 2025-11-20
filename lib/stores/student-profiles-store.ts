'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DimensionId } from './scholarships-store'

export type StudentStory = {
  id: string
  title: string
  summary: string
  dimensionTags: DimensionId[]
}

export type StudentStats = {
  scholarshipsMatched: number
  draftsGenerated: number
  avgAlignment: number // 0–100
}

export type StudentProfile = {
  id: string
  name: string
  program: string
  year: string
  tags: string[]

  // same shape this page expects:
  features: Record<DimensionId, number> // 0–1 importance
  stories: StudentStory[]
  stats: StudentStats
}

/** Seed: the 3 demo students from your current page */
const SEED_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 's1',
    name: 'Frank Coconut',
    program: 'Computer Engineering',
    year: '3rd year',
    tags: ['Robotics', 'Men in STEM', 'Teaching'],
    features: {
      academics: 0.82,
      leadership: 0.75,
      community: 0.6,
      need: 0.2,
      innovation: 0.9,
      research: 0.7,
      adversity: 0.25,
    },
    stories: [
      {
        id: 's1-1',
        title: 'Low-cost robotics kit for middle schools',
        summary:
          'Designed a low-cost robotics kit and ran weekend workshops for local middle schools, focusing on hands-on learning and accessible materials.',
        dimensionTags: ['innovation', 'community', 'leadership'],
      },
      {
        id: 's1-2',
        title: 'Undergraduate research in swarm robotics',
        summary:
          'Worked with a lab to prototype swarm coordination strategies and presented a poster at an undergraduate research conference.',
        dimensionTags: ['research', 'academics', 'innovation'],
      },
    ],
    stats: {
      scholarshipsMatched: 9,
      draftsGenerated: 12,
      avgAlignment: 84,
    },
  },
  {
    id: 's2',
    name: 'Yasser Nootnoot',
    program: 'Health Studies & Public Policy',
    year: '2nd year',
    tags: ['Community health', 'Refugee support', 'Advocacy'],
    features: {
      academics: 0.7,
      leadership: 0.8,
      community: 0.95,
      need: 0.35,
      innovation: 0.45,
      research: 0.4,
      adversity: 0.6,
    },
    stories: [
      {
        id: 's2-1',
        title: 'Neighbourhood health access project',
        summary:
          'Coordinated a weekly clinic information booth and translation support for newcomers navigating local healthcare.',
        dimensionTags: ['community', 'leadership'],
      },
      {
        id: 's2-2',
        title: 'Refugee youth mentorship circle',
        summary:
          'Started a peer mentorship circle for refugee youth to share resources, study strategies, and mental health supports.',
        dimensionTags: ['community', 'adversity', 'leadership'],
      },
    ],
    stats: {
      scholarshipsMatched: 11,
      draftsGenerated: 15,
      avgAlignment: 88,
    },
  },
  {
    id: 's3',
    name: 'Lucia Rivera',
    program: 'Economics & Sociology',
    year: '1st generation · 4th year',
    tags: ['First-gen', 'Work-study', 'Equity'],
    features: {
      academics: 0.75,
      leadership: 0.45,
      community: 0.6,
      need: 0.95,
      innovation: 0.3,
      research: 0.35,
      adversity: 0.9,
    },
    stories: [
      {
        id: 's3-1',
        title: 'Working two jobs while studying full-time',
        summary:
          'Balanced two part-time jobs to cover tuition and family expenses while maintaining strong academic performance.',
        dimensionTags: ['need', 'adversity', 'academics'],
      },
      {
        id: 's3-2',
        title: 'Campus equity research assistant',
        summary:
          'Assisted in a study on first-generation student outcomes and helped design a peer-support pilot program.',
        dimensionTags: ['research', 'community', 'adversity'],
      },
    ],
    stats: {
      scholarshipsMatched: 13,
      draftsGenerated: 17,
      avgAlignment: 90,
    },
  },
]

type StudentProfileState = {
  profiles: StudentProfile[]

  addProfile: (data: Omit<StudentProfile, 'id'> & { id?: string }) => void
  updateProfile: (id: string, patch: Partial<StudentProfile>) => void
  removeProfile: (id: string) => void
  resetToSeed: () => void
}

export const useStudentProfileStore = create<StudentProfileState>()(
  persist(
    (set, get) => ({
      profiles: SEED_STUDENT_PROFILES,

      addProfile: (data) => {
        const id = data.id ?? crypto.randomUUID()
        const newProfile: StudentProfile = { ...data, id }
        set({ profiles: [...get().profiles, newProfile] })
      },

      updateProfile: (id, patch) => {
        set({
          profiles: get().profiles.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })
      },

      removeProfile: (id) => {
        set({
          profiles: get().profiles.filter((p) => p.id !== id),
        })
      },

      resetToSeed: () => set({ profiles: SEED_STUDENT_PROFILES }),
    }),
    {
      name: 'agentiiv-student-profiles-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
