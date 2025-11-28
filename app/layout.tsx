import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 챗봇 - 영지챗봇",
  description: "문서 기반 AI 챗봇",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}


