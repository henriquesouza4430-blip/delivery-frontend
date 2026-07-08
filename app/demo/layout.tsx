import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ZH Sistema de Delivery | Gestão de Cardápio Digital e Pedidos Online | Demonstrações",
  description: "Teste gratuitamente os planos Basic, Pro.",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
