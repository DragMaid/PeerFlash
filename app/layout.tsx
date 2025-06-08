import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PeerFlash',
  description: 'Create, share, and learn with decentralized flashcards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
