// app/layout.tsx
import "./globals.css"
import { CartProvider } from "@/components/cart-contex"
import { Toaster } from "sonner"
import { draftMode } from "next/headers"
import { VisualEditingProvider } from "@/components/visual-editing-provider"
import { SanityLive } from "@/lib/sanity/live"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/webfonts/neue-haas-unica-pro-web.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body className="antialiased  text-black">
        <CartProvider>
          {children}
          <Toaster position="bottom-right" />
          <VisualEditingProvider isEnabled={isEnabled} />
          <SanityLive />
        </CartProvider>
      </body>
    </html>
  )
}
