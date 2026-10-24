
"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getRentalCart,
  removeFromRentalCart,
  type RentalCartItem,
} from "@/lib/rentalCart";

const API_URL = "http://127.0.0.1:8000";

function ProductImage({
  item,
  onZoom,
}: {
  item: RentalCartItem;
  onZoom: (item: RentalCartItem) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - y) * 7,
      y: (x - 0.5) * 7,
    });
  }

  return (
    <div style={{ perspective: "1100px" }} className="w-full">
      <button
        type="button"
        onClick={() => onZoom(item)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        aria-label={`Enlarge image of ${item.title}`}
        className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[28px] border border-[#E7DCF7] bg-gradient-to-br from-white via-[#FAF8FF] to-[#EEE6FC] p-6 shadow-[0_18px_40px_rgba(90,62,145,0.08)] transition-all duration-300 hover:shadow-[0_24px_55px_rgba(90,62,145,0.17)]"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <span className="absolute left-5 top-5 z-10 rounded-full border border-white bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#7045B5] shadow-sm">
          Product Preview
        </span>

        {item.imageUrl && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(35,23,64,0.18)] transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="text-center">
            <div className="text-8xl">
              {item.category === "Textbook"
                ? "📚"
                : item.category === "Calculator"
                  ? "🧮"
                  : item.category === "Tool"
                    ? "🛠️"
                    : "📦"}
            </div>
            <p className="mt-4 text-sm text-[#81738F]">
              Image unavailable
            </p>
          </div>
        )}

        <span className="absolute bottom-5 right-5 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#7045B5] shadow-md transition group-hover:bg-[#8050D6] group-hover:text-white">
          ⤢ View Larger
        </span>
      </button>
    </div>
  );
}

function ImageLightbox({
  item,
  onClose,
}: {
  item: RentalCartItem;
  onClose: () => void;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} image preview`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171025]/90 p-4 backdrop-blur-lg"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F0E9F7] px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-[#281D3C]">
              {item.title}
            </h2>
            <p className="text-xs text-[#82758E]">
              Enlarged product preview
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close image preview"
            className="ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#F3EDFC] text-2xl text-[#65449B] hover:bg-[#E6D9F8]"
          >
            ×
          </button>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-white to-[#F2ECFB] p-6">
          {item.imageUrl && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              onError={() => setFailed(true)}
              className="max-h-[68vh] max-w-full object-contain"
            />
          ) : (
            <div className="py-20 text-center text-[#81738F]">
              Product image unavailable
            </div>
          )}
        </div>

        {item.imageAttributionUrl && (
          <div className="border-t border-[#F0E9F7] px-6 py-3 text-center text-xs text-[#81738F]">
            Image source:{" "}
            <a
              href={item.imageAttributionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#8050D6] underline"
            >
              {item.imageSource || "View original source"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<RentalCartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [zoomItem, setZoomItem] =
    useState<RentalCartItem | null>(null);

  useEffect(() => {
    setCart(getRentalCart());
    setLoaded(true);
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const totalDays = cart.reduce(
    (total, item) => total + item.rentalDays,
    0
  );

  function handleRemove(cartId: string) {
    removeFromRentalCart(cartId);
    setCart(getRentalCart());
    setError("");
  }

  async function confirmRental() {
    setError("");

    const token = sessionStorage.getItem(
      "campus_rental_token"
    );

    if (!token) {
      setError("Please log in before confirming your rental.");
      return;
    }

    if (cart.length === 0 || submitting) return;

    setSubmitting(true);
    let completed = 0;

    try {
      for (const item of cart) {
        const response = await fetch(`${API_URL}/api/rentals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_id: item.itemId,
            start_date: item.startDate,
            end_date: item.endDate,
            handoff_location: item.pickupLocation,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          let message = `Unable to rent ${item.title}.`;

          if (typeof data?.detail === "string") {
            message = data.detail;
          } else if (Array.isArray(data?.detail)) {
            message = data.detail
              .map((entry: { msg?: string }) => entry.msg || "Invalid data")
              .join(", ");
          }

          throw new Error(message);
        }

        completed += 1;

        removeFromRentalCart(item.cartId);
      }

      setCart(getRentalCart());
      router.push("/my-rentals");
    } catch (err) {
      setCart(getRentalCart());

      const message =
        err instanceof Error
          ? err.message
          : "Unable to confirm rental.";

      setError(
        completed > 0
          ? `${completed} rental(s) were created, but another item failed: ${message}`
          : message
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="min-h-[70vh] bg-[#F6F2FC] p-12 text-center">
        Loading your rental cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F5FD] via-[#F0E9FC] to-[#E8DCF9] px-4 py-10 text-[#291F3B] sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#7950C5] transition hover:text-[#542E9B]"
        >
          ← Continue Browsing
        </Link>

        <div className="mb-10 mt-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#8B55DB]">
              Campus Rental Hub
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#281C3D] sm:text-5xl">
              Your Rental Cart
            </h1>

            <p className="mt-3 text-[#7E718F]">
              Review your items, explore product photos, and confirm
              your rental dates.
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 px-5 py-3 shadow-sm">
            <p className="text-xs text-[#877996]">
              Items in your cart
            </p>
            <p className="text-2xl font-extrabold text-[#7F4ED2]">
              {cart.length}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="rounded-[32px] border border-white bg-white px-6 py-20 text-center shadow-xl shadow-violet-100">
            <div className="text-7xl">🛒</div>
            <h2 className="mt-5 text-2xl font-extrabold">
              Your cart is empty
            </h2>
            <p className="mt-3 text-[#82758F]">
              Explore available items and add your first rental.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-2xl bg-[#8050D6] px-8 py-4 font-bold text-white transition hover:bg-[#6838BB]"
            >
              Browse Products →
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="space-y-7">
              {cart.map((item) => (
                <article
                  key={item.cartId}
                  className="overflow-hidden rounded-[32px] border border-white bg-white p-5 shadow-[0_18px_55px_rgba(85,55,135,0.10)] sm:p-7"
                >
                  <div className="grid items-start gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                    <div>
                      <ProductImage
                        item={item}
                        onZoom={setZoomItem}
                      />

                      {item.imageAttributionUrl && (
                        <p className="mt-3 text-center text-xs text-[#8B7D9A]">
                          Photo:{" "}
                          <a
                            href={item.imageAttributionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8050D6] underline"
                          >
                            {item.imageSource || "Image source"}
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="flex h-full flex-col">
                      <div>
                        <span className="inline-block rounded-full bg-[#EFE5FF] px-4 py-2 text-xs font-bold text-[#7949C9]">
                          {item.category}
                        </span>

                        <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#281D3C]">
                          {item.title}
                        </h2>

                        <p className="mt-3 text-sm text-[#877A95]">
                          {item.condition} condition
                        </p>

                        <div className="mt-6 rounded-2xl bg-[#F7F2FF] p-5">
                          <p className="text-xs font-medium text-[#857394]">
                            Daily Rental Price
                          </p>

                          <p className="mt-2 text-3xl font-extrabold text-[#8050D6]">
                            ${item.dailyPrice.toFixed(2)}
                            <span className="ml-1 text-sm font-medium text-[#897D96]">
                              /day
                            </span>
                          </p>
                        </div>

                        <div className="mt-5 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[#887B97]">
                              Pickup location
                            </span>
                            <span className="text-right font-semibold">
                              {item.pickupLocation}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <span className="text-[#887B97]">
                              Rental duration
                            </span>
                            <span className="font-semibold">
                              {item.rentalDays} days
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between border-t border-[#F0EAF8] pt-5">
                        <span className="text-sm font-semibold text-[#887B97]">
                          Item total
                        </span>
                        <span className="text-3xl font-extrabold text-[#8050D6]">
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7 grid gap-4 rounded-[22px] border border-[#F0E9FA] bg-[#FBF9FF] p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[#8B7E99]">
                        Pickup Date
                      </p>
                      <p className="mt-1 font-bold text-[#302344]">
                        {item.startDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8B7E99]">
                        Return Date
                      </p>
                      <p className="mt-1 font-bold text-[#302344]">
                        {item.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      href={`/items/${item.itemId}`}
                      className="text-sm font-bold text-[#8050D6] hover:underline"
                    >
                      View Product →
                    </Link>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRemove(item.cartId)}
                      className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Remove Item
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[30px] border border-white bg-white p-7 shadow-[0_18px_55px_rgba(85,55,135,0.10)] lg:sticky lg:top-6">
              <h2 className="text-2xl font-extrabold text-[#281D3C]">
                Order Summary
              </h2>

              <p className="mt-2 text-sm text-[#857990]">
                Your rental overview
              </p>

              <div className="mt-8 space-y-5 text-sm">
                <div className="flex justify-between text-[#82758F]">
                  <span>Rental items</span>
                  <span className="font-bold text-[#281D3C]">
                    {cart.length}
                  </span>
                </div>

                <div className="flex justify-between text-[#82758F]">
                  <span>Total item-days</span>
                  <span className="font-bold text-[#281D3C]">
                    {totalDays}
                  </span>
                </div>

                <div className="flex justify-between text-[#82758F]">
                  <span>Rental subtotal</span>
                  <span className="font-bold text-[#281D3C]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-7 border-t border-[#EDE5F6] pt-6">
                <p className="text-sm font-bold text-[#281D3C]">
                  Estimated Total
                </p>

                <p className="mt-2 text-4xl font-extrabold tracking-tight text-[#8050D6]">
                  ${subtotal.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={confirmRental}
                className="mt-7 w-full rounded-2xl bg-gradient-to-r from-[#9A6BEB] to-[#7040C6] px-6 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Confirming Rental..."
                  : "Confirm Rental →"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-[#91849E]">
                No payment is collected here.
                Your rental request will be submitted
                to Campus Rental Hub.
              </p>

              <div className="mt-7 rounded-2xl bg-[#EAF8F0] p-5">
                <p className="text-sm font-bold text-[#26784F]">
                  ✓ Automatic Pricing
                </p>
                <p className="mt-2 text-xs leading-5 text-[#418260]">
                  Prices are calculated using the selected
                  rental dates and each item's daily rate.
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8F5FD] p-4 text-xs leading-5 text-[#897D97]">
                Product images are reference images.
                Confirm the exact item details with the owner
                before collecting your rental.
              </div>
            </aside>
          </div>
        )}
      </div>

      {zoomItem && (
        <ImageLightbox
          key={zoomItem.cartId}
          item={zoomItem}
          onClose={() => setZoomItem(null)}
        />
      )}
    </main>
  );
}
