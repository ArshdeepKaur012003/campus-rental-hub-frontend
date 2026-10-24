
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import ItemCard from "@/components/ItemCard";
import { items } from "@/lib/mock-data";
import { useFavoriteIds } from "@/lib/favorites";

type Tab = "rentals" | "listings" | "saved";

type Rental = {
  id: number;
  item_id: number;
  renter_id: number;
  start_date: string;
  end_date: string;
  total_price: number | string;
  status: string;
  handoff_location: string | null;
  payment_status?: string | null;
};

type ApiItem = {
  id: number;
  owner_id: number;
  title: string;
  description: string | null;
  category: string;
  condition: string;
  price_per_day: number | string;
  status: string;
  pickup_location?: string | null;
  university?: string | null;
  campus?: string | null;
};

type CheckoutResponse = {
  checkout_url?: string;
  session_id?: string;
};

const API_URL = "http://127.0.0.1:8001";

function formatPrice(value: number | string) {
  return Number(value).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function statusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "requested":
      return "bg-amber-100 text-amber-800";

    case "approved":
      return "bg-blue-100 text-blue-800";

    case "active":
      return "bg-purple-100 text-purple-800";

    case "completed":
      return "bg-green-100 text-green-800";

    case "available":
      return "bg-emerald-100 text-emerald-800";

    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function paymentClasses(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";

    case "unpaid":
      return "bg-amber-100 text-amber-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function MyRentalsPage() {
  const [tab, setTab] = useState<Tab>("rentals");

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [rentalItems, setRentalItems] = useState<
    Record<number, ApiItem>
  >({});

  const [myItems, setMyItems] = useState<ApiItem[]>([]);

  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  const [rentalError, setRentalError] = useState("");
  const [listingsError, setListingsError] = useState("");

  const [cancellingId, setCancellingId] = useState<
    number | null
  >(null);

  const [payingId, setPayingId] = useState<number | null>(
    null
  );

  const favoriteIds = useFavoriteIds();

  const savedItems = items.filter((item) =>
    favoriteIds.has(item.id)
  );

  // ======================================
  // LOAD MY RENTALS
  // ======================================

  const loadRentals = useCallback(async () => {
    setLoadingRentals(true);
    setRentalError("");

    try {
      const token = sessionStorage.getItem(
        "campus_rental_token"
      );

      if (!token) {
        setRentalError(
          "Please log in to view your rental bookings."
        );
        setRentals([]);
        setRentalItems({});
        return;
      }

      const response = await fetch(
        `${API_URL}/api/rentals/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        throw new Error(
          `Unable to load rentals (HTTP ${response.status}).`
        );
      }

      const data: Rental[] = await response.json();

      setRentals(data);

      const uniqueIds = [
        ...new Set(
          data.map((rental) => rental.item_id)
        ),
      ];

      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const itemResponse = await fetch(
              `${API_URL}/api/items/${id}`,
              { cache: "no-store" }
            );

            if (!itemResponse.ok) {
              return null;
            }

            return (await itemResponse.json()) as ApiItem;
          } catch {
            return null;
          }
        })
      );

      const lookup: Record<number, ApiItem> = {};

      for (const item of results) {
        if (item) {
          lookup[item.id] = item;
        }
      }

      setRentalItems(lookup);
    } catch (err) {
      setRentalError(
        err instanceof Error
          ? err.message
          : "Unable to load your rentals."
      );
    } finally {
      setLoadingRentals(false);
    }
  }, []);

  // ======================================
  // LOAD MY LISTINGS
  // ======================================

  const loadMyItems = useCallback(async () => {
    setLoadingListings(true);
    setListingsError("");

    try {
      const token = sessionStorage.getItem(
        "campus_rental_token"
      );

      if (!token) {
        setMyItems([]);
        setListingsError(
          "Please log in to view your listings."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/items/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session has expired. Please log in again."
          );
        }

        throw new Error(
          `Unable to load listings (HTTP ${response.status}).`
        );
      }

      const data: ApiItem[] = await response.json();

      setMyItems(data);
    } catch (err) {
      setListingsError(
        err instanceof Error
          ? err.message
          : "Unable to load your listings."
      );
      setMyItems([]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  // ======================================
  // INITIAL DATA LOAD
  // ======================================

  useEffect(() => {
    void loadRentals();
    void loadMyItems();
  }, [loadRentals, loadMyItems]);

  // ======================================
  // CANCEL RENTAL REQUEST
  // ======================================

  async function cancelRental(rentalId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this rental request?"
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem(
      "campus_rental_token"
    );

    if (!token) {
      setRentalError("Please log in again.");
      return;
    }

    setCancellingId(rentalId);
    setRentalError("");

    try {
      const response = await fetch(
        `${API_URL}/api/rentals/${rentalId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(
          () => null
        );

        throw new Error(
          typeof body?.detail === "string"
            ? body.detail
            : "Unable to cancel this rental."
        );
      }

      await loadRentals();
    } catch (err) {
      setRentalError(
        err instanceof Error
          ? err.message
          : "Cancellation failed."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // ======================================
  // START STRIPE CHECKOUT
  // ======================================

  async function payForRental(rentalId: number) {
    const token = sessionStorage.getItem(
      "campus_rental_token"
    );

    if (!token) {
      setRentalError(
        "Please log in before making a payment."
      );
      return;
    }

    setPayingId(rentalId);
    setRentalError("");

    try {
      const response = await fetch(
        `${API_URL}/api/payments/checkout/${rentalId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const body: CheckoutResponse & {
        detail?: string;
      } = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof body.detail === "string"
            ? body.detail
            : "Unable to start Stripe Checkout."
        );
      }

      if (!body.checkout_url) {
        throw new Error(
          "Stripe did not return a checkout URL."
        );
      }

      // Redirect to Stripe's hosted payment page.
      window.location.assign(body.checkout_url);
    } catch (err) {
      setRentalError(
        err instanceof Error
          ? err.message
          : "Payment could not be started."
      );
      setPayingId(null);
    }
  }

  // ======================================
  // PAGE
  // ======================================

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5efff] via-white to-[#fffaf6] px-5 py-12 text-[#2c2042]">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADING */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-600">
            Campus Rental Hub
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            My Account
          </h1>

          <p className="mt-3 text-[#81748f]">
            Manage your bookings, listings and saved items.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/manage-requests"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-700"
            >
              Manage Rental Requests →
            </Link>

            <Link
              href="/list-item"
              className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50"
            >
              + List an Item
            </Link>
          </div>
        </div>

        {/* ACCOUNT TABS */}
        <div className="mb-8 flex flex-wrap gap-3 border-b border-violet-100 pb-4">
          {(
            [
              ["rentals", "My Rentals", rentals.length],
              ["listings", "My Listings", myItems.length],
              ["saved", "Saved", savedItems.length],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                tab === value
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                  : "bg-white text-[#6f6280] hover:bg-violet-50"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* =====================================
            MY RENTALS TAB
        ===================================== */}
        {tab === "rentals" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Your Rental Bookings
              </h2>

              <button
                type="button"
                onClick={() => void loadRentals()}
                disabled={loadingRentals}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>

            {rentalError && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {rentalError}
              </div>
            )}

            {loadingRentals ? (
              <div className="rounded-3xl bg-white p-12 text-center text-[#81748f] shadow-sm">
                Loading your rental bookings...
              </div>
            ) : rentals.length === 0 ? (
              <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
                <h3 className="text-xl font-bold">
                  No rental bookings yet
                </h3>

                <p className="mt-3 text-[#81748f]">
                  Your rental requests will appear here.
                </p>

                <Link
                  href="/"
                  className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white"
                >
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {rentals.map((rental) => {
                  const item = rentalItems[rental.item_id];

                  const paymentStatus =
                    rental.payment_status ?? "Unpaid";

                  const isPaid =
                    paymentStatus.toLowerCase() === "paid";

                  const canPay =
                    rental.status === "Approved" &&
                    !isPaid;

                  return (
                    <article
                      key={rental.id}
                      className="overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_15px_45px_rgba(85,55,130,0.08)]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-violet-500">
                            Booking #{rental.id}
                          </p>

                          <h3 className="mt-2 text-xl font-bold">
                            {item?.title ??
                              `Item #${rental.item_id}`}
                          </h3>

                          {item && (
                            <p className="mt-1 text-sm text-[#81748f]">
                              {item.category} · {item.condition}
                            </p>
                          )}
                        </div>

                        <span
                          className={`rounded-full px-3 py-2 text-xs font-bold ${statusClasses(
                            rental.status
                          )}`}
                        >
                          {rental.status}
                        </span>
                      </div>

                      {/* RENTAL DATES */}
                      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#f8f4ff] p-4">
                        <div>
                          <p className="text-xs text-[#81748f]">
                            Pickup date
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatDate(rental.start_date)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#81748f]">
                            Return date
                          </p>

                          <p className="mt-1 font-semibold">
                            {formatDate(rental.end_date)}
                          </p>
                        </div>
                      </div>

                      {/* PRICE */}
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm text-[#81748f]">
                          Total rental price
                        </span>

                        <strong className="text-2xl text-violet-600">
                          {formatPrice(rental.total_price)}
                        </strong>
                      </div>

                      {/* PAYMENT STATUS */}
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-violet-100 pt-4">
                        <span className="text-sm text-[#81748f]">
                          Payment status
                        </span>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${paymentClasses(
                            paymentStatus
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </div>

                      {rental.handoff_location && (
                        <p className="mt-3 text-sm text-[#81748f]">
                          Pickup: {rental.handoff_location}
                        </p>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {item && (
                          <Link
                            href={`/items/${item.id}`}
                            className="rounded-xl border border-violet-200 px-5 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                          >
                            View Item
                          </Link>
                        )}

                        {rental.status === "Requested" && (
                          <button
                            type="button"
                            disabled={
                              cancellingId === rental.id
                            }
                            onClick={() =>
                              void cancelRental(rental.id)
                            }
                            className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            {cancellingId === rental.id
                              ? "Cancelling..."
                              : "Cancel Request"}
                          </button>
                        )}

                        {canPay && (
                          <button
                            type="button"
                            disabled={payingId !== null}
                            onClick={() =>
                              void payForRental(rental.id)
                            }
                            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {payingId === rental.id
                              ? "Opening Checkout..."
                              : "Pay Now"}
                          </button>
                        )}

                        {isPaid && (
                          <span className="inline-flex items-center rounded-xl bg-green-50 px-5 py-3 text-sm font-bold text-green-700">
                            ✓ Payment Complete
                          </span>
                        )}
                      </div>

                      {rental.status === "Requested" && (
                        <p className="mt-4 text-xs text-[#81748f]">
                          Payment becomes available after
                          the owner approves your request.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =====================================
            MY LISTINGS TAB
        ===================================== */}
        {tab === "listings" && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  My Listings
                </h2>

                <p className="mt-2 text-sm text-[#81748f]">
                  Products you own in the Campus Rental Hub database.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadMyItems()}
                disabled={loadingListings}
                className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50"
              >
                Refresh Listings
              </button>
            </div>

            {listingsError && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {listingsError}
              </div>
            )}

            {loadingListings ? (
              <div className="rounded-3xl bg-white p-12 text-center text-[#81748f] shadow-sm">
                Loading your listings...
              </div>
            ) : myItems.length === 0 ? (
              <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
                <span className="text-5xl">📚</span>

                <h3 className="mt-5 text-xl font-bold">
                  No listings found
                </h3>

                <p className="mt-3 text-[#81748f]">
                  You don't have any products assigned to your account yet.
                </p>

                <Link
                  href="/list-item"
                  className="mt-6 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white"
                >
                  List an Item
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myItems.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-3xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-3xl">
                        📚
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-xs font-bold ${statusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-violet-500">
                      Listing #{item.id}
                    </p>

                    <h3 className="mt-2 text-xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#81748f]">
                      {item.category} · {item.condition}
                    </p>

                    {item.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-6 rounded-2xl bg-[#f8f4ff] p-4">
                      <p className="text-xs text-[#81748f]">
                        Rental price per day
                      </p>

                      <p className="mt-2 text-2xl font-extrabold text-violet-600">
                        {formatPrice(item.price_per_day)}
                        <span className="ml-1 text-sm font-normal text-[#81748f]">
                          / day
                        </span>
                      </p>
                    </div>

                    {item.pickup_location && (
                      <p className="mt-4 text-sm text-[#81748f]">
                        📍 {item.pickup_location}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/items/${item.id}`}
                        className="rounded-xl border border-violet-200 px-5 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                      >
                        View Item
                      </Link>

                      <Link
                        href="/manage-requests"
                        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        Manage Requests
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* =====================================
            SAVED ITEMS TAB
        ===================================== */}
        {tab === "saved" && (
          <>
            <h2 className="mb-5 text-xl font-bold">
              Saved Items
            </h2>

            {savedItems.length === 0 ? (
              <div className="rounded-3xl bg-white p-12 text-center text-[#81748f]">
                You haven't saved anything yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {savedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
