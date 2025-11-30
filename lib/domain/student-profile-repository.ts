import type {
  StudentContextFile,
  StudentProfile,
} from '@/types/student-profile'

export interface StudentProfileRepository {
  listProfiles(userId: string): Promise<StudentProfile[]>
  getProfile(userId: string, profileId: string): Promise<StudentProfile | null>
  createProfile(
    userId: string,
    input: Omit<StudentProfile, 'id' | 'stats'>
  ): Promise<StudentProfile>
  updateProfile(
    userId: string,
    profileId: string,
    patch: Partial<StudentProfile>
  ): Promise<StudentProfile>
  deleteProfile(userId: string, profileId: string): Promise<void>
}

export interface StudentContextFileStorage {
  listFiles(userId: string, profileId: string): Promise<StudentContextFile[]>
  uploadFile(
    userId: string,
    profileId: string,
    file: Blob | ArrayBuffer,
    metadata: { label: string }
  ): Promise<StudentContextFile>
  deleteFile(
    userId: string,
    profileId: string,
    fileId: string
  ): Promise<void>
}

