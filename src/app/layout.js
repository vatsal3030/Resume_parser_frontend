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
 title:"Elevara — AI Career Operating System",
 description:"Your AI-powered career platform: resume analysis, tailoring, cover letters, interview prep, and more.",
};

export default function RootLayout({ children }) {
 return (
 <html lang="en" suppressHydrationWarning>
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
