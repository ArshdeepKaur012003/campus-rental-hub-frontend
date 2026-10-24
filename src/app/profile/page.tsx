
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  university: string | null;
  campus: string | null;
};

type ProfileForm = {
  full_name: string;
  university: string;
  campus: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    university: "",
    campus: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = sessionStorage.getItem(
        "campus_rental_token"
      );

      if (!token) {
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please log in again."
              : "Unable to load your profile."
          );
        }

        const data: UserProfile = await response.json();

        if (!cancelled) {
          setUser(data);
          setForm({
            full_name: data.full_name,
            university: data.university ?? "",
            campus: data.campus ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCancel() {
    if (!user) return;

    setForm({
      full_name: user.full_name,
      university: user.university ?? "",
      campus: user.campus ?? "",
    });

    setEditing(false);
    setError("");
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.full_name.trim() || form.full_name.trim().length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    const token = sessionStorage.getItem(
      "campus_rental_token"
    );

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: form.full_name.trim(),
            university: form.university.trim() || null,
            campus: form.campus.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        const message =
          typeof result?.detail === "string"
            ? result.detail
            : response.status === 401
              ? "Your session has expired. Please log in again."
              : "Unable to save your changes.";

        throw new Error(message);
      }

      const updatedUser: UserProfile = await response.json();

      setUser(updatedUser);
      setForm({
        full_name: updatedUser.full_name,
        university: updatedUser.university ?? "",
        campus: updatedUser.campus ?? "",
      });

      setEditing(false);
      setSuccess("Your profile has been updated successfully!");

      // Let other components, such as Navbar,
      // know that the displayed name may have changed.
      window.dispatchEvent(new Event("campus-profile-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F8F4EF]">
        <p className="animate-pulse text-stone-600">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-[#F8F4EF] px-6 text-center">
        <h1 className="font-serif text-4xl font-bold text-stone-900">
          My Profile
        </h1>

        <p className="text-stone-600">
          {error || "Profile not available."}
        </p>

        <Link
          href="/login"
          className="rounded-full bg-[#B65D3B] px-7 py-3 font-semibold text-white"
        >
          Go to Log In →
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F4EF] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B65D3B]">
          Student Dashboard
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold text-stone-900 sm:text-5xl">
              My Profile
            </h1>

            <p className="mt-3 text-stone-600">
              Manage your Campus Rental Hub account information.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
                setSuccess("");
              }}
              className="rounded-full bg-[#B65D3B] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#994A2E]"
            >
              Edit Profile ✎
            </button>
          )}
        </div>

        {success && (
          <div
            role="status"
            className="mt-7 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
          >
            ✓ {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-7 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-9 overflow-hidden rounded-[28px] bg-white shadow-[0_20px_65px_rgba(40,30,20,0.08)]">
          {/* Profile banner */}
          <div className="bg-[#234438] px-7 py-10 text-white sm:px-10">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F2E3D5] font-serif text-4xl font-bold text-[#B65D3B]">
                {user.full_name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h2 className="break-words font-serif text-2xl font-bold sm:text-3xl">
                  {user.full_name}
                </h2>

                <p className="mt-2 break-all text-sm text-white/75">
                  {user.email}
                </p>

                <p className="mt-2 text-sm text-white/70">
                  {user.university || "University not added"}
                  {user.campus ? ` · ${user.campus}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {editing
                  ? "Edit Personal Information"
                  : "Personal Information"}
              </h3>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  user.is_verified
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {user.is_verified
                  ? "Verified Account"
                  : "Email Not Verified"}
              </span>
            </div>

            {editing ? (
              <form
                onSubmit={handleSave}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="profile-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[#B65D3B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-university"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    University
                  </label>

                  <input
                    id="profile-university"
                    type="text"
                    maxLength={150}
                    value={form.university}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        university: e.target.value,
                      })
                    }
                    placeholder="e.g. Australian Catholic University"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[#B65D3B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-campus"
                    className="mb-2 block text-sm font-semibold text-stone-700"
                  >
                    Campus
                  </label>

                  <input
                    id="profile-campus"
                    type="text"
                    maxLength={150}
                    value={form.campus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        campus: e.target.value,
                      })
                    }
                    placeholder="e.g. North Sydney"
                    className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[#B65D3B]"
                  />
                </div>

                <div className="rounded-xl bg-[#F8F2EB] p-5">
                  <p className="text-sm leading-6 text-stone-600">
                    Your email address and account type cannot
                    be changed here. University and campus
                    information is self-reported and does not
                    verify student enrolment.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#B65D3B] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#994A2E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes ✓"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleCancel}
                    className="rounded-full border border-stone-300 px-7 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <InfoField
                    label="Full Name"
                    value={user.full_name}
                  />

                  <InfoField
                    label="Account Type"
                    value={user.role}
                  />

                  <InfoField
                    label="Email Address"
                    value={user.email}
                  />

                  <InfoField
                    label="Account ID"
                    value={String(user.id)}
                  />

                  <InfoField
                    label="University"
                    value={user.university || "Not added yet"}
                  />

                  <InfoField
                    label="Campus"
                    value={user.campus || "Not added yet"}
                  />
                </div>

                <div className="mt-9 rounded-xl bg-[#F8F2EB] p-5">
                  <p className="text-sm leading-7 text-stone-600">
                    Keep your university and campus details up
                    to date so your profile reflects where
                    you study. Email verification is not
                    enabled yet.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/list-item"
                    className="rounded-full bg-[#B65D3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#994A2E]"
                  >
                    List an Item →
                  </Link>

                  <Link
                    href="/my-rentals"
                    className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-[#B65D3B]"
                  >
                    My Rentals
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-stone-100 pb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>

      <p className="mt-2 break-words text-base font-semibold text-stone-900">
        {value}
      </p>
    </div>
  );
}
