import type { Metadata } from 'next'
import './globals.css'
<<<<<<< HEAD
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorProvider } from '@/lib/error-store'
=======
>>>>>>> 640877f (fix: resolve all 14 production issues)
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
        <AuthProvider>
          <ErrorProvider>
            <Nav />
            {children}
          </ErrorProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
