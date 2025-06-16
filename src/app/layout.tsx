// app/layout.tsx
import "./globals.css"
import { CartProvider } from "@/components/cart-contex"
import { Toaster } from "sonner"
import { VisualEditing } from "next-sanity"
import { draftMode } from "next/headers"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  
  return (
    <html lang="en">
      <body className="antialiased  text-black">
        <CartProvider>
          {children}
          <Toaster position="bottom-right" />
          {isEnabled && <VisualEditing />}
        </CartProvider>
      </body>
    </html>
  )
}
