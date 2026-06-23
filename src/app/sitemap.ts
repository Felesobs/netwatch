import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/login`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${baseUrl}/register`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
