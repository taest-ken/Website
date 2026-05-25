'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const ScrollRig = dynamic(() => import('@/components/ScrollRig'), {
  ssr: false,
})

export default function ScrollRigClient({ children }: { children: ReactNode }) {
  return <ScrollRig>{children}</ScrollRig>
}