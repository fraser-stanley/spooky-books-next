// components/sort-options.tsx
"use client"

import { useState } from "react"

type SortOption =
  | "price-asc"
  | "price-desc"
  | "newest"
  | "alpha-asc"
  | "alpha-desc"

export function SortOptions({
  onChange,
  defaultValue = "newest",
}: {
  onChange: (value: SortOption) => void
  defaultValue?: SortOption
}) {
  const [sort, setSort] = useState<SortOption>(defaultValue)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SortOption
    setSort(selected)
    onChange(selected)
  }

  return (
    <div className="mb-4">
      <label htmlFor="sort" className="sr-only">
        Sort
      </label>
      <select
        id="sort"
        name="sort"
        value={sort}
        onChange={handleChange}
        className="p-2 border border-gray-300 rounded"
      >
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="alpha-asc">A–Z</option>
        <option value="alpha-desc">Z–A</option>
      </select>
    </div>
  )
}
