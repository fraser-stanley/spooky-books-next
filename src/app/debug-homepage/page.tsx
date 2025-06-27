import { sanityFetch } from "@/lib/sanity/live";
import { homepageQuery } from "@/lib/sanity/groq";

export default async function DebugHomepage() {
  try {
    console.log("🔍 Debugging homepage data...");

    // Try to fetch homepage data
    const { data: homepage } = await sanityFetch({
      query: homepageQuery,
      tags: ["homepage"],
    });

    // Also try the old query structure
    const oldHomepage = await sanityFetch({
      query: `*[_type == "homepage"][0]{
        title,
        heroSections[]{
          _type,
          title,
          caption,
          layout,
          leftImage,
          rightImage,
          image,
          linkedProduct->{
            _id,
            title,
            author,
            "slug": slug.current
          }
        }
      }`,
      tags: ["homepage-debug"],
    });

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Homepage Debug Information</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Current Query Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(homepage, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Old Query Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(oldHomepage.data, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Analysis:</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Has homepage: {homepage ? "✅" : "❌"}</li>
            <li>Has heroSections: {homepage?.heroSections ? "✅" : "❌"}</li>
            <li>HeroSections count: {homepage?.heroSections?.length || 0}</li>
            <li>Has contentBlocks: {homepage?.contentBlocks ? "✅" : "❌"}</li>
            <li>ContentBlocks count: {homepage?.contentBlocks?.length || 0}</li>
            <li>Old query has data: {oldHomepage.data ? "✅" : "❌"}</li>
            <li>
              Old query heroSections:{" "}
              {oldHomepage.data?.heroSections?.length || 0}
            </li>
          </ul>
        </div>

        {homepage?.heroSections && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Hero Sections Found:</h2>
            {homepage.heroSections.map((section: any, index: number) => (
              <div key={index} className="border p-4 mb-2 rounded">
                <p>
                  <strong>Type:</strong> {section._type}
                </p>
                <p>
                  <strong>Title:</strong> {section.title}
                </p>
                <p>
                  <strong>Layout:</strong> {section.layout || "N/A"}
                </p>
                <p>
                  <strong>Has Left Image:</strong>{" "}
                  {section.leftImage ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Has Right Image:</strong>{" "}
                  {section.rightImage ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Has Single Image:</strong>{" "}
                  {section.image ? "✅" : "❌"}
                </p>
                <p>
                  <strong>Linked Product:</strong>{" "}
                  {section.linkedProduct?.title || "None"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Error</h1>
        <pre className="bg-red-100 p-4 rounded text-red-800">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
