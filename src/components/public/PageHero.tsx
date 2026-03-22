"use client";

import { useState, useEffect, ReactNode } from "react";
import Image from "next/image";

const images = [
  "/hostel-gate.png",
  "/hostel-building.png",
  "/hostel-room.png",
  "/hostel-temple.png",
  "/hostel-playground.jpg",
];

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, children }: PageHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt={`Background ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(26, 54, 93, 0.9), rgba(26, 54, 93, 0.85), rgba(26, 54, 93, 0.95))",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center" style={{ color: "var(--text-inverse)" }}>
          {children}
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg" style={{ color: "var(--color-navy-200)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className="rounded-full transition-all"
            style={{
              width: index === currentImage ? "1rem" : "0.375rem",
              height: "0.375rem",
              backgroundColor:
                index === currentImage
                  ? "var(--bg-accent)"
                  : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
