// Cart layout that fetches categories server-side
import { getCategories } from "@/lib/sanity/queries";
import { Layout } from "@/components/layout";

export default async function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return <Layout categories={categories}>{children}</Layout>;
}
