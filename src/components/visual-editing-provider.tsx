"use client";

import dynamic from "next/dynamic";

// Dynamic import for VisualEditing (client-side only)
const VisualEditing = dynamic(
  () => import("next-sanity").then((mod) => ({ default: mod.VisualEditing })),
  {
    ssr: false,
    loading: () => null,
  },
);

interface VisualEditingProviderProps {
  isEnabled: boolean;
}

export function VisualEditingProvider({
  isEnabled,
}: VisualEditingProviderProps) {
  return <>{isEnabled && <VisualEditing />}</>;
}
