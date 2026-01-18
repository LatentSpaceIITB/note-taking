import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { AppLayout } from "@/components/AppLayout";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lecture Notes - AI-Powered Note Taking",
  description: "Stop scribbling. Start listening. The AI study partner that turns 90-minute lectures into perfectly structured notes.",
  keywords: ["lecture notes", "AI", "transcription", "note taking", "study", "audio recording"],
  authors: [{ name: "Lecture Notes" }],
  openGraph: {
    title: "Lecture Notes - AI-Powered Note Taking",
    description: "Stop scribbling. Start listening. The AI study partner that turns 90-minute lectures into perfectly structured notes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lecture Notes - AI-Powered Note Taking",
    description: "Stop scribbling. Start listening. The AI study partner that turns 90-minute lectures into perfectly structured notes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
