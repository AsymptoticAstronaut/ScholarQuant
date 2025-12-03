import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/options'
import { PostgresStudentProfileRepository } from '@/lib/server/postgres-student-profile-repository'

const repo = new PostgresStudentProfileRepository()

const MAX_PROFILE_JSON_BYTES = 128 * 1024

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

const getUserId = async () => {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const { id } = await params
    const profile = await repo.getProfile(userId, id)
    if (!profile) return notFound()
    return NextResponse.json(profile)
  } catch (err) {
    console.error('Failed to fetch profile', err)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  const contentLength = req.headers.get('content-length')
  if (contentLength && Number(contentLength) > MAX_PROFILE_JSON_BYTES) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const updated = await repo.updateProfile(userId, id, body)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Failed to update profile', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const { id } = await params
    await repo.deleteProfile(userId, id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to delete profile', err)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
