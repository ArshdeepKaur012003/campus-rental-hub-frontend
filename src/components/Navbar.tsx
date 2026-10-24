
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CartButton from "@/components/CartButton";

type Student = {
  id?: number;
  full_name?: string;
  email?: string;
  university?: string | null;
  campus?: string | null;
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/list-item", label: "List an Item" },
  { href: "/my-rentals", label: "My Rentals" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(
    null
  );
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function updateStudent() {
      const token = sessionStorage.getItem(
        "campus_rental_token"
      );

      const savedUser = sessionStorage.getItem(
        "campus_rental_user"
      );

      setLoggedIn(Boolean(token));

      if (token && savedUser) {
        try {
          setStudent(JSON.parse(savedUser) as Student);
        } catch {
          setStudent(null);
        }
      } else {
        setStudent(null);
      }
    }

    updateStudent();

    window.addEventListener(
      "campus-auth-updated",
      updateStudent
    );
    window.addEventListener("storage", updateStudent);
    window.addEventListener("focus", updateStudent);

    return () => {
      window.removeEventListener(
        "campus-auth-updated",
        updateStudent
      );
      window.removeEventListener("storage", updateStudent);
      window.removeEventListener("focus", updateStudent);
    };
  }, [pathname]);

  function handleLogout() {
    sessionStorage.removeItem("campus_rental_token");
    sessionStorage.removeItem("campus_rental_user");

    setStudent(null);
    setLoggedIn(false);
    setMenuOpen(false);

    window.dispatchEvent(
      new Event("campus-auth-updated")
    );

    router.push("/");
    router.refresh();
  }

  const displayName =
    student?.full_name?.trim() || "Student";

  const initials = displayName
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function isActive(href: string) {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0DE] bg-[#FFFCFA]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[86px] max-w-[1600px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        {/* Brand */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20302D] font-serif text-xl font-bold text-white shadow-md">
            CR
          </div>

          <div className="leading-tight">
            <p className="font-serif text-lg font-bold text-[#292422] sm:text-xl">
              Campus Rental
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#B95E3E]">
              Hub
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 py-2 text-sm font-semibold transition ${
                isActive(link.href)
                  ? "border-[#B95E3E] text-[#B95E3E]"
                  : "border-transparent text-[#49413E] hover:text-[#B95E3E]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop account actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <CartButton />

          {loggedIn ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-full border border-[#E9E1DD] bg-white px-3 py-2 transition hover:border-[#D3B9A8]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8E8DE] text-sm font-bold text-[#B95E3E]">
                  {initials || "S"}
                </span>

                <span className="max-w-[150px] text-left">
                  <span className="block truncate text-sm font-bold text-[#302926]">
                    {displayName}
                  </span>
                  <span className="block text-[11px] text-[#938680]">
                    View My Profile →
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-[#B95E3E] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9D492D]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-full border border-[#E5DCD7] bg-white px-6 py-3 text-sm font-semibold text-[#302926] transition hover:bg-[#F8F0EC]"
              >
                Sign Up
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-[#B95E3E] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#9D492D]"
              >
                Log In →
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={
              menuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E9E1DD] bg-white text-2xl text-[#302926]"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#E9E1DD] bg-[#FFFCFA] px-5 pb-6 pt-4 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  isActive(link.href)
                    ? "bg-[#F8E8DE] text-[#B95E3E]"
                    : "text-[#302926] hover:bg-[#F8F0EC]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-[#302926] hover:bg-[#F8F0EC]"
            >
              Shopping Cart
            </Link>
          </nav>

          <div className="mt-4 border-t border-[#E9E1DD] pt-4">
            {loggedIn ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#F8F0EC] px-4 py-3 text-sm font-semibold text-[#302926]"
                >
                  My Profile — {displayName}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-[#B95E3E] px-5 py-3 text-sm font-bold text-white"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-[#E5DCD7] px-5 py-3 text-center text-sm font-semibold"
                >
                  Sign Up
                </Link>

                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#B95E3E] px-5 py-3 text-center text-sm font-bold text-white"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
