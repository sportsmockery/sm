import type { Metadata } from "next";
import Script from "next/script";
import { Space_Grotesk } from "next/font/google";
import { JsonLd, organizationJsonLd, SITE_URL, SITE_NAME, WEBSITE_NODE_ID } from "@/lib/seo";
import "./globals.css";
import "@/styles/homepage.css";
import "@/styles/homepage-v2.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ConditionalChatProvider from "@/components/layout/ConditionalChatProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TeamRecordProvider } from "@/contexts/TeamRecordContext";
// Header removed — top bar disabled
// LeftSidebar removed — replaced by AppSidebar via SidebarLayout
import SidebarLayout from "@/components/layout/SidebarLayout";
import SkipToContent from "@/components/layout/SkipToContent";
import ScrollToTop from "@/components/layout/ScrollToTop";
import BackToTop from "@/components/layout/BackToTop";
import CookieBanner from "@/components/layout/CookieBanner";
import MotionProvider from "@/components/motion/MotionProvider";
import NavigationProgress from "@/components/layout/NavigationProgress";
import Breadcrumb from "@/components/layout/Breadcrumb";
import NavigationOrb from "@/components/layout/NavigationOrb";
import ParticleBg from "@/components/layout/ParticleBg";
import LiveStrip from "@/components/layout/LiveStrip";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { MediaControllerProvider } from "@/context/MediaControllerContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import AudioMiniPlayer from "@/components/SportsRiver/AudioMiniPlayer";

// Floating buttons disabled - users access AI and Fan Chat via header buttons
// import BearsAIButton from "@/components/bears/BearsAIButton";
// import FloatingChatButton from "@/components/chat/FloatingChatButton";
// import FloatingARButton from "@/components/ar/FloatingARButton";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  // Note: canonical is NOT set at root level — each page sets its own
  // via alternates.canonical in its page-level metadata export
  category: "sports",
  icons: {
    icon: "/favicon.ico",
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" data-theme="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        {GTM_ID && (
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="alternate" type="application/rss+xml" title="Sports Mockery RSS" href="https://sportsmockery.com/api/rss" />
        <link rel="preconnect" href="https://izwhcuccuwvlqqhpprbb.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://a.espncdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.espn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        {/* Organization + WebSite JSON-LD */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": WEBSITE_NODE_ID,
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
        style={{ backgroundColor: 'var(--sm-dark)', color: 'var(--sm-text)' }}
        suppressHydrationWarning
      >
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TeamRecordProvider>
              <ConditionalChatProvider>
              <SkipToContent />
              <NavigationProgress />
              <div className="flex min-h-screen flex-col">
                <LiveStrip />
                <div id="main-content" className="flex-1" tabIndex={-1}>
                  {/* Breadcrumb removed — navigation handled by sidebar */}
                  <MotionProvider>
                    <WebSocketProvider>
                      <MediaControllerProvider>
                        <AudioPlayerProvider>
                          <SidebarLayout>
                            {children}
                          </SidebarLayout>
                          <AudioMiniPlayer />
                        </AudioPlayerProvider>
                      </MediaControllerProvider>
                    </WebSocketProvider>
                  </MotionProvider>
                </div>
              </div>
              {/* NavigationOrb removed — nav moved to left sidebar */}
              <MobileBottomNav />
              {/* ParticleBg removed — replaced by Chicago star canvas in hero */}
              <ScrollToTop />
              <BackToTop />
              <CookieBanner />
              {/* Floating buttons disabled - users access AI and Fan Chat via header buttons */}
              {/* AR Tour available in article sidebars */}
            </ConditionalChatProvider>
              </TeamRecordProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
