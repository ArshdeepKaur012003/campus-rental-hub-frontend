
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthSidePanel from "@/components/AuthSidePanel";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type LoginResponse = {
  message: string;
  access_token: string;
  token_type: string;
  user_id: number;
  full_name: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to log in. Please try again."
        );
      }

      const loginData = data as LoginResponse;

      if (!loginData.access_token) {
        throw new Error(
          "Login response did not include an access token."
        );
      }

      // Development-only token storage.
      // Use server-managed HttpOnly cookies
      // before production deployment.
      sessionStorage.setItem(
        "campus_rental_token",
        loginData.access_token
      );

      sessionStorage.setItem(
        "campus_rental_user",
        JSON.stringify({
          id: loginData.user_id,
          full_name: loginData.full_name,
          role: loginData.role,
          email: email.trim().toLowerCase(),
        })
      );

      // Return to a safe local path if requested.
      const requestedPath = new URLSearchParams(
        window.location.search
      ).get("next");

      const destination =
        requestedPath &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        !requestedPath.includes("\\")
          ? requestedPath
          : "/";

      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full flex-1 bg-[#f7f3ee]">
      <div className="mx-auto grid w-full max-w-[1500px] overflow-hidden md:grid-cols-2">
        {/* CAMPUS HERO */}
        <AuthSidePanel />

        {/* LOGIN FORM AREA */}
        <section className="flex min-h-[660px] items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[470px] rounded-[28px] border border-white bg-white p-7 shadow-[0_20px_70px_rgba(64,39,22,0.10)] sm:p-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.23em] text-[#b65c3b]">
              Welcome Back
            </p>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
              Log In
            </h1>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              Sign in to explore student rentals,
              manage your listings, and connect
              with students across Australian universities.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Email address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-4 transition focus-within:border-[#b65c3b] focus-within:ring-2 focus-within:ring-[#b65c3b]/10">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="shrink-0 text-stone-500"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu.au"
                    className="w-full min-w-0 bg-transparent py-4 text-sm text-stone-900 outline-none placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-4 transition focus-within:border-[#b65c3b] focus-within:ring-2 focus-within:ring-[#b65c3b]/10">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="shrink-0 text-stone-500"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full min-w-0 bg-transparent py-4 text-sm text-stone-900 outline-none placeholder:text-stone-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    className="shrink-0 text-xs font-semibold text-[#b65c3b] hover:underline"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b65c3b] px-5 py-4 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#99482d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Logging in...
                  </>
                ) : (
                  "Log In →"
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-stone-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#b65c3b] hover:underline"
              >
                Create an account
              </Link>
            </p>

            {/* INFORMATION NOTE */}
            <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#f8f2eb] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6e1ce] text-xl">
                🎓
              </div>

              <p className="text-xs leading-6 text-stone-600">
                Campus Rental Hub is designed for students
                across Australian universities. Use the
                email and password associated with your
                registered account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
