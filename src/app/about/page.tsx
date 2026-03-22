import Image from "next/image";
import { BookOpen, Shield, Heart } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import PublicLayout from "@/components/public/PublicLayout";

const objectives = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Empowerment",
    description:
      "Providing quality education and accommodation to Jain students, enabling them to pursue academic excellence while staying rooted in their cultural values.",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Spiritual Integrity",
    description:
      "Upholding the principles of Jain philosophy by creating an environment that nurtures spiritual growth, ethical conduct, and disciplined living.",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Service",
    description:
      "Extending selfless service to the Jain community and society at large through charitable initiatives, community welfare programs, and humanitarian support.",
  },
];

const timelineEvents = [
  {
    year: "1852",
    title: "Foundation Laid",
    description:
      "The seeds of the Trust were planted by the visionary Jhaveri family of Bhindar, Rajasthan, who recognized the need for community welfare in Mumbai.",
  },
  {
    year: "1900",
    title: "Formalization of the Trust",
    description:
      "The Trust was formally established under the guidance of Seth Hirachand Gumanji, bringing together resources for the betterment of the Jain community.",
  },
  {
    year: "1914",
    title: "Boys Hostel Established",
    description:
      "The flagship Boys Hostel was inaugurated on Lamington Road, Mumbai, providing affordable accommodation for Jain students pursuing higher education.",
  },
  {
    year: "1940",
    title: "Girls Ashram Founded",
    description:
      "Recognizing the importance of women's education, the Girls Ashram was established, offering a safe and nurturing environment for female students.",
  },
  {
    year: "1972",
    title: "Dharamshala Inaugurated",
    description:
      "The Dharamshala was opened to serve Jain pilgrims and travelers, providing comfortable lodging for those visiting Mumbai for religious and personal purposes.",
  },
  {
    year: "Present",
    title: "Digital Transformation",
    description:
      "Embracing modern technology to streamline hostel management, admissions, and communication while preserving the Trust's core values and heritage.",
  },
];

const facilities = [
  {
    title: "Boys Hostel",
    description:
      "Well-maintained hostel facilities for male students with modern amenities, study rooms, and a supportive community atmosphere.",
    image: "/hostel-building.png",
  },
  {
    title: "Girls Ashram",
    description:
      "A secure and nurturing residential facility for female students, equipped with all necessary amenities for comfortable living and focused study.",
    image: "/hostel-room.png",
  },
  {
    title: "Dharamshala",
    description:
      "Comfortable guest accommodations for Jain pilgrims and travelers, located conveniently in Mumbai with easy access to temples and transport.",
    image: "/hostel-temple.png",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <PageHero
        title="Seth Hirachand Gumanji Jain Trust, Mumbai"
        subtitle="Preserving Heritage, Empowering Future Generations"
      />

      {/* Mission Statement */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2
            className="text-3xl font-bold mb-8"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Our Mission
          </h2>
          <blockquote
            className="text-lg italic leading-relaxed"
            style={{
              color: "var(--text-secondary)",
              borderLeft: "4px solid var(--bg-accent)",
              paddingLeft: "1.5rem",
              textAlign: "left",
            }}
          >
            &ldquo;To serve the Jain community by providing quality education,
            secure accommodation, and spiritual nourishment to students and
            travelers, while preserving our rich cultural heritage and fostering
            values of compassion, non-violence, and selfless service for the
            betterment of society.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Core Objectives */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Core Objectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {objectives.map((obj) => (
              <div
                key={obj.title}
                className="rounded-xl p-8 text-center"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{
                    backgroundColor: "var(--color-navy-50)",
                    color: "var(--color-navy-700)",
                  }}
                >
                  {obj.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  {obj.title}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  {obj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            About Us
          </h2>
          <div
            className="space-y-6 text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            <p>
              The Seth Hirachand Gumanji Jain Trust, Mumbai, is a distinguished
              charitable institution dedicated to the welfare and upliftment of
              the Jain community. Founded over a century ago by the illustrious
              Jhaveri family of Bhindar, Rajasthan, the Trust has been a beacon
              of hope and service for generations.
            </p>
            <p>
              The Trust manages three key institutions: a Boys Hostel, a Girls
              Ashram, and a Dharamshala, all located in the heart of Mumbai.
              These facilities provide affordable and quality accommodation to
              Jain students pursuing higher education and to pilgrims visiting
              the city.
            </p>
            <p>
              With a deep commitment to preserving Jain values of
              non-violence, truth, and compassion, the Trust has continuously
              adapted to modern needs while maintaining its cultural roots. The
              institution operates under the guidance of a dedicated Board of
              Trustees who ensure transparency, accountability, and adherence to
              the founding principles.
            </p>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--surface-secondary)" }}
      >
        <div className="mx-auto max-w-4xl px-4">
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Our History
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: "var(--bg-accent)" }}
            />

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div
                  key={event.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div
                    className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 z-10"
                    style={{
                      backgroundColor: "var(--bg-accent)",
                      border: "3px solid var(--surface-primary)",
                    }}
                  />

                  {/* Content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                      index % 2 === 0
                        ? "md:pr-8 md:text-right"
                        : "md:pl-8 md:text-left"
                    }`}
                  >
                    <span
                      className="inline-block text-sm font-bold px-3 py-1 rounded-full mb-2"
                      style={{
                        backgroundColor: "var(--color-gold-100)",
                        color: "var(--color-gold-800)",
                      }}
                    >
                      {event.year}
                    </span>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-serif)",
                      }}
                    >
                      {event.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Institutions & Facilities */}
      <section
        className="py-16"
        style={{ backgroundColor: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Institutions &amp; Facilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((facility) => (
              <div
                key={facility.title}
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div className="relative h-48">
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {facility.title}
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {facility.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
