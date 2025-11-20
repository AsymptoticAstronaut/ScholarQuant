'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DimensionId =
  | 'academics'
  | 'leadership'
  | 'community'
  | 'need'
  | 'innovation'
  | 'research'
  | 'adversity'

export type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

export type Scholarship = {
  id: string
  name: string
  type: ScholarshipType
  source: 'Manual' | 'Demo' | 'Imported'
  description: string
  priorities: DimensionId[]
  weights: Record<DimensionId, number> // 0–1
  genericScore: number
  tailoredScore: number
}

/** 3 mock scholarships to start with */
const SEED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'merit-excellence',
    name: 'Merit Excellence Grant',
    type: 'Merit',
    source: 'Demo',
    description:
      'Awarded to students with exceptional academic performance and demonstrated leadership in campus initiatives.',
    priorities: ['academics', 'leadership', 'research'],
    weights: {
      academics: 0.45,
      leadership: 0.25,
      community: 0.1,
      need: 0.05,
      innovation: 0.05,
      research: 0.08,
      adversity: 0.02,
    },
    genericScore: 58,
    tailoredScore: 86,
  },
  {
    id: 'community-builder',
    name: 'Community Builder Scholarship',
    type: 'Community',
    source: 'Demo',
    description:
      'Recognizes students who have created measurable impact through community service and grassroots organizing.',
    priorities: ['community', 'leadership', 'adversity'],
    weights: {
      academics: 0.1,
      leadership: 0.25,
      community: 0.4,
      need: 0.1,
      innovation: 0.05,
      research: 0.02,
      adversity: 0.08,
    },
    genericScore: 52,
    tailoredScore: 81,
  },
  {
    id: 'first-gen-access',
    name: 'First-Gen Access Bursary',
    type: 'Access',
    source: 'Demo',
    description:
      'Provides support for first-generation students facing financial barriers and systemic obstacles to accessing education.',
    priorities: ['need', 'adversity', 'community'],
    weights: {
      academics: 0.12,
      leadership: 0.12,
      community: 0.2,
      need: 0.3,
      innovation: 0.04,
      research: 0.02,
      adversity: 0.2,
    },
    genericScore: 55,
    tailoredScore: 79,
  },
]

type ScholarshipState = {
  scholarships: Scholarship[]

  addScholarship: (data: Omit<Scholarship, 'id'> & { id?: string }) => void
  updateScholarship: (id: string, patch: Partial<Scholarship>) => void
  removeScholarship: (id: string) => void
  resetToSeed: () => void
}

export const useScholarshipStore = create<ScholarshipState>()(
  persist(
    (set, get) => ({
      scholarships: SEED_SCHOLARSHIPS,

      addScholarship: (data) => {
        const id = data.id ?? crypto.randomUUID()
        const newScholarship: Scholarship = { ...data, id }
        set({ scholarships: [...get().scholarships, newScholarship] })
      },

      updateScholarship: (id, patch) => {
        set({
          scholarships: get().scholarships.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        })
      },

      removeScholarship: (id) => {
        set({
          scholarships: get().scholarships.filter((s) => s.id !== id),
        })
      },

      resetToSeed: () => set({ scholarships: SEED_SCHOLARSHIPS }),
    }),
    {
      name: 'agentiiv-scholarships-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
