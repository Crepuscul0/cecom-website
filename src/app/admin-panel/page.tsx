"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPanelPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin-panel/cms')
  }, [router])
  return null
}
