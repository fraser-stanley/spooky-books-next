"use client"

import * as React from "react"
import styles from "./check-filter.module.css"

type CheckFilterProps = {
  items: string[]
  name?: string
  selectedItems?: string[]
  setSelectedItems: (items: string[]) => void
  open?: boolean
}

export function CheckFilter({
  items,
  name,
  selectedItems = [],
  setSelectedItems,
  open = true,
}: CheckFilterProps) {
  const toggleItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value
    const isChecked = e.currentTarget.checked

    if (isChecked) {
      setSelectedItems([...selectedItems, value])
    } else {
      setSelectedItems(selectedItems.filter((item) => item !== value))
    }
  }

  const clearItems = () => {
    setSelectedItems([])
  }

  return (
    <details open={open} className={styles.filter}>
      {name && (
        <summary>
          <div className={styles.summary}>
            {name}
            {selectedItems.length > 0 && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={clearItems}
              >
                Clear
              </button>
            )}
          </div>
        </summary>
      )}
      <div className={styles.filterOptions}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item)
          return (
            <label
              key={item}
              className={isSelected ? styles.selectedLabel : undefined}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                value={item}
                checked={isSelected}
                onChange={toggleItem}
              />
              {item || "None"}
            </label>
          )
        })}
      </div>
    </details>
  )
}
