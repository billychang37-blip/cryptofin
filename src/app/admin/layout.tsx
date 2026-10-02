import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 980,
};

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 980,
  initialScale: undefined,
  maximumScale: undefined,
  userScalable: undefined,
};

import type { Viewport } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
