
import Link from "next/link";
import type { Item } from "@/lib/types";
import StampBadge from "./StampBadge";
import FavoriteButton from "./FavoriteButton";

// ==========================================
// PRODUCT PHOTOGRAPHS
// ==========================================

const productImages: Record<string, string> = {
  // TEXTBOOKS
  "Computer Science Textbook":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=85",

  "Nursing Fundamentals Textbook":
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=900&auto=format&fit=crop&q=85",

  "Anatomy & Physiology Textbook":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=85",

  "Business Management Textbook":
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=85",

  "Accounting Textbook":
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=85",

  "Psychology Textbook":
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=85",

  "Engineering Mathematics Textbook":
    "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=85",

  "Law Textbook":
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&auto=format&fit=crop&q=85",

  // CALCULATORS
  "Scientific Calculator":
    "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=85",

  "Casio Scientific Calculator":
    "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=85",

  "Graphing Calculator":
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&auto=format&fit=crop&q=85",

  "Financial Calculator":
    "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=85",

  // LAPTOPS & ELECTRONICS
  "Windows Student Laptop":
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&auto=format&fit=crop&q=85",

  "MacBook Laptop":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&auto=format&fit=crop&q=85",

  "iPad or Android Tablet":
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&auto=format&fit=crop&q=85",

  "Computer Monitor":
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=85",

  "USB-C Docking Station":
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop&q=85",

  "Portable Charger":
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop&q=85",

  "Noise-Cancelling Headphones":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop&q=85",

  "Drawing Tablet":
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900&auto=format&fit=crop&q=85",

  // LAB & NURSING EQUIPMENT
  "Laboratory Coat":
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=85",

  "Safety Goggles":
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&auto=format&fit=crop&q=85",

  "Dissection Kit":
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=85",

  "Stethoscope":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=85",

  "Blood Pressure Monitor":
    "https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=900&auto=format&fit=crop&q=85",

  "Anatomical Study Model":
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=900&auto=format&fit=crop&q=85",

  // CAMERA EQUIPMENT
  "DSLR Camera":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85",

  "Mirrorless Camera":
    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&auto=format&fit=crop&q=85",

  "Camera Tripod":
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=85",

  "Ring Light":
    "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=900&auto=format&fit=crop&q=85",

  "USB Microphone":
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=900&auto=format&fit=crop&q=85",

  // ENGINEERING & TOOLS
  "Digital Multimeter":
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=85",

  "Arduino Starter Kit":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=85",

  "Raspberry Pi Kit":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=85",

  "Electronics Toolkit":
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=900&auto=format&fit=crop&q=85",

  "Cordless Drill":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop&q=85",

  "Measuring & Drafting Kit":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&auto=format&fit=crop&q=85",

  // STUDENT ESSENTIALS
  "Portable Projector":
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&auto=format&fit=crop&q=85",

  "Portable Whiteboard":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=85",

  "Scientific Poster Stand":
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=85",

  "Presentation Clicker":
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop&q=85",

  // ORIGINAL PRODUCT
  "Test Student Notebook":
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=900&auto=format&fit=crop&q=85",
};

// ==========================================
// FALLBACK PHOTOS BY CATEGORY
// ==========================================

const categoryImages: Record<string, string> = {
  Textbook:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=85",

  Books:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=85",

  Calculator:
    "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=85",

  Electronics:
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900&auto=format&fit=crop&q=85",

  "Lab Equipment":
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=85",

  "Nursing Equipment":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=85",

  "Camera Equipment":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop&q=85",

  Tool:
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&auto=format&fit=crop&q=85",

  "Study Equipment":
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=85",
};

// ==========================================
// ITEM CARD COMPONENT
// ==========================================

export default function ItemCard({
  item,
}: {
  item: Item;
}) {
  const isDemo =
    item.description
      ?.toUpperCase()
      .startsWith("DEMO LISTING ONLY.") ?? false;

  const imageUrl =
    productImages[item.title] ||
    categoryImages[item.category];

  const isAvailable =
    item.status === "Available" && !isDemo;

  const content = (
    <>
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            {item.coverIcon || "📦"}
          </div>
        )}

        {isDemo && (
          <span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 shadow">
            Demo Listing
          </span>
        )}

        <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow">
          {item.category}
        </span>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-bold text-stone-900 transition-colors group-hover:text-[#b65c3b]">
          {item.title}
        </h3>

        {item.author && (
          <p className="mt-1 text-sm text-stone-500">
            {item.author}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <span className="rounded-md bg-stone-100 px-2 py-1">
            {item.condition}
          </span>

          <span>
            {isDemo ? "Example product" : "Campus pickup"}
          </span>
        </div>

        {/* PRICE AND STATUS */}
        <div className="mt-auto flex items-end justify-between gap-2 border-t border-stone-100 pt-5">
          <div>
            <p className="text-xs text-stone-500">
              {isDemo
                ? "Suggested rental price"
                : "Rental price"}
            </p>

            <p className="text-2xl font-bold text-stone-900">
              ${item.price.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-stone-500">
                /day
              </span>
            </p>
          </div>

          {!isDemo && <StampBadge status={item.status} />}
        </div>

        {/* RENTAL BUTTON */}
        <div
          className={
            isDemo
              ? "mt-5 rounded-full bg-stone-200 px-5 py-3 text-center text-sm font-semibold text-stone-600"
              : "mt-5 rounded-full bg-[#b65c3b] px-5 py-3 text-center text-sm font-semibold text-white transition-colors group-hover:bg-[#99482d]"
          }
        >
          {isDemo
            ? "View Demo Details →"
            : isAvailable
              ? "Rent Now →"
              : "View Details →"}
        </div>
      </div>
    </>
  );

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* FAVORITES ONLY FOR REAL PRODUCTS */}
      {!isDemo && (
        <FavoriteButton
          itemId={item.id}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md transition-transform hover:scale-110"
        />
      )}

      {/* ALL PRODUCT CARDS ARE CLICKABLE */}
      <Link
        href={`/items/${item.id}`}
        className="flex flex-1 flex-col"
      >
        {content}
      </Link>
    </article>
  );
}
