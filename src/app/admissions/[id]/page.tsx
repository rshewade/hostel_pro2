import Link from "next/link";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";
import { Building2, Users, Home, CheckCircle, ArrowRight } from "lucide-react";

type AdmissionId = "boys-hostel" | "girls-hostel" | "dharamshala";

interface AdmissionData {
  title: string;
  subtitle: string;
  icon: typeof Building2;
  themeColor: string;
  themeBg: string;
  themeBorder: string;
  applyLink: string;
  ctaLabel: string;
  steps: string[];
  documents: string[];
}

const admissionsData: Record<AdmissionId, AdmissionData> = {
  "boys-hostel": {
    title: "Boys' Hostel Admissions",
    subtitle: "Seth Hirachand Gumanji Jain Hostel",
    icon: Building2,
    themeColor: "var(--color-navy-700)",
    themeBg: "var(--color-navy-50, #eff3f8)",
    themeBorder: "var(--color-navy-200, #b0c4de)",
    applyLink: "/apply/boys-hostel/contact",
    ctaLabel: "Apply for Boys' Hostel",
    steps: [
      "Check eligibility criteria and age requirements",
      "Create an account or login with your mobile number",
      "Fill in the application form with personal and academic details",
      "Upload all required documents in the specified formats",
      "Submit your application and track its status online",
    ],
    documents: [
      "Birth Certificate",
      "Caste Certificate",
      "College Admission Letter",
      "Academic Records / Marksheets",
      "Passport-size Photographs",
      "Jain Sangh Recommendation Letter",
    ],
  },
  "girls-hostel": {
    title: "Girls' Hostel Admissions",
    subtitle: "R. R. Shravika Ashram",
    icon: Users,
    themeColor: "#9f1239",
    themeBg: "#fff1f2",
    themeBorder: "#fecdd3",
    applyLink: "/apply/girls-ashram/contact",
    ctaLabel: "Apply for Girls' Hostel",
    steps: [
      "Check eligibility criteria and age requirements",
      "Create an account or login with your mobile number",
      "Fill in the application form with personal and academic details",
      "Upload all required documents in the specified formats",
      "Submit your application and track its status online",
    ],
    documents: [
      "Birth Certificate",
      "Caste Certificate",
      "College Admission Letter",
      "Academic Records / Marksheets",
      "Passport-size Photographs",
      "Jain Sangh Recommendation Letter",
    ],
  },
  dharamshala: {
    title: "Dharamshala Booking",
    subtitle: "Hirabaug",
    icon: Home,
    themeColor: "#92400e",
    themeBg: "#fffbeb",
    themeBorder: "#fde68a",
    applyLink: "/apply/dharamshala/contact",
    ctaLabel: "Book Dharamshala",
    steps: [
      "Check room availability for your desired dates",
      "Fill in the booking form with a valid government ID",
      "Make the payment online or at the office",
      "Receive your booking confirmation via SMS and email",
    ],
    documents: [
      "Valid Government ID (Aadhaar / Passport / Driving License)",
      "Hospital or medical documents (if visiting for medical transit)",
    ],
  },
};

const validIds: AdmissionId[] = ["boys-hostel", "girls-hostel", "dharamshala"];

export function generateStaticParams() {
  return validIds.map((id) => ({ id }));
}

export default async function AdmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = admissionsData[id as AdmissionId];

  if (!data) {
    return (
      <PublicLayout>
        <div
          style={{
            textAlign: "center",
            padding: "5rem 1rem",
            color: "var(--text-secondary)",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              color: "var(--text-primary)",
            }}
          >
            Page Not Found
          </h1>
          <p>The admissions page you are looking for does not exist.</p>
        </div>
      </PublicLayout>
    );
  }

  const IconComponent = data.icon;

  return (
    <PublicLayout>
      <PageHero title={data.title} subtitle={data.subtitle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "1rem",
            backgroundColor: "rgba(255,255,255,0.15)",
            marginBottom: "1.25rem",
          }}
        >
          <IconComponent size={28} color="var(--text-inverse)" />
        </div>
      </PageHero>

      {/* Two-column grid */}
      <section
        style={{
          backgroundColor: "var(--bg-page)",
          padding: "3rem 1rem",
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          style={{
            maxWidth: "72rem",
            marginInline: "auto",
          }}
        >
          {/* Left: Process Steps */}
          <div
            style={{
              backgroundColor: "var(--surface-primary)",
              borderRadius: "0.75rem",
              border: "1px solid var(--border-primary)",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.25rem",
                fontFamily: "var(--font-serif)",
              }}
            >
              {id === "dharamshala"
                ? "Booking Process"
                : "Application Process"}
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
              }}
            >
              {id === "dharamshala"
                ? "Follow these steps to book your stay"
                : "Follow these steps to apply for admission"}
            </p>

            <ol
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {data.steps.map((step, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      backgroundColor: data.themeBg,
                      color: data.themeColor,
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${data.themeBorder}`,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                      paddingTop: "0.25rem",
                    }}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: Required Documents */}
          <div
            style={{
              backgroundColor: "var(--surface-primary)",
              borderRadius: "0.75rem",
              border: "1px solid var(--border-primary)",
              padding: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.25rem",
                fontFamily: "var(--font-serif)",
              }}
            >
              Required Documents
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "1.5rem",
                fontSize: "0.95rem",
              }}
            >
              Please keep the following documents ready
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {data.documents.map((doc, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                  }}
                >
                  <CheckCircle
                    size={20}
                    color={data.themeColor}
                    style={{ flexShrink: 0, marginTop: "0.125rem" }}
                  />
                  <span
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {doc}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Full-width CTA Card */}
      <section
        style={{
          backgroundColor: "var(--bg-page)",
          padding: "0 1rem 3rem",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            marginInline: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-inverse, #1a365d)",
              borderRadius: "0.75rem",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--text-inverse)",
                fontFamily: "var(--font-serif)",
              }}
            >
              Ready to{" "}
              {id === "dharamshala" ? "book your stay" : "begin your journey"}?
            </h2>
            <p
              style={{
                color: "var(--color-navy-200, #b0c4de)",
                fontSize: "0.95rem",
                maxWidth: "32rem",
              }}
            >
              {id === "dharamshala"
                ? "Check availability and reserve your room at Hirabaug Dharamshala today."
                : "Start your application now and take the first step towards securing your place."}
            </p>
            <Link
              href={data.applyLink}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
                padding: "0.75rem 2rem",
                backgroundColor: "var(--bg-accent)",
                color: "var(--text-inverse)",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              {data.ctaLabel}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
