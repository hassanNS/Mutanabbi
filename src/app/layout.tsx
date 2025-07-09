import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مُحسِّن النص العربي بالذكاء الاصطناعي',
  description: 'أداة لتحليل نصوصك، تصحيحها، وترجمتها لجعلها أكثر قوة ووضوحًا.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
