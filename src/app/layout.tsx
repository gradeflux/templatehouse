import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

// GA4 측정 ID - Vercel 환경변수 또는 .env.local에 설정
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pretendard = localFont({
  src: [
    {
      path: "./fonts/PretendardVariable.woff2",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 업무에 바로 쓰는 무료 템플릿`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "무료 템플릿",
    "노션 템플릿",
    "PPT 템플릿",
    "이력서 템플릿",
    "엑셀 템플릿",
    "업무 템플릿",
    "프레젠테이션 템플릿",
    "문서 양식",
    "업무보고서 양식",
    "프로젝트관리 템플릿",
    "마케팅 템플릿",
    "교육 템플릿",
    "자기소개서 양식",
    "가계부 엑셀",
  ],
  verification: {
    // TODO: 구글 서치콘솔 인증 코드를 여기에 입력
    // google: "YOUR_GOOGLE_SITE_VERIFICATION_CODE",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} - 업무에 바로 쓰는 무료 템플릿`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 업무에 바로 쓰는 무료 템플릿`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-[100dvh] flex flex-col">
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <JsonLd type="website" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
