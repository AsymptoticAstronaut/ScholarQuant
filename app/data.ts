// app/data.ts

type Project = {
  name: string
  description: string
  link: string
  video: string
  id: string
}

type WorkExperience = {
  company: string
  title: string
  start: string
  end: string
  link: string
  id: string
}

type BlogPost = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Wonder 1.0',
    description:
      'Educational literacy and STEM game built with Phaser, Node.js, Firebase, and AWS. Integrated OpenAI APIs for adaptive learning feedback and secure OAuth 2.0 access control.',
    link: 'https://playwonder.ca',
    video: '/videos/wonder.mp4',
    id: 'project1',
  },
  {
    name: 'Wonder 2.0',
    description:
      'Next-generation iteration of Wonder featuring AI-driven reading comprehension, teacher dashboards, and gamified adaptive learning built in React, Node.js, and OpenAI fine-tuned models.',
    link: 'https://playwonder.ca',
    video: '/videos/wonder2.mp4',
    id: 'project2',
  },
  {
    name: 'The Fourth Dimension',
    description:
      'Experimental first-person prototype combining Unreal Engine 4 with photogrammetry and LiDAR mapping to explore immersive environmental storytelling.',
    link: 'https://github.com/AsymptoticAstronaut/TheFourthDimension',
    video: '/videos/dimension.mp4',
    id: 'project3',
  },
  {
    name: 'QuizCraft',
    description:
      'AI-powered desktop quiz generator using Java Swing and Cohere NLP API. Automatically creates study questions from uploaded content with real-time collaboration and CRUD APIs.',
    link: 'https://github.com/AsymptoticAstronaut/QuizCraft',
    video: '/videos/quizcraft.mp4',
    id: 'project4',
  },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Wonder',
    title: 'Co-Founder & Software Developer',
    start: 'Jan 2025',
    end: 'Present',
    link: 'https://playwonder.ca',
    id: 'work1',
  },
  {
    company: 'Dalla Lana School of Public Health',
    title: 'Facilitator',
    start: 'Sep 2024',
    end: 'Present',
    link: 'https://www.dlsph.utoronto.ca',
    id: 'work2',
  },
  {
    company: 'Toronto Blue Jays Summer Camp',
    title: 'Team Supervisor',
    start: 'Jun 2024',
    end: 'Aug 2024',
    link: 'https://www.bluejays.com',
    id: 'work3',
  },
  {
    company: 'Toronto District School Board',
    title: 'Programming Teacher Assistant — Python & Robotics',
    start: 'Sep 2022',
    end: 'Jan 2023',
    link: 'https://www.tdsb.on.ca',
    id: 'work4',
  },
  {
    company: 'Fiverr',
    title: 'Freelance Web Developer',
    start: 'Jan 2021',
    end: 'Nov 2022',
    link: 'https://www.fiverr.com',
    id: 'work5',
  },
]

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Secure by Design: Applying OWASP in Modern Development',
    description:
      'A reflection on integrating cryptographic APIs, MFA, and secure coding practices in full-stack systems.',
    link: '#',
    uid: 'blog-1',
  },
  {
    title: 'Building Wonder: AI Literacy Games for Students',
    description:
      'Behind the scenes of developing an educational game that adapts learning feedback using LLMs.',
    link: '#',
    uid: 'blog-2',
  },
  {
    title: 'From Freelance to Founding: Lessons in Product Design',
    description:
      'What years of freelance web development taught me about scalability, security, and user trust.',
    link: '#',
    uid: 'blog-3',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    link: 'https://github.com/AsymptoticAstronaut',
  },
  {
    label: 'LinkedIn',
    link: 'https://linkedin.com/in/yasser-noori',
  },
]

export const EMAIL = 'yasser.noori@mail.utoronto.ca'
