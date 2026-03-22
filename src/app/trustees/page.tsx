import { Building, Users, Heart, GraduationCap } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import PublicLayout from "@/components/public/PublicLayout";

const heritageCards = [
  {
    icon: <Building className="w-8 h-8" />,
    title: "Origins in Bhindar",
    description:
      "The Jhaveri family traces its roots to the historic town of Bhindar in Rajasthan, a region renowned for its rich Jain heritage and tradition of philanthropy. From these humble beginnings, the family established itself as a pillar of the community.",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Founding Figures",
    description:
      "The early patriarchs of the Jhaveri family laid the groundwork for what would become one of Mumbai's most respected charitable trusts. Their vision of community service and educational empowerment continues to guide the Trust's mission.",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "The Trust's Namesake",
    description:
      "Seth Hirachand Gumanji, whose name the Trust proudly bears, was a visionary leader who dedicated his life and resources to the welfare of the Jain community. His legacy of generosity and compassion remains the cornerstone of the institution.",
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Generational Leadership",
    description:
      "Across multiple generations, the Jhaveri family has maintained an unwavering commitment to the Trust's founding principles. Each generation has built upon the work of its predecessors, expanding the reach and impact of the Trust's charitable activities.",
  },
];

const managementMembers = [
  {
    name: "Seema Javeri",
    role: "Executive Director",
    initials: "SJ",
    description:
      "Seema Javeri has been leading the Trust's operations with dedication and vision for over a decade. Under her stewardship, the Trust has modernized its facilities, streamlined admissions processes, and strengthened its commitment to student welfare while preserving the institution's core values.",
  },
  {
    name: "Asit Jhaveri",
    role: "Trustee",
    initials: "AJ",
    description:
      "Asit Jhaveri brings a wealth of experience in governance and community development to the Board of Trustees. His strategic guidance has been instrumental in the Trust's growth, particularly in expanding educational programs and ensuring financial sustainability for future generations.",
  },
];

export default function TrusteesPage() {
  return (
    <PublicLayout>
      <PageHero title="Board of Trustees" />

      {/* Jhaveri Family Heritage */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            className="text-3xl font-bold mb-4 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            The Jhaveri Family Heritage
          </h2>
          <p
            className="text-center mb-12 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            A legacy of service, faith, and dedication spanning over a century
            and a half.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {heritageCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl p-8"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                  style={{
                    backgroundColor: "var(--color-navy-50)",
                    color: "var(--color-navy-700)",
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Management */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2
            className="text-3xl font-bold mb-4 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Key Management
          </h2>
          <p
            className="text-center mb-12 max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            The dedicated leaders who guide the Trust with wisdom and
            commitment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {managementMembers.map((member) => (
              <div
                key={member.name}
                className="rounded-xl p-8 text-center"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 text-2xl font-bold"
                  style={{
                    backgroundColor: "var(--color-navy-100)",
                    color: "var(--color-navy-700)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {member.initials}
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-sm font-medium mb-4"
                  style={{ color: "var(--bg-accent)" }}
                >
                  {member.role}
                </p>
                <p
                  className="leading-relaxed text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2
            className="text-3xl font-bold mb-8"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            A Living Legacy
          </h2>
          <p
            className="text-lg leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            The Seth Hirachand Gumanji Jain Trust stands as a testament to the
            enduring power of faith, service, and community. From its origins in
            the small town of Bhindar to its present-day impact in Mumbai, the
            Trust continues to honor its founders&apos; vision by empowering
            students, supporting pilgrims, and preserving the rich cultural
            heritage of the Jain community. As it embraces digital
            transformation, the Trust remains steadfast in its commitment to the
            values that have guided it for over 170 years.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
