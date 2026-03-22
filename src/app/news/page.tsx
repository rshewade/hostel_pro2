import { Calendar } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const newsItems = [
  {
    title: "Admissions Open for 2025-26",
    description:
      "Applications are now being accepted for the upcoming academic year. Apply online through our streamlined admission process for Boys Hostel, Girls Ashram, and Dharamshala.",
    date: "15 Dec 2024",
    category: "Admissions",
    badgeColor: "#2563eb",
    badgeBg: "#dbeafe",
  },
  {
    title: "Annual Paryushan Mahaparva Celebration",
    description:
      "The hostel community came together to celebrate Paryushan Mahaparva with devotion and enthusiasm. Events included special prayers, lectures, and community gatherings.",
    date: "08 Sep 2024",
    category: "Events",
    badgeColor: "#d97706",
    badgeBg: "#fef3c7",
  },
  {
    title: "Alumni Meet 2024 - A Grand Success",
    description:
      "Over 200 alumni gathered for the annual reunion, sharing memories and experiences. The event featured cultural programs, felicitations, and mentorship sessions for current residents.",
    date: "20 Nov 2024",
    category: "Alumni",
    badgeColor: "#e11d48",
    badgeBg: "#ffe4e6",
  },
  {
    title: "New Library Wing Inaugurated",
    description:
      "A state-of-the-art library wing has been inaugurated with over 5,000 new books, digital resources, and dedicated study spaces for residents.",
    date: "05 Oct 2024",
    category: "Infrastructure",
    badgeColor: "#16a34a",
    badgeBg: "#dcfce7",
  },
  {
    title: "Scholarship Program Expanded",
    description:
      "The trust has expanded its scholarship program to support more deserving students. New categories include merit-based, need-based, and sports scholarships.",
    date: "15 Aug 2024",
    category: "Scholarships",
    badgeColor: "#9333ea",
    badgeBg: "#f3e8ff",
  },
];

export default function NewsPage() {
  return (
    <PublicLayout>
      <PageHero
        title="News & Announcements"
        subtitle="Stay updated with the latest happenings at our institutions"
      />

      <section
        className="px-4 py-16"
        style={{ background: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {newsItems.map((item) => (
            <article
              key={item.title}
              className="rounded-lg p-6 transition-shadow duration-200 hover:shadow-md"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    color: item.badgeColor,
                    backgroundColor: item.badgeBg,
                  }}
                >
                  {item.category}
                </span>
                <span
                  className="flex items-center gap-1.5 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
              </div>
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
