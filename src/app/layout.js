import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { CopilotProvider } from "@/context/CopilotContext";
import { CopilotPanel } from "@/components/ui/CopilotPanel";
import { QueryProvider } from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

export const metadata = {
  title: "Elevara — AI Career Operating System",
  description: "Your AI-powered career platform: resume analysis, tailoring, cover letters, interview prep, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
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
      </body>
    </html>
  );
}
