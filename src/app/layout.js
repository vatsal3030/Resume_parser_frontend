import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { CopilotProvider } from "@/context/CopilotContext";
import { CopilotPanel } from "@/components/ui/CopilotPanel";
import { QueryProvider } from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

import { Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://career.vixora.co.in";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-MQH8X8ZFEC";

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Elevara — AI Career Operating System | Vixora",
    template: "%s | Elevara"
  },
  description: "Autonomous AI Career Operating System: deep ATS resume analysis, multi-round technical mock interviews, smart cover letters, and career roadmaps powered by Claude 3.5 Sonnet.",
  keywords: [
    "AI resume analyzer",
    "ATS resume checker",
    "AI mock interview practice",
    "technical interview simulation",
    "cover letter generator",
    "career roadmap AI",
    "job application tracker",
    "Claude career copilot",
    "Vixora AI"
  ],
  authors: [{ name: "Elevara by Vixora" }],
  creator: "Vixora",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Elevara — AI Career Operating System",
    description: "Deep ATS resume analysis, multi-round technical mock interviews, smart cover letters, and career roadmaps.",
    siteName: "Elevara - Vixora",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevara — AI Career Operating System",
    description: "Autonomous AI career intelligence workspace powered by Claude 3.5.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Elevara',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  description: 'Autonomous AI Career Operating System offering ATS resume analysis, multi-round technical mock interviews, and career roadmap generation.',
  url: APP_URL,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI ATS Resume Scanner and Scoring',
    'Interactive Multi-Round Mock Technical Interviews',
    'AI Cover Letter Generator',
    'Skill Gap & Career Roadmap Architect',
    'Active Job Application Tracker'
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${cormorant.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <ToastProvider>
              <CopilotProvider>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
                <CopilotPanel />
              </CopilotProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
