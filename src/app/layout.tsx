import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ErrorBoundary } from '@/src/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import ReduxProvider from '@/src/components/providers/redux-provider'

import { Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const geist = V0_Font_Geist({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist'
})
const geistMono = V0_Font_Geist_Mono({ 
  subsets: ['latin'], 
  weight: ["100","200","300","400","500","600","700","800","900"],
  variable: '--font-geist-mono'
})
const sourceSerif4 = V0_Font_Source_Serif_4({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800","900"],
  variable: '--font-source-serif-4'
})

export const metadata: Metadata = {
  title: {
    template: '%s | Document Management System',
    default: 'Document Management System - Secure Document Storage & Management'
  },
  description: 'Professional document management system for secure storage, organization, and collaboration. Aapke documents ko manage karne ka sabse aasan tarika.',
  keywords: ['document management', 'file storage', 'document organization', 'team collaboration'],
  authors: [{ name: 'DMS Team' }],
  creator: 'Document Management System',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Document Management System',
    description: 'Professional document management system for secure storage and collaboration.',
    siteName: 'DMS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Management System',
    description: 'Professional document management system for secure storage and collaboration.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${sourceSerif4.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ReduxProvider>
          <ErrorBoundary>
            {children}
            <Toaster />
            <Analytics />
          </ErrorBoundary>
        </ReduxProvider>
      </body>
    </html>
  )
}
