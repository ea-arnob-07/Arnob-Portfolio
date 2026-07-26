import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Portfolio Admin — Estiuk Arafat Arnob",
  description: "Manage every section of Estiuk Arafat Arnob's portfolio.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
