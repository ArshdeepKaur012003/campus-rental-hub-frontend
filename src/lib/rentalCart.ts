
export type RentalCartItem = {
  cartId: string;
  itemId: number;
  title: string;
  category: string;
  condition: string;
  dailyPrice: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  totalPrice: number;
  pickupLocation: string;
  imageUrl?: string;
  imageSource?: string;
  imageAttributionUrl?: string;
};

const CART_KEY = "campus_rental_cart";

export function getRentalCart(): RentalCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(CART_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is RentalCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.cartId === "string" &&
        typeof item.itemId === "number" &&
        typeof item.title === "string" &&
        typeof item.totalPrice === "number"
    );
  } catch {
    return [];
  }
}

export function addToRentalCart(
  item: RentalCartItem
): void {
  const cart = getRentalCart();

  const existingIndex = cart.findIndex(
    (entry) => entry.itemId === item.itemId
  );

  if (existingIndex >= 0) {
    cart[existingIndex] = item;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(
    new Event("campus-cart-updated")
  );
}

export function removeFromRentalCart(
  cartId: string
): void {
  const updated = getRentalCart().filter(
    (item) => item.cartId !== cartId
  );

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new Event("campus-cart-updated")
  );
}

export function clearRentalCart(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CART_KEY);

  window.dispatchEvent(
    new Event("campus-cart-updated")
  );
}

export function getRentalCartCount(): number {
  return getRentalCart().length;
}
