import Link from "next/link";
import { ProfileOrder } from "@/lib/profile/types";
import { ProfileOrderCard } from "./ProfileOrderCard";

interface ProfileOrdersSectionProps {
  orders: ProfileOrder[];
}

export function ProfileOrdersSection({
  orders,
}: ProfileOrdersSectionProps) {
  return (
    <section className="px-0 pt-12 lg:px-[102px] lg:pt-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            className="text-[28px] font-light leading-none text-[#2d2a26] lg:text-[24px]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            Recent Purchases
          </h2>
        </div>
        <p className="text-[12px] font-light leading-4 text-[#5c6b5e]">
          Showing last {orders.length} orders
        </p>
      </div>

      {orders.length > 0 ? (
        <>
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <ProfileOrderCard key={order.id} order={order} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/profile"
              className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
            >
              View All Orders
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-[32px] bg-white/60 px-8 py-10 text-center">
          <p
            className="text-[26px] leading-8 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            No order history yet
          </p>
          <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
            Real backend orders will appear here after checkout.
          </p>
        </div>
      )}
    </section>
  );
}
