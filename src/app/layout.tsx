import type { Metadata } from "next";
import Script from 'next/script';
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
//import FeedbackForm from "./components/FeedbackForm";

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
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        {/* <FeedbackForm /> */}
      </body>
    </html>
  );
}