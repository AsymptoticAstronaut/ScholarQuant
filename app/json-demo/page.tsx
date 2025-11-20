'use client'

import { useEffect } from 'react'
import { useScholarshipStore } from '@/lib/stores/scholarships-store'
import { useStudentProfileStore } from '@/lib/stores/student-profiles-store'

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default function ExportPage() {
  const scholarships = useScholarshipStore((s) => s.scholarships)
  const students = useStudentProfileStore((s) => s.profiles)

  useEffect(() => {
    const scholarshipsJson = JSON.stringify(scholarships, null, 2)
    const studentsJson = JSON.stringify(students, null, 2)

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Data export examples</title>
          <style>
            body {
              background: #020617;
              color: #e5e7eb;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 1.5rem;
              line-height: 1.4;
            }
            h1, h2 {
              color: #f9fafb;
              margin: 0 0 0.5rem;
            }
            h2 {
              margin-top: 1.5rem;
            }
            pre {
              background: #020617;
              border-radius: 0.5rem;
              padding: 1rem;
              border: 1px solid #1f2937;
              overflow-x: auto;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Agentiiv local data export</h1>

          <h2>Scholarships</h2>
          <pre>${escapeHtml(scholarshipsJson)}</pre>

          <h2>Student profiles</h2>
          <pre>${escapeHtml(studentsJson)}</pre>
        </body>
      </html>
    `

    document.open()
    document.write(html)
    document.close()
  }, [scholarships, students])

  // React never actually renders this, because we overwrite the whole document.
  return null
}
