"use client";

import Image from "next/image";
import { Flower2, MessageCircle, Star } from "lucide-react";
import {
  TRACKING_COPY,
  TRACKING_DRIVER_IMAGE,
} from "./tracking.constants";

const MAP_VIEWBOX = {
  width: 580,
  height: 450,
} as const;

const MAP_PATHS = [
  {
    d: "M-71.5 204.074C-71.5 204.074 72.5 186.074 254.5 222.074C436.5 258.074 507.5 226.074 651.5 204.074",
    stroke: "#8A6D5D",
  },
  {
    d: "M157.794 -73.933C157.794 -73.933 157.794 149.067 260.279 373.067",
    stroke: "#D4A373",
  },
  {
    d: "M-28.12 75.533C-28.12 75.533 157.794 149.067 607.12 373.067",
    stroke: "#D4A373",
  },
] as const;

const HOME_MARKER = {
  left: 80.8,
  top: 50.8,
} as const;

const CURRENT_LOCATION_MARKER = {
  left: 225.8,
  top: 145.8,
} as const;

const LIVE_TRACKING_BADGE = {
  left: 24.8,
  top: 376.6,
  width: 530,
} as const;

function toPercent(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

function HomeLocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-[#8a6d5d]"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export function TrackingMapSection() {
  const homeMarkerStyle = {
    left: toPercent(HOME_MARKER.left, MAP_VIEWBOX.width),
    top: toPercent(HOME_MARKER.top, MAP_VIEWBOX.height),
  };

  const currentLocationStyle = {
    left: toPercent(CURRENT_LOCATION_MARKER.left, MAP_VIEWBOX.width),
    top: toPercent(CURRENT_LOCATION_MARKER.top, MAP_VIEWBOX.height),
  };

  const liveTrackingBadgeStyle = {
    left: toPercent(LIVE_TRACKING_BADGE.left, MAP_VIEWBOX.width),
    top: toPercent(LIVE_TRACKING_BADGE.top, MAP_VIEWBOX.height),
    width: toPercent(LIVE_TRACKING_BADGE.width, MAP_VIEWBOX.width),
  };

  return (
    <section className="mx-auto w-full max-w-[580px] space-y-8 xl:mx-0">
      <div className="relative aspect-[580/450] overflow-hidden rounded-[40px] bg-[#f4f1ee]">
        <div className="absolute inset-[0.8px] bg-white">
          <svg
            viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
            className="h-full w-full"
            fill="none"
            aria-hidden="true"
          >
            {MAP_PATHS.map((path) => (
              <path
                key={path.d}
                d={path.d}
                stroke={path.stroke}
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        <div
          className="absolute flex w-[113px] flex-col items-center gap-1"
          style={homeMarkerStyle}
        >
          <HomeLocationIcon />
          <div className="h-[23px] rounded-full bg-white px-[12.8px] py-[5.6px] shadow-[0_10px_24px_rgba(44,40,37,0.06)]">
            <span
              className="text-[9px] font-bold uppercase leading-[13.5px] tracking-[0.9px] text-[#3a3532]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {TRACKING_COPY.homeLabel}
            </span>
          </div>
        </div>

        <div
          className="absolute h-12 w-10"
          style={currentLocationStyle}
        >
          <div className="absolute left-[-4px] top-[-4px] h-12 w-12 rounded-full bg-[rgba(255,255,255,0.4)]" />
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_14px_30px_rgba(44,40,37,0.08)]">
            <Flower2 className="h-6 w-6 text-[#d4a373]" strokeWidth={2.2} />
          </div>
          <div className="absolute left-1/2 top-10 h-2 w-[11px] -translate-x-1/2 rounded-full bg-[rgba(138,109,93,0.16)] blur-[1.5px]" />
        </div>

        <div
          className="absolute rounded-2xl bg-[rgba(255,255,255,0.9)] px-4 py-4 shadow-[0_18px_32px_rgba(44,40,37,0.06)]"
          style={liveTrackingBadgeStyle}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#d4a373]" />
              <span
                className="text-[10px] font-bold uppercase leading-[15px] tracking-[1px] text-[#3a3532]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                {TRACKING_COPY.liveTrackingLabel}
              </span>
            </div>
            <span
              className="whitespace-nowrap text-[10px] font-light leading-[15px] text-[#6b7280]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {TRACKING_COPY.liveTrackingUpdate}
            </span>
          </div>
        </div>
      </div>

      <article className="rounded-[32px] bg-white px-8 py-8 shadow-[0_24px_60px_rgba(138,109,93,0.08)]">
        <div className="grid gap-8 md:grid-cols-[96px_239px_117px] md:items-center">
          <div className="relative h-32 w-24 overflow-hidden rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[8px] rounded-br-[8px] bg-[#f4f1ee]">
            <Image
              src={TRACKING_DRIVER_IMAGE}
              alt={TRACKING_COPY.courierName}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p
              className="text-[10px] font-bold uppercase leading-[15px] tracking-[2px] text-[#d4a373]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {TRACKING_COPY.courierLabel}
            </p>
            <h2
              className="mt-2 text-[24px] leading-8 text-[#2c2825]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {TRACKING_COPY.courierName}
            </h2>
            <p
              className="mt-2 text-[12px] font-light leading-[19.5px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {TRACKING_COPY.courierDescription}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <div className="flex items-center gap-1 text-[#d4a373]">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className="h-5 w-5 fill-current"
                  strokeWidth={1.8}
                />
              ))}
            </div>
            <button className="flex h-[33px] min-w-[96px] items-center justify-center gap-2 rounded-full bg-[#fdfaf7] px-5 text-[#3a3532] transition hover:bg-[#f4f1ee]">
              <MessageCircle className="h-4 w-4" strokeWidth={2.1} />
              <span
                className="text-[10px] font-bold uppercase leading-[15px] tracking-[1px]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                {TRACKING_COPY.courierContactLabel}
              </span>
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
