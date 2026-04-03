import Image from "next/image";
import Link from "next/link";

export default function OurStoryPage() {
    return (
        <main className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="pt-32 pb-16 px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h1 className="font-[family-name:var(--font-noto-serif)] text-[72px] leading-tight font-normal text-[#1b1c1a]">
                            <span className="text-[#d0bb95]">Our Story:</span>
                            <br />
                            Artistry in
                            <br />
                            Every Petal
                        </h1>
                        <p className="font-[family-name:var(--font-inter)] text-lg text-[#4f4444] leading-[29.25px] max-w-md">
                            Founded on the belief that flowers are more than
                            decoration—they are a language of emotion, a tactile connection
                            to the seasons, and a form of living art.
                        </p>
                    </div>
                    <div className="relative h-[500px] md:h-[838px] rounded-2xl overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=1200&q=80"
                            alt="Large elegant flower arrangement"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 px-12 bg-[#f5f3ef]">
                <div className="max-w-4xl mx-auto text-center space-y-10">
                    <p className="font-[family-name:var(--font-inter)] text-sm tracking-[4.2px] uppercase text-[#52634c]">
                        Our Philosophy
                    </p>
                    <h2 className="font-[family-name:var(--font-noto-serif)] text-5xl font-normal text-[#1b1c1a] leading-[48px]">
                        Dedicated to sustainability and the
                        <br />
                        profound emotional power of the
                        <br />
                        botanical world.
                    </h2>
                    <div className="space-y-6 font-[family-name:var(--font-inter)] text-lg font-light italic text-[#4f4444] leading-[29.25px]">
                        <p>
                            &ldquo;We believe that a boutique should be an atelier of the senses. Our practice is rooted in the quiet
                            observation of nature&apos;s perfect asymmetries. Each stem is chosen not just for its beauty, but for its
                            integrity.&rdquo;
                        </p>
                        <p>
                            At Floral Boutique, luxury is defined by the luxury of time—the time it takes to hand-select locally
                            grown blooms and the time spent composing each unique arrangement with an artist&apos;s precision.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Atelier Section */}
            <section className="py-16 px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Large image */}
                    <div className="md:col-span-2 relative h-[600px] rounded-2xl overflow-hidden">
                        <Image
                            src="https://images.unsplash.com/photo-1464983953574-0892a716854b?w=1200&q=80"
                            alt="Floral studio process"
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        <div className="relative h-[350px] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&q=80"
                                alt="Hand crafting process"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-sm">
                            <h3 className="font-[family-name:var(--font-noto-serif)] text-2xl font-normal text-[#1b1c1a] mb-4">
                                The Atelier
                            </h3>
                            <p className="font-[family-name:var(--font-inter)] text-base text-[#4f4444] leading-[26px]">
                                Every bouquet is born in our sun-drenched studio, where we treat petals
                                like pigments. It is a space of continuous discovery, where traditional techniques
                                meet contemporary botanical design.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Founder Section */}
            <section className="py-32 px-12 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Portrait */}
                    <div className="relative h-[597px]">
                        <div className="relative h-full w-full max-w-[448px] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
                                alt="Minh Quân Portrait"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Badge */}
                        <div className="absolute bottom-10 right-0 bg-[#7d562d] rounded-xl p-6">
                            <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
                                <path d="M1 9h24M13 1l8 8-8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    {/* Bio */}
                    <div className="space-y-8">
                        <p className="font-[family-name:var(--font-inter)] text-sm tracking-[4.2px] uppercase text-[#52634c]">
                            The Visionary
                        </p>
                        <h2 className="font-[family-name:var(--font-noto-serif)] text-5xl font-normal text-[#1b1c1a] leading-[48px]">
                            Minh Quân
                        </h2>
                        <blockquote className="font-[family-name:var(--font-noto-serif)] text-xl text-[#7d562d] leading-[32.5px]">
                            &ldquo;Flowers speak where words fail. My mission is to curate
                            moments of stillness and wonder through the botanical arts.&rdquo;
                        </blockquote>
                        <p className="font-[family-name:var(--font-inter)] text-lg text-[#4f4444] leading-[29.25px]">
                            With over fifteen years of experience in both classical European
                            floristry and traditional Eastern minimalist design, Minh Quân
                            brings a unique global perspective to every creation. His work
                            has been featured in leading design journals for its architectural
                            integrity and emotional depth.
                        </p>
                        <Link
                            href="/products"
                            className="inline-block bg-[#2d2a26] text-white font-[family-name:var(--font-inter)] text-base tracking-[0.4px] px-10 py-4 rounded-full hover:bg-[#2d2a26]/80 transition-colors"
                        >
                            View His Portfolio
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sustainability Commitment Section */}
            <section className="py-16 px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Text card */}
                    <div className="bg-[#f5f3ef] rounded-xl p-12 flex flex-col justify-center space-y-8">
                        <div className="flex items-center gap-4">
                            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                                <path d="M13 2C7 2 2 7 2 13s5 11 11 11 11-5 11-11S19 2 13 2zm0 4c2 0 4 1 5 3-2 0-4 1-5 3-1-2-3-3-5-3 1-2 3-3 5-3zm0 14c-4 0-7-3-7-7 2 0 4 1 5 3h4c1-2 3-3 5-3 0 4-3 7-7 7z" fill="#52634c" />
                            </svg>
                            <h3 className="font-[family-name:var(--font-noto-serif)] text-3xl font-normal text-[#1b1c1a]">
                                Earth-Kind Artistry
                            </h3>
                        </div>
                        <p className="font-[family-name:var(--font-inter)] text-lg text-[#4f4444] leading-[29.25px]">
                            Our commitment to the planet is woven into every stem. We source 90% of our blooms from local,
                            family-owned farms that practice regenerative agriculture, reducing our carbon footprint while
                            supporting our community.
                        </p>
                        <ul className="space-y-5">
                            {[
                                "100% Compostable & Recyclable Packaging",
                                "Zero-Plastic Floral Mechanics",
                                "Seasonal Sourcing Calendar",
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-4">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M4 10l4 4 8-8" stroke="#52634c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="font-[family-name:var(--font-inter)] text-base text-[#1b1c1a]">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Image grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative h-full min-h-[528px] rounded-2xl overflow-hidden">
                            <Image
                                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80"
                                alt="Eco-friendly packaging"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="relative h-[256px] rounded-2xl overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
                                    alt="Locally sourced flowers"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="relative h-[256px] rounded-2xl overflow-hidden">
                                <Image
                                    src="https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?w=600&q=80"
                                    alt="Sustainability detail"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
