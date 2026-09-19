import type { Metadata, Viewport } from "next"
import { Chakra_Petch, JetBrains_Mono } from "next/font/google"
import "./globals.css"

/**
 * Type pairing: JetBrains Mono is the primary voice — the whole console speaks
 * in monospace because data should look like data. Chakra Petch handles display
 * only; its clipped, angular terminals read as instrument signage rather than
 * sci-fi costume.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
})

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PRAFUL CHIKHLE // AVIONICS",
  description:
    "Staff Software Engineer at SailPoint Technologies. Enterprise visualisation platforms, real-time operations dashboards, and the component systems other teams build on.",
  authors: [{ name: "Praful Chikhle" }],
  openGraph: {
    title: "PRAFUL CHIKHLE // AVIONICS",
    description:
      "Staff Software Engineer — architecture, Angular, TypeScript, WebGL visualisation.",
    type: "profile",
  },
}

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}
