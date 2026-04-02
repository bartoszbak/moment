import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faces",
  description: "Async team photo wall for remote organisations"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
