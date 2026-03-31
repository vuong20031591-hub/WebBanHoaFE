"use client";

import { useState } from "react";
import type { PersonalNote as PersonalNoteType } from "@/lib/checkout/types";

interface PersonalNoteProps {
  onSubmit?: (note: PersonalNoteType) => void;
}

export function PersonalNote({ onSubmit }: PersonalNoteProps) {
  const [note, setNote] = useState<PersonalNoteType>({
    recipient: "Dear Recipient,",
    message: "",
    signature: "With love.",
    keepAnonymous: false,
  });

  return (
    <div className="space-y-16">
      <h2
        className="text-[24px] font-medium leading-[32px] text-[#2c2825]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        A Personal Touch
      </h2>

      <div className="rounded-lg bg-white p-12">
        <div className="space-y-[41px]">
          <p
            className="text-[20px] leading-[28px] text-[rgba(138,109,93,0.7)]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {note.recipient}
          </p>

          <textarea
            value={note.message}
            onChange={(e) => setNote((prev) => ({ ...prev, message: e.target.value }))}
            placeholder="Write your heartfelt note here..."
            rows={5}
            className="w-full resize-none bg-transparent px-3 py-2 text-[24px] leading-[32px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none"
            style={{ fontFamily: "var(--font-cormorant)" }}
          />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-[28px]">
              <div className="relative h-4 w-4">
                <input
                  type="checkbox"
                  checked={note.keepAnonymous}
                  onChange={(e) =>
                    setNote((prev) => ({ ...prev, keepAnonymous: e.target.checked }))
                  }
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-[#e5e7eb] bg-white checked:border-[#8a6d5d] checked:bg-[#8a6d5d]"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 text-white peer-checked:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span
                className="text-[11px] font-semibold leading-[16.5px] tracking-[1.1px] text-[#9ca3af]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                KEEP MY IDENTITY SECRET
              </span>
            </label>

            <p
              className="text-[18px] leading-[28px] text-[rgba(138,109,93,0.7)]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {note.signature}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
