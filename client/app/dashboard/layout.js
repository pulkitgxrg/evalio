import { DashboardLayoutClient } from './DashboardLayoutClient';

export const metadata = {
  title: "Dashboard | Evalio - Take Tests and Track Your Progress",
  description: "Access your Evalio dashboard to take exams, view your test history, track statistics, and manage your learning progress.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

