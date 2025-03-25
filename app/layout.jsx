import "./globals.css"
import "./styles/globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "飞行日志",
  description: "记录您的飞行旅程和旅行回忆",
  generator: 'Next.js'
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 