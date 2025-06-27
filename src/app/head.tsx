// app/head.tsx
export default function Head() {
  return (
    <>
      <title>Spooky Books</title>
      <meta
        name="description"
        content="Independent publisher of limited edition artists books."
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ffffff" />

      {/* Open Graph */}
      <meta property="og:title" content="Spooky Books" />
      <meta
        property="og:description"
        content="Independent publisher of limited edition artists books."
      />
      <meta property="og:image" content="/default-og.png" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://spooky-books.com" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Spooky Books" />
      <meta
        name="twitter:description"
        content="Independent publisher of limited edition artists books."
      />
      <meta name="twitter:image" content="/default-og.png" />
      <meta name="twitter:creator" content="@spookybooks" />

      {/* Favicons */}
      <link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
      <link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
      <link
        rel="apple-touch-icon"
        href="/apple-touch-icon.png"
        sizes="180x180"
      />
    </>
  );
}
