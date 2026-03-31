"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CartNote } from "@/lib/cart";
import { PREVIEW_NOTE } from "./constants";

interface CartNoteCardProps {
  note: CartNote | null;
  onClear: () => void;
  onSave: (note: CartNote) => void;
}

export function CartNoteCard({
  note,
  onClear,
  onSave,
}: CartNoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CartNote>({
    message: "",
    signature: "",
  });

  const displayNote = note ?? PREVIEW_NOTE;

  const handleCancel = () => {
    setDraft({ message: "", signature: "" });
    setIsEditing(false);
  };

  const handleSave = () => {
    const nextMessage = draft.message.trim();
    const nextSignature = draft.signature.trim();

    if (!nextMessage && !nextSignature) {
      onClear();
      setIsEditing(false);
      return;
    }

    onSave({
      message: nextMessage || PREVIEW_NOTE.message,
      signature: nextSignature || PREVIEW_NOTE.signature,
    });
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setDraft({
      message: note?.message ?? "",
      signature: note?.signature ?? "",
    });
    setIsEditing(true);
  };

  return (
    <section className="pt-10">
      <h2
        className="mb-8 text-[24px] leading-[32px] text-[var(--color-cart-ink)]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Personal Sentiment
      </h2>
      <div className="relative overflow-hidden rounded-sm border border-[#eee6db] bg-[#fdfbf7] px-12 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,166,148,0.05),transparent_45%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <p
              className="text-[10px] uppercase leading-[15px] tracking-[2px] text-[var(--color-cart-gold)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Handwritten Note
            </p>
            {note ? (
              <button
                type="button"
                onClick={onClear}
                className="p-1 text-[var(--color-cart-danger)] transition hover:bg-[rgba(163,43,43,0.08)]"
                aria-label="Delete note"
              >
                <Trash2 className="h-8 w-8" />
              </button>
            ) : null}
          </div>
          {isEditing ? (
            <div className="mt-10 space-y-4">
              <textarea
                value={draft.message}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    message: event.target.value,
                  }))
                }
                rows={4}
                className="min-h-40 w-full resize-none rounded-[24px] border border-[rgba(138,109,93,0.15)] bg-white/80 px-6 py-5 text-[18px] leading-8 text-[var(--color-cart-ink)] outline-none transition focus:border-[var(--color-cart-gold)]"
                style={{ fontFamily: "var(--font-inter)" }}
                placeholder="Write your note here"
              />
              <input
                type="text"
                value={draft.signature}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    signature: event.target.value,
                  }))
                }
                className="w-full rounded-full border border-[rgba(138,109,93,0.15)] bg-white/80 px-5 py-4 text-[15px] text-[var(--color-cart-ink)] outline-none transition focus:border-[var(--color-cart-gold)]"
                style={{ fontFamily: "var(--font-inter)" }}
                placeholder="Signature"
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-[var(--color-cart-warm)] px-6 py-3 text-[11px] uppercase tracking-[1.8px] text-white transition hover:bg-[#775f51]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Save Note
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-[rgba(201,166,148,0.4)] px-6 py-3 text-[11px] uppercase tracking-[1.8px] text-[var(--color-cart-ink)] transition hover:bg-[rgba(201,166,148,0.08)]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-10 max-w-[448px]">
              <p
                className="whitespace-pre-line text-[36px] leading-[58.5px] text-[#4a4542]"
                style={{ fontFamily: "var(--font-pinyon)" }}
              >
                {displayNote.message}
              </p>
              <p
                className="mt-6 text-[36px] leading-[40px] text-[#4a4542]"
                style={{ fontFamily: "var(--font-pinyon)" }}
              >
                {displayNote.signature}
              </p>
              <button
                type="button"
                onClick={handleStartEditing}
                className="mt-8 border-b border-[rgba(201,166,148,0.4)] pb-1 text-[10px] uppercase leading-[15px] tracking-[2px] text-[var(--color-cart-ink)] transition hover:border-[var(--color-cart-gold)] hover:text-[var(--color-cart-gold)]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Edit Message
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
