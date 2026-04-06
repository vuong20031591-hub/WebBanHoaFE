import { Footer, Navbar } from "@/src/components/layout";
import {
  ContactSection,
  GallerySection,
  HeritageSection,
  HeroSection,
  ProcessSection,
  ShopSection,
} from "@/src/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <section id="categories" className="scroll-mt-28">
          <ShopSection />
        </section>
        <ProcessSection />
        <section id="our-story" className="scroll-mt-28">
          <HeritageSection />
        </section>
        <section id="latest" className="scroll-mt-28">
          <GallerySection />
        </section>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
