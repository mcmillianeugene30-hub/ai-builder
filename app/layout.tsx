import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorProvider } from '@/lib/error-store'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'AI App Builder',
  description: 'Build production apps with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorProvider>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </ErrorProvider>
      </body>
    </html>
  )
}
