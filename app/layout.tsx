import "./globals.css";
import ClientShell from "@/components/ClientShell";

export const metadata = {
  title: "ZH Sistema de Delivery",
  description: "Gestão de Cardápio Digital e Pedidos Online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}