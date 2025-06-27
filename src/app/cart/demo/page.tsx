// app/cart/demo/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-contex";

export default function CartDemo() {
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    // Add some demo items to the cart
    const demoItems = [
      {
        id: "demo_001",
        title: "Niijima Gardens",
        price: 45,
        quantity: 1,
        image: "/images/niijima-gardens-cover.jpg",
      },
      {
        id: "demo_002",
        title: "Courier",
        price: 35,
        quantity: 2,
        image: "/images/courier-cover.jpg",
      },
      {
        id: "demo_003",
        title: "Tote Bag in Black",
        price: 25,
        quantity: 1,
        image: "/images/sb-tote-blk.jpg",
      },
    ];

    // Add each demo item
    demoItems.forEach((item) => {
      addItem(item);
    });

    // Redirect to cart page after adding items
    router.push("/cart");
  }, [addItem, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Adding demo items to cart...</p>
    </div>
  );
}
