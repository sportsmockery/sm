import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono, Bebas_Neue } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "@/styles/homepage.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TeamRecordProvider } from "@/contexts/TeamRecordContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SkipToContent from "@/components/layout/SkipToContent";
import ScrollToTop from "@/components/layout/ScrollToTop";
import CookieBanner from "@/components/layout/CookieBanner";
import TeamChatPanel from "@/components/chat/TeamChatPanel";
import MotionProvider from "@/components/motion/MotionProvider";

// Floating buttons disabled - users access AI and Fan Chat via header buttons
// import BearsAIButton from "@/components/bears/BearsAIButton";
// import FloatingChatButton from "@/components/chat/FloatingChatButton";
// import FloatingARButton from "@/components/ar/FloatingARButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Sports Mockery | Bears News, Chicago Sports Analysis & Rumors",
    template: "%s | Sports Mockery",
  },
  description: "Your #1 source for Chicago Bears news, analysis, and rumors. Plus complete coverage of Bulls, Cubs, White Sox, and Blackhawks. Bears-first Chicago sports coverage.",
  keywords: [
    "Chicago Bears",
    "Bears news",
    "Chicago sports",
    "Bears rumors",
    "NFL",
    "Chicago Bulls",
    "Chicago Cubs",
    "Chicago White Sox",
    "Chicago Blackhawks",
    "Caleb Williams",
    "Bears analysis",
  ],
  authors: [{ name: "Sports Mockery" }],
  creator: "Sports Mockery",
  publisher: "Sports Mockery",
  metadataBase: new URL("https://sportsmockery.com"),
  openGraph: {
    title: "Sports Mockery | Bears-First Chicago Sports Coverage",
    description: "Your #1 source for Chicago Bears news and all Chicago sports. In-depth analysis, breaking rumors, and fan perspectives.",
    url: "https://sportsmockery.com",
    siteName: "Sports Mockery",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sports Mockery - Chicago Sports News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Mockery | Bears-First Chicago Sports",
    description: "Your #1 source for Chicago Bears news and all Chicago sports coverage.",
    site: "@sportsmockery",
    creator: "@sportsmockery",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sportsmockery.com",
  },
  category: "sports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('sm-theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${inter.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TeamRecordProvider>
              <ChatProvider teamSlug="bears">
              <SkipToContent />
              <div className="flex min-h-screen flex-col">
                <Header />
                <div id="main-content" className="flex-1" tabIndex={-1}>
                  <MotionProvider>
                    {children}
                  </MotionProvider>
                </div>
                <Footer />
              </div>
              <ScrollToTop />
              <CookieBanner />
              <TeamChatPanel teamSlug="bears" teamName="Bears" />
              {/* Floating buttons disabled - users access AI and Fan Chat via header buttons */}
              {/* AR Tour available in article sidebars */}
            </ChatProvider>
              </TeamRecordProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
