import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "State of Chicago Sports Dashboard | Bears Bulls Cubs Sox Hawks Today",
  description:
    "Live Chicago sports dashboard tracking Bears, Bulls, Cubs, White Sox, and Blackhawks. Real-time records, playoff odds, injuries, and vibes. The ultimate Chicago fan damage report.",
  keywords: [
    "Chicago sports",
    "Chicago Bears",
    "Chicago Bulls",
    "Chicago Cubs",
    "Chicago White Sox",
    "Chicago Blackhawks",
    "Chicago sports dashboard",
    "sports vibes",
    "Chicago sports today",
    "Bears news",
    "Bulls news",
    "Cubs news",
    "White Sox news",
    "Blackhawks news",
  ],
  openGraph: {
    title: "State of Chicago Sports | Today's Damage Report",
    description:
      "How cooked are we as a city right now? Live vibes, records, injuries, and playoff odds for all 5 Chicago teams.",
    type: "website",
    images: [
      {
        url: "/og-chicago-dashboard.png",
        width: 1200,
        height: 630,
        alt: "State of Chicago Sports Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "State of Chicago Sports | Today's Damage Report",
    description:
      "How cooked are we as a city right now? Live vibes for Bears, Bulls, Cubs, Sox, and Hawks.",
    site: "@sportsmockery",
    creator: "@sportsmockery",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function ChicagoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
