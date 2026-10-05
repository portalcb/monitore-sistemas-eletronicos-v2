import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.monitorecbc.com.br"),
  title: { default: "Monitore Sistemas Eletrônicos | Balneário Camboriú", template: "%s | Monitore" },
  description: "Câmeras, alarmes, interfones, controle de acesso facial e automação de portões em Balneário Camboriú. Solicite orçamento.",
  icons: { icon: "/favicon-monitore.png", apple: "/favicon-monitore.png" },
  openGraph: { title: "Monitore Sistemas Eletrônicos", description: "Segurança eletrônica, CFTV e automação de portões em Balneário Camboriú.", images: ["/monitore-hero.jpg"] }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
