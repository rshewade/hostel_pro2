"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface NavItem {
  path?: string;
  label: string;
  children?: { path: string; label: string }[];
}

const navItems: NavItem[] = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  {
    label: "Institutions",
    children: [
      { path: "/institutions/boys-hostel", label: "Boys' Hostel" },
      { path: "/institutions/girls-hostel", label: "Girls' Hostel" },
      { path: "/institutions/dharamshala", label: "Dharamshala" },
    ],
  },
  {
    label: "Admissions",
    children: [
      { path: "/admissions/boys-hostel", label: "Boys' Hostel" },
      { path: "/admissions/girls-hostel", label: "Girls' Hostel" },
      { path: "/admissions/dharamshala", label: "Dharamshala Booking" },
    ],
  },
  { path: "/trustees", label: "Trustees" },
  { path: "/gallery", label: "Gallery" },
  { path: "/news", label: "News" },
  { path: "/donations", label: "Donate" },
  { path: "/contact", label: "Contact" },
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        borderColor: "var(--border-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Hirachand Gumanji Family Charitable Trust"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div className="hidden sm:block">
              <h1
                className="text-sm md:text-base font-bold leading-tight"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                Hirachand Gumanji Family
              </h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Charitable Trust
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) =>
              item.children ? (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className="px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.label}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <div
                      className="absolute top-full left-0 mt-0 w-48 rounded-md shadow-lg py-1 z-50"
                      style={{
                        backgroundColor: "var(--surface-primary)",
                        border: "1px solid var(--border-primary)",
                      }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          href={child.path}
                          className="block px-4 py-2 text-sm transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "var(--color-navy-50)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  href={item.path!}
                  className="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: "var(--text-primary)" }}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav
            className="lg:hidden py-4 border-t"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item, index) =>
                item.children ? (
                  <div key={index} className="space-y-1">
                    <p
                      className="px-3 py-2 text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.label}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        onClick={() => setMobileOpen(false)}
                        className="block px-6 py-2 text-sm rounded-md"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path!}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 text-sm rounded-md"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
