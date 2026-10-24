
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthSidePanel from "@/components/AuthSidePanel";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type RegisterResponse = {
  id: number;
  full_name: string;
  email: string;
  is_verified: boolean;
  role: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] =
    useState<RegisterResponse | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setServerError("");

    const nextErrors: FormErrors = {};
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      nextErrors.name =
        "Please enter your full name (at least 2 characters).";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password =
        "Password must be at least 8 characters.";
    }

    if (password.length > 128) {
      nextErrors.password =
        "Password must be no more than 128 characters.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = "Unable to create account.";

        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (response.status === 409) {
          message = "This email is already registered.";
        } else if (response.status === 422) {
          message =
            "Please check your details and try again.";
        }

        throw new Error(message);
      }

      const account = data as RegisterResponse;

      setCreatedAccount(account);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  // SUCCESS SCREEN - SHOWN ONLY AFTER API SUCCESS

  if (createdAccount) {
    return (
      <main className="w-full flex-1 bg-[#f7f3ee]">
        <div className="mx-auto grid max-w-[1500px] overflow-hidden md:grid-cols-2">
          <AuthSidePanel />

          <section className="flex min-h-[660px] items-center justify-center px-5 py-12 sm:px-8">
            <div className="w-full max-w-[470px] rounded-[28px] bg-white p-8 text-center shadow-[0_20px_70px_rgba(64,39,22,0.10)] sm:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e8f4e8] text-4xl text-green-700">
                ✓
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#b65c3b]">
                Welcome to Campus Rental Hub
              </p>

              <h1 className="mt-3 font-serif text-4xl font-bold text-stone-900">
                Account Created!
              </h1>

              <p className="mt-5 text-sm leading-7 text-stone-600">
                Your account has been successfully
                registered in Campus Rental Hub.
              </p>

              <div className="mt-7 rounded-xl bg-[#f8f2eb] p-5 text-left">
                <p className="text-sm font-semibold text-stone-900">
                  {createdAccount.full_name}
                </p>

                <p className="mt-1 break-all text-sm text-stone-600">
                  {createdAccount.email}
                </p>

                <p className="mt-3 text-xs text-stone-500">
                  Account status: Registered
                </p>
              </div>

              <p className="mt-6 text-sm text-stone-600">
                You can now log in using your email
                and password.
              </p>

              <Link
                href="/login"
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#b65c3b] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#99482d]"
              >
                Continue to Log In →
              </Link>

              <p className="mt-5 text-xs text-stone-500">
                Email verification is not enabled yet.
                Registration does not verify student status.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex-1 bg-[#f7f3ee]">
      <div className="mx-auto grid max-w-[1500px] overflow-hidden md:grid-cols-2">
        {/* UNIVERSITY CAMPUS PHOTO AND TYPEWRITER */}
        <AuthSidePanel />

        {/* REGISTRATION FORM */}
        <section className="flex min-h-[660px] items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[470px] rounded-[28px] border border-white bg-white p-7 shadow-[0_20px_70px_rgba(64,39,22,0.10)] sm:p-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.23em] text-[#b65c3b]">
              Join the Community
            </p>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900">
              Create Account
            </h1>

            <p className="mt-4 text-sm leading-7 text-stone-600">
              Join Campus Rental Hub and connect with
              students across Australian universities.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-7 space-y-4"
            >
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-[#b65c3b] focus:ring-2 focus:ring-[#b65c3b]/10"
                />

                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@university.edu.au"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-[#b65c3b] focus:ring-2 focus:ring-[#b65c3b]/10"
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Password
                </label>

                <div className="flex items-center rounded-xl border border-stone-300 bg-white px-4 focus-within:border-[#b65c3b] focus-within:ring-2 focus-within:ring-[#b65c3b]/10">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    className="w-full min-w-0 bg-transparent py-3.5 text-sm text-stone-900 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="ml-2 shrink-0 text-xs font-semibold text-[#b65c3b]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-stone-800"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type={
                    showPassword ? "text" : "password"
                  }
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter your password again"
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-[#b65c3b] focus:ring-2 focus:ring-[#b65c3b]/10"
                />

                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SERVER ERROR */}
              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {serverError}
                </div>
              )}

              {/* CREATE ACCOUNT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b65c3b] px-5 py-4 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#99482d] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-stone-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#b65c3b] hover:underline"
              >
                Log In
              </Link>
            </p>

            <div className="mt-7 rounded-xl bg-[#f8f2eb] p-4">
              <p className="text-xs leading-6 text-stone-600">
                For development testing, you can use a
                test email address. University email
                verification will be added before launch.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
