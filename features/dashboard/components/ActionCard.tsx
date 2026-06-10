"use client";

import Link from "next/link";

type Variant = "primary" | "dark";

type Props = {
  href: string;
  title: string;
  description: string;
  variant?: Variant;
  cta?: string;
};

export default function ActionCard({ href, title, description, variant = "primary", cta }: Props) {
  const iconBg =
    variant === "primary"
      ? "bg-tess-green-light group-hover:bg-tess-green-soft"
      : "bg-tess-surface-soft group-hover:bg-gray-200";
  const iconColor = variant === "primary" ? "text-tess-green-dark" : "text-tess-charcoal";
  const ctaColor = variant === "primary" ? "text-tess-green-dark" : "text-tess-charcoal";

  return (
    <Link
      href={href}
      className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
    >
      <div className="p-8 h-full flex flex-col justify-between">
        <div>
          <div className={`w-16 h-16 ${iconBg} rounded-lg flex items-center justify-center mb-4 transition`}>
            <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
        </div>
        <div className={`inline-flex items-center ${ctaColor} font-semibold group-hover:text-opacity-90`}>{cta || "Åpne"}</div>
      </div>
    </Link>
  );
}
