import type { Metadata } from "next";
import { Archivo, Fraunces, Nunito_Sans } from "next/font/google";
import { ClosetProvider } from "@/components/ClosetProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

// Body text: sentences, hints and messages.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });

// The headline face. It's the free stand-in for Saol Display (the "Mix & Match" font on rino-pelle.com),
// tuned in globals.css to sit close to Saol's light weight.
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz", "SOFT", "WONK"] });

// The caps face for nav, buttons and labels: the free match for Avenir Next, which Volta's navbar uses.
const nunitoSans = Nunito_Sans({ variable: "--font-nunito-sans", subsets: ["latin"] });

export const metadata: Metadata =
  {
    title: { default: "Style.io", template: "%s · Style.io" },
    description: "Drop in a screenshot of an outfit and find the closest pieces in the clothes you already own.",
  };

// The shell stays put while the pages change underneath it: header and nav on top, the page below.
export default function RootLayout({ children }: LayoutProps<"/">)
  {
    return (
      <html lang="en" className={`${archivo.variable} ${fraunces.variable} ${nunitoSans.variable}`}>
        <body className="min-h-dvh bg-bg font-sans text-[0.9375rem] leading-normal text-text antialiased">
          <ClosetProvider>
            <div className="app-shell flex h-dvh flex-col overflow-hidden">
              <SiteHeader />
              <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
                {children}
              </main>
            </div>
          </ClosetProvider>
        </body>
      </html>
    );
  }
