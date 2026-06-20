import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const dmSans = localFont({
  src: [
    {
      path: '../public/fonts/DMSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/DMSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-dm-sans',
})

const lostInSouth = localFont({
  src: '../public/fonts/Lost-in-South.woff2',
  variable: '--font-lost-in-south',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'taest. | Global Social Club',
  description: 'Global social club for brands, agencies and creatives',
  generator: 'v0.app'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Cleaned up CSS scroll hijacking properties to allow JS physics engine to run flawlessly
    <html lang="en" className="bg-black">
      <body className={`${dmSans.variable} ${lostInSouth.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}