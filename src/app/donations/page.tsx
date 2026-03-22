import { Heart, GraduationCap, Building, Utensils, Home, Gift, Phone } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const donationPurposes = [
  {
    title: "Education Fund",
    description: "Support scholarships and academic programs for deserving students.",
    icon: GraduationCap,
  },
  {
    title: "Infrastructure",
    description: "Help maintain and improve hostel buildings and facilities.",
    icon: Building,
  },
  {
    title: "Bhojanshala",
    description: "Contribute towards providing nutritious meals for all residents.",
    icon: Utensils,
  },
  {
    title: "Medical Assistance",
    description: "Fund medical aid and health checkups for hostel residents.",
    icon: Heart,
  },
  {
    title: "Dharamshala Maintenance",
    description: "Support the upkeep of Dharamshala for pilgrims and visitors.",
    icon: Home,
  },
  {
    title: "General Donation",
    description: "Contribute to the overall welfare and growth of the institution.",
    icon: Gift,
  },
];

export default function DonationsPage() {
  return (
    <PublicLayout>
      <PageHero
        title="Support Our Mission"
        subtitle="Your generosity helps us provide quality accommodation and education"
      >
        <Heart
          className="w-10 h-10 mx-auto mb-4"
          style={{ color: "var(--bg-accent)" }}
        />
      </PageHero>

      <section
        className="px-4 py-16"
        style={{ background: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-6xl">
          {/* Tax Benefit Banner */}
          <div
            className="rounded-lg px-6 py-4 mb-12 text-center"
            style={{
              backgroundColor: "var(--bg-brand)",
              color: "var(--text-inverse)",
            }}
          >
            <p className="text-sm md:text-base font-medium">
              All donations are eligible for tax benefits under Section 80G of the Income Tax Act.
            </p>
          </div>

          {/* Donation Purpose Cards */}
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Choose a Cause to Support
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {donationPurposes.map((purpose) => {
              const Icon = purpose.icon;
              return (
                <div
                  key={purpose.title}
                  className="rounded-lg p-6 text-center transition-shadow duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div
                    className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--surface-secondary)" }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: "var(--bg-brand)" }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {purpose.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {purpose.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bank Details Card */}
          <div
            className="rounded-lg p-8 max-w-xl mx-auto"
            style={{
              backgroundColor: "var(--surface-primary)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <h2
              className="text-xl font-bold mb-6 text-center"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Make a Donation
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Bank Name</span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>State Bank of India</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Branch</span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Dadar East</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
                <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>IFSC Code</span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SBIN0001234</span>
              </div>
            </div>

            <div className="text-center">
              <p
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                For assistance or to confirm your donation, contact us:
              </p>
              <a
                href="tel:+919876543210"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--bg-brand)",
                  color: "var(--text-inverse)",
                }}
              >
                <Phone className="w-4 h-4" />
                Call +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
