import { Navbar, Footer, ChatLive } from "@/src/components/layout";
import {
  HeroSection,
  ShopSection,
  ProcessSection,
  HeritageSection,
  GallerySection,
  ContactSection,
} from "@/src/components/home";





















/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ShopSection />
        <ProcessSection />
        <HeritageSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <ChatLive />
    </div>
  );
}
