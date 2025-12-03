import { withClient } from './db'

export type ActivityType =
  | 'login'
  | 'profile_created'
  | 'profile_updated'
  | 'draft_generated'

export type ActivityEvent = {
  id: string
  type: ActivityType
  description: string
  createdAt: string
}

export class PostgresActivityRepository {
  async logEvent(userId: string, type: ActivityType, description: string): Promise<void> {
    await withClient((client) =>
      client.query('insert into activity_events (user_id, type, description) values ($1, $2, $3)', [
        userId,
        type,
        description,
      ])
    )
  }

  async listRecent(userId: string, limit = 20): Promise<ActivityEvent[]> {
    const result = await withClient((client) =>
      client.query(
        'select id, type, description, created_at from activity_events where user_id = $1 order by created_at desc limit $2',
        [userId, limit]
      )
    )

    return result.rows.map((row) => ({
      id: String(row.id),
      type: row.type as ActivityType,
      description: row.description as string,
      createdAt: (row.created_at as Date).toISOString(),
    }))
  }
}

