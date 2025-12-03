import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/options'
import {
  PostgresActivityRepository,
  type ActivityType,
} from '@/lib/server/postgres-activity-repository'

const repo = new PostgresActivityRepository()

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const getUserId = async () => {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const events = await repo.listRecent(userId, 20)
    return NextResponse.json(events)
  } catch (err) {
    console.error('Failed to list activity events', err)
    return NextResponse.json({ error: 'Failed to list activity events' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const body = (await req.json()) as {
      type?: string
      description?: string
    }

    const type = body.type as ActivityType | undefined
    const description = typeof body.description === 'string' ? body.description.trim() : ''

    const allowedTypes: ActivityType[] = [
      'login',
      'profile_created',
      'profile_updated',
      'draft_generated',
    ]

    if (!type || !allowedTypes.includes(type) || !description) {
      return NextResponse.json(
        { error: 'Invalid activity payload' },
        { status: 400 }
      )
    }

    await repo.logEvent(userId, type, description)
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('Failed to log activity event', err)
    return NextResponse.json({ error: 'Failed to log activity event' }, { status: 500 })
  }
}

