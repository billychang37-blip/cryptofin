import type { Viewport } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const viewport: Viewport = {
  width: 980,
  initialScale: 1,
  maximumScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
