import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SwipeMeme — Find Your Humor Twin",
  description: "Swipe memes, match with people who share your humor, and unlock profiles. The only dating app that actually knows if you're funny.",
  openGraph: {
    title: "SwipeMeme — Find Your Humor Twin",
    description: "Swipe memes, match with people who share your humor, and unlock profiles.",
    images: [{ url: '/og-image.png' }], // Placeholder for now
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
