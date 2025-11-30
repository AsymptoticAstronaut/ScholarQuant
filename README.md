ScholarQuant
- UI: dashboard, scholarships, profiles, drafts
- Auth: NextAuth with Cognito (Google as IdP).
- Persistence: Postgres (RDS) for profiles; S3 for context files. API routes in `app/api/profiles/**` call repositories, UI uses Zustand store with API-backed actions.
- Types/interfaces: domain types in `types/student-profile.ts`, `types/dimensions.ts`; repositories in `lib/domain/student-profile-repository.ts`; Postgres adapter in `lib/server/postgres-student-profile-repository.ts`; S3 adapter in `lib/server/s3-student-context-file-storage.ts`.

Setup (local dev)
1) Install Node 18+.
2) Copy `.env.local.example` (or fill `.env.local`) with:
   - Auth: `COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET`, `COGNITO_ISSUER`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
   - Database: `DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>`, `STUDENT_PROFILES_TABLE=student_profiles`, `POSTGRES_SSL=true` (default).
   - Files: `STUDENT_FILES_BUCKET=<your-bucket>`, `AWS_REGION=<region>`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
3) Create the table (in your DB):
   ```sql
   CREATE TABLE IF NOT EXISTS student_profiles (
     user_id text NOT NULL,
     profile_id uuid NOT NULL,
     data jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now(),
     PRIMARY KEY (user_id, profile_id)
   );
   ```
4) Install deps: `npm install`
5) Run: `npm run dev` then open http://localhost:3000

Security principles
- Least privilege: IAM policy limited to bucket `student-profile-files` (Put/Delete/Get/List). Use IAM role on AWS compute; for local dev use a dedicated key and rotate.
- No public S3 access; rely on auth + signed requests via API. Keep RDS SG scoped (your IP for dev; app SG in prod).
- Secrets in env vars; do not commit keys. Prefer IAM roles in prod instead of long-lived keys.
- TLS everywhere: RDS connections use SSL by default (`rejectUnauthorized: false` for RDS cert), S3 via HTTPS.

SOLID & boundaries
- Single responsibility: domain types live in `types/*`; persistence ports in `lib/domain/*`; adapters in `lib/server/*`; UI state in `lib/stores/*`.
- Open/closed: swap repositories/adapters (e.g., another DB) without touching UI or domain.
- Liskov: `StudentProfileRepository` and `StudentContextFileStorage` implementations are interchangeable by contract.
- Interface segregation: file storage separated from profile CRUD.
- Dependency inversion: UI calls API; API depends on interfaces, then concrete Postgres/S3 adapters.

Key flows
- Profiles: UI store calls `/api/profiles` (list/create) and `/api/profiles/[id]` (get/patch/delete). Data persisted in Postgres JSONB per user.
- Files: UI calls `/api/profiles/[id]/files` (POST multipart; GET metadata) and `/api/profiles/[id]/files/[fileId]` (DELETE). Blobs in S3, metadata in Postgres.

Notes
- For local dev against RDS: open SG to your IP; for prod, run inside VPC and disable public access.
- If you point to a local Postgres without SSL, set `POSTGRES_SSL=false`.
