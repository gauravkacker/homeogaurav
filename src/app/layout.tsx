import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Homeo PMS - Patient Management System',
  description: 'Homeopathy Clinic Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
