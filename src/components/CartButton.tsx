
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRentalCartCount } from "@/lib/rentalCart";

export default function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(getRentalCartCount());
    }

    updateCount();

    window.addEventListener(
      "campus-cart-updated",
      updateCount
    );
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(
        "campus-cart-updated",
        updateCount
      );
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link
      href="/cart"
      aria-label={`Shopping cart with ${count} items`}
      className="relative inline-flex items-center gap-2 rounded-full border border-[#E7DCF4] bg-white px-4 py-2.5 font-semibold text-[#332441] shadow-sm transition hover:border-[#B99AE8] hover:bg-[#F7F1FF]"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
      </svg>

      <span className="hidden sm:inline">Cart</span>

      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8650DB] px-1 text-[11px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
