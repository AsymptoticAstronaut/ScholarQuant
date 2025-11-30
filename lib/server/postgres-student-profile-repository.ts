import type { PoolClient } from 'pg'

import type { StudentProfile } from '@/types/student-profile'
import { EMPTY_FEATURES } from '@/types/student-profile'
import type { StudentProfileRepository } from '@/lib/domain/student-profile-repository'
import { withClient } from './db'

const tableName = (() => {
  const name = process.env.STUDENT_PROFILES_TABLE ?? 'student_profiles'
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error('Invalid table name for STUDENT_PROFILES_TABLE')
  }
  return name
})()

const DEFAULT_STATS = {
  scholarshipsMatched: 0,
  draftsGenerated: 0,
  avgAlignment: 0,
}

const ensureProfileShape = (input: Partial<StudentProfile>): StudentProfile => {
  const id = input.id ?? crypto.randomUUID()

  return {
    id,
    name: input.name ?? '',
    program: input.program ?? '',
    year: input.year ?? '',
    tags: input.tags ?? [],

    gpa: input.gpa,
    gpaScale: input.gpaScale,
    location: input.location,
    university: input.university ?? '',
    campus: input.campus,
    degreeLevel: input.degreeLevel,
    enrollmentStatus: input.enrollmentStatus,
    citizenshipStatus: input.citizenshipStatus,
    firstGen: input.firstGen,
    languages: input.languages ?? [],
    workStatus: input.workStatus,
    financialNeedLevel: input.financialNeedLevel,
    awards: input.awards ?? [],
    testScores: input.testScores ?? {},

    recommendedScholarshipIds: input.recommendedScholarshipIds ?? [],

    features: input.features ?? { ...EMPTY_FEATURES },
    stories: input.stories ?? [],
    baseStory: input.baseStory,
    contextFiles: input.contextFiles ?? [],
    stats: input.stats ?? { ...DEFAULT_STATS },
  }
}

const rowToProfile = (row: { data: StudentProfile }) => ensureProfileShape(row.data)

export class PostgresStudentProfileRepository implements StudentProfileRepository {
  async listProfiles(userId: string): Promise<StudentProfile[]> {
    return withClient(async (client) => {
      const result = await client.query(
        `select data from ${tableName} where user_id = $1 order by data->>'name' asc`,
        [userId]
      )
      return result.rows.map(rowToProfile)
    })
  }

  async getProfile(userId: string, profileId: string): Promise<StudentProfile | null> {
    return withClient(async (client) => {
      const result = await client.query(
        `select data from ${tableName} where user_id = $1 and profile_id = $2 limit 1`,
        [userId, profileId]
      )
      if (!result.rows[0]) return null
      return rowToProfile(result.rows[0])
    })
  }

  async createProfile(
    userId: string,
    input: Omit<StudentProfile, 'id' | 'stats'>
  ): Promise<StudentProfile> {
    const profile = ensureProfileShape({ ...input, id: crypto.randomUUID() })

    return withClient(async (client) => {
      await client.query(
        `insert into ${tableName} (user_id, profile_id, data) values ($1, $2, $3::jsonb)`,
        [userId, profile.id, JSON.stringify(profile)]
      )
      return profile
    })
  }

  async updateProfile(
    userId: string,
    profileId: string,
    patch: Partial<StudentProfile>
  ): Promise<StudentProfile> {
    return withClient(async (client) => {
      const current = await this.getProfileWithClient(client, userId, profileId)
      if (!current) {
        throw new Error('Profile not found')
      }
      const nextProfile = ensureProfileShape({ ...current, ...patch, id: profileId })

      const result = await client.query(
        `update ${tableName} set data = $3::jsonb, updated_at = now() where user_id = $1 and profile_id = $2 returning data`,
        [userId, profileId, JSON.stringify(nextProfile)]
      )

      return rowToProfile(result.rows[0])
    })
  }

  async deleteProfile(userId: string, profileId: string): Promise<void> {
    return withClient(async (client) => {
      await client.query(`delete from ${tableName} where user_id = $1 and profile_id = $2`, [
        userId,
        profileId,
      ])
    })
  }

  // Internal helper that reuses an existing client (avoids nested pool checkout).
  private async getProfileWithClient(
    client: PoolClient,
    userId: string,
    profileId: string
  ): Promise<StudentProfile | null> {
    const result = await client.query(
      `select data from ${tableName} where user_id = $1 and profile_id = $2 limit 1`,
      [userId, profileId]
    )
    if (!result.rows[0]) return null
    return rowToProfile(result.rows[0])
  }
}

