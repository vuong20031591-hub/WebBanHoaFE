"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getUserRewards, getRewardsHistory } from "@/lib/api/profile";
import type { UserRewardsDTO, RewardsTransactionDTO } from "@/lib/api/types";

interface BloomRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BloomRewardsModal({ isOpen, onClose }: BloomRewardsModalProps) {
  const [rewards, setRewards] = useState<UserRewardsDTO | null>(null);
  const [history, setHistory] = useState<RewardsTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsData, historyData] = await Promise.all([
        getUserRewards(),
        getRewardsHistory(0, 10),
      ]);
      setRewards(rewardsData);
      setHistory(historyData.content);
    } catch (err) {
      console.error("Failed to load rewards data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Gold":
        return "text-[#d4af37]";
      case "Silver":
        return "text-[#c0c0c0]";
      default:
        return "text-[#cd7f32]";
    }
  };

  const getTierProgress = () => {
    if (!rewards) return 0;
    const { lifetimePoints, tier } = rewards;
    if (tier === "Gold") return 100;
    if (tier === "Silver") {
      return Math.min(100, ((lifetimePoints - 500) / 1000) * 100);
    }
    return Math.min(100, (lifetimePoints / 500) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] bg-white p-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#a8a29e] transition-colors hover:text-[#2d2a26]"
        >
          <X className="h-6 w-6" />
        </button>

        <h2
          className="text-[32px] font-light leading-none text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          Bloom Rewards
        </h2>
        <p className="mt-3 max-w-[560px] text-[14px] leading-6 text-[#78716c]">
          Your Bloom Rewards balance is made up of loyalty points from your account.
          You can review the balance here and apply points directly at checkout. This
          is not a separate promo code system.
        </p>

        {loading ? (
          <div className="mt-8 h-[400px] animate-pulse rounded-[16px] bg-[#f5f5f4]" />
        ) : rewards ? (
          <>
            <div className="mt-8 rounded-[16px] bg-[#fef5f6] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#a8a29e]">
                    Available Reward Points
                  </p>
                  <p className="mt-1 text-[36px] font-light leading-none text-[#2d2a26]">
                    {rewards.points}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-medium uppercase tracking-[1.2px] text-[#a8a29e]">
                    Current Tier
                  </p>
                  <p
                    className={`mt-1 text-[24px] font-medium leading-none ${getTierColor(
                      rewards.tier
                    )}`}
                  >
                    {rewards.tier}
                  </p>
                </div>
              </div>

              {rewards.tier !== "Gold" && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-[11px] text-[#a8a29e]">
                    <span>Progress to next tier</span>
                    <span>{rewards.pointsToNextTier} points to go</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/60">
                    <div
                      className="h-full rounded-full bg-[#d0bb95] transition-all duration-500"
                      style={{ width: `${getTierProgress()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-[18px] font-medium text-[#2d2a26]">
                How Points Work
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-[12px] bg-[#f5f5f4] p-4">
                  <p className="text-[14px] font-medium text-[#cd7f32]">
                    Point value
                  </p>
                  <p className="mt-1 text-[12px] text-[#5c6b5e]">
                    1 Bloom Rewards point = 1,000 VND applied at checkout.
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#f5f5f4] p-4">
                  <p className="text-[14px] font-medium text-[#c0c0c0]">
                    When points are earned
                  </p>
                  <p className="mt-1 text-[12px] text-[#5c6b5e]">
                    Points are added after an order is confirmed by the system.
                  </p>
                </div>
                <div className="rounded-[12px] bg-[#f5f5f4] p-4">
                  <p className="text-[14px] font-medium text-[#d4af37]">
                    Tier milestones
                  </p>
                  <p className="mt-1 text-[12px] text-[#5c6b5e]">
                    Bronze starts below 500 lifetime points, Silver starts at 500,
                    and Gold starts at 1,500.
                  </p>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[18px] font-medium text-[#2d2a26]">
                  Recent Activity
                </h3>
                <div className="mt-4 space-y-2">
                  {history.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-[12px] bg-[#f5f5f4] p-4"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-[#2d2a26]">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#a8a29e]">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p
                        className={`text-[16px] font-medium ${
                          transaction.points > 0
                            ? "text-[#166534]"
                            : "text-[#b91c1c]"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-8 text-center text-[14px] text-[#a8a29e]">
            Failed to load rewards data
          </p>
        )}
      </div>
    </div>
  );
}
