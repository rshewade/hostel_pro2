"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const faqs = [
  {
    question: "Who can apply for hostel admission?",
    answer:
      "Hostel admission is open to students belonging to the Digambar Jain community who are pursuing their education in Mumbai. Applicants must provide valid community references and proof of enrollment at a recognised educational institution. Both undergraduate and postgraduate students are eligible to apply.",
  },
  {
    question: "What is the admission process?",
    answer:
      "The admission process begins with submitting an application through our online portal. After submission, your documents will be verified by the hostel superintendent. Shortlisted applicants are then called for an interview with the trust committee. Upon approval, you will receive an admission offer with instructions for fee payment and room allocation.",
  },
  {
    question: "What are the hostel fees?",
    answer:
      "The trust charges minimal fees to support students from the community. Fee amounts vary depending on the room type (shared or single occupancy) and the specific hostel. Scholarships and fee concessions are available for students demonstrating financial need. Detailed fee structures are shared upon receiving the admission offer.",
  },
  {
    question: "How can I book a room at Dharamshala?",
    answer:
      "Rooms at Hirabaug Dharamshala can be booked through our online portal or by visiting the trust office in person. Advance booking is recommended, especially during festival seasons and peak travel periods. Stays are available for a maximum of 7 days and are open to members of the Jain community with valid identification.",
  },
  {
    question: "Are meals provided in the hostel?",
    answer:
      "Yes, the hostel provides pure Jain vegetarian meals prepared under strict dietary guidelines. The mess operates on a fixed schedule for breakfast, lunch, and dinner. Special dietary requirements can be communicated to the warden. No outside non-vegetarian food is permitted on the premises.",
  },
  {
    question: "How can I donate to the trust?",
    answer:
      "Donations to the trust can be made via bank transfer, cheque, or in person at the trust office. All donations are eligible for tax benefits under Section 80G of the Income Tax Act. The trust issues official receipts for all contributions. For large donations or corpus fund contributions, please contact the trust office directly.",
  },
  {
    question: "What facilities are available for girls?",
    answer:
      "The R.R. Shravika Ashram is a dedicated facility for girls with women-only staff and management. The ashram features 24/7 security with CCTV surveillance, a separate study hall, recreation room, and prayer hall. Strict visitor policies ensure a safe and comfortable environment. A female warden resides on the premises at all times.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PublicLayout>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our hostels and services"
      />

      <section className="px-4 py-16" style={{ background: "var(--bg-page)" }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col gap-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden transition-shadow duration-200"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                  boxShadow:
                    openIndex === index
                      ? "0 4px 12px rgba(0,0,0,0.08)"
                      : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors duration-150"
                  style={{
                    backgroundColor:
                      openIndex === index
                        ? "var(--surface-secondary)"
                        : "transparent",
                  }}
                >
                  <HelpCircle
                    size={20}
                    style={{ color: "var(--color-gold-500)", flexShrink: 0 }}
                  />
                  <span
                    className="flex-1 font-semibold text-base"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    style={{
                      color: "var(--text-secondary)",
                      flexShrink: 0,
                      transform:
                        openIndex === index ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </button>
                {openIndex === index && (
                  <div
                    className="px-5 pb-5 pt-2"
                    style={{ paddingLeft: "3.25rem" }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
