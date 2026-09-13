import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Evalio - Online Exam & Assessment Platform for Chitkara University",
  description: "Evalio is your comprehensive online exam platform with automated assessments, personalized learning paths, real-time analytics, and detailed feedback for students and educators.",
  keywords: ["online exams", "assessment platform", "automated tests", "learning management", "exam software"],
  openGraph: {
    title: "Evalio - Automated Online Exam & Assessment Platform",
    description: "Create, manage, and track online exams with real-time analytics and personalized learning paths.",
    url: "https://myevalio.tech/",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Analytics />
        </QueryProvider>
      </body>
    </html>
  );
}
