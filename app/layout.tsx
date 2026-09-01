import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://monitore-sistemas-eletronicos-v2.vercel.app"),
  title: { default: "Monitore Sistemas Eletrônicos | Balneário Camboriú", template: "%s | Monitore" },
  description: "Soluções em segurança eletrônica e tecnologia em Balneário Camboriú.",
  icons: { icon: "/favicon-monitore.png", apple: "/favicon-monitore.png" },
  openGraph: { title: "Monitore Sistemas Eletrônicos", description: "Segurança eletrônica e tecnologia em Balneário Camboriú.", images: ["/monitore-hero.jpg"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
