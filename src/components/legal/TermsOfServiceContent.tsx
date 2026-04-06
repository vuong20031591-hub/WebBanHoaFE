'use client';

import Link from 'next/link';
import { Flower2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfServiceContent() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1024px] mx-auto px-12 py-20 md:py-32">
        <section className="mb-24">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[1.2px] text-[#52634c] mb-8">Legal Framework</p>
            <h1 className="font-serif text-5xl md:text-6xl text-[#1b1c1a] mb-8">
              Terms of Service
            </h1>
            <p className="text-base leading-[26px] text-[#4f4444] max-w-[672px] mx-auto">
              Welcome to Botanical Atelier. These terms outline the rules and regulations for the use of
              our services, ensuring a harmonious experience for every guest in our digital garden.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="h-px w-16 bg-[#d2c3c34d]" />
            </div>
          </div>

          <div className="grid md:grid-cols-[208px_1fr] gap-12">
            <aside className="space-y-12">
              <nav className="space-y-6">
                <Link href="#service-terms" className="block pl-4 border-l-2 border-[#7d562d]">
                  <span className="font-serif text-lg text-[#7d562d]">Service Terms</span>
                </Link>
                <Link href="#user-obligations" className="block pl-4">
                  <span className="text-sm text-[#4f4444] hover:text-[#1b1c1a] transition-colors">
                    User Obligations
                  </span>
                </Link>
                <Link href="#intellectual-property" className="block pl-4">
                  <span className="text-sm text-[#4f4444] hover:text-[#1b1c1a] transition-colors">
                    Intellectual Property
                  </span>
                </Link>
                <Link href="#limitation-liability" className="block pl-4">
                  <span className="text-sm text-[#4f4444] hover:text-[#1b1c1a] transition-colors">
                    Limitation of Liability
                  </span>
                </Link>
                <Link href="#governing-law" className="block pl-4">
                  <span className="text-sm text-[#4f4444] hover:text-[#1b1c1a] transition-colors">
                    Governing Law
                  </span>
                </Link>
              </nav>
            </aside>

            <div className="space-y-24">
              <section id="service-terms" className="relative">
                <div className="absolute -left-8 top-0 text-[96px] font-serif text-[#7d562d1a] leading-none">
                  01
                </div>
                <h2 className="font-serif text-3xl text-[#1b1c1a] mb-8">Service Terms</h2>
                <div className="bg-[#f5f3ef] rounded-2xl p-10 space-y-6">
                  <p className="text-base leading-[26px] text-[#1b1c1a]">
                    By accessing this website, we assume you accept these terms and conditions.
                    Do not continue to use Botanical Atelier if you do not agree to all of the terms
                    and conditions stated on this page.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <div className="mt-1">
                        <Flower2 className="w-3 h-3 text-[#52634c]" />
                      </div>
                      <p className="text-sm leading-[22.75px] text-[#4f4444]">
                        Our floral arrangements are artisan-crafted and subject to seasonal availability. We
                        reserve the right to substitute blooms of equal or higher value.
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="mt-1">
                        <Flower2 className="w-3 h-3 text-[#52634c]" />
                      </div>
                      <p className="text-sm leading-[22.75px] text-[#4f4444]">
                        Delivery windows are estimates. While we strive for punctuality, botanical integrity is
                        our priority.
                      </p>
                    </li>
                  </ul>
                </div>
              </section>

              <section id="user-obligations" className="relative">
                <div className="absolute -left-8 top-0 text-[96px] font-serif text-[#7d562d1a] leading-none">
                  02
                </div>
                <h2 className="font-serif text-3xl text-[#1b1c1a] mb-8">User Obligations</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-8">
                    <h3 className="font-serif text-lg text-[#7d562d] mb-4">Account Integrity</h3>
                    <p className="text-sm leading-[22.75px] text-[#4f4444]">
                      You are responsible for maintaining the
                      confidentiality of your account and
                      password. You agree to accept
                      responsibility for all activities that occur
                      under your account.
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-8">
                    <h3 className="font-serif text-lg text-[#7d562d] mb-4">Proper Conduct</h3>
                    <p className="text-sm leading-[22.75px] text-[#4f4444]">
                      Users must not engage in any behavior
                      that is harmful, offensive, or disruptive
                      to the Botanical Atelier community or
                      platform functionality.
                    </p>
                  </div>
                </div>
              </section>

              <section id="intellectual-property" className="relative">
                <div className="absolute -left-8 top-0 text-[96px] font-serif text-[#7d562d1a] leading-none">
                  03
                </div>
                <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
                  <div>
                    <h2 className="font-serif text-3xl text-[#1b1c1a] mb-8">Intellectual Property</h2>
                    <p className="text-base leading-[26px] text-[#4f4444] mb-6">
                      The creative essence of Botanical Atelier—
                      including our photography, floral designs, and
                      editorial content—is our soul. All material is owned
                      by or licensed to Botanical Atelier.
                    </p>
                    <div className="border-l-2 border-[#d2e5c8] pl-6 py-2">
                      <p className="text-base leading-[26px] text-[#4f4444] italic">
                        Reproduction, distribution, or unauthorized use
                        of our creative assets without express written
                        consent is strictly prohibited.
                      </p>
                    </div>
                  </div>
                  <div className="bg-[#f5f3ef] rounded-2xl aspect-square" />
                </div>
              </section>

              <section id="limitation-liability" className="relative">
                <div className="absolute -left-8 top-0 text-[96px] font-serif text-[#7d562d1a] leading-none">
                  04
                </div>
                <h2 className="font-serif text-3xl text-[#1b1c1a] mb-8">Limitation of Liability</h2>
                <div className="bg-[#1c1917] rounded-[48px] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#7d562d33] rounded-full blur-3xl" />
                  <div className="relative space-y-8">
                    <p className="font-serif text-lg leading-[29.25px] text-[#f5f5f4]">
                      &ldquo;Nature is unpredictable, and so is life. We strive for perfection but
                      acknowledge the variables beyond our control.&rdquo;
                    </p>
                    <div className="space-y-4">
                      <p className="text-sm leading-5 text-[#a8a29e]">
                        To the maximum extent permitted by applicable law, Botanical Atelier shall not be liable
                        for any indirect, incidental, special, consequential, or punitive damages resulting from
                        your access to or use of our services.
                      </p>
                      <p className="text-sm leading-5 text-[#a8a29e]">
                        This includes but is not limited to errors in product descriptions, delivery delays due to
                        weather, or seasonal variation in floral stock.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-[#ffd1a6] bg-[#ffd1a64d] rounded-[64px] p-12 text-center">
                <h2 className="font-serif text-2xl text-[#7e572d] mb-6">
                  Have questions regarding our terms?
                </h2>
                <p className="text-base leading-6 text-[#7e572dcc] mb-8 max-w-md mx-auto">
                  Our concierge is available to clarify any nuances of our service
                  standards.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#7d562d] text-white px-10 py-4 rounded-full hover:bg-[#6d4a25] transition-colors"
                >
                  <Flower2 className="w-4 h-4" />
                  <span className="text-base tracking-[0.4px]">Contact Concierge</span>
                </Link>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
