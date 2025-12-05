ScholarQuant
=============

ScholarQuant is a professional web application that supports the full scholarship lifecycle. It centralizes student profiles, evaluates scholarship opportunities, guides essay drafting with structured prompts, and keeps supporting files organized. Security is treated as a core feature alongside usability. The project earned 2nd place at the Anthropic AI Hackathon in Toronto, emphasizing its quality and focus on real-world use.

Core Capabilities
-----------------
- Profiles: capture, update, and reuse student details across applications.  
- Scholarships: track, compare, and prioritize opportunities against profile signals.  
- Drafts: generate, review, and refine essays with clear guidance.  
- Files: attach contextual documents and notes in one place for faster drafting.

Usage Overview
--------------
- Clone the repository, install dependencies, configure environment values, and run the development server with npm scripts.  
- When ready, package the app in a container and deploy to AWS (for example, ECR/ECS Fargate with S3 storage and Cognito/Google sign-in).  
- State management uses Zustand; authentication uses NextAuth with Google via Cognito; file storage is S3-backed.

Security Posture
----------------
ScholarQuant’s security design is guided by the confidentiality, integrity, and availability (CIA) of student data and informed by OWASP best practices for modern web applications.