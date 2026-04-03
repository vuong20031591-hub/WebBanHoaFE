import Image from "next/image";
import Link from "next/link";
import {
  Flower2,
  HeartHandshake,
  Leaf,
  Recycle,
  Sparkles,
} from "lucide-react";
import { Footer, Navbar } from "@/components/layout";

const HERO_IMAGE = "/images/hero-main.png";
const STORY_IMAGE_LEFT = "/images/birthday.png";
const STORY_IMAGE_RIGHT = "/images/gallery-photo.png";
const FOUNDER_IMAGE = "/images/process-step-2.png";
const VALUE_IMAGE_1 = "/images/anniversary.png";
const VALUE_IMAGE_2 = "/images/sympathy.png";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />

      <main>
        <section className="px-4 pb-18 pt-16 md:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_460px]">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[2.2px] text-[#b39a7b]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Our Journey
                </p>
                <h1
                  className="mt-4 max-w-[560px] text-[46px] leading-[0.96] text-[#2d2a26] md:text-[56px] lg:text-[64px]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  Our Story:
                  <br />
                  Artistry in
                  <br />
                  Every Petal
                </h1>
                <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#6b6259]">
                  Founded with a love for floral craftsmanship, we transform
                  everyday stems into heartfelt experiences for weddings,
                  celebrations, and quiet moments of gratitude.
                </p>
              </div>

              <div className="relative mx-auto h-[360px] w-[360px] rounded-full bg-[#ebe6df] md:h-[420px] md:w-[420px]">
                <Image
                  src={HERO_IMAGE}
                  alt="Floral Boutique hero bouquet"
                  fill
                  sizes="420px"
                  className="rounded-full object-cover p-4"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f1ede7] px-4 py-16 md:px-8">
          <div className="mx-auto max-w-[980px] text-center">
            <p
              className="mx-auto max-w-[760px] text-[34px] leading-[1.18] text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Dedicated to sustainability and the profound emotional power of the
              botanical world.
            </p>
            <p className="mx-auto mt-5 max-w-[700px] text-[14px] leading-7 text-[#7b7168]">
              We source fresh flowers from trusted farms, minimize waste in
              every process, and craft each arrangement with intention so every
              delivery feels personal.
            </p>
          </div>
        </section>

        <section className="px-4 py-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="relative min-h-[330px] overflow-hidden rounded-[28px]">
              <Image
                src={STORY_IMAGE_LEFT}
                alt="Crafted floral collection"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>

            <div className="grid gap-6">
              <div className="relative min-h-[165px] overflow-hidden rounded-[28px]">
                <Image
                  src={STORY_IMAGE_RIGHT}
                  alt="Atelier workflow"
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="object-cover"
                />
              </div>
              <article className="rounded-[28px] border border-[#e3d9cd] bg-white/80 p-6">
                <p
                  className="text-[20px] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  The Atelier
                </p>
                <p className="mt-3 text-[13px] leading-6 text-[#70665d]">
                  Every bouquet is handcrafted by our floral artists in a calm
                  studio environment where balance, color, and storytelling come
                  first.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-4 pb-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 rounded-[30px] border border-[#e8ddd1] bg-white/70 p-6 md:p-10 lg:grid-cols-[270px_minmax(0,1fr)]">
            <div className="relative h-[320px] overflow-hidden rounded-[130px_130px_18px_18px] bg-[#ebe5dd]">
              <Image
                src={FOUNDER_IMAGE}
                alt="Founder portrait"
                fill
                sizes="270px"
                className="object-cover"
              />
            </div>

            <div>
              <p
                className="text-[36px] leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Minh Quân
              </p>
              <p className="mt-3 text-[14px] text-[#8d7f72]">Founder & Creative Lead</p>
              <p className="mt-4 max-w-[640px] text-[14px] leading-7 text-[#6f645b]">
                &quot;Flowers helped me understand how beauty can comfort people.
                Floral Boutique was born from that belief: design should touch
                emotions, not just decorate spaces.&quot;
              </p>
              <p className="mt-3 max-w-[640px] text-[14px] leading-7 text-[#6f645b]">
                We continue to blend modern floral styling with meaningful
                storytelling, making every arrangement feel thoughtful and alive.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center rounded-full bg-[#8d6030] px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-[#744c22]"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#f1ede7] px-4 py-18 md:px-8">
          <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_360px]">
            <article className="rounded-[28px] border border-[#e6dccf] bg-white/75 p-7">
              <p
                className="text-[26px] text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Earth-Kind Artistry
              </p>
              <p className="mt-3 text-[14px] leading-7 text-[#6f655d]">
                We believe floral design should leave beauty behind, not waste.
                Our daily operations follow mindful standards:
              </p>
              <ul className="mt-5 space-y-3 text-[14px] text-[#5f554b]">
                <li className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-[#7f9b71]" />
                  Seasonal sourcing from local farms
                </li>
                <li className="flex items-center gap-3">
                  <Recycle className="h-4 w-4 text-[#7f9b71]" />
                  Reusable packaging and compost-friendly wraps
                </li>
                <li className="flex items-center gap-3">
                  <HeartHandshake className="h-4 w-4 text-[#7f9b71]" />
                  Fair partnership with growers and artisans
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#7f9b71]" />
                  Quality-first curation in every bouquet
                </li>
              </ul>
            </article>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative min-h-[160px] overflow-hidden rounded-[22px]">
                <Image
                  src={VALUE_IMAGE_1}
                  alt="Seasonal arrangement"
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="relative min-h-[160px] overflow-hidden rounded-[22px]">
                <Image
                  src={VALUE_IMAGE_2}
                  alt="Sympathy arrangement"
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="col-span-2 rounded-[22px] bg-[#e2d8cd] p-6">
                <Flower2 className="h-6 w-6 text-[#8d6030]" />
                <p
                  className="mt-3 text-[21px] text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  Floral Purpose
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#6d6258]">
                  From gift moments to milestone ceremonies, our arrangements are
                  crafted to make every memory more vivid and heartfelt.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
