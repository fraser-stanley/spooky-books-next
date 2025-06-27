import { PortableText } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";

// Component configuration for rendering Portable Text
const components = {
  block: {
    normal: ({ children }: any) => <p className="mb-4">{children}</p>,
    h4: ({ children }: any) => (
      <h4 className="text-lg font-medium mb-3 mt-6">{children}</h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-base font-medium mb-2 mt-4">{children}</h5>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 text-black">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ children, value }: any) => (
      <a
        href={value?.href || "#"}
        className="underline hover:no-underline text-blue-600 hover:text-blue-800 transition-colors"
        target={value?.blank ? "_blank" : undefined}
        rel={value?.blank ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
};

interface ProductDescriptionProps {
  value: PortableTextBlock[] | null | undefined;
}

export function ProductDescription({ value }: ProductDescriptionProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }

  return (
    <div className="text-pretty pr-4 sm:pr-8 mb-4 leading-[1.5] max-w-prose [text-rendering:optimizeLegibility] antialiased">
      <PortableText value={value} components={components} />
    </div>
  );
}

// Fallback component for legacy plaintext descriptions
interface LegacyDescriptionProps {
  text: string;
}

export function LegacyDescription({ text }: LegacyDescriptionProps) {
  return (
    <div className="text-pretty pr-4 sm:pr-8 mb-4 leading-[1.5] max-w-prose [text-rendering:optimizeLegibility] antialiased">
      {text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .split("\n\n")
        .map((para, idx) => (
          <p key={idx} className="mb-4">
            {para}
          </p>
        ))}
    </div>
  );
}
