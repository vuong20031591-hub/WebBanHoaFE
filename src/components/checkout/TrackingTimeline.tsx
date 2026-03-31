import type { ComponentType } from "react";
import {
  Check,
  Flower2,
  HandHeart,
  Heart,
  House,
  Truck,
} from "lucide-react";
import {
  TRACKING_TIMELINE_STEPS,
  type TrackingTimelineIcon,
  type TrackingTimelineState,
} from "./tracking.constants";

const timelineIconMap: Record<
  TrackingTimelineIcon,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  flower: Flower2,
  "hand-heart": HandHeart,
  truck: Truck,
  house: House,
};

function TrackingTimelineMarker({
  state,
}: {
  state: TrackingTimelineState;
}) {
  if (state === "complete") {
    return (
      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#d4a373] text-white shadow-[0_12px_24px_rgba(212,163,115,0.22)]">
        <Check className="h-4 w-4" strokeWidth={2.7} />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,163,115,0.24)] bg-white shadow-[0_12px_24px_rgba(44,40,37,0.06)]">
        <span className="h-2 w-2 rounded-full bg-[#d4a373]" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(209,213,219,0.9)] bg-white text-[#d1d5db]">
      <Heart className="h-4 w-4" strokeWidth={2.3} />
    </div>
  );
}

export function TrackingTimeline() {
  return (
    <section className="relative">
      <div className="absolute left-[15px] top-8 bottom-8 w-px bg-[rgba(138,109,93,0.16)]" />
      <div className="space-y-12">
        {TRACKING_TIMELINE_STEPS.map((step) => {
          const Icon = timelineIconMap[step.icon];

          return (
            <article
              key={step.title}
              className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-4"
            >
              <TrackingTimelineMarker state={step.state} />
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-[#d4a373] shadow-[0_10px_18px_rgba(44,40,37,0.04)]">
                    <Icon className="h-4 w-4" strokeWidth={2.15} />
                  </div>
                  <h2
                    className="text-[20px] font-medium leading-7 text-[#2c2825]"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {step.title}
                  </h2>
                </div>
                <p
                  className="mt-3 text-[12px] font-light leading-[19.5px] text-[#9ca3af]"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  {step.description}
                </p>
                {step.detail ? (
                  <p
                    className="mt-2 text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#d4a373]"
                    style={{ fontFamily: "var(--font-montserrat)" }}
                  >
                    {step.detail}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
