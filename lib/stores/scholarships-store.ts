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
  weights: Record<DimensionId, number>
  genericScore: number
  tailoredScore: number

  // winner patterns stored directly on the scholarship
  stories: {
    title: string
    fullText: string
  }[]

  winnerPatterns: {
    id: string
    label: string
    description: string
    relatedDimensions: DimensionId[]
    strength: number
    evidenceCount: number
    preferredMetrics: string[]
    do: string[]
    dont: string[]
    length: number // wordcount
  }[]
}

/** 13 mock scholarships */
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

    stories: [],
    winnerPatterns: [
      {
        id: 'academic-breakthrough-open',
        label: 'concrete academic breakthroughs first',
        description:
          'Winners open with one specific academic milestone and connect leadership as the amplifier.',
        relatedDimensions: ['academics', 'leadership', 'research'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'competition ranking',
          'publication/paper',
          'research result',
          'GPA trend',
        ],
        do: [
          'Start with a single, specific academic milestone.',
          'State why it mattered (to field, lab, or community).',
          'Add leadership as proof of scaling that excellence.',
        ],
        dont: [
          'List multiple awards without a main throughline.',
          'Lead with titles before showing academic proof.',
        ],
        length: 600,
      },
    ],
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

    stories: [],
    winnerPatterns: [
      {
        id: 'impact-first-titles-second',
        label: 'impact first, titles second',
        description:
          'Winning essays headline a single initiative with clear outcomes; roles are supporting evidence.',
        relatedDimensions: ['community', 'leadership', 'adversity'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'people reached',
          'outcomes achieved',
          'program growth',
          'policy/behavior change',
        ],
        do: [
          'Lead with one community initiative and its outcomes.',
          'Quantify reach or change.',
          'Mention titles only to confirm responsibility.',
        ],
        dont: [
          'Open by listing positions held.',
          'Describe service only as hours with no results.',
        ],
        length: 650,
      },
    ],
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

    stories: [],
    winnerPatterns: [
      {
        id: 'resilience-financial-context',
        label: 'resilience with specific financial context',
        description:
          'Winners specify barriers (costs, caregiving, first-gen navigation) and pair them with persistence and goals.',
        relatedDimensions: ['need', 'adversity', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'financial gap',
          'hours worked',
          'caregiving load',
          'cost offsets',
        ],
        do: [
          'Be explicit about barriers and financial context.',
          'Show concrete actions taken to persist.',
          'End with a forward-looking plan.',
        ],
        dont: [
          'Stay only in hardship without agency.',
          'Hide financial specifics behind vague language.',
        ],
        length: 700,
      },
    ],
  },

  /* -------------------- NEW 10 SCHOLARSHIPS -------------------- */

  {
    id: 'stem-innovation-award',
    name: 'STEM Innovation Award',
    type: 'STEM',
    source: 'Demo',
    description:
      'Honours students who demonstrate strong technical abilities and propose novel scientific or engineering solutions.',
    priorities: ['innovation', 'research', 'academics'],
    weights: {
      academics: 0.3,
      leadership: 0.1,
      community: 0.05,
      need: 0.05,
      innovation: 0.3,
      research: 0.17,
      adversity: 0.03,
    },
    genericScore: 60,
    tailoredScore: 88,

    stories: [],
    winnerPatterns: [
      {
        id: 'iterative-problem-solving',
        label: 'iterative problem-solving',
        description:
          'Past winners describe the problem, failed attempts, iterations, and the final impact.',
        relatedDimensions: ['innovation', 'research', 'academics'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'prototype count',
          'performance improvement',
          'error reduction',
          'user/test results',
        ],
        do: [
          'State a clear technical problem.',
          'Describe at least one failed attempt and what you learned.',
          'Show how iteration led to measurable improvement.',
        ],
        dont: [
          'Present a polished result with no process.',
          'Use technical depth without linking to impact.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'leadership-excellence-fund',
    name: 'Leadership Excellence Fund',
    type: 'Merit',
    source: 'Demo',
    description:
      'Supports students who have demonstrated exceptional leadership capacity in academic or extracurricular settings.',
    priorities: ['leadership', 'academics'],
    weights: {
      academics: 0.35,
      leadership: 0.45,
      community: 0.05,
      need: 0.05,
      innovation: 0.05,
      research: 0.03,
      adversity: 0.02,
    },
    genericScore: 57,
    tailoredScore: 84,

    stories: [],
    winnerPatterns: [
      {
        id: 'systems-change',
        label: 'systems change',
        description:
          'Winning essays show how the student improved a team or organization (process, culture, results), not just that they held a role.',
        relatedDimensions: ['leadership', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'retention',
          'time saved',
          'participation growth',
          'quality gains',
        ],
        do: [
          'Name the system/process you changed.',
          'Show team adoption and sustainability.',
          'Quantify before/after improvement.',
        ],
        dont: [
          'Lead with titles.',
          'Claim leadership without outcomes.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'innovation-challenge-grant',
    name: 'Innovation Challenge Grant',
    type: 'STEM',
    source: 'Demo',
    description:
      'Rewards students who develop creative prototypes or high-impact ideas with potential commercialization.',
    priorities: ['innovation', 'academics'],
    weights: {
      academics: 0.28,
      leadership: 0.12,
      community: 0.05,
      need: 0.05,
      innovation: 0.37,
      research: 0.08,
      adversity: 0.05,
    },
    genericScore: 61,
    tailoredScore: 90,

    stories: [],
    winnerPatterns: [
      {
        id: 'novelty-feasibility',
        label: 'quantify novelty + feasibility',
        description:
          'Successful applicants explain what is new, then prove feasibility with a pilot, prototype, or validation.',
        relatedDimensions: ['innovation', 'academics'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'pilot results',
          'prototype performance',
          'user validation',
          'market signals',
        ],
        do: [
          'State what is genuinely new about your idea.',
          'Include evidence of feasibility.',
          'Tie innovation to tangible impact.',
        ],
        dont: [
          'Describe only the idea with no validation.',
          'Over-claim without proof.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'community-impact-grant',
    name: 'Community Impact Grant',
    type: 'Community',
    source: 'Demo',
    description:
      'For students who demonstrate long-term commitment to social impact projects that improve local communities.',
    priorities: ['community', 'adversity'],
    weights: {
      academics: 0.08,
      leadership: 0.2,
      community: 0.42,
      need: 0.1,
      innovation: 0.05,
      research: 0.02,
      adversity: 0.13,
    },
    genericScore: 50,
    tailoredScore: 78,

    stories: [],
    winnerPatterns: [
      {
        id: 'consistency-multi-year',
        label: 'consistency over one-off volunteering',
        description:
          'Past winners show sustained commitment with partners, outcomes, and how work continues.',
        relatedDimensions: ['community', 'adversity', 'leadership'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'years involved',
          'partner testimonials',
          'program continuity',
          'community outcomes',
        ],
        do: [
          'Show multi-year arc, not a single event.',
          'Name community partners.',
          'Explain sustainability plans.',
        ],
        dont: [
          'List disconnected volunteer events.',
          'Rely on hours without outcomes.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'access-equity-award',
    name: 'Access & Equity Award',
    type: 'Access',
    source: 'Demo',
    description:
      'Supports students who have overcome systemic barriers and demonstrate strong academic potential.',
    priorities: ['adversity', 'need', 'academics'],
    weights: {
      academics: 0.22,
      leadership: 0.08,
      community: 0.1,
      need: 0.28,
      innovation: 0.03,
      research: 0.02,
      adversity: 0.27,
    },
    genericScore: 56,
    tailoredScore: 82,

    stories: [],
    winnerPatterns: [
      {
        id: 'barrier-action-impact',
        label: 'barrier → action → impact',
        description:
          'Winning essays connect obstacles to actions taken and show who benefited.',
        relatedDimensions: ['adversity', 'need', 'academics', 'community'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'obstacle severity',
          'actions taken',
          'impact scope',
          'academic trajectory',
        ],
        do: [
          'State the barrier clearly.',
          'Describe concrete actions you took.',
          'Show the resulting impact on others and yourself.',
        ],
        dont: [
          'Leave out the “action” step.',
          'Frame adversity without growth or outcomes.',
        ],
        length: 700,
      },
    ],
  },
  {
    id: 'research-exploration-fund',
    name: 'Undergraduate Research Exploration Fund',
    type: 'STEM',
    source: 'Demo',
    description:
      'Funds undergraduate researchers working on early-stage scientific or social science investigations.',
    priorities: ['research', 'academics'],
    weights: {
      academics: 0.32,
      leadership: 0.1,
      community: 0.05,
      need: 0.05,
      innovation: 0.18,
      research: 0.27,
      adversity: 0.03,
    },
    genericScore: 62,
    tailoredScore: 89,

    stories: [],
    winnerPatterns: [
      {
        id: 'curiosity-method-clarity',
        label: 'curiosity + method clarity',
        description:
          'Winners describe a precise question, clear method, and learning over flashy results.',
        relatedDimensions: ['research', 'academics', 'innovation'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'research question specificity',
          'method rigor',
          'learning outcomes',
        ],
        do: [
          'State a specific research question.',
          'Explain your method short and clear.',
          'Highlight rigor and what you learned.',
        ],
        dont: [
          'Rely on buzzwords.',
          'Oversell insignificant results.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'social-leadership-prize',
    name: 'Social Leadership Prize',
    type: 'Community',
    source: 'Demo',
    description:
      'Recognizes students who lead social advocacy or volunteer initiatives that drive measurable societal change.',
    priorities: ['leadership', 'community'],
    weights: {
      academics: 0.1,
      leadership: 0.42,
      community: 0.35,
      need: 0.05,
      innovation: 0.03,
      research: 0.02,
      adversity: 0.03,
    },
    genericScore: 54,
    tailoredScore: 83,

    stories: [],
    winnerPatterns: [
      {
        id: 'why-then-how',
        label: 'lead with the “why,” then the “how”',
        description:
          'Winning applications start with motivation, then show mobilization and measured change.',
        relatedDimensions: ['leadership', 'community'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'coalition size',
          'policy/behavior change',
          'reach',
        ],
        do: [
          'Open with personal motivation.',
          'Describe coalition-building.',
          'Show measurable social change.',
        ],
        dont: [
          'Start with logistics before motivation.',
          'Skip outcomes.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'emerging-researcher-scholarship',
    name: 'Emerging Researcher Scholarship',
    type: 'STEM',
    source: 'Demo',
    description:
      'Awarded to students showing early promise in academic research and scholarly inquiry.',
    priorities: ['research', 'academics'],
    weights: {
      academics: 0.4,
      leadership: 0.07,
      community: 0.03,
      need: 0.05,
      innovation: 0.2,
      research: 0.23,
      adversity: 0.02,
    },
    genericScore: 63,
    tailoredScore: 91,

    stories: [],
    winnerPatterns: [
      {
        id: 'strong-framing-accessible',
        label: 'strong framing beats jargon',
        description:
          'Winners explain significance and role clearly for non-experts.',
        relatedDimensions: ['research', 'academics'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'question significance',
          'role clarity',
          'accessible explanation',
        ],
        do: [
          'Explain why the question matters.',
          'State your specific contribution.',
          'Keep language accessible.',
        ],
        dont: [
          'Use heavy jargon.',
          'Assume expert knowledge.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'resilience-award',
    name: 'Resilience in Education Award',
    type: 'Access',
    source: 'Demo',
    description:
      'Celebrates students who have demonstrated perseverance through adversity while maintaining strong academic drive.',
    priorities: ['adversity', 'academics'],
    weights: {
      academics: 0.3,
      leadership: 0.1,
      community: 0.07,
      need: 0.12,
      innovation: 0.03,
      research: 0.03,
      adversity: 0.35,
    },
    genericScore: 59,
    tailoredScore: 87,

    stories: [],
    winnerPatterns: [
      {
        id: 'tradeoffs-specific',
        label: 'resilience through specific tradeoffs',
        description:
          'Winners describe constraints, tradeoffs made, and continued progress.',
        relatedDimensions: ['adversity', 'academics', 'need'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'constraint severity',
          'tradeoff examples',
          'academic persistence',
        ],
        do: [
          'Name the hard constraints.',
          'Show the tradeoffs you chose.',
          'Tie to academic progress.',
        ],
        dont: [
          'Stay vague about constraints.',
          'Frame adversity without agency.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'global-citizenship-award',
    name: 'Global Citizenship Award',
    type: 'Community',
    source: 'Demo',
    description:
      'Recognizes students who demonstrate cross-cultural leadership and sustained impact on global or intercultural initiatives.',
    priorities: ['community', 'leadership', 'innovation'],
    weights: {
      academics: 0.12,
      leadership: 0.28,
      community: 0.32,
      need: 0.06,
      innovation: 0.16,
      research: 0.03,
      adversity: 0.03,
    },
    genericScore: 53,
    tailoredScore: 85,

    stories: [],
    winnerPatterns: [
      {
        id: 'local-to-global-meaning',
        label: 'connect local action to global meaning',
        description:
          'Winners ground a concrete intercultural project, then link it to broader global stakes and learning.',
        relatedDimensions: ['community', 'leadership', 'innovation'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'cross-cultural outcomes',
          'project reach',
          'learning/reflection quality',
        ],
        do: [
          'Describe a specific intercultural project.',
          'Explain the global problem it speaks to.',
          'Show what you learned and how you changed.',
        ],
        dont: [
          'Stay abstract about “global issues.”',
          'Describe travel/participation without impact.',
        ],
        length: 650,
      },
    ],
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
