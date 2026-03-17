import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Czech Companies — ARES Directory',
  description: 'Vyhledávejte firmy registrované v České republice. Filtrujte podle kraje, velikosti a zobrazujte detaily včetně statutárních orgánů.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-slate-900">
        {children}
      </body>
    </html>
  );
}
