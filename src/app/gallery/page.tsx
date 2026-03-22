import Image from "next/image";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const galleryImages = [
  { src: "/hostel-gate.png", alt: "Historic Main Gate" },
  { src: "/hostel-building.png", alt: "Heritage Building" },
  { src: "/hostel-temple.png", alt: "Temple View" },
  { src: "/hostel-room.png", alt: "Traditional Interior" },
  { src: "/hostel-playground.jpg", alt: "Sports Ground" },
];

export default function GalleryPage() {
  return (
    <PublicLayout>
      <PageHero
        title="Photo Gallery"
        subtitle="Glimpses of our institutions and events"
      />

      <section
        className="px-4 py-16"
        style={{ background: "var(--bg-page)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {galleryImages.map((image) => (
              <div
                key={image.src}
                className="group mb-4 break-inside-avoid overflow-hidden rounded-lg"
                style={{
                  backgroundColor: "var(--surface-primary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div className="overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={600}
                    height={400}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="px-3 py-2">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {image.alt}
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
