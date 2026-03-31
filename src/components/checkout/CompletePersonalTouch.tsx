import { Quote } from "lucide-react";
import { CartItem, CartNote } from "@/lib/cart";
import { getCompleteNoteContent } from "./complete.constants";

interface CompletePersonalTouchProps {
  items: CartItem[];
  note: CartNote | null;
}

export function CompletePersonalTouch({
  items,
  note,
}: CompletePersonalTouchProps) {
  const content = getCompleteNoteContent(note, items);

  return (
    <section>
      <h2
        className="text-[24px] font-medium leading-8 text-[#2c2825]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        A Personal Touch
      </h2>
      <div className="relative mt-8 overflow-hidden rounded-[8px] bg-white px-8 py-8 shadow-[0_18px_45px_rgba(138,109,93,0.06)] md:px-14 md:py-14">
        <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#fdfaf7] text-[#8a6d5d] md:right-6 md:top-6">
          <Quote className="h-4 w-4" strokeWidth={2.25} />
        </div>
        <div className="max-w-[466px]">
          <p
            className="text-[20px] leading-7 text-[rgba(138,109,93,0.7)]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {content.greeting}
          </p>
          <p
            className="mt-6 text-[24px] leading-[1.25] text-[#3a3532] md:text-[30px] md:leading-[1.2]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {content.message}
          </p>
          <div className="mt-8 flex justify-end">
            <p
              className="text-right text-[20px] leading-7 text-[rgba(138,109,93,0.7)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {content.signature}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
