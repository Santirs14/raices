import "./globals.css";

export const metadata = {
  title: "Raíces del Occidente de Boyacá | Catálogo Campesino",
  description: "Plataforma de comercialización agropecuaria directa - Economía Popular y Campesina",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}