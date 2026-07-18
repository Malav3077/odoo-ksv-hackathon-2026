import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: { default: 'RentEase — Rental Management', template: '%s · RentEase' },
  description: 'Rental Management System — powered by RentEase',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} h-full`}>
      <body className="min-h-full antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={200}>
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
