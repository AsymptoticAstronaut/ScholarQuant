'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DimensionId } from '@/types/dimensions'
export type { DimensionId } from '@/types/dimensions'

export type ScholarshipType = 'Merit' | 'Community' | 'STEM' | 'Access'

/**
 * Helper to generate a strategy from winnerPatterns
 */
function generateStrategyFromPatterns(patterns: Scholarship['winnerPatterns']): string {
  if (patterns.length === 0) return ''

  const pattern = patterns[0]
  const dos = pattern.do.map(item => `• ${item}`).join('\n')
  const donts = pattern.dont.map(item => `• ${item}`).join('\n')

  return `${pattern.description}\n\n**Do:**\n${dos}\n\n**Don't:**\n${donts}`
}

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
  summary?: string
  strategy?: string
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
    length: number
  }[]
}

const SEED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'coca-cola-scholars',
    name: 'Coca-Cola Scholars Program',
    type: 'Merit',
    source: 'Imported',
    description: 'Awards $20,000 scholarships to 150 exceptional high school seniors dedicated to leadership, service, and academics:contentReference[oaicite:44]{index=44}.',
    priorities: ['academics', 'leadership', 'community'],
    weights: {
      academics: 0.30,
      leadership: 0.40,
      community: 0.25,
      need: 0.00,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 58,
    tailoredScore: 86,
    stories: [],
    winnerPatterns: [
      {
        id: 'impactful-leadership-service',
        label: 'impact before accolades',
        description: 'Winners spotlight a major community initiative they led and its tangible impact, rather than just listing achievements.',
        relatedDimensions: ['leadership', 'community', 'academics'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'volunteer hours',
          'people impacted',
          'leadership roles',
          'GPA',
        ],
        do: [
          'Open with a specific volunteer project or cause you led.',
          'Quantify the impact (e.g., number of people helped or outcome achieved).',
          'Connect leadership and service to your academic or personal passion.',
        ],
        dont: [
          'List numerous activities with no focus.',
          'Center the essay only on grades or awards.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'cameron-impact',
    name: 'Cameron Impact Scholarship',
    type: 'Merit',
    source: 'Imported',
    description: 'Full four-year tuition scholarship for 10–15 U.S. high school seniors who excel in academics, extracurriculars, leadership, and community service:contentReference[oaicite:45]{index=45}.',
    priorities: ['academics', 'leadership', 'community'],
    weights: {
      academics: 0.35,
      leadership: 0.35,
      community: 0.20,
      need: 0.00,
      innovation: 0.05,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 57,
    tailoredScore: 85,
    stories: [],
    winnerPatterns: [
      {
        id: 'well-rounded-narrative',
        label: 'well-rounded excellence',
        description: 'Essays integrate academic achievement with leadership and service into one cohesive personal story.',
        relatedDimensions: ['academics', 'leadership', 'community'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'GPA/Class rank',
          'leadership positions',
          'volunteer impact',
          'awards',
        ],
        do: [
          'Highlight a balance of scholarly achievements and community initiatives.',
          'Show how your academic interests inspire service or leadership roles (and vice versa).',
          'Emphasize a unifying passion or goal that ties your activities together.',
        ],
        dont: [
          'Focus on only one aspect of your achievements.',
          'Present a disconnected list of honors without a personal narrative.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'td-community',
    name: 'TD Scholarships for Community Leadership',
    type: 'Community',
    source: 'Imported',
    description: 'Awards up to $70,000 (tuition + stipend) over 4 years to Canadian students who have shown outstanding dedication to community leadership:contentReference[oaicite:46]{index=46}.',
    priorities: ['community', 'leadership', 'adversity'],
    weights: {
      academics: 0.10,
      leadership: 0.25,
      community: 0.45,
      need: 0.10,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.10,
    },
    genericScore: 52,
    tailoredScore: 80,
    stories: [],
    winnerPatterns: [
      {
        id: 'sustained-impact',
        label: 'sustained community impact',
        description: 'Winners focus on a long-term community project they led, demonstrating consistency and tangible results over time.',
        relatedDimensions: ['community', 'leadership', 'adversity'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'years of service',
          'people benefited',
          'outcomes (e.g., policy change, funds raised)',
        ],
        do: [
          'Lead with a multi-year community initiative you spearheaded.',
          'Quantify growth or outcomes (e.g., expansion from 10 to 100 participants, measurable community improvements).',
          'Mention challenges overcome (resource shortages, personal obstacles) to sustain the project.',
        ],
        dont: [
          'Highlight only short-term volunteer activities.',
          'List titles or hours without explaining impact or motivation.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'prudential-visionaries',
    name: 'Prudential Emerging Visionaries Awards',
    type: 'Community',
    source: 'Imported',
    description: 'National recognition (with scholarships up to $15,000) for students (age 14–18) who create innovative solutions to financial or societal challenges in their communities:contentReference[oaicite:47]{index=47}:contentReference[oaicite:48]{index=48}.',
    priorities: ['community', 'innovation', 'leadership'],
    weights: {
      academics: 0.05,
      leadership: 0.30,
      community: 0.50,
      need: 0.00,
      innovation: 0.10,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 50,
    tailoredScore: 78,
    stories: [],
    winnerPatterns: [
      {
        id: 'personal-motivation',
        label: 'personal “why” drives change',
        description: 'Winning entries tie a personal story or motivation to the community issue they addressed, demonstrating innovative thinking and impact.',
        relatedDimensions: ['community', 'innovation'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'initiative started',
          'number of people helped',
          'originality of solution',
        ],
        do: [
          'Explain what personally inspired you to tackle the problem.',
          'Describe how your approach was innovative or unique compared to others.',
          'Include evidence of impact (testimonials, before-and-after data, etc.).',
        ],
        dont: [
          'Speak in generalities about volunteer work with no personal connection.',
          'Focus only on planning an idea without mentioning results.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'loran-scholarship',
    name: 'Loran Scholars Foundation Award',
    type: 'Community',
    source: 'Imported',
    description: 'Prestigious Canadian award (valued up to $100,000 over 4 years) recognizing young leaders of character who demonstrate integrity, courage, compassion, and a deep commitment to service:contentReference[oaicite:49]{index=49}:contentReference[oaicite:50]{index=50}.',
    priorities: ['leadership', 'community', 'academics'],
    weights: {
      academics: 0.20,
      leadership: 0.40,
      community: 0.30,
      need: 0.05,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 55,
    tailoredScore: 87,
    stories: [],
    winnerPatterns: [
      {
        id: 'character-driven',
        label: 'values in action',
        description: 'Essays illustrate character (integrity, courage, empathy) through a story of leadership and service rather than just listing achievements.',
        relatedDimensions: ['leadership', 'community'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'ethical challenge overcome',
          'service hours (multi-year)',
          'leadership roles',
          'personal growth instances',
        ],
        do: [
          'Narrate an instance where you faced a moral or personal challenge and chose to help others or lead positively.',
          'Highlight long-term involvement or mentorship (showing commitment beyond a single event).',
          'Reflect on what the experience taught you about your values or leadership style.',
        ],
        dont: [
          'Brag about accomplishments without acknowledging mentors or teamwork.',
          'Hide failures or tough decisions — Loran values honesty and humility.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'terry-fox',
    name: 'Terry Fox Humanitarian Award',
    type: 'Community',
    source: 'Imported',
    description: 'Awards up to $28,000 over 4 years to students who have overcome adversity and shown exceptional courage and humanitarian service in their communities:contentReference[oaicite:51]{index=51}:contentReference[oaicite:52]{index=52}.',
    priorities: ['adversity', 'community', 'academics'],
    weights: {
      academics: 0.15,
      leadership: 0.10,
      community: 0.25,
      need: 0.00,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.50,
    },
    genericScore: 53,
    tailoredScore: 82,
    stories: [],
    winnerPatterns: [
      {
        id: 'service-from-adversity',
        label: 'adversity motivates service',
        description: 'Winners connect personal adversity to a drive to serve others, showing how hardship instilled empathy and action.',
        relatedDimensions: ['adversity', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'obstacle overcome',
          'volunteer projects led',
          'people assisted',
        ],
        do: [
          'Share your personal challenge or adversity and how it inspired you to help others facing similar issues.',
          'Describe a humanitarian or volunteer project you took on as a result, including specific outcomes or people helped.',
          'Emphasize qualities like empathy, courage, and perseverance in both your story and your community work.',
        ],
        dont: [
          'Center the essay only on your own hardship without linking to your service.',
          'Use a tone of self-pity or resentment; focus on positive change instead.',
        ],
        length: 700,
      },
    ],
  },
  {
    id: 'dell-scholars',
    name: 'Dell Scholars Program',
    type: 'Access',
    source: 'Imported',
    description: 'Supports 500 low-income, often first-generation college students annually with a $20,000 scholarship, laptop, and mentorship, focusing on students who have demonstrated grit and ambition in the face of personal challenges:contentReference[oaicite:53]{index=53}:contentReference[oaicite:54]{index=54}.',
    priorities: ['need', 'adversity', 'academics'],
    weights: {
      academics: 0.15,
      leadership: 0.10,
      community: 0.10,
      need: 0.40,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.25,
    },
    genericScore: 55,
    tailoredScore: 79,
    stories: [],
    winnerPatterns: [
      {
        id: 'resilience-initiative',
        label: 'resilience with initiative',
        description: 'Winners demonstrate how they took initiative to overcome financial and personal hurdles, showing resilience and resourcefulness.',
        relatedDimensions: ['adversity', 'need', 'academics'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'hours worked (employment)',
          'family responsibilities',
          'GPA improvement',
          'college prep program participation',
        ],
        do: [
          'Describe specific obstacles (financial hardship, family obligations, etc.) and actions you took to address them (e.g., working a job, seeking tutoring, leading a family responsibility).',
          'Highlight support systems you utilized or created – for instance, mentoring others or forming study groups, showing you are proactive in challenging situations.',
          'Stress your commitment to education despite difficulties (good attendance, improved grades, taking college-level courses).',
        ],
        dont: [
          'Just state you had it tough financially without detail or context.',
          'Portray yourself as having overcome everything alone – acknowledging mentors or programs (like AVID, Gear Up) you engaged with can strengthen your narrative.',
        ],
        length: 700,
      },
    ],
  },
  {
    id: 'gates-scholarship',
    name: 'The Gates Scholarship (TGS)',
    type: 'Access',
    source: 'Imported',
    description: 'A full-cost scholarship for 300 outstanding minority students from low-income households across the U.S., covering all unmet college expenses and focusing on scholars with high academic achievement and leadership potential:contentReference[oaicite:55]{index=55}:contentReference[oaicite:56]{index=56}.',
    priorities: ['need', 'academics', 'leadership'],
    weights: {
      academics: 0.30,
      leadership: 0.20,
      community: 0.10,
      need: 0.30,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.10,
    },
    genericScore: 59,
    tailoredScore: 88,
    stories: [],
    winnerPatterns: [
      {
        id: 'excellence-purpose',
        label: 'academic excellence with purpose',
        description: 'Winners pair top academic performance with a clear sense of purpose in serving their community or advancing a cause, often related to their background.',
        relatedDimensions: ['academics', 'leadership', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'AP/IB/Honors courses',
          'leadership positions',
          'community service hours',
          'awards/honors',
        ],
        do: [
          'Emphasize academic successes (valedictorian, rigorous courses) alongside leadership in school or community (club president, volunteer organizer).',
          'Explain how your identity or personal experience drives you to pursue higher education **and** give back (e.g., advocating for others, solving a problem in your community).',
          'Demonstrate impact: e.g., tutoring peers, leading a cultural association, improving school policy, etc., with tangible outcomes.',
        ],
        dont: [
          'Assume that being low-income or a minority alone will impress—show concrete achievements and initiatives.',
          'Focus only on personal benefit of the scholarship; Gates Scholars are expected to uplift others, so share your vision for making a difference.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'horatio-alger',
    name: 'Horatio Alger National Scholarship',
    type: 'Access',
    source: 'Imported',
    description: 'Provides need-based scholarships (up to $25,000) to students who have demonstrated perseverance through extreme adversity and critical financial need, helping over 100 national scholars each year pursue college:contentReference[oaicite:57]{index=57}:contentReference[oaicite:58]{index=58}.',
    priorities: ['adversity', 'need', 'community'],
    weights: {
      academics: 0.10,
      leadership: 0.05,
      community: 0.15,
      need: 0.35,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.35,
    },
    genericScore: 59,
    tailoredScore: 87,
    stories: [],
    winnerPatterns: [
      {
        id: 'perseverance-story',
        label: 'overcome and aspire',
        description: 'Essays detail significant hardships overcome and connect them to the student’s drive to succeed and give back, highlighting perseverance and hope.',
        relatedDimensions: ['adversity', 'need', 'community'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'family income',
          'challenge faced (e.g., illness, loss, foster care)',
          'work/volunteer responsibilities',
          'academic improvement',
        ],
        do: [
          'Tell a chronological story of your life challenge, focusing on how you responded and what steps you took to keep moving toward your goals (studying at odd hours, seeking help, working part-time, etc.).',
          'Show your optimism and ambition: e.g., discuss your career goals or how you plan to help others in the future, proving that adversity strengthened your resolve.',
          'Mention any community involvement or leadership, even if modest (church, school clubs, family duties), to demonstrate character and a desire to contribute.',
        ],
        dont: [
          'Simply enumerate misfortunes without explaining how you coped or grew.',
          'Use a defeated tone; the scholarship is about hope and resilience, so end on a positive, forward-looking note.',
        ],
        length: 700,
      },
    ],
  },
  {
    id: 'schulich-leader',
    name: 'Schulich Leader Scholarships',
    type: 'STEM',
    source: 'Imported',
    description: 'Canada’s premier STEM scholarship, awarding $100,000 (engineering) or $80,000 (science) to 100 entrepreneurial-minded high school graduates who exhibit academic excellence, leadership, creativity, and potentially financial need:contentReference[oaicite:59]{index=59}.',
    priorities: ['academics', 'innovation', 'leadership'],
    weights: {
      academics: 0.30,
      leadership: 0.20,
      community: 0.00,
      need: 0.10,
      innovation: 0.30,
      research: 0.05,
      adversity: 0.05,
    },
    genericScore: 60,
    tailoredScore: 88,
    stories: [],
    winnerPatterns: [
      {
        id: 'innovation-leadership',
        label: 'innovation + leadership',
        description: 'Winners combine a strong innovative project in STEM with evidence of leadership or entrepreneurial spirit driving that project.',
        relatedDimensions: ['innovation', 'academics', 'leadership'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'STEM project awards',
          'leadership roles in tech clubs',
          'entrepreneurial ventures',
          'creativity (patents/prototypes)',
        ],
        do: [
          'Describe a significant STEM project or competition where you created something new (research finding, app, engineered device) and explain its significance.',
          'Highlight how you led others or took initiative during that project (started a team, secured funding, collaborated with mentors).',
          'Mention any entrepreneurial activities – e.g., turning a project into a startup, or applying your tech solution in the real world.',
        ],
        dont: [
          'Solely list academic scores or science fair participation without context.',
          'Neglect the “human” side – even in tech, show how your work addresses a real-world problem or could benefit others.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'goldwater-scholarship',
    name: 'Barry Goldwater Scholarship',
    type: 'STEM',
    source: 'Imported',
    description: 'Elite U.S. scholarship for college sophomores/juniors pursuing research careers in STEM. About 400 scholars are selected annually based on exceptional academic talent and research potential in the natural sciences, engineering, or math:contentReference[oaicite:60]{index=60}:contentReference[oaicite:61]{index=61}.',
    priorities: ['research', 'academics', 'innovation'],
    weights: {
      academics: 0.30,
      leadership: 0.00,
      community: 0.00,
      need: 0.00,
      innovation: 0.20,
      research: 0.50,
      adversity: 0.00,
    },
    genericScore: 63,
    tailoredScore: 91,
    stories: [],
    winnerPatterns: [
      {
        id: 'clarity-not-jargon',
        label: 'clear research passion',
        description: 'Winning essays clearly explain the student’s research and why it matters, showing enthusiasm and understanding without heavy jargon.',
        relatedDimensions: ['research', 'academics'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'research hours or years',
          'lab techniques mastered',
          'presentations/publications',
          'future research goals',
        ],
        do: [
          'State your research question or hypothesis in layperson terms, and why it is important to your field or society.',
          'Describe your specific contributions (experimental design, data analysis, etc.) and any results or findings achieved.',
          'Convey your passion for research and your long-term goals (e.g. Ph.D., solving a particular scientific problem).',
        ],
        dont: [
          'Overwhelm with technical jargon or assume the reader has specialized knowledge.',
          'Focus solely on your love of science without detailing your actual research work – show what you have done, not just that you are interested.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'regeneron-sts',
    name: 'Regeneron Science Talent Search (STS)',
    type: 'STEM',
    source: 'Imported',
    description: 'America’s oldest and most prestigious science competition for high school seniors:contentReference[oaicite:62]{index=62}. 40 Finalists are chosen from ~1,800 applicants to showcase outstanding original research, competing for awards up to $250,000.',
    priorities: ['research', 'innovation', 'academics'],
    weights: {
      academics: 0.20,
      leadership: 0.00,
      community: 0.00,
      need: 0.00,
      innovation: 0.40,
      research: 0.40,
      adversity: 0.00,
    },
    genericScore: 62,
    tailoredScore: 89,
    stories: [],
    winnerPatterns: [
      {
        id: 'process-focused',
        label: 'process > results',
        description: 'Finalists emphasize their scientific process—identifying problems, learning from failures, and developing insights—rather than just presenting a polished result.',
        relatedDimensions: ['research', 'innovation'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'experiments run / trials',
          'obstacles overcome',
          'novel techniques used',
          'insights gained',
        ],
        do: [
          'Narrate how you approached your research question: what sparked it, how you designed your experiment, and any iterative improvements or troubleshooting you did.',
          'Mention at least one challenge or unexpected finding and how you responded (adjusting the method, seeking mentorship, etc.).',
          'Highlight what makes your project innovative or original compared to what’s been done before, and the potential impact of your findings.',
        ],
        dont: [
          'Imply that everything went perfectly or that you alone achieved something in isolation (acknowledge mentors or team if applicable).',
          'Focus only on results without context—judges want to understand your thinking and problem-solving skills.',
        ],
        length: 650,
      },
    ],
  },
  {
    id: 'regeneron-isef',
    name: 'Regeneron International Science & Engineering Fair (ISEF)',
    type: 'STEM',
    source: 'Imported',
    description: 'The world’s largest pre-college science fair, where 1,600+ top students from over 75 countries compete for nearly $9 million in scholarships and prizes by presenting innovative research projects:contentReference[oaicite:63]{index=63}. Top awards include $50,000–$75,000 grand prizes in various categories.',
    priorities: ['innovation', 'research', 'community'],
    weights: {
      academics: 0.10,
      leadership: 0.00,
      community: 0.05,
      need: 0.00,
      innovation: 0.45,
      research: 0.40,
      adversity: 0.00,
    },
    genericScore: 61,
    tailoredScore: 90,
    stories: [],
    winnerPatterns: [
      {
        id: 'global-solution',
        label: 'local solution to global issue',
        description: 'Top ISEF projects frame a big global problem and then show how the student developed and tested a concrete local solution or prototype for it.',
        relatedDimensions: ['innovation', 'research', 'community'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'global problem stats (e.g., CO2 reduction %)',
          'prototype performance metrics',
          'trials or case studies conducted',
          'awards at affiliate fairs',
        ],
        do: [
          'Begin by stating the global challenge your project addresses (climate change, disease, etc.) and why it’s important.',
          'Describe your solution or invention and how you implemented/tested it (include data from experiments or trials).',
          'Explain the potential broader impact if your solution were scaled up, and any recognition it received (placing in regional fair, patent filed, etc.).',
        ],
        dont: [
          'Keep the scope too narrow or technical—remind the reader/judge of the larger significance of your work.',
          'Skip over practical results. Even if it’s a theoretical project, indicate how it could be applied or what next steps would bring it closer to real-world use.',
        ],
        length: 650,
      },
    ],
  },
{
    id: 'national-merit',
    name: 'National Merit Scholarship Program',
    type: 'Merit',
    source: 'Manual',
    description: 'Awards academically talented high school students based on PSAT/NMSQT scores and academic achievements.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.8,
      leadership: 0.05,
      community: 0.03,
      need: 0.02,
      innovation: 0.02,
      research: 0.04,
      adversity: 0.04,
    },
    genericScore: 60,
    tailoredScore: 85,
    stories: [],
    winnerPatterns: [
      {
        id: 'focus-academics-clear',
        label: 'focus on academics clearly',
        description: 'Essays focus on a clear academic interest or achievement, showcasing intellectual curiosity without unnecessary filler.',
        relatedDimensions: ['academics'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'PSAT/NMSQT score',
          'GPA',
          'AP/IB courses',
        ],
        do: [
          'Highlight a specific academic passion or accomplishment.',
          'Demonstrate intellectual curiosity or love of learning.',
          'Keep the tone focused and evidence-based.',
        ],
        dont: [
          'List unrelated extracurriculars with no academic connection.',
          'Over-embellish with flowery language without substance.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'prudential-spirit',
    name: 'Prudential Spirit of Community Awards',
    type: 'Community',
    source: 'Manual',
    description: 'Honors youth volunteers who have made a meaningful difference through community service, providing scholarship awards to top national honorees.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.05,
      leadership: 0.20,
      community: 0.50,
      need: 0.05,
      innovation: 0.05,
      research: 0.02,
      adversity: 0.13,
    },
    genericScore: 52,
    tailoredScore: 80,
    stories: [],
    winnerPatterns: [
      {
        id: 'single-project-focus',
        label: 'single project focus',
        description: 'Winning entries focus on one significant volunteer initiative and detail its positive outcomes and lessons learned.',
        relatedDimensions: ['community', 'leadership'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'people helped',
          'hours volunteered',
          'tangible outcomes',
        ],
        do: [
          'Describe the community need and your specific project.',
          'Use numbers to show the scale of impact.',
          'Share what you learned and why it mattered.',
        ],
        dont: [
          'List multiple unrelated service activities without focus.',
          'Overstate impact without evidence.',
        ],
        length: 500,
      },
    ],
  },
  {
    id: 'equitable-excellence',
    name: 'Equitable Excellence Scholarship',
    type: 'Community',
    source: 'Manual',
    description: 'Recognizes students who show exceptional determination and achievement, often in the face of obstacles, providing renewable awards for college.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.15,
      leadership: 0.20,
      community: 0.15,
      need: 0.10,
      innovation: 0.15,
      research: 0.05,
      adversity: 0.20,
    },
    genericScore: 57,
    tailoredScore: 82,
    stories: [],
    winnerPatterns: [
      {
        id: 'overcoming-challenge-success',
        label: 'overcoming challenge to success',
        description: 'Winners share how they overcame a personal challenge or obstacle and turned it into a meaningful achievement or way to help others.',
        relatedDimensions: ['adversity', 'leadership', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'obstacle described',
          'achievement level',
          'people benefited',
        ],
        do: [
          'Clearly explain the challenge you faced and why it was significant.',
          'Highlight what you achieved despite or due to overcoming it.',
          'Connect the experience to your future goals or how you will continue to excel.',
        ],
        dont: [
          'Focus only on the hardship without an outcome or lesson.',
          'Downplay the difficulty—be honest and reflective.',
        ],
        length: 600,
      },
    ],
  },
  {
    id: 'truman-scholarship',
    name: 'Harry S. Truman Scholarship',
    type: 'Community',
    source: 'Manual',
    description: 'Awards outstanding college juniors committed to public service leadership with funding for graduate study and professional development in public service careers.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.15,
      leadership: 0.40,
      community: 0.30,
      need: 0.03,
      innovation: 0.05,
      research: 0.02,
      adversity: 0.05,
    },
    genericScore: 53,
    tailoredScore: 84,
    stories: [],
    winnerPatterns: [
      {
        id: 'issue-vision-track',
        label: 'issue vision with track record',
        description: 'Successful essays articulate a clear public issue passion with evidence of leadership addressing it and a concrete vision for future change.',
        relatedDimensions: ['leadership', 'community'],
        strength: 0.9,
        evidenceCount: 1,
        preferredMetrics: [
          'leadership roles',
          'community impact',
          'policy initiative',
        ],
        do: [
          'State the specific social or public issue you are passionate about.',
          'Give examples of actions and leadership roles you\'ve already undertaken to address it.',
          'Outline your plan or vision to continue making change in this area.',
        ],
        dont: [
          'Remain too general about wanting to "help people" without specifics.',
          'Ignore explaining your personal motivation for focusing on this issue.',
        ],
        length: 700,
      },
    ],
  },
  {
    id: 'chickfila-scholars',
    name: 'Chick-fil-A Community Scholars',
    type: 'Community',
    source: 'Manual',
    description: 'Provides $25,000 scholarships to student leaders who excel academically, serve their communities, and demonstrate financial need.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.28,
      leadership: 0.06,
      community: 0.28,
      need: 0.28,
      innovation: 0.02,
      research: 0.02,
      adversity: 0.06,
    },
    genericScore: 50,
    tailoredScore: 79,
    stories: [],
    winnerPatterns: [
      {
        id: 'service-scholar-balance',
        label: 'service & scholarship balance',
        description: 'Winning essays emphasize balancing strong academics with impactful community service, often including a personal challenge overcome.',
        relatedDimensions: ['academics', 'community', 'need'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: [
          'GPA or academic honors',
          'service hours',
          'financial hardship',
        ],
        do: [
          'Show commitment to a volunteer or service project alongside schoolwork.',
          'Highlight academic achievements maintained or improved while serving.',
          'Mention any personal or financial challenges managed during this time.',
        ],
        dont: [
          'Focus only on grades without human context.',
          'Hide or downplay the help you provided to others.',
        ],
        length: 500,
      },
    ],
  },
  {
    id: 'davidson-fellows',
    name: 'Davidson Fellows Scholarship',
    type: 'STEM',
    source: 'Manual',
    description: 'Awards significant scholarships to students under 18 who have completed extraordinary projects in science, technology, mathematics, literature, music, or philosophy.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.15,
      leadership: 0.12,
      community: 0.12,
      need: 0.03,
      innovation: 0.30,
      research: 0.20,
      adversity: 0.08,
    },
    genericScore: 60,
    tailoredScore: 87,
    stories: [],
    winnerPatterns: [
      {
        id: 'passion-project-mastery',
        label: 'passion project mastery',
        description: 'Winners showcase a unique, self-driven project born of personal passion, explaining both the process of achieving it and its significance or impact.',
        relatedDimensions: ['innovation', 'academics'],
        strength: 0.80,
        evidenceCount: 1,
        preferredMetrics: [
          'project duration',
          'impact scope',
          'awards or recognition',
        ],
        do: [
          'Explain what inspired your project and why you pursued it.',
          'Describe challenges overcome and key milestones in your work.',
          'Highlight the outcome or impact of your project and any recognition received.',
        ],
        dont: [
          'Be overly modest about a significant accomplishment.',
          'Assume the reader has expert knowledge of your project\'s field.',
        ],
        length: 800,
      },
    ],
  },
  {
    id: 'generation-google',
    name: 'Generation Google Scholarship',
    type: 'STEM',
    source: 'Manual',
    description: 'Supports aspiring computer science students from underrepresented groups with funding for college and opportunities in the tech industry.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.20,
      leadership: 0.25,
      community: 0.20,
      need: 0.10,
      innovation: 0.05,
      research: 0.05,
      adversity: 0.15,
    },
    genericScore: 54,
    tailoredScore: 83,
    stories: [],
    winnerPatterns: [
      {
        id: 'aspiration-and-inclusion',
        label: 'aspiration and inclusion',
        description: 'Winning essays often tie the applicant\'s personal experiences to their goals in tech, showing how they\'ve overcome challenges and helped others to foster inclusion.',
        relatedDimensions: ['adversity', 'leadership', 'community'],
        strength: 0.80,
        evidenceCount: 1,
        preferredMetrics: [
          'CS club leadership',
          'outreach events organized',
          'personal obstacles overcome',
        ],
        do: [
          'Share challenges faced as an underrepresented student in tech and how you overcame them.',
          'Highlight efforts to support or mentor others in technology (especially underrepresented peers).',
          'Connect your passion for tech to a desire to make the field more inclusive.',
        ],
        dont: [
          'Focus only on personal achievement without community impact.',
          'Avoid discussing your identity or motivations – authenticity is valued.',
        ],
        length: 500,
      },
    ],
  },
  {
    id: 'jack-kent-cooke',
    name: 'Jack Kent Cooke Foundation College Scholarship',
    type: 'Access',
    source: 'Manual',
    description: 'Prestigious scholarship for high-achieving students with significant financial need, covering tuition and expenses and providing academic development support.',
    priorities: ['academics', 'leadership', 'community', 'need', 'innovation', 'research', 'adversity'],
    weights: {
      academics: 0.30,
      leadership: 0.20,
      community: 0.10,
      need: 0.25,
      innovation: 0.02,
      research: 0.03,
      adversity: 0.10,
    },
    genericScore: 59,
    tailoredScore: 88,
    stories: [],
    winnerPatterns: [
      {
        id: 'excellence-meets-need',
        label: 'excellence meets need',
        description: 'Winning essays blend evidence of exceptional academic or leadership achievements with a compelling narrative of financial need and personal drive.',
        relatedDimensions: ['academics', 'leadership', 'need', 'adversity'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: [
          'GPA or test scores',
          'leadership roles',
          'family income level',
        ],
        do: [
          'Highlight top academic accomplishments or awards and why they matter to you.',
          'Share details of your financial circumstances (low income, obstacles) with honesty.',
          'Emphasize leadership or community roles you\'ve taken on despite those challenges.',
        ],
        dont: [
          'Rely on academics alone without personal context.',
          'Generalize your need—use concrete details to illustrate your situation.',
        ],
        length: 800,
      },
    ],
  },
    {
    id: 'elks-mvs',
    name: 'Elks Most Valuable Student Scholarship',
    type: 'Merit',
    source: 'Imported',
    description:
      'National contest awarding scholarships (from $4,000 up to $50,000) to 500 high school seniors based on **scholarship (academics), leadership, and financial need**:contentReference[oaicite:28]{index=28}.',
    priorities: ['academics', 'leadership', 'need'],
    weights: {
      academics: 0.25,
      leadership: 0.25,
      community: 0.20,
      need: 0.25,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 57,
    tailoredScore: 85,
    stories: [],
    winnerPatterns: [
      {
        id: 'well-rounded-contributor',
        label: 'the well-rounded contributor',
        description:
          'Winners present a balance of academic achievement, leadership roles, and service, often tying in how the scholarship will relieve financial strain to further these pursuits.',
        relatedDimensions: ['academics', 'leadership', 'need'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: ['GPA/class rank', 'leadership positions', 'volunteer hours', 'financial situation details'],
        do: [
          'Highlight a strong academic record **and** key leadership roles (student government, captainships, etc.).',
          'Discuss community service or extracurriculars that show you give back.',
          'Mention financial need in context (e.g. working part-time while excelling in school) to underscore the impact of the award.',
        ],
        dont: [
          'Focus on only one aspect (e.g. all academics, or all service) – the competition values well-roundedness.',
          'Be vague about leadership or impact (provide concrete examples of your contributions).',
        ],
        length: 650,
      },
    ],
  },
{
    id: 'rhodes-scholarship',
    name: 'Rhodes Scholarship',
    type: 'Merit',
    source: 'Imported',
    description:
      'Internationally prestigious scholarship for graduate study at Oxford. Selects young leaders of **outstanding intellect, character, leadership, and commitment to service**; 32 U.S. Rhodes Scholars are chosen each year:contentReference[oaicite:30]{index=30} (among ~100 worldwide), with all expenses covered for up to 3 years.',
    priorities: ['academics', 'leadership', 'community'],
    weights: {
      academics: 0.35,
      leadership: 0.30,
      community: 0.20,
      need: 0.00,
      innovation: 0.05,
      research: 0.05,
      adversity: 0.05,
    },
    genericScore: 62,
    tailoredScore: 94,
    stories: [],
    winnerPatterns: [
      {
        id: 'beyond-academics',
        label: 'beyond academics to purpose',
        description:
          'Successful Rhodes applicants weave top academics with a larger sense of purpose – showing how their scholarly achievements and leadership serve a broader humanitarian or global goal.',
        relatedDimensions: ['academics', 'leadership', 'community'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: ['GPA/Awards', 'leadership positions', 'service impact or global experiences'],
        do: [
          'Demonstrate academic excellence (top grades, major awards) in your field of study **and** why that field matters to the world.',
          'Provide examples of leadership that resulted in meaningful change or insight (preferably with international or intercultural elements).',
          'Articulate a clear vision for how you will make a “strong difference for good in the world” (tying into Rhodes mission:contentReference[oaicite:31]{index=31}).',
        ],
        dont: [
          'Rely solely on academic success – without showing character, empathy, or drive to help others.',
          'Overlook mentioning the values of service or teamwork; Rhodes committees seek those who work well with and for others.',
        ],
        length: 800,
      },
    ],
  },
    {
    id: 'swe-scholarships',
    name: 'Society of Women Engineers (SWE) Scholarships',
    type: 'STEM',
    source: 'Imported',
    description:
      'Multiple awards (totaling $1M+ yearly) for women pursuing engineering or CS degrees. Over 250 scholarships are granted annually based on academic merit, leadership in STEM activities, and sometimes need:contentReference[oaicite:34]{index=34}:contentReference[oaicite:35]{index=35}.',
    priorities: ['academics', 'leadership', 'innovation'],
    weights: {
      academics: 0.30,
      leadership: 0.20,
      community: 0.10,
      need: 0.10,
      innovation: 0.10,
      research: 0.10,
      adversity: 0.10,
    },
    genericScore: 53,
    tailoredScore: 80,
    stories: [],
    winnerPatterns: [
      {
        id: 'passion-for-engineering',
        label: 'passion for engineering + initiative',
        description:
          'A strong SWE application often highlights a genuine enthusiasm for engineering (e.g. projects, competitions) and initiatives taken to advance or apply engineering skills, especially to help others or overcome barriers for women in STEM.',
        relatedDimensions: ['academics', 'innovation', 'leadership'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: ['engineering project outcomes', 'STEM club leadership roles', 'any patents or competitions'],
        do: [
          'Discuss an engineering problem or project you tackled – what inspired it and what you achieved (could be a design competition, research project, or invention).',
          'Highlight leadership or active membership in STEM organizations (robotics club, SWE collegiate chapter, etc.), especially efforts to mentor others or promote STEM among girls/women.',
          'If applicable, mention any financial need or personal adversity and how you remained committed to engineering through it (some SWE scholarships factor need).',
        ],
        dont: [
          'Spend too much time on non-STEM activities – ensure your tech/engineering interest is front and center.',
          'Suggest you’re pursuing engineering due to external pressure rather than passion – convey genuine curiosity and self-motivation in the field.',
        ],
        length: 600,
      },
    ],
  },
    {
    id: 'ron-brown-scholar',
    name: 'Ron Brown Scholar Program',
    type: 'Community',
    source: 'Imported',
    description:
      '$40,000 scholarship ($10K/year) for talented African-American high school seniors. **Looking for academic excellence, leadership potential, and dedication to service** in the community:contentReference[oaicite:36]{index=36}. Also provides mentoring and networking.',
    priorities: ['academics', 'leadership', 'community'],
    weights: {
      academics: 0.25,
      leadership: 0.25,
      community: 0.30,
      need: 0.10,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.10,
    },
    genericScore: 58,
    tailoredScore: 86,
    stories: [],
    winnerPatterns: [
      {
        id: 'service-leadership-ethos',
        label: 'service leadership ethos',
        description:
          'Ron Brown essays often center on a personal drive to uplift the community, backed by concrete examples of leadership and service, along with academic success as a foundation.',
        relatedDimensions: ['leadership', 'community', 'academics'],
        strength: 0.85,
        evidenceCount: 1,
        preferredMetrics: ['volunteer initiatives led', 'leadership roles (esp. related to Black community or diversity)', 'academic honors'],
        do: [
          'Share what motivates you to serve your community (e.g. witnessing injustice or needs in your community and deciding to act).',
          'Give detailed examples of projects or organizations you have led or contributed to that helped others – especially those that create opportunity or support for people of color.',
          'Underscore your academic achievements and how you seek to use education to further your community impact (e.g. career goals that benefit society).',
        ],
        dont: [
          'Generalize about “helping the community” without a specific story or role you played – specificity is key to stand out.',
          'Ignore the element of leadership – the program looks for potential future leaders, so show how you took charge or initiated something meaningful.',
        ],
        length: 650,
      },
    ],
  },
      {
    id: 'ge-reagan-foundation',
    name: 'GE-Reagan Foundation Scholarship',
    type: 'Merit',
    source: 'Imported',
    description:
      'Offers about 10 renewable scholarships (worth up to $40,000 each) to high school seniors nationwide who **showcase leadership, drive, integrity, and citizenship** in their schools and communities:contentReference[oaicite:37]{index=37}. Scholars also join a leadership network and attend an annual retreat.',
    priorities: ['leadership', 'academics', 'community'],
    weights: {
      academics: 0.30,
      leadership: 0.30,
      community: 0.30,
      need: 0.05,
      innovation: 0.00,
      research: 0.00,
      adversity: 0.05,
    },
    genericScore: 61,
    tailoredScore: 89,
    stories: [],
    winnerPatterns: [
      {
        id: 'values-driven-leader',
        label: 'values-driven leader',
        description:
          'GE-Reagan recipients illustrate leadership fueled by core values (integrity, service, humility). Essays tend to recount ethical leadership decisions or community initiatives started, reflecting a mature character.',
        relatedDimensions: ['leadership', 'community'],
        strength: 0.8,
        evidenceCount: 1,
        preferredMetrics: ['leadership roles', 'community service impact', 'personal principles illustrated (anecdotes)'],
        do: [
          'Share an example of a time you led peers to solve a problem or improve something, emphasizing the integrity or perseverance involved (e.g., standing up for what’s right, or overcoming a challenge as a team).',
          'Highlight community involvement or service where you took initiative (the scholarship’s emphasis on “citizenship” values sustained contribution to community).',
          'Align your narrative with qualities President Reagan admired (without overtly political statements) – e.g., optimism, service, leadership through collaboration.',
        ],
        dont: [
          'Brag about accomplishments without humility or reflection on what you learned – humility and growth are part of “drive and integrity.”',
          'Focus solely on academic accolades; the committee looks for well-rounded leaders, not just top students.',
        ],
        length: 700,
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
      scholarships: SEED_SCHOLARSHIPS.map(sch => ({
        ...sch,
        strategy: sch.strategy || generateStrategyFromPatterns(sch.winnerPatterns),
      })),

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

      resetToSeed: () => set({
        scholarships: SEED_SCHOLARSHIPS.map(sch => ({
          ...sch,
          strategy: sch.strategy || generateStrategyFromPatterns(sch.winnerPatterns),
        })),
      }),
    }),
    {
      name: 'agentiiv-scholarships-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
