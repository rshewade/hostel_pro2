"use client";

import { useState } from "react";
import { Building2, Home, Users } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

type TabKey = "boys" | "girls" | "dharamshala";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "boys", label: "Boys' Hostel", icon: <Building2 size={18} /> },
  { key: "girls", label: "Girls' Hostel", icon: <Home size={18} /> },
  { key: "dharamshala", label: "Dharamshala", icon: <Users size={18} /> },
];

const rules: Record<TabKey, string[]> = {
  boys: [
    "All residents must maintain strict discipline and decorum within the hostel premises at all times.",
    "Entry to the hostel after 9:00 PM is not permitted without prior written permission from the superintendent.",
    "Consumption of alcohol, tobacco, or any intoxicating substances is strictly prohibited and will result in immediate expulsion.",
    "Visitors are allowed only in the designated visitor area during visiting hours (4:00 PM to 7:00 PM on weekends).",
    "Residents are responsible for maintaining cleanliness of their rooms and common areas as per the assigned duty roster.",
    "Use of personal electrical appliances such as heaters, cookers, or irons is not permitted in the rooms without approval.",
    "All residents are expected to attend the morning prayer assembly held daily at 6:30 AM in the prayer hall.",
    "Any damage to hostel property will be charged to the resident responsible, and repeated offences may lead to disciplinary action.",
  ],
  girls: [
    "Entry to the ashram after 8:00 PM is not permitted. Late entry requires prior written consent from the warden.",
    "Male visitors are not allowed beyond the reception area. All meetings must take place in the designated visitor room.",
    "Overnight stays outside the ashram require written consent from a parent or guardian, submitted to the warden at least 24 hours in advance.",
    "Residents must inform the warden before leaving the ashram premises, stating the destination and expected time of return.",
    "A modest dress code must be followed within the ashram premises as per the guidelines issued by the management.",
    "Mobile phone usage is restricted during study hours (7:00 PM to 9:30 PM) and during prayer sessions.",
    "All residents are expected to participate in cultural and religious events organised by the ashram and the trust.",
  ],
  dharamshala: [
    "Check-in time is 12:00 PM and check-out time is 11:00 AM. Early check-in or late check-out is subject to availability.",
    "Valid government-issued photo ID proof is mandatory for all guests at the time of check-in.",
    "Maximum duration of stay is 7 days. Extensions may be granted in exceptional circumstances with approval from the trust office.",
    "Non-vegetarian food, alcohol, and tobacco products are strictly prohibited within the dharamshala premises.",
    "Silence must be maintained during prayer hours (6:00 AM to 7:00 AM and 7:00 PM to 8:00 PM).",
    "Cancellations must be made at least 24 hours before the check-in date to receive a full refund of the advance payment.",
    "Vehicle parking is available on a first-come, first-served basis. The management is not responsible for any loss or damage to vehicles.",
  ],
};

export default function FacilitiesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("boys");

  return (
    <PublicLayout>
      <PageHero
        title="Facilities & Rules"
        subtitle="Guidelines and regulations for our institutions"
      />

      <section className="px-4 py-16" style={{ background: "var(--bg-page)" }}>
        <div className="mx-auto max-w-4xl">
          {/* Tab buttons */}
          <div
            className="flex flex-wrap gap-2 mb-8 p-1.5 rounded-xl"
            style={{ backgroundColor: "var(--surface-secondary)" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor:
                    activeTab === tab.key
                      ? "var(--surface-primary)"
                      : "transparent",
                  color:
                    activeTab === tab.key
                      ? "var(--color-navy-700)"
                      : "var(--text-secondary)",
                  boxShadow:
                    activeTab === tab.key
                      ? "0 2px 8px rgba(0,0,0,0.08)"
                      : "none",
                  minWidth: "140px",
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Rules list */}
          <div
            className="rounded-xl p-6 md:p-8"
            style={{
              backgroundColor: "var(--surface-primary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {tabs.find((t) => t.key === activeTab)?.label} Rules &amp;
              Regulations
            </h2>

            <ol className="flex flex-col gap-4">
              {rules[activeTab].map((rule, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      color: "var(--color-navy-800)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <p
                    className="text-sm leading-relaxed pt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {rule}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
