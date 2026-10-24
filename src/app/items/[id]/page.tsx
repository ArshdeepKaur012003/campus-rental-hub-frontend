
"use client";

import {
  use,
  useEffect,
  useState,
  type PointerEvent,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { getItemById } from "@/lib/mock-data";
import StampBadge from "@/components/StampBadge";
import FavoriteButton from "@/components/FavoriteButton";

import {
  calculateRentalDays,
  calculateRentalTotal,
} from "@/lib/rentalPricing";

import { addToRentalCart } from "@/lib/rentalCart";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type ApiItem = {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  category: string;
  condition: string;
  price_per_day: number | string;
  status: string;
  university?: string | null;
  campus?: string | null;
  pickup_location?: string | null;
  isbn?: string | null;
};

type ProductImage = {
  url: string;
  title?: string;
  source?: string;
  attributionUrl?: string;
  license?: string;
};

function getTodayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [apiItem, setApiItem] =
    useState<ApiItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [selectedImage, setSelectedImage] =
    useState<ProductImage | null>(null);

  const [searchingImages, setSearchingImages] =
    useState(false);

  const [imageError, setImageError] = useState("");
  const [failedImages, setFailedImages] =
    useState<string[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
  });

  const [zoomed, setZoomed] = useState(false);

  const mockItem = getItemById(id);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError("");
      setApiItem(null);

      // Demo items use the existing mock-data page.
      // Numeric IDs are reserved for database listings.
      if (!/^\d+$/.test(id)) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/items/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found."
              : "Unable to load product."
          );
        }

        const data: ApiItem = await response.json();

        if (!controller.signal.aborted) {
          setApiItem(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load product."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProduct();

    return () => controller.abort();
  }, [id]);

  const isRealProduct = Boolean(apiItem);

  const title =
    apiItem?.title || mockItem?.title || "";

  const category =
    apiItem?.category || mockItem?.category || "";

  const condition =
    apiItem?.condition || mockItem?.condition || "";

  const description =
    apiItem?.description || mockItem?.description || "";

  const status =
    apiItem?.status || mockItem?.status || "";

  const pickupLocation = apiItem
    ? apiItem.pickup_location ||
      apiItem.campus ||
      "Pickup to be arranged"
    : mockItem?.campusLocation || "";

  const dailyPrice = apiItem
    ? Number(apiItem.price_per_day)
    : 0;

  const today = getTodayLocal();

  const rentalDays = calculateRentalDays(
    startDate,
    endDate
  );

  const validDates =
    startDate >= today &&
    rentalDays > 0;

  const totalPrice =
    validDates && Number.isFinite(dailyPrice)
      ? calculateRentalTotal(
          dailyPrice,
          startDate,
          endDate
        )
      : 0;

  useEffect(() => {
    if (!title || loading) return;

    const controller = new AbortController();

    async function searchProductImages() {
      setSearchingImages(true);
      setImageError("");
      setImages([]);
      setSelectedImage(null);
      setFailedImages([]);

      try {
        const params = new URLSearchParams({
          q: title,
          category,
        });

        if (apiItem?.isbn) {
          params.set("isbn", apiItem.isbn);
        }

        const response = await fetch(
          `/api/product-images?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Image search failed.");
        }

        const result: {
          images?: ProductImage[];
        } = await response.json();

        if (controller.signal.aborted) return;

        const matches = (result.images || []).filter(
          (image) =>
            typeof image.url === "string" &&
            /^https?:\/\//i.test(image.url)
        );

        setImages(matches);
        setSelectedImage(matches[0] || null);
      } catch {
        if (!controller.signal.aborted) {
          setImageError(
            "Matching photos could not be loaded."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchingImages(false);
        }
      }
    }

    void searchProductImages();

    return () => controller.abort();
  }, [title, category, apiItem?.isbn, loading]);

  function handlePointerMove(
    event: PointerEvent<HTMLDivElement>
  ) {
    if (event.pointerType === "touch") return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - y) * 9,
      y: (x - 0.5) * 9,
    });
  }

  function handleAddToCart() {
    if (
      !apiItem ||
      !validDates ||
      apiItem.status !== "Available" ||
      !Number.isFinite(dailyPrice) ||
      dailyPrice <= 0
    ) {
      return;
    }

    addToRentalCart({
      cartId: String(apiItem.id),
      itemId: apiItem.id,
      title: apiItem.title,
      category: apiItem.category,
      condition: apiItem.condition,
      dailyPrice,
      startDate,
      endDate,
      rentalDays,
      totalPrice,
      pickupLocation,
      imageUrl: selectedImage?.url,
      imageSource: selectedImage?.source,
      imageAttributionUrl:
        selectedImage?.attributionUrl,
    });

    router.push("/cart");
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#F2EEFA] p-12 text-center">
        Loading product details...
      </main>
    );
  }

  if (!apiItem && !mockItem) {
    return (
      <main className="min-h-[70vh] bg-[#F2EEFA] p-12 text-center">
        <h1 className="text-2xl font-bold">
          {error || "Product not found."}
        </h1>

        <Link
          href="/"
          className="mt-5 inline-block text-violet-700 underline"
        >
          Back to browsing
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F1EBFC] via-[#F9F7FD] to-[#E8DDF8] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-7 inline-block text-sm font-bold text-[#7848C6]"
        >
          ← Back to Products
        </Link>

        <div className="grid gap-9 rounded-[32px] border border-white bg-white/95 p-6 shadow-[0_25px_80px_rgba(76,48,132,0.12)] lg:grid-cols-2 lg:p-10">
          <section>
            <div
              style={{ perspective: "1200px" }}
              onPointerMove={handlePointerMove}
              onPointerLeave={() => {
                setTilt({ x: 0, y: 0 });
                setZoomed(false);
              }}
            >
              <div
                className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[28px] border border-[#E6D9F9] bg-gradient-to-br from-[#F9F5FF] to-[#E8DCF9] transition-transform duration-200"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }}
              >
                {selectedImage &&
                !failedImages.includes(selectedImage.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title || title}
                    onClick={() =>
                      setZoomed((current) => !current)
                    }
                    onError={() =>
                      setFailedImages((current) => [
                        ...current,
                        selectedImage.url,
                      ])
                    }
                    className={`h-full w-full cursor-zoom-in object-contain p-8 drop-shadow-2xl transition-transform duration-500 ${
                      zoomed ? "scale-125" : "scale-100"
                    }`}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-8xl">
                      {mockItem?.coverIcon ||
                        (category === "Textbook"
                          ? "📚"
                          : category === "Calculator"
                            ? "🧮"
                            : "📦")}
                    </div>
                    <p className="mt-5 text-sm text-[#857891]">
                      {searchingImages
                        ? "Searching for product photos..."
                        : "Product photo unavailable"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-4 gap-3">
                {images
                  .filter(
                    (image) =>
                      !failedImages.includes(image.url)
                  )
                  .slice(0, 8)
                  .map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      aria-label={`Choose photo ${index + 1}`}
                      onClick={() => {
                        setSelectedImage(image);
                        setZoomed(false);
                      }}
                      className={`aspect-square overflow-hidden rounded-2xl border-[3px] bg-white p-2 transition hover:shadow-lg ${
                        selectedImage?.url === image.url
                          ? "border-[#8B55E0]"
                          : "border-[#EEE6F8]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.title || title}
                        onError={() =>
                          setFailedImages((current) => [
                            ...current,
                            image.url,
                          ])
                        }
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
              </div>
            )}

            {imageError && (
              <p className="mt-4 text-sm text-[#857891]">
                {imageError}
              </p>
            )}

            {selectedImage?.attributionUrl && (
              <p className="mt-4 text-xs text-[#857891]">
                Photo:{" "}
                <a
                  href={selectedImage.attributionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-violet-700 underline"
                >
                  {selectedImage.source || "Image source"}
                </a>
                {selectedImage.license
                  ? ` · ${selectedImage.license}`
                  : ""}
              </p>
            )}

            <p className="mt-3 text-xs text-[#9589A3]">
              Hover to tilt the image. Click to zoom.
              Product photos are search results and may
              not represent the exact listed item.
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-[#EEE4FC] px-4 py-2 text-xs font-bold text-[#7C49CA]">
                  {category}
                </span>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#281D3C]">
                  {title}
                </h1>

                {!isRealProduct && mockItem?.author && (
                  <p className="mt-2 text-[#7C708C]">
                    {mockItem.author}
                  </p>
                )}
              </div>

              {!isRealProduct && mockItem && (
                <FavoriteButton
                  itemId={mockItem.id}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E8DEF5] bg-white text-xl shadow-sm"
                />
              )}
            </div>

            {!isRealProduct && mockItem ? (
              <StampBadge status={mockItem.status} />
            ) : (
              <span className="inline-block rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-700">
                {status}
              </span>
            )}

            <div>
              <p className="text-sm text-[#82768F]">
                Rental Price
              </p>
              <p className="mt-1 text-4xl font-extrabold text-[#8050D6]">
                {isRealProduct
                  ? `$${dailyPrice.toFixed(2)}`
                  : `$${mockItem?.price}`}
                <span className="ml-1 text-base font-medium text-[#82768F]">
                  /{isRealProduct ? "day" : "week"}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#F8F5FD] p-5 text-sm">
              <div>
                <p className="text-[#8B8099]">
                  Condition
                </p>
                <p className="mt-1 font-semibold">
                  {condition}
                </p>
              </div>

              <div>
                <p className="text-[#8B8099]">
                  Category
                </p>
                <p className="mt-1 font-semibold">
                  {category}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-[#8B8099]">
                  Pickup Location
                </p>
                <p className="mt-1 font-semibold">
                  {pickupLocation}
                </p>
              </div>
            </div>

            {description && (
              <div>
                <h2 className="mb-2 font-bold text-[#281D3C]">
                  Product Description
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#7C708C]">
                  {description}
                </p>
              </div>
            )}

            {isRealProduct ? (
              <div className="rounded-3xl border border-[#EDE3FA] bg-white p-6">
                <h2 className="mb-5 text-xl font-extrabold text-[#281D3C]">
                  Choose Rental Dates
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="pickup-date"
                      className="mb-2 block text-sm font-bold"
                    >
                      Pickup Date
                    </label>

                    <input
                      id="pickup-date"
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(event) => {
                        setStartDate(event.target.value);
                        setEndDate("");
                      }}
                      className="w-full rounded-xl border border-violet-200 bg-[#FCFAFF] p-3 outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="return-date"
                      className="mb-2 block text-sm font-bold"
                    >
                      Return Date
                    </label>

                    <input
                      id="return-date"
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(event) =>
                        setEndDate(event.target.value)
                      }
                      className="w-full rounded-xl border border-violet-200 bg-[#FCFAFF] p-3 outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[#F2EAFF] p-5">
                  <div className="flex justify-between text-sm text-[#7957A9]">
                    <span>Rental Duration</span>
                    <span>{rentalDays} days</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#DDD0F4] pt-4">
                    <span className="font-bold text-[#281D3C]">
                      Total Rental Price
                    </span>

                    <span className="text-3xl font-extrabold text-[#8050D6]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={
                    !validDates ||
                    status !== "Available" ||
                    dailyPrice <= 0
                  }
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#9567E8] to-[#7140C8] px-6 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  🛒 Add to Cart →
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
                Demo listing — preview only.
                Real database items can be added to cart.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
