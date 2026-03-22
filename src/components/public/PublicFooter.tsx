import Link from "next/link";

const quickLinks = [
  { path: "/about", label: "About Us" },
  { path: "/institutions/boys-hostel", label: "Boys' Hostel" },
  { path: "/institutions/girls-hostel", label: "Girls' Hostel" },
  { path: "/institutions/dharamshala", label: "Dharamshala" },
  { path: "/donations", label: "Donate" },
];

export default function PublicFooter() {
  return (
    <footer style={{ backgroundColor: "var(--bg-inverse)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-navy-700)" }}
              >
                <span style={{ color: "var(--text-inverse)" }} className="font-bold">
                  &#x0950;
                </span>
              </div>
              <div>
                <h3
                  className="font-bold"
                  style={{
                    color: "var(--text-inverse)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  Seth Hirachand Gumanji
                </h3>
                <p className="text-sm" style={{ color: "var(--color-navy-300)" }}>
                  Jain Trust, Mumbai
                </p>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-navy-300)" }}
            >
              Serving the Jain community through education, shelter, and
              spiritual welfare since 1940.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold mb-4"
              style={{ color: "var(--text-inverse)" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "var(--color-navy-300)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold mb-4"
              style={{ color: "var(--text-inverse)" }}
            >
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li
                className="flex items-start gap-2 text-sm"
                style={{ color: "var(--color-navy-300)" }}
              >
                <span className="mt-0.5 shrink-0">&#x1F4CD;</span>
                <span>
                  148, Lamington Road, Opp. Navjivan Society, Grant Road (E),
                  Mumbai, Maharashtra – 400007
                </span>
              </li>
              <li
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-navy-300)" }}
              >
                <span className="shrink-0">&#x1F4DE;</span>
                <span>+91 22 2414 1234</span>
              </li>
              <li
                className="flex items-center gap-2 text-sm"
                style={{ color: "var(--color-navy-300)" }}
              >
                <span className="shrink-0">&#x2709;&#xFE0F;</span>
                <span>info@shgjaintrust.org</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="font-semibold mb-4"
              style={{ color: "var(--text-inverse)" }}
            >
              Support Our Mission
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-navy-300)" }}
            >
              Your generous donations help us continue our service to the
              community.
            </p>
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: "var(--bg-accent)",
                color: "var(--text-on-accent)",
              }}
            >
              Donate Now
            </Link>
          </div>
        </div>

        <div
          className="mt-12 pt-8 border-t"
          style={{ borderColor: "var(--color-navy-700)" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p style={{ color: "var(--color-navy-300)" }}>
              &copy; {new Date().getFullYear()} Seth Hirachand Gumanji Jain
              Trust. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/faq"
                className="transition-colors hover:opacity-100"
                style={{ color: "var(--color-navy-300)" }}
              >
                FAQ
              </Link>
              <Link
                href="/facilities"
                className="transition-colors hover:opacity-100"
                style={{ color: "var(--color-navy-300)" }}
              >
                Rules &amp; Regulations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
