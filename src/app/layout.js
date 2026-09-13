import"./globals.css";
import { ToastProvider } from"@/components/ui/toast";
import { CopilotProvider } from"@/context/CopilotContext";
import { CopilotPanel } from"@/components/ui/CopilotPanel";
import { QueryProvider } from"@/providers/QueryProvider";
import { ErrorBoundary } from"@/components/ui/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";

import { Inter, Cormorant_Garamond } from"next/font/google";

const inter = Inter({
 variable:"--font-inter",
 subsets: ["latin"],
 display:"swap",
});

const cormorant = Cormorant_Garamond({
 variable:"--font-cormorant",
 subsets: ["latin"],
 display:"swap",
 weight: ["300","400","500","600"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://elevara.ai'),
  title: {
    default: "Elevara — AI Career Operating System",
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
    "Claude career copilot"
  ],
  authors: [{ name: "Elevara AI" }],
  creator: "Elevara",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elevara.ai",
    title: "Elevara — AI Career Operating System",
    description: "Deep ATS resume analysis, multi-round technical mock interviews, smart cover letters, and career roadmaps.",
    siteName: "Elevara",
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
  url: 'https://elevara.ai',
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
