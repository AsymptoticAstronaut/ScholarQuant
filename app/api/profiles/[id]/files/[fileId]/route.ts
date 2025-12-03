import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/options'
import { PostgresStudentProfileRepository } from '@/lib/server/postgres-student-profile-repository'
import { S3StudentContextFileStorage } from '@/lib/server/s3-student-context-file-storage'

const repo = new PostgresStudentProfileRepository()
const storage = new S3StudentContextFileStorage()

const unauthorized = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

const getUserId = async () => {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

const sanitizeFilename = (name: string): string => {
  const cleaned = name.replace(/[\r\n"]/g, '_').trim()
  if (!cleaned) return 'download'
  return cleaned.slice(0, 200)
}

type Params = { params: Promise<{ id: string; fileId: string }> }

export async function GET(_: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const { id, fileId } = await params
    const profile = await repo.getProfile(userId, id)
    if (!profile) return notFound()

    const target = (profile.contextFiles ?? []).find((f) => f.id === fileId)
    if (!target) return notFound()

    const file = await storage.getFile(userId, id, fileId)
    const filename = sanitizeFilename(file.fileName ?? target.name)

    return new Response(Buffer.from(file.body), {
      headers: {
        'Content-Type': file.contentType ?? 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('Failed to fetch file', err)
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const { id, fileId } = await params
    const profile = await repo.getProfile(userId, id)
    if (!profile) return notFound()

    const current = profile.contextFiles ?? []
    const target = current.find((f) => f.id === fileId)
    if (!target) return notFound()

    await storage.deleteFile(userId, id, fileId)

    const nextFiles = current.filter((f) => f.id !== fileId)
    const updated = await repo.updateProfile(userId, id, {
      contextFiles: nextFiles,
    })

    return NextResponse.json(updated.contextFiles ?? [])
  } catch (err) {
    console.error('Failed to delete file', err)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
