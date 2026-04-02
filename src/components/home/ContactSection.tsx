export function ContactSection() {
  return (
    <section className="bg-[rgba(245,213,217,0.2)] py-24">
      <div className="max-w-[1280px] mx-auto px-[192px]">
        <div className="flex items-center justify-between">
          <div className="w-[349px]">
            <h2
              className="text-[#2d2a26] text-[36px] font-light leading-[40px] mb-4"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Join Our Bloom Club
            </h2>
            <p
              className="text-[#5c6b5e] text-[18px] font-light leading-[28px]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Receive styling tips, seasonal updates, and 10% off your first order.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[320px] h-16 bg-white rounded-3xl border border-[#ece4da] px-4 flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent text-[14px] font-light text-[#2d2a26] placeholder-gray-400 outline-none"
                style={{ fontFamily: "var(--font-inter)" }}
              />
            </div>
            <button
              className="bg-[#d0bb95] border border-[rgba(0,0,0,0.1)] text-white text-[16px] font-medium px-8 h-16 rounded-3xl hover:bg-[#c2a571] transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
