import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth/options'
import { PostgresStudentProfileRepository } from '@/lib/server/postgres-student-profile-repository'
import { S3StudentContextFileStorage } from '@/lib/server/s3-student-context-file-storage'

const repo = new PostgresStudentProfileRepository()
const storage = new S3StudentContextFileStorage()

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_LABEL_LENGTH = 256
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'text/plain',
  'text/markdown',
]

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
    return NextResponse.json(profile.contextFiles ?? [])
  } catch (err) {
    console.error('Failed to list files', err)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return unauthorized()

  try {
    const { id } = await params
    const formData = await req.formData()
    const file = formData.get('file')
    const rawLabel = (formData.get('label') as string | null) ?? ''
    const label = rawLabel.trim().slice(0, MAX_LABEL_LENGTH)

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }
    if (!label) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 })
    }

    // Enforce a per-file size limit to reduce DoS risk.
    if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 })
    }

    // Only allow a small set of document/text types.
    const fileType = file.type
    if (fileType && !ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      )
    }

    const profile = await repo.getProfile(userId, id)
    if (!profile) return notFound()

    const uploaded = await storage.uploadFile(userId, id, file, { label })

    const nextFiles = [...(profile.contextFiles ?? []), uploaded]
    const updated = await repo.updateProfile(userId, id, {
      contextFiles: nextFiles,
    })

    return NextResponse.json(updated.contextFiles ?? [], { status: 201 })
  } catch (err) {
    console.error('Failed to upload file', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
