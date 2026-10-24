
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ItemCard from "@/components/ItemCard";
import { getItemsFromAPI } from "@/lib/api";
import type { Item } from "@/lib/types";

type SortOption = "newest" | "price-asc" | "price-desc";

const PAGE_SIZE = 12;

const typingWords = [
  "Study Smarter.",
  "Rent for Less.",
  "Share More.",
  "Save Money.",
];

const studyAreas = [
  {
    title: "IT & Computing",
    subtitle: "Laptops, programming and electronics",
    icon: "💻",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Science & Labs",
    subtitle: "Laboratory and science equipment",
    icon: "🔬",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Nursing & Healthcare",
    subtitle: "Clinical training and nursing resources",
    icon: "🩺",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Education & Teaching",
    subtitle: "Classroom and teaching essentials",
    icon: "🎓",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Business & Accounting",
    subtitle: "Finance, business and management",
    icon: "📊",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Textbooks & Books",
    subtitle: "Course books and study guides",
    icon: "📚",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Engineering",
    subtitle: "Calculators and technical equipment",
    icon: "📐",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Creative Media",
    subtitle: "Cameras and creative equipment",
    icon: "📷",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85",
  },
];

const categories = [
  "All Categories",
  ...studyAreas.map((area) => area.title),
];

function isUniversityProduct(item: Item): boolean {
  const title = item.title.toLowerCase();

  const excluded = [
    "screw pack",
    "nail pack",
    "garden hose",
    "lawn mower",
    "paint roller",
    "household cleaner",
    "power drill",
    "spanner",
    "wrench",
  ];

  return !excluded.some((word) => title.includes(word));
}

function matchesStudyArea(
  item: Item,
  selected: string
): boolean {
  if (selected === "All Categories") return true;

  const text = `${item.title} ${item.category}`.toLowerCase();

  const contains = (words: string[]) =>
    words.some((word) => text.includes(word));

  switch (selected) {
    case "IT & Computing":
      return contains([
        "computer",
        "laptop",
        "programming",
        "software",
        "keyboard",
        "mouse",
        "headphone",
        "network",
        "electronics",
        "tablet",
        "monitor",
        "coding",
      ]);

    case "Science & Labs":
      return contains([
        "lab",
        "science",
        "microscope",
        "biology",
        "chemistry",
        "physics",
        "anatomy",
        "laboratory",
      ]);

    case "Nursing & Healthcare":
      return contains([
        "nursing",
        "medical",
        "health",
        "clinical",
        "stethoscope",
        "anatomy",
        "patient",
        "blood pressure",
      ]);

    case "Education & Teaching":
      return contains([
        "teaching",
        "education",
        "classroom",
        "lesson",
        "learning",
        "whiteboard",
        "projector",
        "teacher",
      ]);

    case "Business & Accounting":
      return contains([
        "business",
        "accounting",
        "finance",
        "management",
        "economics",
        "marketing",
      ]);

    case "Textbooks & Books":
      return contains([
        "textbook",
        "book",
        "notebook",
        "stationery",
        "study guide",
      ]);

    case "Engineering":
      return contains([
        "engineering",
        "calculator",
        "drawing",
        "measurement",
        "cad",
        "circuit",
        "robotics",
      ]);

    case "Creative Media":
      return contains([
        "camera",
        "photography",
        "media",
        "tripod",
        "microphone",
        "design",
        "lighting kit",
      ]);

    default:
      return true;
  }
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState<SortOption>("newest");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [typedText, setTypedText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Load products from FastAPI.
  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        const data = await getItemsFromAPI();

        if (active) {
          setItems(data);
          setError("");
        }
      } catch (err) {
        console.error("Unable to load products:", err);

        if (active) {
          setError(
            "Unable to load products. Check that FastAPI is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      active = false;
    };
  }, []);

  // Typewriter animation.
  useEffect(() => {
    const word = typingWords[wordIndex];

    let delay = deleting ? 45 : 100;

    if (!deleting && letterIndex === word.length) {
      delay = 1600;
    }

    if (deleting && letterIndex === 0) {
      delay = 350;
    }

    const timer = window.setTimeout(() => {
      if (!deleting && letterIndex < word.length) {
        const next = letterIndex + 1;
        setLetterIndex(next);
        setTypedText(word.slice(0, next));
      } else if (!deleting) {
        setDeleting(true);
      } else if (letterIndex > 0) {
        const next = letterIndex - 1;
        setLetterIndex(next);
        setTypedText(word.slice(0, next));
      } else {
        setDeleting(false);
        setWordIndex(
          (current) => (current + 1) % typingWords.length
        );
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [wordIndex, letterIndex, deleting]);

  const universityItems = useMemo(
    () => items.filter(isUniversityProduct),
    [items]
  );

  const availableCount = universityItems.filter(
    (item) => item.status === "Available"
  ).length;

  const featuredItems = useMemo(() => {
    return universityItems
      .filter((item) => item.status === "Available")
      .slice()
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 4);
  }, [universityItems]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    const results = universityItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        (item.author || "").toLowerCase().includes(search);

      const categoryMatch = matchesStudyArea(
        item,
        category
      );

      const availabilityMatch =
        !availableOnly || item.status === "Available";

      return (
        matchesSearch &&
        categoryMatch &&
        availabilityMatch
      );
    });

    return [...results].sort((a, b) => {
      if (sort === "price-asc") {
        return a.price - b.price;
      }

      if (sort === "price-desc") {
        return b.price - a.price;
      }

      return Number(b.id) - Number(a.id);
    });
  }, [
    universityItems,
    query,
    category,
    sort,
    availableOnly,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category, sort, availableOnly]);

  const visibleItems = filteredItems.slice(
    0,
    visibleCount
  );

  const hasMore = visibleCount < filteredItems.length;

  function selectCategory(value: string) {
    setCategory(value);

    document.getElementById("collection")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setQuery("");
    setCategory("All Categories");
    setSort("newest");
    setAvailableOnly(false);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-stone-900">

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#fb7b35] via-[#e96a79] to-[#a657d1] text-white">
        <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-6 py-16 md:px-12 lg:grid-cols-2 lg:px-16">

          <div>
            <p className="mb-5 text-sm font-bold uppercase tracking-widest text-white/90">
              ✦ Made for students, by students
            </p>

            <h1 className="text-5xl font-extrabold leading-tight sm:text-6xl">
              Your Campus.
              <br />
              Your Marketplace.
            </h1>

            <div className="mt-5 min-h-[55px] text-3xl font-extrabold sm:text-4xl">
              <span>{typedText}</span>
              <span className="typewriter-cursor ml-1">
                |
              </span>
            </div>

            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Rent textbooks, IT equipment, nursing
              essentials, laboratory instruments and
              teaching resources for university.
            </p>

            <div className="mt-8 flex max-w-xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl sm:flex-row">
              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search university rentals..."
                aria-label="Search university rentals"
                className="min-w-0 flex-1 px-4 py-3 text-stone-900 outline-none"
              />

              <a
                href="#collection"
                className="rounded-xl bg-[#fa713e] px-6 py-3 text-center font-bold text-white hover:bg-[#db5930]"
              >
                Search Rentals →
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="#collection"
                className="rounded-xl bg-white px-7 py-3 font-bold text-[#a34d78]"
              >
                Explore Rentals
              </a>

              <Link
                href="/list-item"
                className="rounded-xl border border-white px-7 py-3 font-bold text-white hover:bg-white/10"
              >
                List an Item
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white p-7 text-stone-900 shadow-xl">
              <span className="text-3xl">📦</span>

              <p className="mt-4 text-4xl font-extrabold">
                {loading ? "..." : universityItems.length}
              </p>

              <p className="mt-2 text-sm text-stone-500">
                University Listings
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 text-stone-900 shadow-xl">
              <span className="text-3xl">✨</span>

              <p className="mt-4 text-4xl font-extrabold">
                {loading ? "..." : availableCount}
              </p>

              <p className="mt-2 text-sm text-stone-500">
                Available Rentals
              </p>
            </div>

            <div className="col-span-2 rounded-3xl bg-white p-7 text-stone-900 shadow-xl">
              <span className="text-3xl">🎓</span>

              <h2 className="mt-3 text-2xl font-extrabold">
                Everything for University Life
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Find study essentials, choose your rental
                dates and manage requests in one place.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* CONTINUOUS MOVING IMAGE GALLERY */}
      <section className="bg-[#f8f4fb] py-14">
        <div className="mx-auto mb-9 max-w-[1500px] px-6 md:px-12 lg:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
            Explore your university
          </p>

          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Discover Your Study Essentials
          </h2>

          <p className="mt-3 text-stone-500">
            Explore equipment and resources across
            different university courses.
          </p>
        </div>

        <div className="moving-gallery overflow-hidden py-3">
          <div className="moving-gallery-track flex w-max">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 gap-5 pr-5"
                aria-hidden={copy === 1}
              >
                {studyAreas.map((area) => (
                  <button
                    key={`${copy}-${area.title}`}
                    type="button"
                    tabIndex={copy === 1 ? -1 : 0}
                    onClick={() => selectCategory(area.title)}
                    className="group relative h-[235px] w-[280px] shrink-0 overflow-hidden rounded-3xl bg-stone-200 text-left shadow-lg sm:h-[260px] sm:w-[330px]"
                  >
                    <img
                      src={area.image}
                      alt={area.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="text-3xl">
                        {area.icon}
                      </span>

                      <h3 className="mt-2 text-xl font-extrabold">
                        {area.title}
                      </h3>

                      <p className="mt-1 text-xs text-white/85">
                        {area.subtitle}
                      </p>

                      <p className="mt-3 text-sm font-bold">
                        Explore →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-stone-500">
          The images move automatically.
          Hover over them to pause.
        </p>
      </section>

      {/* FEATURED PRODUCTS */}
      {!loading && !error && featuredItems.length > 0 && (
        <section className="bg-[#f8f4fb] py-14">
          <div className="mx-auto max-w-[1500px] px-6 md:px-12 lg:px-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
                  From our catalogue
                </p>

                <h2 className="mt-3 text-4xl font-extrabold">
                  Featured Student Rentals
                </h2>

                <p className="mt-3 text-stone-500">
                  Browse available university equipment.
                </p>
              </div>

              <a
                href="#collection"
                className="font-bold text-purple-600 hover:underline"
              >
                View All Rentals →
              </a>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1500px] px-6 md:px-12 lg:px-16">
          <h2 className="text-center text-4xl font-extrabold">
            How Campus Rental Hub Works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🔎",
                number: "01",
                title: "Find an Item",
                text: "Explore university products and compare rental prices.",
              },
              {
                icon: "📅",
                number: "02",
                title: "Choose Your Dates",
                text: "Select pickup and return dates and review the total price.",
              },
              {
                icon: "🤝",
                number: "03",
                title: "Request Your Rental",
                text: "Submit your request and track it in My Rentals.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-3xl bg-[#fff8f4] p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl">
                    {step.icon}
                  </span>

                  <span className="text-lg font-extrabold text-[#d28c76]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-stone-600">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL RENTAL PRODUCTS */}
      <section
        id="collection"
        className="scroll-mt-20 bg-[#fffdfa] py-16"
      >
        <div className="mx-auto max-w-[1500px] px-6 md:px-12 lg:px-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c65d48]">
            Student marketplace
          </p>

          <h2 className="mt-3 text-4xl font-extrabold">
            Explore All University Rentals
          </h2>

          <p className="mt-3 text-stone-500">
            Search university equipment, textbooks
            and student essentials.
          </p>

          {/* FILTER CONTROLS */}
          <div className="mt-9 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">
            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search university products..."
              aria-label="Search rental products"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 px-5 py-3 outline-none focus:border-[#c65d48]"
            />

            <select
              aria-label="Filter by course"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-xl border border-stone-200 px-4 py-3"
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort rental products"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              className="rounded-xl border border-stone-200 px-4 py-3"
            >
              <option value="newest">
                Newest First
              </option>
              <option value="price-asc">
                Price: Low to High
              </option>
              <option value="price-desc">
                Price: High to Low
              </option>
            </select>

            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(event) =>
                  setAvailableOnly(event.target.checked)
                }
              />
              Available Only
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-stone-100 px-5 py-3 font-semibold hover:bg-stone-200"
            >
              Clear Filters
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm text-stone-500">
            <p>{filteredItems.length} products found</p>

            <p>
              Showing {visibleItems.length} of{" "}
              {filteredItems.length}
            </p>
          </div>

          {/* PRODUCT GRID */}
          {loading ? (
            <p className="py-20 text-center text-stone-500">
              Loading rental products...
            </p>
          ) : error ? (
            <div className="mt-8 rounded-xl bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-stone-500">
                No matching products found.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 font-semibold text-orange-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* SHOW MORE BUTTON */}
              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount(
                        (current) => current + PAGE_SIZE
                      )
                    }
                    className="rounded-2xl bg-gradient-to-r from-[#fb7b35] to-[#a657d1] px-10 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    Show More Products ↓
                  </button>

                  <p className="mt-3 text-sm text-stone-500">
                    {Math.min(
                      PAGE_SIZE,
                      filteredItems.length - visibleCount
                    )} more products available
                  </p>
                </div>
              )}

              {!hasMore &&
                filteredItems.length > PAGE_SIZE && (
                  <p className="mt-10 text-center text-sm text-stone-500">
                    You've reached the end of the catalogue.
                  </p>
                )}
            </>
          )}

          <p className="mt-10 text-center text-xs text-stone-500">
            University project demonstration.
            Test listings are not verified real-world offers.
          </p>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="bg-gradient-to-r from-[#fa7c47] via-[#d96583] to-[#a75bd1] px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            Join the student community
          </p>

          <h2 className="mt-3 text-4xl font-extrabold">
            Have Something Useful to Share?
          </h2>

          <p className="mt-5 leading-8 text-white/90">
            Give your textbooks and university equipment
            a second life. List an item and help another
            student save money.
          </p>

          <Link
            href="/list-item"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-[#a14e77] shadow-lg"
          >
            List Your Item →
          </Link>
        </div>
      </section>

      {/* ANIMATIONS */}
      <style jsx>{`
        .typewriter-cursor {
          animation: cursor-blink 0.75s step-end infinite;
        }

        @keyframes cursor-blink {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0;
          }
        }

        .moving-gallery-track {
          animation: gallery-scroll 45s linear infinite;
        }

        .moving-gallery:hover .moving-gallery-track,
        .moving-gallery:focus-within .moving-gallery-track {
          animation-play-state: paused;
        }

        @keyframes gallery-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .moving-gallery-track {
            animation: none;
          }

          .moving-gallery {
            overflow-x: auto;
          }

          .typewriter-cursor {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
