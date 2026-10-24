
"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Discover. Rent. Repeat.",
  "Study More. Spend Less.",
  "Your Campus. Your Community.",
];

const features = [
  {
    icon: "👥",
    title: "Real Students",
    description: "Student-to-student rentals",
  },
  {
    icon: "🎓",
    title: "Great Prices",
    description: "Affordable daily rentals",
  },
  {
    icon: "🌿",
    title: "Across Campuses",
    description: "Australian universities",
  },
];

export default function AuthSidePanel() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotion = () => {
      setReduceMotion(media.matches);
    };

    updateMotion();
    media.addEventListener("change", updateMotion);

    return () => {
      media.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const message = MESSAGES[messageIndex];

    let delay = deleting ? 45 : 80;

    if (!deleting && characterIndex === message.length) {
      delay = 2300;
    }

    if (deleting && characterIndex === 0) {
      delay = 350;
    }

    const timer = window.setTimeout(() => {
      if (!deleting) {
        if (characterIndex < message.length) {
          setCharacterIndex((previous) => previous + 1);
        } else {
          setDeleting(true);
        }
      } else if (characterIndex > 0) {
        setCharacterIndex((previous) => previous - 1);
      } else {
        setDeleting(false);
        setMessageIndex(
          (previous) => (previous + 1) % MESSAGES.length
        );
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    messageIndex,
    characterIndex,
    deleting,
    reduceMotion,
  ]);

  const typedText = reduceMotion
    ? MESSAGES[0]
    : MESSAGES[messageIndex].slice(0, characterIndex);

  return (
    <section className="relative hidden min-h-[660px] flex-1 overflow-hidden bg-[#473124] text-white md:flex">
      {/* UNIVERSITY CAMPUS PHOTOGRAPH */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?w=1800&auto=format&fit=crop&q=90')",
        }}
      />

      {/* CINEMATIC OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#21160e]/90 via-[#332216]/75 to-[#332216]/35" />

      {/* SOFT LIGHT EFFECT */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-200/10 blur-3xl" />

      {/* CONTENT */}
      <div className="relative z-10 flex w-full flex-col justify-center px-8 py-12 lg:px-12 xl:px-16">
        <div className="max-w-lg">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-orange-100">
            Student to Student
          </p>

          <h2 className="font-serif text-5xl font-bold leading-[1.08] tracking-tight lg:text-6xl">
            Campus
            <br />
            Rental Hub
          </h2>

          {/* TYPEWRITER ANIMATION */}
          <div className="mt-7 min-h-[58px]">
            <p
              className="font-mono text-base font-bold tracking-wide text-white lg:text-lg"
              aria-label={MESSAGES[messageIndex]}
            >
              <span aria-hidden="true">{typedText}</span>

              {!reduceMotion && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-5 w-[2px] translate-y-1 animate-pulse bg-orange-200"
                />
              )}
            </p>
          </div>

          <p className="max-w-sm text-sm leading-7 text-white/90 lg:text-base">
            Essential study items, from students at
            Australian universities. Find what you need,
            rent affordably, and connect across campuses.
          </p>

          {/* FEATURES */}
          <div className="mt-9 space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group flex items-center gap-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8e8d2] text-xl shadow-md transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    {feature.title}
                  </p>
                  <p className="text-xs text-white/75">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-orange-300" />
            Built for Australian university students
          </div>
        </div>
      </div>
    </section>
  );
}
