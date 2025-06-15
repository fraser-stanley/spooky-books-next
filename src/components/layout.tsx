// components/layout.tsx
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { SanityCategory } from "@/lib/sanity/types"

interface LayoutProps {
  children: React.ReactNode
  categories: SanityCategory[]
}

export function Layout({ children, categories }: LayoutProps) {
  return (
    <>
      <Header categories={categories} />
      <main className="mx-4 2xl:mx-16">{children}</main>
      <Footer />
    </>
  )
}
