import { QR_PAYMENT_STEPS } from "./qr.constants";

export function QrPaymentSteps() {
  return (
    <section className="space-y-12 lg:space-y-14 lg:pr-8 lg:text-right">
      {QR_PAYMENT_STEPS.map((step) => (
        <article key={step.step}>
          <p
            className="text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#d4a373]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {step.step}
          </p>
          <h2
            className="mt-1 text-[20px] leading-7 text-[rgba(138,109,93,0.8)]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {step.title}
          </h2>
          <p
            className="mt-1 max-w-[181px] text-[11px] leading-[17.875px] text-[#9ca3af] lg:ml-auto"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {step.description}
          </p>
        </article>
      ))}
    </section>
  );
}
