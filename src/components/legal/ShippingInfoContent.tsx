'use client';

import Link from 'next/link';
import { Check, Package } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ShippingInfoContent() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1280px] mx-auto px-6 py-20 md:py-32">
        <section className="mb-24">
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl md:text-6xl text-[#1b1c1a] mb-6">
              Shipping Info
            </h1>
            <p className="text-lg leading-[29.25px] text-[#4f4444] max-w-[672px] mx-auto">
              From our atelier to your sanctuary. We ensure every petal arrives with the
              same grace it possessed when it left our care.
            </p>
          </div>

          <div className="grid gap-8 mb-16">
            <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
              <div className="bg-white rounded-xl p-10">
                <div className="bg-[#f5f3ef] rounded-2xl aspect-square mb-6" />
              </div>
              
              <div className="bg-white rounded-xl p-10">
                <p className="text-xs tracking-[1.2px] text-[#7d562d] mb-4">Our Neighborhood</p>
                <h2 className="font-serif text-3xl text-[#1b1c1a] mb-6">Local Delivery</h2>
                <p className="text-base leading-[26px] text-[#4f4444] mb-8">
                  Hand-delivered by our internal team.
                  We offer same-day delivery for orders
                  placed before 11 AM within the
                  metropolitan area.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#52634c]" />
                    <span className="text-sm text-[#1b1c1a]">$15 Flat Rate Delivery Fee</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#52634c]" />
                    <span className="text-sm text-[#1b1c1a]">Complimentary over $150</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#52634c]" />
                    <span className="text-sm text-[#1b1c1a]">Tuesday – Sunday delivery</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#f5f3ef] rounded-xl p-10">
                <p className="text-xs tracking-[1.2px] text-[#7d562d] mb-4">Beyond Borders</p>
                <h2 className="font-serif text-3xl text-[#1b1c1a] mb-6">National Shipping</h2>
                <p className="text-base leading-[26px] text-[#4f4444] mb-8">
                  For our dried collections and home accessories, we
                  offer carbon-neutral shipping across the country via
                  premium couriers.
                </p>
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#4f4444]">Standard (3-5 days)</span>
                    <span className="text-base font-bold text-[#7d562d]">$9.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#4f4444]">Express (Next Day)</span>
                    <span className="text-base font-bold text-[#7d562d]">$22.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#f5f3ef] rounded-xl p-10">
                <div className="bg-white rounded-2xl aspect-square mb-6" />
                <h3 className="font-serif text-xl text-[#1b1c1a] mb-4">Eco-Friendly Packaging</h3>
                <p className="text-sm leading-[22.75px] text-[#4f4444]">
                  Every element of our packaging is either
                  compostable or recyclable. From the algae-
                  based ink on our tissue paper to the
                  biodegradable hydration sponges.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-10">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h2 className="font-serif text-2xl text-[#1b1c1a] mb-6">Real-Time Tracking</h2>
                  <p className="text-sm leading-[22.75px] text-[#4f4444] mb-8">
                    The moment your arrangement leaves the
                    atelier, you will receive a SMS link to follow its
                    journey in real-time.
                  </p>
                  <div className="space-y-6 border-l-2 border-[#d2c3c34d] pl-8">
                    <div className="relative">
                      <div className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-[#52634c]" />
                      <h4 className="text-sm font-semibold text-[#1b1c1a] mb-1">Processing</h4>
                      <p className="text-xs text-[#4f4444]">Atelier artisans are hand-picking your stems.</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-[#d2c3c3]" />
                      <h4 className="text-sm font-semibold text-[#1b1c1a] mb-1">In Transit</h4>
                      <p className="text-xs text-[#4f4444]">
                        Carefully secured in our climate-controlled
                        vehicle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#d2e5c84d] rounded-xl p-8">
                  <Package className="w-6 h-6 text-[#52634c] mb-4" />
                  <h3 className="font-serif text-xl text-[#1b1c1a] mb-4">On Arrival Care</h3>
                  <p className="text-sm leading-[22.75px] text-[#566750] mb-4">
                    Fresh flowers may feel thirsty after their
                    journey. Trim 1cm from the stems at an angle
                    and place in fresh, cool water immediately.
                  </p>
                  <Link href="#" className="text-sm text-[#52634c] underline">
                    Read full care guide
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#eae8e4] rounded-[64px] p-20 text-center">
            <h2 className="font-serif text-3xl text-[#1b1c1a] mb-4">Need a hand?</h2>
            <p className="text-base leading-6 text-[#4f4444] mb-8 max-w-md mx-auto">
              Our concierge is available for delivery inquiries 7 days a week.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#7d562d] text-white px-10 py-4 rounded-full hover:bg-[#6d4a25] transition-colors"
              >
                <span className="text-sm">Contact Concierge</span>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 bg-white text-[#1b1c1a] px-10 py-4 rounded-full hover:bg-[#f5f3ef] transition-colors"
              >
                <span className="text-sm">FAQ Center</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
