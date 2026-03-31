import type { ComponentType } from "react";
import { Headset, Leaf, Snowflake } from "lucide-react";
import {
  TRACKING_HIGHLIGHTS,
  type TrackingHighlightIcon,
} from "./tracking.constants";

const highlightIconMap: Record<
  TrackingHighlightIcon,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  leaf: Leaf,
  snowflake: Snowflake,
  headset: Headset,
};

export function TrackingHighlights() {
  return (
    <section className="grid gap-10 md:grid-cols-3 md:gap-12">
      {TRACKING_HIGHLIGHTS.map((highlight) => {
        const Icon = highlightIconMap[highlight.icon];

        return (
          <article key={highlight.title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-[#d4a373]">
              <Icon className="h-7 w-7" strokeWidth={2} />
            </div>
            <h2
              className="mt-5 text-[20px] leading-7 text-[#3a3532]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {highlight.title}
            </h2>
            <p
              className="mx-auto mt-3 max-w-[314px] text-[12px] font-light leading-4 text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {highlight.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}
