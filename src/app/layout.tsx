import type { Metadata } from "next";
import Link from 'next/link';
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicMilk - Long Form Mixtapes",
  description: "Share and discover long-form mixtapes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <nav className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link className="text-2xl font-bold" href='/'>MusicMilk</Link>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Explore
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Upload Mix
                </button>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}