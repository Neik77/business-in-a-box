import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business in a Box™ | Personalized Entrepreneur Headquarters',
  description: 'Built by Coach Neik™ | AI Legacy Lounge™ | Legacy Labs™',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
