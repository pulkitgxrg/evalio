import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { QueryProvider } from "@/components/providers/QueryProvider";
import MobileBlocker from "@/components/layout/MobileBlocker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://myevalio.tech";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Evalio - Online Exam & Assessment Platform for Chitkara University",
    template: "%s",
  },
  description: "Evalio is your comprehensive online exam platform with automated assessments, personalized learning paths, real-time analytics, and detailed feedback for students and educators.",
  keywords: ["online exams", "assessment platform", "automated tests", "learning management", "exam software", "Chitkara University", "evalio"],
  authors: [{ name: "Pulkit Garg" }],
  creator: "Pulkit Garg",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Evalio - Automated Online Exam & Assessment Platform",
    description: "Create, manage, and track online exams with real-time analytics and personalized learning paths.",
    url: SITE_URL,
    siteName: "Evalio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evalio - Automated Online Exam & Assessment Platform",
    description: "Create, manage, and track online exams with real-time analytics and personalized learning paths.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Evalio",
  url: SITE_URL,
  description: "Online exam and assessment platform with automated assessments, personalized learning paths, and real-time analytics.",
  publisher: {
    "@type": "Organization",
    name: "Evalio",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MobileBlocker />
        <QueryProvider>
          {children}
          <Analytics />
        </QueryProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P32Q20PJR7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-P32Q20PJR7');
          `}
        </Script>
      </body>
    </html>
  );
}
