import type { CartItem } from "@/lib/cart";
import { getCompleteOrderNumber } from "./complete.constants";

export type TrackingTimelineIcon = "flower" | "hand-heart" | "truck" | "house";
export type TrackingHighlightIcon = "leaf" | "snowflake" | "headset";
export type TrackingTimelineState = "complete" | "active" | "upcoming";

export interface TrackingTimelineStep {
  title: string;
  description: string;
  detail?: string;
  icon: TrackingTimelineIcon;
  state: TrackingTimelineState;
}

export interface TrackingHighlight {
  title: string;
  description: string;
  icon: TrackingHighlightIcon;
}

export const TRACKING_COPY = {
  pageTitle: "Journey of your blooms",
  arrivalPrefix: "Estimated Arrival:",
  arrivalTime: "2:45 PM",
  liveTrackingLabel: "LIVE TRACKING",
  liveTrackingUpdate: "Last updated: Just now",
  homeLabel: "Home",
  courierLabel: "YOUR DELIVERY HERO",
  courierName: "Minh Quan",
  courierDescription:
    "Quan has been delivering elegance with us for 3 years. He handles every bouquet like a masterpiece.",
  courierContactLabel: "Contact",
};

export const TRACKING_DRIVER_IMAGE = "/images/checkout/tracking-driver.png";

export const TRACKING_TIMELINE_STEPS: TrackingTimelineStep[] = [
  {
    title: "Order Placed",
    description:
      "Your selection has been received with grace. Our morning harvest is being gathered.",
    detail: "09:12 AM",
    icon: "flower",
    state: "complete",
  },
  {
    title: "Hand-crafting Bouquet",
    description:
      "Our lead artisan is currently composing your arrangement with seasonal peonies and wild roses.",
    detail: "11:30 AM",
    icon: "hand-heart",
    state: "complete",
  },
  {
    title: "Out for Delivery",
    description:
      "Your gift is travelling through the city streets, kept in a climate-controlled sanctuary.",
    detail: "IN TRANSIT",
    icon: "truck",
    state: "active",
  },
  {
    title: "Arrived",
    description:
      "The final destination. A moment of beauty delivered to your doorstep.",
    icon: "house",
    state: "upcoming",
  },
];

export const TRACKING_HIGHLIGHTS: TrackingHighlight[] = [
  {
    title: "Eco-Friendly Transit",
    description:
      "Delivered in our signature electric fleet to minimize our floral footprint.",
    icon: "leaf",
  },
  {
    title: "Freshness Locked",
    description:
      "Our bespoke transit boxes maintain a perfect 12°C to keep petals crisp.",
    icon: "snowflake",
  },
  {
    title: "Concierge Support",
    description:
      "Need to change delivery details? Our artisans are standing by for you.",
    icon: "headset",
  },
];

export function getTrackingOrderMeta(items: CartItem[]) {
  return `Order #${getCompleteOrderNumber(items)} • ${TRACKING_COPY.arrivalPrefix} ${TRACKING_COPY.arrivalTime}`;
}
