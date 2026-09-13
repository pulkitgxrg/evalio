const BASE_URL = "https://myevalio.tech";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/profile",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
