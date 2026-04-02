import Link from "next/link";
import { ChatLive, Footer, Navbar } from "@/components/layout";

export function ProfileNotificationsSettingsPageContent() {
  return (
    <div className="min-h-screen bg-[#fcfaf7]">
      <Navbar />
      <main className="pb-24 pt-16 lg:pt-16">
        <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-10">
          <div className="rounded-[40px] bg-white px-10 py-10 text-center shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
            <h1
              className="text-[40px] font-light leading-none tracking-[-1.2px] text-[#2d2a26] lg:text-[48px]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Notification Settings unavailable
            </h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-6 text-[#5c6b5e]">
              FE mock notification preferences have been removed. This page needs
              a real backend preference API before it can display data again.
            </p>
            <div className="mt-8">
              <Link
                href="/profile"
                className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
