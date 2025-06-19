// New success page layout
import { getCategories } from "@/lib/sanity/queries"
import { Layout } from "@/components/layout"

export default async function NewSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()
  
  return (
    <Layout categories={categories}>
      {children}
    </Layout>
  )
}