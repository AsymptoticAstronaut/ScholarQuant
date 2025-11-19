'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { XIcon } from 'lucide-react'
import { Spotlight } from '@/components/ui/spotlight'
import { Magnetic } from '@/components/ui/magnetic'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from '@/components/ui/morphing-dialog'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'
import {
  PROJECTS,
  WORK_EXPERIENCE,
  // BLOG_POSTS, // ⛔ Commented out
  EMAIL,
  SOCIAL_LINKS,
} from './data'

// === Typing animation keyframes ===
const typing = {
  hidden: { width: 0 },
  visible: {
    width: '100%',
    transition: {
      duration: 2,
      ease: 'easeInOut',
    },
  },
}

const blink = {
  visible: {
    opacity: [1, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = { duration: 0.3 }

/* ---------- SKILLS DATA (categories kept for headings but badges are rendered without wrapper divs) ---------- */
const SKILL_CATEGORIES = [
  {
    title: 'Languages',
    badges: [
      'TypeScript-3178C6?logo=typescript&logoColor=white',
      'JavaScript-F7DF1E?logo=javascript&logoColor=black',
      'Java-007396?logo=openjdk&logoColor=white',
      'Python-3776AB?logo=python&logoColor=white',
      'C%2B%2B-00599C?logo=cplusplus&logoColor=white',
      'SQL-336791?logo=postgresql&logoColor=white',
    ],
  },
  {
    title: 'Security',
    badges: [
      'Cryptography-7C3AED?logo=keybase&logoColor=white',
      'OAuth_2.0-FF4088?logo=auth0&logoColor=white',
      'OWASP-2C3E50?logo=owasp&logoColor=white',
      'Authentication-0078D7?logo=keycloak&logoColor=white',
      'Encryption-0A66C2?logo=lock&logoColor=white',
    ],
  },
  {
    title: 'Cloud',
    badges: [
      'AWS-FF9900?logo=amazonaws&logoColor=white',
      'Firebase-FFCA28?logo=firebase&logoColor=black',
      'Google_Cloud-4285F4?logo=googlecloud&logoColor=white',
      'Docker-2496ED?logo=docker&logoColor=white',
      'GitHub_Actions-2088FF?logo=githubactions&logoColor=white',
      'Linux-FCC624?logo=linux&logoColor=black',
    ],
  },
  {
    title: 'Machine Learning',
    badges: [
      'OpenAI-412991?logo=openai&logoColor=white',
      'TensorFlow-FF6F00?logo=tensorflow&logoColor=white',
      'HuggingFace-FFD21E?logo=huggingface&logoColor=black',
      'Cohere-6B4EFF?logo=cohere&logoColor=white',
      'NumPy-013243?logo=numpy&logoColor=white',
      'Jupyter-F37626?logo=jupyter&logoColor=white',
    ],
  },
]

type ProjectVideoProps = { src: string }

function ProjectVideo({ src }: ProjectVideoProps) {
  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      }}
    >
      <MorphingDialogTrigger>
        <video
          src={src}
          autoPlay
          loop
          muted
          className="aspect-video w-full cursor-zoom-in rounded-xl"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
	  
        <MorphingDialogContent className="z-[999] relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          <video
            src={src}
            autoPlay
            loop
            muted
            className="aspect-video h-[50vh] w-full rounded-xl md:h-[70vh]"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="z-[997] fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 0.3, duration: 0.1 } },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

function MagneticSocialLink({
  children,
  link,
}: {
  children: React.ReactNode
  link: string
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    </Magnetic>
  )
}

export default function Personal() {
  // Typing component state & timing
  const TEXT = "Hey, I'm Yasser!"
  const TYPING_SPEED_MS = 90 // ms per character
  const AFTER_SHOW_ROCKET_MS = 160 // keep cursor briefly after rocket appears
  const START_SHAKE_AFTER_MS = 220 // start shaking shortly after cursor hides

  const [display, setDisplay] = useState('') // currently displayed text
  const [cursorVisible, setCursorVisible] = useState(true)
  const [showRocket, setShowRocket] = useState(false)
  const [rocketShaking, setRocketShaking] = useState(false)

  const idxRef = useRef(0)
  const intervalRef = useRef<number | null>(null)
  const finishTimerRef = useRef<number | null>(null)
  const shakeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    // Start typing
    intervalRef.current = window.setInterval(() => {
      const i = idxRef.current
      if (i < TEXT.length) {
        setDisplay((s) => s + TEXT[i])
        idxRef.current = i + 1
      } else {
        // finished typing
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        // show rocket immediately
        setShowRocket(true)

        // briefly keep cursor, then hide cursor and start shaking
        finishTimerRef.current = window.setTimeout(() => {
          setCursorVisible(false)
        }, AFTER_SHOW_ROCKET_MS)

        shakeTimerRef.current = window.setTimeout(() => {
          setRocketShaking(true)
        }, START_SHAKE_AFTER_MS)
      }
    }, TYPING_SPEED_MS)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current)
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.main
      className="space-y-12"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {/* === HERO INTRO: Typing text + shaking rocket (replaced old block) === */}
      <motion.section className="pt-8 text-center md:text-left">
        <motion.div
          className="text-3xl md:text-5xl text-zinc-900 dark:text-zinc-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span style={{ whiteSpace: 'pre' }}>{display}</span>

          {/* blinking cursor (only while visible) */}
          {cursorVisible && (
            <motion.span
              className="ml-1 text-zinc-900 dark:text-zinc-100"
              aria-hidden
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              |
            </motion.span>
          )}

          {/* rocket - appears after typing finishes */}
          {showRocket && (
            <motion.span
              className="ml-2 inline-block"
              initial={{ opacity: 0, y: 6, rotate: 0 }}
              animate={
                rocketShaking
                  ? {
                      opacity: 1,
                      rotate: [0, -8, 8, -5, 5, 0],
                      x: [0, -2, 2, -1.5, 1.5, 0],
                      y: [0, 2, -2, 1, -1, 0],
                    }
                  : { opacity: 1, y: 0, rotate: 0 }
              }
              transition={
                rocketShaking
                  ? { duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }
                  : { duration: 0.28, ease: 'easeOut' }
              }
              aria-hidden
            >
              🚀
            </motion.span>
          )}
        </motion.div>
      </motion.section>

      {/* === INTRO TEXT === */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <div className="flex-1">
          <p className="text-zinc-600 dark:text-zinc-400">
            Security-focused software engineer skilled in TypeScript, React
            Native, and AWS, with experience in GitHub Actions, cloud security,
            and vulnerability remediation. Experienced in secure system design,
            MFA integration, and OWASP-aligned development.
          </p>
        </div>
		
		  <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex mt-5 items-center w-fit text-zinc-800 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="font-medium mr-2">Explore Projects</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none" width="16" height="16" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <path
                d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                fill="currentColor"
              />
            </svg>
          </a>
		  
      </motion.section>
	  
	  
	        <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
	          <h3 className="mb-5 text-lg font-medium">Education</h3>

{/* University of Toronto — corrected (professional wording) */}
<a
  className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30 block"
  href="#"
  onClick={(e) => e.preventDefault()}
  aria-label="University of Toronto — Bachelor of Science"
>
<Spotlight
  className="from-amber-300 via-amber-200 to-amber-100 blur-2xl dark:from-amber-400 dark:via-amber-300 dark:to-amber-200"
  size={64}
/>


  <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
    <div className="relative flex w-full flex-row justify-between">
      <div>
        <h4 className="font-normal dark:text-zinc-300">
          University of Toronto
        </h4>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Honours B.Sc. in Computer Science & Economics
        </p>
      </div>

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        <div>Expected 2023 - 2027</div>
      </div>
    </div>

    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
      Relevant Coursework: Algebraic Cryptography (Audit), Formal Methods, Algorithms & Data Structures.<br/>
	  Member of the Google Student Developer Club and OISE InnovED accelerator program.
    </p>
  </div>
</a>
      </motion.section>
	


      {/* === WORK EXPERIENCE === */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Work Experience</h3>
        <div className="flex flex-col space-y-2">
          {WORK_EXPERIENCE.map((job) => (
            <a
              className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30"
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              key={job.id}
            >
              <Spotlight
                className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
                size={64}
              />
              <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
                <div className="relative flex w-full flex-row justify-between">
                  <div>
                    <h4 className="font-normal dark:text-zinc-100">
                      {job.title}
                    </h4>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {job.company}
                    </p>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {job.start} - {job.end}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </motion.section>	  

      {/* === SKILLS (inserted directly, badges only — no wrapper divs around badges) === */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        aria-label="Skills"
      >
        <h3 className="mb-4 text-lg font-medium">Skills</h3>

        {/* Render category heading followed directly by badge images (no div wrappers) */}
        {SKILL_CATEGORIES.map((cat, ci) => (
          <motion.span
            key={cat.title}
            className="block mb-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * ci, duration: 0.35 }}
          >
            <h3 className="mb-2">{cat.title}</h3>

            {/* badges: plain images, inline, no extra container */}
            {cat.badges.map((b, i) => (
              <motion.img
                key={b}
                src={`https://img.shields.io/badge/${b}&style=for-the-badge`}
                alt={b}
                className="inline-block mr-2 mb-2 rounded-md select-none"
                draggable={false}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i + 0.04 * ci, duration: 0.35 }}
              />
            ))}
          </motion.span>
        ))}
      </motion.section>
	  
	  {/* ---------- CERTIFICATIONS (same card style as Work Experience) ---------- */}
<motion.section
  variants={VARIANTS_SECTION}
  transition={TRANSITION_SECTION}
  aria-label="Certifications"
>
  <h3 className="mb-5 text-lg font-medium">Certifications</h3>

  <div className="flex flex-col md:flex-row gap-4">
    {/* Cert 1 */}
    <a
      className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30 md:w-1/3 block"
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label="Advanced Learning Algorithms — Stanford"
    >
      <Spotlight
        className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
        size={48}
      />

      <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
        <div className="flex w-full items-start justify-between">
          <div>
            <h4 className="font-normal dark:text-zinc-100">
              Advanced Learning Algorithms
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Stanford University
            </p>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <div>2024</div>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Covered supervised learning, optimization, regularization, TensorFlow, and practical model evaluation.
        </p>
      </div>
    </a>

    {/* Cert 2 */}
    <a
      className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30 md:w-1/3 block"
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label="LLMOps — Google"
    >
      <Spotlight
        className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
        size={48}
      />

      <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
        <div className="flex w-full items-start justify-between">
          <div>
            <h4 className="font-normal dark:text-zinc-100">LLMOps</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Google</p>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <div>2024</div>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Practical MLOps for large language models: deployment, monitoring, and scaling best practices.
        </p>
      </div>
    </a>

    {/* Cert 3 */}
    <a
      className="relative overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30 md:w-1/3 block"
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-label="Bloomberg Market Concepts — Bloomberg"
    >
      <Spotlight
        className="from-zinc-900 via-zinc-800 to-zinc-700 blur-2xl dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-50"
        size={48}
      />

      <div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
        <div className="flex w-full items-start justify-between">
          <div>
            <h4 className="font-normal dark:text-zinc-100">
              Bloomberg Market Concepts
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Bloomberg</p>
          </div>

          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <div>2023</div>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Fundamentals of market data, Bloomberg Terminal use, and macro/financial concepts.
        </p>
      </div>
    </a>
  </div>
</motion.section>
 {/* === ADDITIONAL PROJECTS (Wonder 2 + QuizCraft) === */}
<motion.section
  variants={VARIANTS_SECTION}
  transition={TRANSITION_SECTION}
>
  <h3 className="mb-5 text-lg font-medium">Pinned Projects</h3>
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {/* QuizCraft (left) */}
    <div className="space-y-2">
      <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
        <ProjectVideo src="/videos/quizcraft.mp4" />
      </div>
      <div className="px-1">
        <a
          className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
          href="https://github.com/AsymptoticAstronaut/QuizCraft"
          target="_blank"
        >
          QuizCraft
          <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 dark:bg-zinc-50 transition-all duration-200 group-hover:max-w-full"></span>
        </a>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          AI-powered Java Swing quiz generator using Cohere NLP APIs, enabling automatic study question creation and collaborative editing.
        </p>
      </div>
    </div>

    {/* Wonder 2 (right) */}
    <div className="space-y-2">
      <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
        <ProjectVideo src="/videos/wonder2.mp4" />
      </div>
      <div className="px-1">
        <a
          className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
          href="https://playwonder.ca"
          target="_blank"
        >
          Wonder 2.0
          <span className="absolute bottom-0.5 left-0 block h-[1px] w-full max-w-0 bg-zinc-900 dark:bg-zinc-50 transition-all duration-200 group-hover:max-w-full"></span>
        </a>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
Advanced sequel built with Phaser, Node.js, Firebase, AWS; integrated OpenAI for adaptive feedback, OAuth2 auth, classroom dashboards, and reading-comprehension analytics.        </p>
      </div>
	  
    </div>
	  		  <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center w-fit ml-1 text-zinc-800 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="font-medium mr-2">View More</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="none" width="16" height="16" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <path
                d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                fill="currentColor"
              />
            </svg>
          </a>
  </div>
  
</motion.section> 
	  

      {/* === CONNECT === */}
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Connect</h3>
        <p className="mb-5 text-zinc-600 dark:text-zinc-400">
          Feel free to contact me at{' '}
          <a className="underline dark:text-zinc-300" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </p>
        <div className="flex items-center justify-start space-x-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink key={link.label} link={link.link}>
              {link.label}
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>
    </motion.main>
  )
}
