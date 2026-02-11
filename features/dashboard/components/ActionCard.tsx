"use client";

import Link from "next/link";

type Props = {
  href: string;
  title: string;
  description: string;
  color?: "blue" | "green";
  cta?: string;
};

export default function ActionCard({ href, title, description, color = "blue", cta }: Props) {
  const bg = color === "blue" ? "bg-blue-100 group-hover:bg-blue-200" : "bg-green-100 group-hover:bg-green-200";
  const text = color === "blue" ? "text-blue-600" : "text-green-600";

  return (
    <Link href={href} className={`group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer`}>
      <div className="p-8 h-full flex flex-col justify-between">
        <div>
          <div className={`w-16 h-16 ${bg} rounded-lg flex items-center justify-center mb-4`}> 
            <svg className={`w-8 h-8 ${text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
        </div>
        <div className={`inline-flex items-center ${text} font-semibold group-hover:text-opacity-90`}>{cta || "Åpne"}</div>
      </div>
    </Link>
  );
}
