"use client";

import { useState } from "react";
import type { DeliveryInfo } from "@/lib/checkout/types";

interface DeliveryFormProps {
  onSubmit?: (info: DeliveryInfo) => void;
}

export function DeliveryForm({ onSubmit }: DeliveryFormProps) {
  const [formData, setFormData] = useState<DeliveryInfo>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postCode: "",
  });

  const handleChange = (field: keyof DeliveryInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-16">
      <h2
        className="text-[24px] font-medium leading-[32px] text-[#2c2825]"
        style={{ fontFamily: "var(--font-cormorant)" }}
      >
        Delivery Details
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-[7px]">
            <label
              className="block text-[10px] font-bold leading-[15px] tracking-[1px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              FIRST NAME
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="Enter name"
              className="h-[50px] w-full rounded-[24px] bg-white px-[16.8px] text-[16px] leading-[24px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d]"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>

          <div className="space-y-[7px]">
            <label
              className="block text-[10px] font-bold leading-[15px] tracking-[1px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              LAST NAME
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Enter name"
              className="h-[50px] w-full rounded-[24px] bg-white px-[16.8px] text-[16px] leading-[24px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d]"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>
        </div>

        <div className="space-y-[13px]">
          <label
            className="block text-[10px] font-bold leading-[15px] tracking-[1px] text-[#9ca3af]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            SHIPPING ADDRESS
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter address"
            className="h-[50px] w-full rounded-[24px] bg-white px-[16.8px] text-[16px] leading-[24px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d]"
            style={{ fontFamily: "var(--font-inter)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-[7px]">
            <label
              className="block text-[10px] font-bold leading-[15px] tracking-[1px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              CITY
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter city"
              className="h-[50px] w-full rounded-[24px] bg-white px-[16.8px] text-[16px] leading-[24px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d]"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>

          <div className="space-y-[7px]">
            <label
              className="block text-[10px] font-bold leading-[15px] tracking-[1px] text-[#9ca3af]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              POST CODE
            </label>
            <input
              type="text"
              value={formData.postCode}
              onChange={(e) => handleChange("postCode", e.target.value)}
              placeholder="Enter post code"
              className="h-[50px] w-full rounded-[24px] bg-white px-[16.8px] text-[16px] leading-[24px] text-[#2c2825] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#8a6d5d]"
              style={{ fontFamily: "var(--font-inter)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
