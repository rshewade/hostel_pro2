import Link from "next/link";
import {
  BedDouble,
  Wifi,
  BookOpen,
  Utensils,
  Droplets,
  Shield,
  Heart,
  Car,
  Users2,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
} from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const iconMap = {
  BedDouble: <BedDouble size={28} />,
  Wifi: <Wifi size={28} />,
  BookOpen: <BookOpen size={28} />,
  Utensils: <Utensils size={28} />,
  Droplets: <Droplets size={28} />,
  Shield: <Shield size={28} />,
  Heart: <Heart size={28} />,
  Car: <Car size={28} />,
  Users2: <Users2 size={28} />,
} as const;

type IconName = keyof typeof iconMap;

interface Facility {
  icon: IconName;
  name: string;
  description: string;
}

interface InstitutionData {
  title: string;
  subtitle: string;
  color: string;
  colorLight: string;
  overview: string;
  facilities: Facility[];
  eligibility: string[];
  location: string;
  phone: string;
  hours: string;
  ctaLabel: string;
  ctaLink: string;
}

const institutionsData: Record<string, InstitutionData> = {
  "boys-hostel": {
    title: "Boys' Hostel",
    subtitle: "Seth Hirachand Gumanji Jain Hostel",
    color: "var(--color-navy-600)",
    colorLight: "var(--color-navy-100)",
    overview:
      "The Seth Hirachand Gumanji Jain Hostel has been a home away from home for Digambar Jain students pursuing higher education in Mumbai for decades. Located in the heritage precinct of Hirabaug, the hostel provides a disciplined, nurturing, and community-oriented environment that supports academic excellence and personal growth. With well-maintained facilities and a strong emphasis on Jain values, the hostel ensures residents thrive in a safe and structured setting.",
    facilities: [
      {
        icon: "BedDouble",
        name: "Furnished Rooms",
        description:
          "Well-furnished single and shared rooms with beds, study desks, and storage",
      },
      {
        icon: "Wifi",
        name: "Wi-Fi Connectivity",
        description:
          "High-speed internet access available throughout the hostel premises",
      },
      {
        icon: "BookOpen",
        name: "Study Hall",
        description:
          "Dedicated quiet study hall open 24 hours for focused academic work",
      },
      {
        icon: "Utensils",
        name: "Dining Hall",
        description:
          "Pure Jain vegetarian meals served three times daily in a spacious dining area",
      },
      {
        icon: "Droplets",
        name: "Hot Water Supply",
        description:
          "24/7 hot water availability in all bathrooms and washing areas",
      },
      {
        icon: "Shield",
        name: "Security",
        description:
          "Round-the-clock security with CCTV surveillance and controlled entry",
      },
    ],
    eligibility: [
      "Must belong to the Digambar Jain community",
      "Must be enrolled at a recognised educational institution in Mumbai",
      "Age between 17 and 25 years at the time of admission",
      "Must provide two community references from known Jain families",
      "Must agree to abide by the hostel rules and code of conduct",
    ],
    location: "Hirabaug, Dr. B.A. Road, Mumbai - 400014",
    phone: "+91 22 2414 1234",
    hours: "Office Hours: Mon-Sat, 10:00 AM - 5:00 PM",
    ctaLabel: "Apply for Boys' Hostel",
    ctaLink: "/apply/boys-hostel",
  },
  "girls-hostel": {
    title: "Girls' Hostel",
    subtitle: "R. R. Shravika Ashram",
    color: "#be185d",
    colorLight: "#fce7f3",
    overview:
      "The R. R. Shravika Ashram is a dedicated residential facility for young women of the Digambar Jain community pursuing education in Mumbai. The ashram is managed entirely by women staff and provides a secure, empowering, and culturally rich environment. With 24/7 security, women-only management, and a focus on holistic development, the ashram ensures that every resident can focus on her education while staying connected to her roots and values.",
    facilities: [
      {
        icon: "BedDouble",
        name: "Safe Accommodation",
        description:
          "Secure, well-furnished rooms with individual lockers and comfortable bedding",
      },
      {
        icon: "Shield",
        name: "24/7 Security",
        description:
          "Women security guards, CCTV surveillance, and biometric access control",
      },
      {
        icon: "BookOpen",
        name: "Library & Study Room",
        description:
          "Well-stocked library and dedicated study spaces for academic pursuits",
      },
      {
        icon: "Utensils",
        name: "Pure Jain Kitchen",
        description:
          "Nutritious Jain vegetarian meals prepared by trained kitchen staff",
      },
      {
        icon: "Heart",
        name: "Health & Wellness",
        description:
          "First aid facility and tie-up with nearby hospitals for medical emergencies",
      },
      {
        icon: "Users2",
        name: "Recreation Room",
        description:
          "Common area for cultural activities, yoga sessions, and community gatherings",
      },
    ],
    eligibility: [
      "Must belong to the Digambar Jain community",
      "Must be a female student enrolled at a recognised institution in Mumbai",
      "Age between 17 and 25 years at the time of admission",
      "Written consent from parent or guardian is mandatory",
      "Must provide two community references from known Jain families",
      "Must agree to the ashram code of conduct and rules",
    ],
    location: "R.R. Shravika Ashram, Near Hirabaug, Mumbai - 400014",
    phone: "+91 22 2414 5678",
    hours: "Office Hours: Mon-Sat, 10:00 AM - 5:00 PM",
    ctaLabel: "Apply for Girls' Hostel",
    ctaLink: "/apply/girls-ashram",
  },
  dharamshala: {
    title: "Dharamshala",
    subtitle: "Hirabaug",
    color: "#b45309",
    colorLight: "#fef3c7",
    overview:
      "The Hirabaug Dharamshala offers comfortable and affordable accommodation for Jain community members visiting Mumbai for religious, medical, or personal purposes. Situated in the historic Hirabaug compound, the dharamshala is conveniently located near major temples, hospitals, and transport hubs. Whether you are visiting for a religious pilgrimage, medical treatment, or family events, the dharamshala provides a clean, peaceful, and welcoming stay.",
    facilities: [
      {
        icon: "BedDouble",
        name: "Guest Rooms",
        description:
          "Clean and comfortable rooms available in single, double, and family configurations",
      },
      {
        icon: "Car",
        name: "Parking",
        description:
          "Spacious parking facility available for guests on a first-come basis",
      },
      {
        icon: "Utensils",
        name: "Dining Facility",
        description:
          "Pure Jain vegetarian meals available on pre-order basis for all guests",
      },
      {
        icon: "Wifi",
        name: "Wi-Fi Access",
        description:
          "Complimentary internet access in common areas and select rooms",
      },
      {
        icon: "Droplets",
        name: "Hot Water",
        description:
          "24/7 hot water supply in all rooms and shared bathroom facilities",
      },
      {
        icon: "Shield",
        name: "Security & Reception",
        description:
          "Staffed reception desk and security available round the clock",
      },
    ],
    eligibility: [
      "Open to members of the Jain community with valid identification",
      "Government-issued photo ID proof is mandatory at check-in",
      "Maximum stay duration of 7 days per booking",
      "Advance booking recommended during festival and peak seasons",
      "Guests must adhere to the dharamshala code of conduct",
    ],
    location: "Hirabaug Dharamshala, Dr. B.A. Road, Mumbai - 400014",
    phone: "+91 22 2414 9012",
    hours: "Reception: 24 hours | Office: Mon-Sat, 9:00 AM - 6:00 PM",
    ctaLabel: "Book Dharamshala",
    ctaLink: "/apply/dharamshala",
  },
};

export function generateStaticParams() {
  return [
    { id: "boys-hostel" },
    { id: "girls-hostel" },
    { id: "dharamshala" },
  ];
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = institutionsData[id];

  if (!data) {
    return (
      <PublicLayout>
        <div
          className="flex items-center justify-center py-32"
          style={{ background: "var(--bg-page)" }}
        >
          <div className="text-center">
            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Institution Not Found
            </h1>
            <Link
              href="/"
              className="underline"
              style={{ color: "var(--color-navy-600)" }}
            >
              Return to Home
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <PageHero title={data.title} subtitle={data.subtitle} />

      <section className="px-4 py-16" style={{ background: "var(--bg-page)" }}>
        <div className="mx-auto max-w-6xl">
          {/* Overview */}
          <div className="mb-16">
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Overview
            </h2>
            <p
              className="text-base leading-relaxed max-w-4xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {data.overview}
            </p>
          </div>

          {/* Facilities Grid */}
          <div className="mb-16">
            <h2
              className="text-2xl font-bold mb-8"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Facilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.facilities.map((facility, index) => (
                <div
                  key={index}
                  className="rounded-xl p-6 transition-shadow duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: "var(--surface-primary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: data.colorLight,
                      color: data.color,
                    }}
                  >
                    {iconMap[facility.icon]}
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {facility.name}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {facility.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div className="mb-16">
            <h2
              className="text-2xl font-bold mb-6"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Eligibility Criteria
            </h2>
            <div
              className="rounded-xl p-6 md:p-8"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <ul className="flex flex-col gap-3">
                {data.eligibility.map((criterion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: data.color }}
                    />
                    {criterion}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & CTA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Card */}
            <div
              className="rounded-xl p-6 md:p-8"
              style={{
                backgroundColor: "var(--surface-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <h3
                className="text-lg font-bold mb-6"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                Contact Information
              </h3>
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={20}
                    style={{ color: data.color, flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {data.location}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone
                    size={20}
                    style={{ color: data.color, flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {data.phone}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Clock
                    size={20}
                    style={{ color: data.color, flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {data.hours}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div
              className="rounded-xl p-6 md:p-8 flex flex-col justify-center items-center text-center"
              style={{
                backgroundColor: data.colorLight,
                border: `1px solid ${data.color}20`,
              }}
            >
              <h3
                className="text-lg font-bold mb-3"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-serif)",
                }}
              >
                Ready to Join?
              </h3>
              <p
                className="text-sm mb-6 max-w-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Begin your application process today. Submit your details online
                and our team will guide you through every step.
              </p>
              <Link
                href={data.ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
                style={{
                  backgroundColor: data.color,
                  color: "#ffffff",
                }}
              >
                {data.ctaLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
