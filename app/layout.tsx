import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Cairo, Amiri } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const cairo = Cairo({ 
  variable: '--font-sans-arabic', 
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700']
})

const amiri = Amiri({ 
  variable: '--font-serif-arabic', 
  subsets: ['arabic', 'latin'],
  weight: ['400', '700']
})

export const metadata: Metadata = {
  title: 'مدونتي',
  description: 'مدونة عربية عصرية',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiri.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
