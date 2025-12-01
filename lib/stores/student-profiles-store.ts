'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  EMPTY_FEATURES,
  type StudentProfile,
  isProfileComplete,
} from '@/types/student-profile'

const SEED_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 's1',
    name: 'Sophie Bennett',
    program: 'Computer Engineering',
    year: '3rd year',
    tags: ['Robotics', 'Mentorship', 'Teaching'],
    gpa: 3.78,
    gpaScale: 4,
    location: 'Toronto, ON',
    university: 'University of Toronto',
    campus: 'St. George',
    degreeLevel: 'Undergraduate',
    enrollmentStatus: 'Full-time',
    citizenshipStatus: 'Domestic',
    firstGen: false,
    languages: ['English'],
    workStatus: 'Part-time',
    financialNeedLevel: 'Low',
    awards: ['Dean’s List', 'Undergraduate Research Poster Award'],
    recommendedScholarshipIds: [
      'stem-innovation-award',
      'innovation-challenge-grant',
      'emerging-researcher-scholarship'
    ],
    features: {
      academics: 0.82,
      leadership: 0.75,
      community: 0.6,
      need: 0.2,
      innovation: 0.9,
      research: 0.7,
      adversity: 0.25
    },
    baseStory:
      'Sophie is a third-year Computer Engineering student focused on building practical robotics systems that improve access to STEM learning. She combines strong coursework with hands-on prototyping, and she has gradually taken on leadership roles where she designs learning experiences for younger students and coordinates small project teams. Her work shows a consistent pattern: identify a real constraint in a community or lab setting, iterate on a technical solution, and then translate the outcome into something others can use. She is motivated by the idea that engineering should be understandable and empowering to non-experts, especially students who do not have easy access to lab equipment or mentorship.',
    stories: [
      {
        id: 's1-1',
        title: 'Low-cost robotics kit for middle schools',
        summary:
          'Sophie designed a low-cost robotics kit to help schools expand access and created workshops that significantly increased participation. The project blended engineering design with educational impact.',
        dimensionTags: ['innovation', 'community', 'leadership']
      },
      {
        id: 's1-2',
        title: 'Undergraduate research in swarm robotics',
        summary:
          'Sophie improved multi-robot coordination by reducing sensor drift and collisions through better filtering and testing. Her work increased system reliability and strengthened her interest in autonomous systems.',
        dimensionTags: ['research', 'academics', 'innovation']
      }
    ],
    contextFiles: [],
    stats: {
      scholarshipsMatched: 9,
      draftsGenerated: 12,
      avgAlignment: 84,
      lastActiveAt: new Date().toISOString(),
      topMatchIds: [
        'stem-innovation-award',
        'innovation-challenge-grant',
        'emerging-researcher-scholarship'
      ]
    }
  },
  {
    id: 's2',
    name: 'Jiawen Liu',
    program: 'Health Studies & Public Policy',
    year: '2nd year',
    tags: ['Community Health', 'Advocacy', 'Newcomer Support'],
    gpa: 3.64,
    gpaScale: 4,
    location: 'Vancouver, BC',
    university: 'University of British Columbia',
    campus: 'Vancouver',
    degreeLevel: 'Undergraduate',
    enrollmentStatus: 'Full-time',
    citizenshipStatus: 'Domestic',
    firstGen: false,
    languages: ['English', 'Mandarin'],
    workStatus: 'Not working',
    financialNeedLevel: 'Medium',
    awards: ['Community Impact Scholar Nominee'],
    recommendedScholarshipIds: [
      'community-builder',
      'community-impact-grant',
      'social-leadership-prize'
    ],
    features: {
      academics: 0.7,
      leadership: 0.8,
      community: 0.95,
      need: 0.35,
      innovation: 0.45,
      research: 0.4,
      adversity: 0.6
    },
    baseStory:
      'Jiawen is a second-year Health Studies and Public Policy student who centers her work on practical, community-grounded health access. She is motivated by a belief that public services only matter if people can actually navigate them. Her strengths show up in organizing, coalition-building, and sustained advocacy, especially with newcomer and multilingual communities. She combines policy training with direct service experience, and she tends to translate complex systems into clear pathways for others.',
    stories: [
      {
        id: 's2-1',
        title: 'Neighbourhood health access project',
        summary:
          'Jiawen launched a multilingual health-navigation booth that helped newcomers understand clinics, referrals, and services. It saw strong uptake and became a sustained program run by trained volunteers.',
        dimensionTags: ['community', 'leadership']
      },
      {
        id: 's2-2',
        title: 'Newcomer youth mentorship circle',
        summary:
          'Jiawen created a mentorship circle for newcomer youth that improved belonging, academic confidence, and peer leadership. The program now runs continuously with student facilitators.',
        dimensionTags: ['community', 'adversity', 'leadership']
      }
    ],
    contextFiles: [],
    stats: {
      scholarshipsMatched: 11,
      draftsGenerated: 15,
      avgAlignment: 88,
      lastActiveAt: new Date().toISOString(),
      topMatchIds: [
        'community-builder',
        'community-impact-grant',
        'social-leadership-prize'
      ]
    }
  },
  {
    id: 's3',
    name: 'Ibn Al-Khawrizmi',
    program: 'Applied Mathematics & Economics',
    year: 'First-generation · 4th year',
    tags: ['First-gen', 'Work-study', 'Equity'],
    gpa: 3.94,
    gpaScale: 4,
    location: 'Ottawa, ON',
    university: 'Carleton University',
    campus: 'Ottawa',
    degreeLevel: 'Undergraduate',
    enrollmentStatus: 'Full-time',
    citizenshipStatus: 'Domestic',
    firstGen: true,
    languages: ['English', 'Arabic'],
    workStatus: 'Part-time',
    financialNeedLevel: 'High',
    awards: ['Access Bursary Recipient', 'Faculty of Science Scholarship'],
    recommendedScholarshipIds: [
      'first-gen-access',
      'access-equity-award',
      'resilience-award'
    ],
    features: {
      academics: 0.75,
      leadership: 0.45,
      community: 0.6,
      need: 0.95,
      innovation: 0.3,
      research: 0.35,
      adversity: 0.9
    },
    baseStory:
      'Al-Khawrizmi is a fourth-year first-generation student studying Applied Mathematics and Economics. He has maintained a high GPA while carrying significant financial responsibility at home, working part-time throughout university. His profile shows strong resilience and a steady academic trajectory, paired with community involvement focused on equity and peer support. He tends to frame his work through problem-solving under constraint: identifying tradeoffs, choosing a path, and following through consistently.',
    stories: [
      {
        id: 's3-1',
        title: 'Working two jobs while studying full-time',
        summary:
          'Al-Khawrizmi balanced two jobs with full-time study by optimizing his schedule and study methods. His GPA rose steadily, and the experience shaped his commitment to educational access.',
        dimensionTags: ['need', 'adversity', 'academics']
      },
      {
        id: 's3-2',
        title: 'Campus equity research assistantship',
        summary:
          'He supported research on first-generation students and helped design a peer-support pilot. His analysis informed improvements and deepened his equity-focused research direction.',
        dimensionTags: ['research', 'community', 'adversity']
      }
    ],
    contextFiles: [],
    stats: {
      scholarshipsMatched: 13,
      draftsGenerated: 17,
      avgAlignment: 90,
      lastActiveAt: new Date().toISOString(),
      topMatchIds: ['first-gen-access', 'access-equity-award', 'resilience-award']
    }
  }
]

type StudentProfileState = {
  profiles: StudentProfile[]
  selectedProfileId: string | null
  loading: boolean
  hasFetched: boolean
  error: string | null
  addProfile: (
    data: Omit<StudentProfile, 'id'> & { id?: string }
  ) => Promise<StudentProfile | null>
  updateProfile: (id: string, patch: Partial<StudentProfile>) => Promise<void>
  removeProfile: (id: string) => void
  resetToSeed: () => void
  loadMockProfiles: () => void
  setSelectedProfileId: (id: string | null) => void
  isProfileComplete: (id: string | null) => boolean
  loadProfiles: () => Promise<void>
}

export const useStudentProfileStore = create<StudentProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      selectedProfileId: null,
      loading: false,
      hasFetched: false,
      error: null,
      addProfile: (data) => {
        const payload = {
          ...data,
          features: data.features ?? { ...EMPTY_FEATURES },
          stories: data.stories ?? [],
          contextFiles: data.contextFiles ?? [],
          stats: data.stats ?? {
            scholarshipsMatched: 0,
            draftsGenerated: 0,
            avgAlignment: 0,
          },
        }

        set({ loading: true, error: null })

        return fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text())
            return res.json() as Promise<StudentProfile>
          })
          .then((created) => {
            const profiles = [...get().profiles, created]
            const selectedProfileId = get().selectedProfileId ?? created.id
            set({ profiles, selectedProfileId })
            return created
          })
          .catch((err) => {
            set({ error: err.message })
            return null
          })
          .finally(() => set({ loading: false }))
      },
      updateProfile: async (id, patch) => {
        set({ error: null, loading: true })

        // Optimistic local update.
        set({
          profiles: get().profiles.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })

        try {
          const res = await fetch(`/api/profiles/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(patch),
          })
          if (!res.ok) throw new Error(await res.text())
          const updated = (await res.json()) as StudentProfile
          set({
            profiles: get().profiles.map((p) =>
              p.id === id ? { ...p, ...updated } : p
            ),
          })
        } catch (err: any) {
          set({ error: err?.message ?? 'Failed to save profile' })
          throw err
        } finally {
          set({ loading: false })
        }
      },
      removeProfile: (id) => {
        set({ loading: true, error: null })

        fetch(`/api/profiles/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text())
          })
          .then(() => {
            const nextProfiles = get().profiles.filter((p) => p.id !== id)
            const nextSelected =
              get().selectedProfileId === id
                ? nextProfiles[0]?.id ?? null
                : get().selectedProfileId
            set({
              profiles: nextProfiles,
              selectedProfileId: nextSelected,
            })
          })
          .catch((err) => set({ error: err.message }))
          .finally(() => set({ loading: false }))
      },
      loadMockProfiles: () =>
        set((state) => {
          const existing = state.profiles
          const toAdd = SEED_STUDENT_PROFILES.filter(
            (seed) => !existing.some((p) => p.id === seed.id)
          )
          const profiles = [...existing, ...toAdd]
          const selectedProfileId = state.selectedProfileId ?? profiles[0]?.id ?? null
          return { profiles, selectedProfileId }
        }),
      resetToSeed: () =>
        set({
          profiles: SEED_STUDENT_PROFILES,
          selectedProfileId: SEED_STUDENT_PROFILES[0]?.id ?? null
        }),
      setSelectedProfileId: (id) => set({ selectedProfileId: id }),
      isProfileComplete: (id) => {
        const profile = get().profiles.find((p) => p.id === id) ?? null
        return isProfileComplete(profile)
      },
      loadProfiles: async () => {
        set({ loading: true, error: null })
        try {
          const res = await fetch('/api/profiles', { credentials: 'include' })
          if (!res.ok) {
            throw new Error(await res.text())
          }

          const profiles = (await res.json()) as StudentProfile[]
          const selectedProfileId = get().selectedProfileId
          const resolvedSelection =
            (selectedProfileId &&
              profiles.find((p) => p.id === selectedProfileId)?.id) ??
            profiles[0]?.id ??
            null

          set({
            profiles,
            selectedProfileId: resolvedSelection,
            hasFetched: true,
          })
        } catch (err: any) {
          set({
            error: err?.message ?? 'Failed to load profiles',
            hasFetched: true,
          })
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'agentiiv-student-profiles-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedProfileId: state.selectedProfileId })
    }
  )
)
