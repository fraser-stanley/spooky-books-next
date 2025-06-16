import { getHomepage } from "@/lib/sanity/queries"

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  try {
    const homepage = await getHomepage(false)
    
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Debug: Homepage Data</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(homepage, null, 2)}
        </pre>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Debug: Error</h1>
        <pre className="bg-red-100 p-4 rounded">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    )
  }
}