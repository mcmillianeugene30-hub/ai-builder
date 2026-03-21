import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorProvider } from '@/lib/error-store'
import { AuthProvider } from '@/components/AuthProvider'
import { Nav } from '@/components/Nav'
import { ToastContainer } from '@/components/errors/ToastContainer'
import { FatalErrorScreen } from '@/components/errors/FatalErrorScreen'

export const metadata: Metadata = {
  title: 'AI App Builder',
  description: 'Build and deploy apps with AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ErrorProvider>
            <AuthProvider>
              <Nav />
              <ToastContainer />
              <FatalErrorScreen />
              {children}
            </AuthProvider>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
