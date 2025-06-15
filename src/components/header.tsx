'use client'

import Link from 'next/link'
import { Navigation } from './navigation'
import { CartButton } from './cart-button'
import type { SanityCategory } from '@/lib/sanity/types'

interface HeaderProps {
  categories: SanityCategory[]
}

export function Header({ categories }: HeaderProps) {
  return (
    <div className="text-md sm:text-sm p-4 pb-12 xl:pb-24 uppercase">

      {/* Top row: Title and Cart inline on mobile, grid on desktop */}
      <div className="flex justify-between items-center sm:grid sm:grid-cols-12">
        <Link href="/" className="font-bold col-span-2">
          Spooky Books
        </Link>

        <div className="hidden sm:block col-span-2 col-start-11 justify-self-end">
          <CartButton />
        </div>

        {/* On mobile, show Cart inline */}
        <div className="sm:hidden">
          <CartButton />
        </div>
      </div>

      {/* Navigation row below title/cart */}
      <div className="mt-4 sm:mt-0 sm:col-span-6">
        <Navigation categories={categories} />
      </div>
    </div>
  )
}

