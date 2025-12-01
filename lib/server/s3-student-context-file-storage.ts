import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'

import type { StudentContextFileStorage } from '@/lib/domain/student-profile-repository'
import type { StudentContextFile } from '@/types/student-profile'

type S3StorageOptions = {
  bucket?: string
  region?: string
}

const getEnv = (key: string, fallback?: string) => {
  const v = process.env[key]
  if (v == null || v === '') return fallback
  return v
}

export class S3StudentContextFileStorage implements StudentContextFileStorage {
  private client: S3Client
  private bucket: string

  constructor(opts: S3StorageOptions = {}) {
    const bucket = opts.bucket ?? getEnv('STUDENT_FILES_BUCKET')
    if (!bucket) {
      throw new Error('STUDENT_FILES_BUCKET env var is required for S3 uploads')
    }

    const region = opts.region ?? getEnv('AWS_REGION') ?? 'us-east-1'

    this.client = new S3Client({
      region,
    })
    this.bucket = bucket
  }

  async listFiles(_: string, __: string): Promise<StudentContextFile[]> {
    // We store metadata in Postgres; the API routes return that directly.
    return []
  }

  async uploadFile(
    userId: string,
    profileId: string,
    file: Blob | ArrayBuffer,
    metadata: { label: string }
  ): Promise<StudentContextFile> {
    const id = crypto.randomUUID()
    const key = `${userId}/${profileId}/${id}`
    const fileName = this.extractName(file)
    const contentType = this.extractContentType(file) ?? 'application/octet-stream'

    const body =
      file instanceof ArrayBuffer ? Buffer.from(file) : Buffer.from(await file.arrayBuffer())

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: {
          label: metadata.label ?? '',
          filename: fileName ?? '',
        },
      })
    )

    return {
      id,
      name: fileName ?? 'uploaded-file',
      label: metadata.label,
    }
  }

  async deleteFile(userId: string, profileId: string, fileId: string): Promise<void> {
    const key = `${userId}/${profileId}/${fileId}`
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
  }

  async getFile(
    userId: string,
    profileId: string,
    fileId: string
  ): Promise<{ body: Uint8Array; contentType?: string; fileName?: string }> {
    const key = `${userId}/${profileId}/${fileId}`
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )

    const body = await result.Body?.transformToByteArray()
    if (!body) {
      throw new Error('File not found or empty')
    }

    const fileName = result.Metadata?.filename || undefined

    return {
      body,
      contentType: result.ContentType || undefined,
      fileName,
    }
  }

  private extractName(file: Blob | ArrayBuffer): string | undefined {
    if (file instanceof ArrayBuffer) return undefined
    // @ts-expect-error File name exists in runtime File, but TS only knows Blob here
    return file.name as string | undefined
  }

  private extractContentType(file: Blob | ArrayBuffer): string | undefined {
    if (file instanceof ArrayBuffer) return undefined
    return file.type || undefined
  }
}
