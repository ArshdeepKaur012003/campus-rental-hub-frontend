
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { getSuggestedDailyRate } from "@/lib/rentalPricing";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const categories = [
  "Textbook",
  "Lab Equipment",
  "Calculator",
  "Tool",
] as const;

const conditions = [
  "New",
  "Good",
  "Fair",
  "Worn",
] as const;

type Category = (typeof categories)[number];
type Condition = (typeof conditions)[number];

type ProductImage = {
  url: string;
  title: string;
  source: string;
  attributionUrl: string;
  license: string;
};

type Profile = {
  id: number;
  full_name: string;
  university: string | null;
  campus: string | null;
};

export default function ListItemPage() {
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<Category>("Textbook");
  const [condition, setCondition] = useState<Condition>("Good");
  const [price, setPrice] = useState("3.00");
  const [pickup, setPickup] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] =
    useState<ProductImage | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [imageError, setImageError] = useState("");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      const token = sessionStorage.getItem("campus_rental_token");
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.ok) {
          setProfile(await response.json());
        }
      } catch {
        // Preview remains available without a backend connection.
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProfile(false);
        }
      }
    }

    void loadProfile();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const query = title.trim();
    const bookIsbn = category === "Textbook" ? isbn.trim() : "";

    if (query.length < 3 && bookIsbn.length < 10) {
      setImages([]);
      setSelectedImage(null);
      setSearched(false);
      setSearching(false);
      setImageError("");
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearched(false);
    setImageError("");
    setImages([]);
    setSelectedImage(null);

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, category });
        if (bookIsbn) params.set("isbn", bookIsbn);

        const response = await fetch(
          `/api/product-images?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) throw new Error("Search failed");

        const data: { images?: ProductImage[] } =
          await response.json();

        if (controller.signal.aborted) return;

        const results = data.images || [];
        setImages(results);
        setSelectedImage(results[0] || null);
        setSearched(true);
      } catch {
        if (!controller.signal.aborted) {
          setImageError("Image search unavailable. Try another name.");
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 650);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [title, isbn, category]);

  function handleCategoryChange(next: Category) {
    setCategory(next);
    setPrice(getSuggestedDailyRate(next).toFixed(2));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - y) * 10,
      y: (x - 0.5) * 10,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const token = sessionStorage.getItem("campus_rental_token");

    if (!token) {
      setError("Please log in before publishing your listing.");
      return;
    }

    if (!profile?.university || !profile?.campus) {
      setError("Please complete your university and campus profile.");
      return;
    }

    const dailyPrice = Number(price);

    if (
      !Number.isFinite(dailyPrice) ||
      dailyPrice <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(price.trim())
    ) {
      setError("Enter a valid daily price.");
      return;
    }

    const fullDescription = [
      author.trim() ? `Author / Brand: ${author.trim()}` : "",
      description.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    if (fullDescription.length > 1000) {
      setError("Description is too long.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: fullDescription,
          category,
          condition,
          price_per_day: dailyPrice,
          isbn:
            category === "Textbook" ? isbn.trim() || null : null,
          pickup_location: pickup.trim(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof result?.detail === "string"
            ? result.detail
            : "Unable to create listing."
        );
      }

      setCreatedId(result.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputStyle =
    "w-full rounded-2xl border border-[#DDD7E9] bg-[#FBFAFE] px-4 py-3 text-sm text-[#241B35] outline-none transition focus:border-[#8154D8] focus:ring-4 focus:ring-violet-100";

  const labelStyle =
    "mb-2 block text-sm font-semibold text-[#322843]";

  if (createdId !== null) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#F0EDF8] px-6">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mb-5 text-6xl">🎉</div>
          <h1 className="text-3xl font-bold text-[#241B35]">
            Listing Created!
          </h1>
          <p className="mt-3 text-[#716680]">
            Listing #{createdId} was saved successfully.
          </p>
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Your listing details are saved. The selected image is
            only a preview until image storage is connected.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#8050D6] px-8 py-3 font-semibold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E9E5F3] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] bg-[#F7F5FC] p-5 shadow-[0_25px_80px_rgba(47,28,91,0.14)] md:p-9">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8050D6]">
              Campus Rental Hub
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#241B35] md:text-4xl">
              Create Your Listing
            </h1>
            <p className="mt-2 text-sm text-[#736783]">
              Search for your product, choose a picture, and
              set up your rental listing.
            </p>
          </div>
          <span className="rounded-full bg-[#E9DFFC] px-5 py-2 text-xs font-bold text-[#7140C4]">
            ✦ Interactive Listing Studio
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
            <section className="rounded-[26px] bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-2 text-xl font-bold text-[#241B35]">
                Find Your Product
              </h2>
              <p className="mb-6 text-sm text-[#82768F]">
                Matching product images appear as you type.
              </p>

              <div className="space-y-5">
                <div>
                  <label htmlFor="product-title" className={labelStyle}>
                    Product Name
                  </label>
                  <input
                    id="product-title"
                    required
                    maxLength={200}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Calculus Textbook"
                    className={inputStyle}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className={labelStyle}>
                      Category
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) =>
                        handleCategoryChange(e.target.value as Category)
                      }
                      className={inputStyle}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="condition" className={labelStyle}>
                      Condition
                    </label>
                    <select
                      id="condition"
                      value={condition}
                      onChange={(e) =>
                        setCondition(e.target.value as Condition)
                      }
                      className={inputStyle}
                    >
                      {conditions.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {category === "Textbook" && (
                  <div>
                    <label htmlFor="isbn" className={labelStyle}>
                      ISBN (optional)
                    </label>
                    <input
                      id="isbn"
                      maxLength={20}
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Enter ISBN"
                      className={inputStyle}
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-[#EEEAF5] pt-6">
                <h3 className="mb-4 font-bold text-[#322843]">
                  Matching Product Images
                </h3>

                {searching ? (
                  <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square animate-pulse rounded-xl bg-violet-100"
                      />
                    ))}
                  </div>
                ) : imageError ? (
                  <p className="text-sm text-red-600">{imageError}</p>
                ) : images.length ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedImage(image);
                          setZoomed(false);
                        }}
                        aria-label={`Select ${image.title}`}
                        aria-pressed={selectedImage?.url === image.url}
                        className={`relative aspect-square overflow-hidden rounded-2xl border-[3px] bg-[#F6F2FC] p-2 transition hover:shadow-lg ${
                          selectedImage?.url === image.url
                            ? "border-[#8553DB]"
                            : "border-transparent"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={image.title}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-[#F7F3FE] p-5 text-sm text-[#82768F]">
                    {searched
                      ? "No matching images found. Try another name."
                      : "Start typing a product name to search for images."}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[26px] bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-6 text-xl font-bold text-[#241B35]">
                Product Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="author" className={labelStyle}>
                    Author / Brand
                  </label>
                  <input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. James Stewart"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="price" className={labelStyle}>
                    Suggested Daily Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0.01"
                    max="99999999.99"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputStyle}
                  />
                  <p className="mt-2 text-xs text-[#82768F]">
                    Automatically suggested from the category.
                    You can adjust it.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="pickup" className={labelStyle}>
                    Pickup Location
                  </label>
                  <input
                    id="pickup"
                    required
                    maxLength={200}
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Campus Library Entrance"
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className={labelStyle}>
                    Product Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    maxLength={800}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your product..."
                    className={inputStyle}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[26px] bg-white p-6 shadow-sm">
              <h2 className="font-bold text-[#241B35]">
                Student Information
              </h2>
              {loadingProfile ? (
                <p className="mt-3 text-sm text-[#82768F]">
                  Loading profile...
                </p>
              ) : profile ? (
                <div className="mt-3 text-sm text-[#716680]">
                  <p>{profile.university || "University missing"}</p>
                  <p>{profile.campus || "Campus missing"}</p>
                  <Link
                    href="/profile"
                    className="mt-3 inline-block font-semibold text-[#8050D6]"
                  >
                    Edit Profile →
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm text-[#716680]">
                  Please log in to publish your listing.
                </p>
              )}
            </section>

            <button
              type="submit"
              disabled={saving || loadingProfile}
              className="w-full rounded-2xl bg-gradient-to-r from-[#9567E8] to-[#6D3CC8] px-8 py-4 font-bold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-1 disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Your Listing →"}
            </button>
          </form>

          <aside className="min-w-0">
            <div className="sticky top-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#241B35]">
                  Live Product Preview
                </h2>
                <span className="rounded-full bg-[#E9DFFC] px-3 py-1 text-xs font-semibold text-[#8050D6]">
                  ✦ 3D Effect
                </span>
              </div>

              <div
                style={{ perspective: "1100px" }}
                onPointerMove={handlePointerMove}
                onPointerLeave={() => {
                  setTilt({ x: 0, y: 0 });
                  setZoomed(false);
                }}
              >
                <div
                  className="overflow-hidden rounded-[28px] border border-[#E4DCF1] bg-white shadow-[0_24px_60px_rgba(61,36,113,0.17)] transition-transform duration-200"
                  style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  }}
                >
                  <div
                    className="relative flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5F0FF] to-[#DED0F5]"
                    onClick={() => setZoomed((v) => !v)}
                  >
                    {selectedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedImage.url}
                        alt={selectedImage.title}
                        className={`h-full w-full object-contain p-9 drop-shadow-xl transition-transform duration-500 ${
                          zoomed ? "scale-125" : "scale-100"
                        }`}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-7xl">📦</div>
                        <p className="mt-4 text-sm text-[#82768F]">
                          Your product image appears here
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-6">
                    <span className="rounded-full bg-[#EEE5FC] px-4 py-2 text-xs font-bold text-[#8050D6]">
                      {category}
                    </span>

                    <h3 className="pt-2 text-2xl font-extrabold text-[#241B35]">
                      {title || "Your Product Name"}
                    </h3>

                    {author && (
                      <p className="text-sm text-[#82768F]">
                        {author}
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-[#F0EBF7] pt-4">
                      <span className="text-sm text-[#716680]">
                        {condition} condition
                      </span>
                      <span className="text-xl font-extrabold text-[#8050D6]">
                        $
                        {price && Number.isFinite(Number(price))
                          ? Number(price).toFixed(2)
                          : "0.00"}
                        /day
                      </span>
                    </div>

                    <p className="text-sm text-[#82768F]">
                      🎓 {profile?.university || "Your University"}
                    </p>
                    <p className="text-sm text-[#82768F]">
                      📍 {pickup || "Campus Pickup"}
                    </p>

                    <div className="rounded-xl bg-[#EAF8F0] px-4 py-3 text-center text-sm font-bold text-[#247B4D]">
                      ✓ Available to Rent
                    </div>
                  </div>
                </div>
              </div>

              {selectedImage && (
                <p className="mt-4 rounded-xl bg-white p-4 text-xs text-[#82768F]">
                  Image source:{" "}
                  <a
                    href={selectedImage.attributionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#8050D6] underline"
                  >
                    {selectedImage.source}
                  </a>
                  {" · "}
                  {selectedImage.license}
                </p>
              )}

              <p className="mt-4 text-center text-xs text-[#82768F]">
                Move your mouse to tilt the card. Click the
                picture to zoom.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
