import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/options'
import { PostgresStudentProfileRepository } from '@/lib/server/postgres-student-profile-repository'

const repo = new PostgresStudentProfileRepository()

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
    const profiles = await repo.listProfiles(userId)
    return NextResponse.json(profiles)
  } catch (err) {
    console.error('Failed to list profiles', err)
    return NextResponse.json({ error: 'Failed to list profiles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const body = await req.json()
    const profile = await repo.createProfile(userId, body)
    return NextResponse.json(profile, { status: 201 })
  } catch (err) {
    console.error('Failed to create profile', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

