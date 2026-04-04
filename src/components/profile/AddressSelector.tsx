"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { getUserAddresses, setPrimaryAddress, AddressDTO } from "@/lib/api";

interface AddressSelectorProps {
  onAddressChange?: (address: AddressDTO | null) => void;
}

export function AddressSelector({ onAddressChange }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserAddresses();
      setAddresses(data);
      
      const primary = data.find((addr) => addr.isDefault);
      if (primary) {
        setSelectedId(primary.id);
        onAddressChange?.(primary);
      } else if (data.length > 0) {
        setSelectedId(data[0].id);
        onAddressChange?.(data[0]);
      }
    } catch (err) {
      setError("Failed to load addresses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onAddressChange]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSetPrimary = async (id: number) => {
    try {
      await setPrimaryAddress(id);
      await loadAddresses();
    } catch (err) {
      console.error("Failed to set primary address:", err);
    }
  };

  const handleChange = (id: number) => {
    setSelectedId(id);
    const address = addresses.find((addr) => addr.id === id);
    onAddressChange?.(address || null);
  };

  const formatAddress = (addr: AddressDTO) => {
    const parts = [addr.address, addr.ward, addr.district, addr.city].filter(Boolean);
    return parts.join(", ");
  };

  if (loading) {
    return (
      <div className="h-[100px] animate-pulse rounded-[11.9px] bg-white/30" />
    );
  }

  if (error || addresses.length === 0) {
    return (
      <div className="rounded-[11.9px] border border-[rgba(92,107,94,0.14)] bg-[rgba(255,255,255,0.5)] px-4 py-3">
        <p className="text-[13px] text-[#5c6b5e]">
          {error || "No addresses found. Add an address in checkout."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <select
          value={selectedId || ""}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="h-[45px] w-full appearance-none rounded-[11.9px] border border-[rgba(92,107,94,0.14)] bg-[rgba(255,255,255,0.5)] px-[16.7px] pr-10 text-[13.994px] font-light text-[#2d2a26] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] outline-none focus:border-[rgba(92,107,94,0.3)] focus:ring-0"
        >
          {addresses.map((addr) => (
            <option key={addr.id} value={addr.id}>
              {addr.fullName} - {formatAddress(addr)}
              {addr.isDefault ? " (Primary)" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2d2a26]" />
      </div>

      {selectedId && !addresses.find((a) => a.id === selectedId)?.isDefault && (
        <button
          type="button"
          onClick={() => handleSetPrimary(selectedId)}
          className="text-[12px] text-[#d0bb95] hover:text-[#c2a571] transition-colors"
        >
          Set as primary address
        </button>
      )}
    </div>
  );
}
