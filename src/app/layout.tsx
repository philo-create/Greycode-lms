import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Greycode LMS",
  description: "An interactive educational web app for Foundation Phase (Grade R - 3) students to learn coding, robotics, and digital concepts according to the school curriculum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans text-slate-900 bg-slate-50" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
