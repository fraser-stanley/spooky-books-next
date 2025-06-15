"use client"

import Link from "next/link"
import { ComponentProps } from "react"
import styles from "./more-button.module.css"
import clsx from "clsx"

type MoreButtonProps = ComponentProps<typeof Link> & {
  className?: string
}

export function MoreButton({ className, ...props }: MoreButtonProps) {
  return <Link className={clsx(styles.moreButton, className)} {...props} />
}
