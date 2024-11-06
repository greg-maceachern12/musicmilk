import type { Metadata } from "next";
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthButton } from "./components/AuthButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MusicMilk - Share Your Mixes",
  description: "Share and discover mixes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-P8692YZSLG"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-P8692YZSLG');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <nav className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link className="flex items-center gap-2" href='/'>
                <Image 
                  src="/images/logo_trans.png" 
                  alt="Music Milk Logo" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold">Music Milk</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href='/feed' className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Explore
                </Link>
                <Link href='/' className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Upload Mix
                </Link>
                <AuthButton />
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