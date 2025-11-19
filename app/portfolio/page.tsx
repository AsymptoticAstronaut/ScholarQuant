'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { XIcon } from 'lucide-react'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog'

const Masonry = dynamic(() => import('react-masonry-css'), { ssr: false })

const DEMO_VIDEO = '../videos/wonder2.mp4'

/* === Frosted badge with tone for contrast control === */
function Badge({
  children,
  tone = 'light',
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark'
}) {
  const base = 'px-2.5 py-[3px] rounded-full text-xs backdrop-blur-md'
  const light =
    'bg-black/5 border border-black/10 text-zinc-800 ' +
    'dark:bg-white/10 dark:border-white/20 dark:text-white'
  const dark =
    'bg-white/12 border border-white/25 text-white ' +
    'dark:bg-white/10 dark:border-white/20 dark:text-white'
  return <span className={`${base} ${tone === 'dark' ? dark : light}`}>{children}</span>
}

function ProjectVideo({ src }: { src: string }) {
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
      <MorphingDialogTrigger>
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="rounded-2xl shadow-2xl w-full max-w-[820px] h-auto object-contain cursor-zoom-in bg-black"
        />
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="z-[999] relative rounded-2xl bg-zinc-50 p-1 dark:bg-zinc-950">
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-h-[70vh] rounded-xl object-contain bg-black"
          />
        </MorphingDialogContent>
        <MorphingDialogClose className="absolute top-6 right-6 bg-white/80 dark:bg-zinc-800/80 rounded-full p-1 shadow-md">
          <XIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

const project = {
  title: 'Wonder',
  desc: `An AI-driven literacy and STEM learning platform built with Phaser, Firebase, AWS, and OpenAI APIs. It adapts dynamically to each student’s reading level and provides real-time feedback analytics.`,
  video: DEMO_VIDEO,
  video2: '../videos/dimension.mp4',
  video3: '../videos/quizcraft.mp4',
  badges: ['Phaser', 'Firebase', 'AWS', 'OpenAI'],
  images: [
    'https://playwonder.ca/images/carousel/earth.png',
    'https://playwonder.ca/images/carousel/bridge.png',
    'https://playwonder.ca/images/carousel/river.png',
    'https://playwonder.ca/images/carousel/lighthouse.png',
    'https://playwonder.ca/images/carousel/palm.png',
  ],
}

type SmallProject = {
  title: string
  desc: string
  image?: string | null
  badges: string[]
  bgImage?: string | null
}

const smallProjects: SmallProject[] = [
  {
    title: 'Huffman Trees Compression Engine',
    desc: 'Lossless compression via entropy-weighted prefix codes and optimal binary trees for compact bitstreams.',
    image: null,
    bgImage:
      'https://previews.123rf.com/images/yanik88/yanik881807/yanik88180700987/105355065-blue-ice-abstract-natural-background-elements-of-glacier-close-up.jpg',
    badges: ['Python', 'Algorithms', 'Data Structures'],
  },
  {
    title: 'Treemap Hierarchical Data Visualization',
    desc: 'Recursive proportional geometry to render hierarchical datasets with dynamic expansion and interaction.',
    image: null,
    bgImage:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
    badges: ['Python', 'Pygame', 'Recursion'],
  },
  {
    title: 'Telecom Network Simulation System',
    desc: 'Object-oriented simulation of calls, contracts, and geospatial analytics with interactive filtering.',
    image: null,
    bgImage:
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=80',
    badges: ['Python', 'OOP', 'Pygame'],
  },
  {
    title: 'My Portfolio: yassernoori.com',
    desc: 'Responsive portfolio emphasizing clarity, structure, and smooth visual flow.',
    image: null,
    bgImage:
      'https://images.unsplash.com/photo-1496302662116-35cc4f36df92?auto=format&fit=crop&w=1600&q=80',
    badges: ['Next.js', 'TypeScript', 'React', 'Tailwind v4', 'shadcn/ui', 'Vercel'],
  },
]

const WASHES = [
  'linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(3,105,161,0.35) 50%, rgba(3,7,18,0.55) 100%)',
  'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(2,132,199,0.35) 55%, rgba(2,6,23,0.6) 100%)',
  'linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(56,189,248,0.35) 50%, rgba(2,6,23,0.55) 100%)',
  'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(8,145,178,0.35) 55%, rgba(2,6,23,0.6) 100%)',
]

export default function ProjectSpotlight() {
  const tileHeight = (i: number) => 240 + (i % 3) * 80

  return (
    <main className="min-h-screen overflow-x-hidden font-[family-name:var(--font-inter-tight)] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">

      {/* removed marquee section entirely ✅ */}

      <div className="h-10 md:h-14" />

      {/* === WONDER MAIN SECTION === */}
      <section className="flex flex-col lg:flex-row items-start justify-center gap-16 px-8 md:px-16 pb-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="flex-1 flex justify-center lg:justify-end">
          <ProjectVideo src={project.video} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }} className="flex-1 flex flex-col justify-center max-w-xl">
          <h1 className="text-3xl md:text-4xl mb-3 leading-snug tracking-tight">{project.title}</h1>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed text-[1.08rem]">{project.desc}</p>

          <a
            href="https://playwonder.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center w-fit mb-6 text-zinc-800 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="font-medium mr-2">Visit Website</span>
          </a>

          <div className="flex flex-wrap gap-2">
            {project.badges.map((b) => (
              <Badge key={b} tone="light">{b}</Badge>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === MASONRY === */}
      <section className="px-6 md:px-16 pb-20">
        <Masonry breakpointCols={{ default: 3, 1000: 2, 600: 1 }} className="flex gap-4" columnClassName="space-y-4">
          {project.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              height={tileHeight(i)}
              style={{ height: tileHeight(i) }}
              className="rounded-2xl shadow-lg w-full object-cover select-none block"
              loading="lazy"
            />
          ))}
        </Masonry>
      </section>

      {/* === More Projects === */}
      <section className="px-6 md:px-16 pb-24">
        <h2 className="text-2xl font-semibold mb-6">More Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {smallProjects.map((p, i) => {
            const noImage = !p.image
            const wash = WASHES[i % WASHES.length]
            const bg = p.bgImage

            return (
              <article key={i} className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 text-white">
                <div className="h-60 relative flex items-center p-5 md:p-6">
                  {bg && <img src={bg} className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0" style={{ background: wash }} />
                  <div className="relative z-10 w-full rounded-xl border border-white/25 bg-white/15 backdrop-blur-xl p-4 md:p-5">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="text-sm mt-2 text-white/95">{p.desc}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.badges.map((b) => (
                        <Badge key={b} tone="dark">{b}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
