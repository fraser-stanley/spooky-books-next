'use client'

/**
 * This route redirects to the external Sanity Studio.
 * Due to Next.js 15 compatibility issues with embedded studio,
 * we redirect to the hosted studio instead.
 */

import { useEffect } from 'react'

export default function StudioPage() {
  useEffect(() => {
    // Redirect to hosted Sanity Studio
    window.location.href = 'https://spooky-books.sanity.studio'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Redirecting to Sanity Studio...</h1>
        <p className="text-gray-600 mb-4">
          You will be redirected to the Sanity Studio interface.
        </p>
        <a 
          href="https://spooky-books.sanity.studio"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open Studio Manually
        </a>
      </div>
    </div>
  )
}