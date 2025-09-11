import type { Metadata } from "next";
import "./globals.css";
import { GlobalProviders } from "@/contexts";

export const metadata: Metadata = {
  title: 'Ignacio - Tu Asistente de Proyectos',
  description: 'Ignacio es tu asistente inteligente para el desarrollo de proyectos empresariales, fundaciones, ONGs y emprendimientos. Parte del programa Action Lab.',
  keywords: ['action lab', 'asistente', 'proyectos', 'emprendimiento', 'startups', 'ong', 'fundaciones'],
  authors: [{ name: 'Action Lab' }],
  creator: 'Action Lab',
  publisher: 'Action Lab',
  openGraph: {
    title: 'Ignacio - Tu Asistente de Proyectos',
    description: 'Ignacio es tu asistente inteligente para el desarrollo de proyectos empresariales, fundaciones, ONGs y emprendimientos.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'Ignacio - Action Lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ignacio - Tu Asistente de Proyectos',
    description: 'Tu asistente inteligente para el desarrollo de proyectos empresariales.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className="h-full">
      <body className="h-full antialiased bg-gray-50 text-gray-900">
        <GlobalProviders>
          <div id="root" className="h-full">
            {children}
          </div>
        </GlobalProviders>
      </body>
    </html>
  );
}
