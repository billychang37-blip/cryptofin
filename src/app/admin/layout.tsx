import type { Viewport } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const viewport: Viewport = {
  width: 980,
  initialScale: 0.1, // Small scale to ensure it zooms out to fit width
  maximumScale: 10,
  userScalable: true,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
