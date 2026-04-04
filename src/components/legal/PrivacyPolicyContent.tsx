'use client';

import Link from 'next/link';
import { Mail, Flower2, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[896px] mx-auto px-6 py-20 md:py-32">
        <section className="mb-24">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-7xl text-[#1b1c1a] mb-6">
              Privacy Policy
            </h1>
            <p className="text-sm tracking-[1.4px] text-[#52634c]">
              Last updated: June 24, 2024
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-24">
            <div className="h-px w-24 bg-[#d2c3c34d]" />
            <Flower2 className="w-4 h-4 text-[#7d562d]" />
            <div className="h-px w-24 bg-[#d2c3c34d]" />
          </div>

          <div className="space-y-24">
            <section className="grid md:grid-cols-[261px_1fr] gap-8">
              <div>
                <h2 className="font-serif text-2xl text-[#7d562d]">Introduction</h2>
              </div>
              <div className="space-y-6">
                <p className="text-lg leading-[29.25px] text-[#4f4444e5]">
                  At Botanical Atelier, we believe that privacy is as fundamental as
                  the air our plants breathe. Your trust is the bedrock of our
                  curated community. This Privacy Policy describes how your
                  personal information is collected, used, and shared when you
                  visit or make a purchase from our atelier.
                </p>
                <p className="text-lg leading-[29.25px] text-[#4f4444e5]">
                  We approach data with the same care we use for our rare
                  orchids—minimalist, protected, and handled with the utmost
                  respect for its natural state.
                </p>
              </div>
            </section>

            <section className="grid md:grid-cols-[261px_1fr] gap-8">
              <div>
                <h2 className="font-serif text-2xl text-[#7d562d]">Information Collection</h2>
              </div>
              <div className="bg-[#f5f3ef] rounded-2xl p-10">
                <h3 className="font-serif text-xl text-[#1b1c1a] mb-6">Direct Information</h3>
                <p className="text-base leading-[26px] text-[#4f4444] mb-8">
                  When you join our circles, we collect the details you provide to
                  us: your name, shipping address, billing address, payment
                  information (including credit card numbers), email address,
                  and phone number.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6">
                    <div className="w-5 h-5 text-[#52634c] mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                    </div>
                    <p className="text-xs tracking-[-0.6px] text-[#4f4444] mb-2">Order Context</p>
                    <p className="text-sm font-medium text-[#1b1c1a]">Sourcing & Delivery</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6">
                    <div className="w-5 h-5 text-[#52634c] mb-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <p className="text-xs tracking-[-0.6px] text-[#4f4444] mb-2">Curation</p>
                    <p className="text-sm font-medium text-[#1b1c1a]">Care Guides & News</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-[261px_1fr] gap-8">
              <div>
                <h2 className="font-serif text-2xl text-[#7d562d]">Use of Data</h2>
              </div>
              <div className="space-y-6">
                <p className="text-base leading-[26px] text-[#4f4444]">
                  We use the Order Information that we collect generally to fulfill any
                  orders placed through the Site. Additionally, we use this information to:
                </p>
                
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="mt-1.5">
                      <Flower2 className="w-3 h-3 text-[#7d562d]" />
                    </div>
                    <p className="text-base leading-[26px] text-[#4f4444]">
                      Communicate with you regarding the journey of your bouquet.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5">
                      <Flower2 className="w-3 h-3 text-[#7d562d]" />
                    </div>
                    <p className="text-base leading-[26px] text-[#4f4444]">
                      Screen our orders for potential risk or fraud to ensure a secure
                      gallery experience.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-1.5">
                      <Flower2 className="w-3 h-3 text-[#7d562d]" />
                    </div>
                    <p className="text-base leading-[26px] text-[#4f4444]">
                      Provide you with information or advertising relating to our botanical
                      collections based on your preferences.
                    </p>
                  </li>
                </ul>
              </div>
            </section>

            <section className="grid md:grid-cols-[261px_1fr] gap-8">
              <div>
                <h2 className="font-serif text-2xl text-[#7d562d]">Cookies & Tracking</h2>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#7d562d0d] rounded-3xl" />
                <div className="relative p-10 space-y-6">
                  <p className="text-base leading-[26px] text-[#4f4444] italic">
                    &ldquo;Like dew on a leaf, cookies provide the necessary moisture
                    for a smooth experience.&rdquo;
                  </p>
                  <p className="text-base leading-[26px] text-[#4f4444]">
                    We use &ldquo;Cookies&rdquo; to record your preferences and session
                    details. You can instruct your browser to refuse all cookies or
                    to indicate when a cookie is being sent, though some parts of
                    our Atelier may not function optimally without them.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid md:grid-cols-[261px_1fr] gap-8">
              <div>
                <h2 className="font-serif text-2xl text-[#7d562d]">Third Parties</h2>
              </div>
              <div className="space-y-6">
                <p className="text-base leading-[26px] text-[#4f4444]">
                  We share your Personal Information with third parties to help us use your
                  Personal Information, as described above. For example, we use Shopify
                  to power our online store—you can read more about how Shopify uses
                  your Personal Information here:{' '}
                  <Link 
                    href="https://www.shopify.com/legal/privacy" 
                    target="_blank"
                    className="text-[#7d562d] border-b border-[#7d562d4d] hover:border-[#7d562d] transition-colors"
                  >
                    Shopify Privacy
                  </Link>
                  .
                </p>
                <p className="text-base leading-[26px] text-[#4f4444]">
                  Finally, we may also share your Personal Information to comply with
                  applicable laws and regulations, or to protect our rights.
                </p>
              </div>
            </section>

            <section className="border-t border-[#d2c3c333] pt-16">
              <div className="text-center space-y-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#eae8e4] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#7d562d]" />
                  </div>
                </div>
                
                <h2 className="font-serif text-3xl text-[#1b1c1a]">
                  Questions or Concerns?
                </h2>
                
                <p className="text-base leading-6 text-[#4f4444] max-w-md mx-auto">
                  If you would like to: access, correct, amend or delete any
                  personal information we have about you, simply contact
                  our Privacy Compliance Officer.
                </p>
                
                <div className="pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-[#7d562d] text-white px-8 py-4 rounded-full hover:bg-[#6d4a25] transition-colors"
                  >
                    <span className="text-base tracking-[0.4px]">Contact our Curator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
