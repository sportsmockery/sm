import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "State of Chicago Sports | Sports Mockery Dashboard",
  description:
    "Real-time Chicago sports vibes tracker. Bears, Bulls, Cubs, White Sox, Blackhawks - all the pain and glory in one place.",
  openGraph: {
    title: "State of Chicago Sports | Sports Mockery",
    description: "How cooked is Chicago right now? Find out.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "State of Chicago Sports",
    description: "The definitive Chicago sports damage report",
  },
  keywords: [
    "Chicago sports",
    "Bears",
    "Bulls", 
    "Cubs",
    "White Sox",
    "Blackhawks",
    "Sports Mockery",
    "Chicago sports news",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function Dash2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
