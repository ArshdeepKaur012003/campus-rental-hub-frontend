
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

type Rental = {
  id: number;
  item_id: number;
  renter_id: number;
  start_date: string;
  end_date: string;
  total_price: number | string;
  status: string;
  handoff_location: string | null;
};

type ApiItem = {
  id: number;
  title: string;
  category: string;
  condition: string;
  pickup_location?: string | null;
};

type Action = "approve" | "reject" | "start" | "complete";

function money(value: number | string) {
  return Number(value).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
}

function displayDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "requested":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "active":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export default function ManageRequestsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [items, setItems] = useState<
    Record<number, ApiItem>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem(
        "campus_rental_token"
      );

      if (!token) {
        setRentals([]);
        setItems({});
        setError("Please log in to manage rental requests.");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/rentals/received`,
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
            "Your session has expired. Please log in again."
          );
        }

        throw new Error(
          `Unable to load requests (HTTP ${response.status}).`
        );
      }

      const data: Rental[] = await response.json();
      setRentals(data);

      const ids = [...new Set(data.map((r) => r.item_id))];

      const itemResults = await Promise.all(
        ids.map(async (id) => {
          try {
            const result = await fetch(
              `${API_URL}/api/items/${id}`,
              { cache: "no-store" }
            );

            if (!result.ok) return null;

            return (await result.json()) as ApiItem;
          } catch {
            return null;
          }
        })
      );

      const lookup: Record<number, ApiItem> = {};

      for (const item of itemResults) {
        if (item) lookup[item.id] = item;
      }

      setItems(lookup);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load rental requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function performAction(
    rental: Rental,
    action: Action
  ) {
    const actionNames: Record<Action, string> = {
      approve: "approve",
      reject: "reject",
      start: "mark as handed over",
      complete: "mark as returned",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${actionNames[action]} booking #${rental.id}?`
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem(
      "campus_rental_token"
    );

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const endpoint =
      action === "approve" || action === "reject"
        ? `${API_URL}/api/rentals/${rental.id}/decision?decision=${action}`
        : `${API_URL}/api/rentals/${rental.id}/${action}`;

    setBusyId(rental.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        const message =
          typeof body?.detail === "string"
            ? body.detail
            : `Action failed (HTTP ${response.status}).`;

        throw new Error(message);
      }

      setSuccess(
        `Booking #${rental.id} updated successfully.`
      );

      await loadRequests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setBusyId(null);
    }
  }

  const requestedCount = rentals.filter(
    (r) => r.status === "Requested"
  ).length;

  const approvedCount = rentals.filter(
    (r) => r.status === "Approved"
  ).length;

  const activeCount = rentals.filter(
    (r) => r.status === "Active"
  ).length;

  const completedCount = rentals.filter(
    (r) => r.status === "Completed"
  ).length;

  const visibleRentals =
    filter === "All"
      ? rentals
      : rentals.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f2ff] via-white to-[#fff8f3] px-5 py-12 text-[#2c2042]">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
            Campus Rental Hub
          </p>

          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">
            Manage Rental Requests
          </h1>

          <p className="mt-4 text-stone-500">
            Review requests for items you own, approve
            bookings and track equipment returns.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/my-rentals"
              className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700"
            >
              My Rentals →
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              title: "Pending",
              value: requestedCount,
              icon: "⏳",
            },
            {
              title: "Approved",
              value: approvedCount,
              icon: "✅",
            },
            {
              title: "Active",
              value: activeCount,
              icon: "📦",
            },
            {
              title: "Completed",
              value: completedCount,
              icon: "🎓",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"
            >
              <span className="text-3xl">
                {card.icon}
              </span>

              <p className="mt-4 text-3xl font-extrabold">
                {loading ? "..." : card.value}
              </p>

              <p className="mt-2 text-sm text-stone-500">
                {card.title}
              </p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "Requested",
              "Approved",
              "Active",
              "Completed",
              "Rejected",
              "Cancelled",
            ].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === value
                    ? "bg-violet-600 text-white"
                    : "bg-white text-violet-700 hover:bg-violet-50"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void loadRequests()}
            disabled={loading || busyId !== null}
            className="rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700 disabled:opacity-50"
          >
            Refresh Requests
          </button>
        </div>

        {/* MESSAGES */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800"
          >
            {success}
          </div>
        )}

        {/* REQUESTS */}
        {loading ? (
          <div className="rounded-3xl bg-white p-12 text-center text-stone-500">
            Loading rental requests...
          </div>
        ) : visibleRentals.length === 0 ? (
          <div className="rounded-3xl border border-violet-100 bg-white p-12 text-center shadow-sm">
            <span className="text-5xl">📭</span>

            <h2 className="mt-5 text-xl font-bold">
              No rental requests found
            </h2>

            <p className="mt-3 text-stone-500">
              Requests for your items will appear here
              when another student submits a booking.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleRentals.map((rental) => {
              const item = items[rental.item_id];
              const busy = busyId === rental.id;

              return (
                <article
                  key={rental.id}
                  className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-violet-500">
                        Booking #{rental.id}
                      </p>

                      <h2 className="mt-2 text-xl font-extrabold">
                        {item?.title ??
                          `Item #${rental.item_id}`}
                      </h2>

                      {item && (
                        <p className="mt-2 text-sm text-stone-500">
                          {item.category} · {item.condition}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-2 text-xs font-bold ${statusStyle(
                        rental.status
                      )}`}
                    >
                      {rental.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-stone-600">
                    Requested by Student #{rental.renter_id}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[#f8f4ff] p-5">
                    <div>
                      <p className="text-xs text-stone-500">
                        Pickup Date
                      </p>
                      <p className="mt-2 font-bold">
                        {displayDate(rental.start_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">
                        Return Date
                      </p>
                      <p className="mt-2 font-bold">
                        {displayDate(rental.end_date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-stone-500">
                      Rental Total
                    </span>

                    <strong className="text-2xl text-violet-600">
                      {money(rental.total_price)}
                    </strong>
                  </div>

                  {rental.handoff_location && (
                    <p className="mt-4 text-sm text-stone-600">
                      Pickup location: {rental.handoff_location}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/items/${rental.item_id}`}
                      className="rounded-xl border border-violet-200 px-5 py-3 text-sm font-bold text-violet-700"
                    >
                      View Item
                    </Link>

                    {rental.status === "Requested" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            void performAction(rental, "approve")
                          }
                          className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {busy ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() =>
                            void performAction(rental, "reject")
                          }
                          className="rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {rental.status === "Approved" && (
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() =>
                          void performAction(rental, "start")
                        }
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {busy
                          ? "Processing..."
                          : "Mark as Handed Over"}
                      </button>
                    )}

                    {rental.status === "Active" && (
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() =>
                          void performAction(rental, "complete")
                        }
                        className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                      >
                        {busy
                          ? "Processing..."
                          : "Mark as Returned"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-xs text-stone-500">
          Campus Rental Hub — University project demonstration.
        </p>
      </div>
    </main>
  );
}
