import { AdminLayoutClient } from './AdminLayoutClient';

export const metadata = {
  title: "Admin Panel | Evalio - Manage Users, Tests & Questions",
  description: "Evalio Admin Dashboard - Manage users, create tests, organize questions by subject, and view comprehensive platform analytics.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
