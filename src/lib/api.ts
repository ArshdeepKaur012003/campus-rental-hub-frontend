
import type {
  Item,
  ItemCategory,
  ItemCondition,
  RentalStatus,
} from "./types";
import { CATEGORY_ICONS } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

interface BackendItem {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  category: string;
  condition: string;
  price_per_day: number | string;
  status: string;
  isbn: string | null;
}

function convertItem(data: BackendItem): Item {
  const category = data.category as ItemCategory;

  // Demo is not part of the existing RentalStatus type.
  // The original demo marker is preserved in description.
  const status: RentalStatus =
    data.status === "Available"
      ? "Available"
      : data.status === "Completed"
        ? "Returned"
        : data.status === "Active"
          ? "Rented"
          : "Requested";

  return {
    id: String(data.id),
    title: data.title,
    description: data.description ?? "",
    category,
    condition: data.condition as ItemCondition,
    price: Number(data.price_per_day),
    status,
    isbn: data.isbn ?? undefined,
    author: undefined,
    campusLocation: "Campus pickup — arrange with owner",
    ownerName: `Student ${data.owner_id}`,
    coverIcon: CATEGORY_ICONS[category] ?? "📦",
  };
}

export async function getItemsFromAPI(): Promise<Item[]> {
  const response = await fetch(`${API_URL}/api/items`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.status}`);
  }

  const data: BackendItem[] = await response.json();

  return data.map(convertItem);
}
