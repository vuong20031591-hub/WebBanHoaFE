"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPinHouse, PencilLine, Plus, Star, Trash2 } from "lucide-react";
import { ChatLive, Footer, Navbar } from "@/components/layout";
import {
  AddressDTO,
  createAddress,
  deleteAddress,
  getUserAddresses,
  isApiError,
  setPrimaryAddress,
  updateAddress,
} from "@/lib/api";
import { ProfileTab } from "@/lib/profile/types";
import { useAuth } from "@/src/contexts";
import { ProfileTabs } from "./ProfileTabs";

const PROFILE_TABS: ProfileTab[] = [
  { id: "orders", label: "My Orders", href: "/profile", active: false },
  { id: "favorites", label: "Favorites", href: "/profile/favorites", active: false },
  { id: "settings", label: "Settings", href: "/profile/settings", active: false },
  { id: "addresses", label: "Addresses", href: "/profile/addresses", active: true },
];

type AddressFormState = {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

const EMPTY_FORM: AddressFormState = {
  fullName: "",
  phone: "",
  address: "",
  ward: "",
  district: "",
  city: "",
  isDefault: false,
};

function toRequestPayload(form: AddressFormState) {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    ward: form.ward.trim(),
    district: form.district.trim(),
    city: form.city.trim(),
    isDefault: form.isDefault,
  };
}

function formatAddress(address: AddressDTO) {
  return [address.address, address.ward, address.district, address.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}

export function ProfileAddressesPageContent() {
  const { user, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDTO | null>(null);
  const [formState, setFormState] = useState<AddressFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addressToDelete, setAddressToDelete] = useState<AddressDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  const pageTitle = useMemo(
    () => (editingAddress ? "Edit Address" : "Add New Address"),
    [editingAddress]
  );

  const loadAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoadingAddresses(false);
      return;
    }

    try {
      setLoadingAddresses(true);
      setPageError(null);
      const data = await getUserAddresses();
      setAddresses(data);
    } catch (error) {
      setPageError(
        isApiError(error) ? error.message : "Unable to load addresses right now."
      );
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadAddresses();
    }
  }, [authLoading, loadAddresses]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setMessage(null);
    setFormState({
      ...EMPTY_FORM,
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      isDefault: addresses.length === 0,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (address: AddressDTO) => {
    setEditingAddress(address);
    setMessage(null);
    setFormState({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      ward: address.ward ?? "",
      district: address.district,
      city: address.city,
      isDefault: address.isDefault,
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsFormModalOpen(false);
    setEditingAddress(null);
    setFormState(EMPTY_FORM);
  };

  const validateForm = () => {
    if (!formState.fullName.trim()) {
      return "Full name is required.";
    }

    if (!formState.phone.trim()) {
      return "Phone is required.";
    }

    if (!formState.address.trim()) {
      return "Street address is required.";
    }

    return null;
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = toRequestPayload(formState);

      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        setMessage({ type: "success", text: "Address updated successfully." });
      } else {
        await createAddress(payload);
        setMessage({ type: "success", text: "Address added successfully." });
      }

      setIsFormModalOpen(false);
      setEditingAddress(null);
      setFormState(EMPTY_FORM);
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text: isApiError(error) ? error.message : "Failed to save address.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAddress = (address: AddressDTO) => {
    setAddressToDelete(address);
    setMessage(null);
  };

  const cancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setAddressToDelete(null);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAddress(addressToDelete.id);
      setAddressToDelete(null);
      setMessage({ type: "success", text: "Address deleted successfully." });
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text: isApiError(error) ? error.message : "Failed to delete address.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setSettingDefaultId(id);
      setMessage(null);
      await setPrimaryAddress(id);
      setMessage({ type: "success", text: "Default address updated." });
      await loadAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text: isApiError(error) ? error.message : "Failed to set default address.",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      <Navbar />
      <main className="pb-24">
        <div className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6 lg:px-10 lg:pt-24">
          <div className="mx-auto max-w-[1100px]">
            <header className="pb-12 lg:pb-16">
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#d0bb95]">
                Account
              </p>
              <h1
                className="mt-4 text-[44px] font-light leading-none text-[#2d2a26]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                Address Book
              </h1>
              <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
                Manage shipping addresses for faster checkout.
              </p>
            </header>

            <ProfileTabs tabs={PROFILE_TABS} />

            {authLoading || loadingAddresses ? (
              <div className="mt-12 h-[320px] rounded-[32px] bg-white/60 animate-pulse" />
            ) : !user ? (
              <div className="pt-12 lg:pt-16">
                <div className="rounded-[32px] bg-white/60 px-8 py-10 text-center">
                  <h2
                    className="text-[32px] leading-[1.1] text-[#2d2a26]"
                    style={{ fontFamily: "var(--font-noto-serif)" }}
                  >
                    Sign in to manage addresses
                  </h2>
                  <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#5c6b5e]">
                    Address management is available only for authenticated users.
                  </p>
                  <div className="mt-8">
                    <Link
                      href="/signin"
                      className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                    >
                      Go to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <section className="pt-12 lg:pt-16">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[13px] uppercase tracking-[1.2px] text-[rgba(92,107,94,0.8)]">
                    {addresses.length} saved address{addresses.length === 1 ? "" : "es"}
                  </p>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[#d0bb95] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>
                </div>

                {message ? (
                  <p
                    className={`mt-5 text-[13px] ${
                      message.type === "success" ? "text-[#166534]" : "text-[#b91c1c]"
                    }`}
                  >
                    {message.text}
                  </p>
                ) : null}

                {pageError ? (
                  <div className="mt-6 rounded-2xl border border-[#f8d3d3] bg-[#fff5f5] px-4 py-3 text-[13px] text-[#b91c1c]">
                    {pageError}
                  </div>
                ) : null}

                {addresses.length === 0 ? (
                  <div className="mt-8 rounded-[32px] border border-dashed border-[rgba(92,107,94,0.2)] bg-white/50 px-8 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#efe6d6] text-[#8f7f6f]">
                      <MapPinHouse className="h-7 w-7" />
                    </div>
                    <h2
                      className="mt-5 text-[30px] leading-[1.1] text-[#2d2a26]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    >
                      No addresses yet
                    </h2>
                    <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-6 text-[#5c6b5e]">
                      Add your first shipping address to speed up checkout and delivery.
                    </p>
                    <button
                      type="button"
                      onClick={openCreateModal}
                      className="mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[#d0bb95] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#c2a571]"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 grid gap-5">
                    {addresses.map((address) => (
                      <article
                        key={address.id}
                        className="rounded-[24px] bg-white/70 px-6 py-6 shadow-[0_8px_24px_rgba(45,42,38,0.04)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className="text-[24px] leading-none text-[#2d2a26]"
                                style={{ fontFamily: "var(--font-noto-serif)" }}
                              >
                                {address.fullName}
                              </h3>
                              {address.isDefault ? (
                                <span className="rounded-full bg-[#ebe3d2] px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-[#8f7f6f]">
                                  Default
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-[14px] text-[#5c6b5e]">{address.phone}</p>
                            <p className="mt-3 text-[14px] leading-6 text-[#4f4841]">
                              {formatAddress(address)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {!address.isDefault ? (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(address.id)}
                                disabled={settingDefaultId === address.id}
                                className="inline-flex min-h-[40px] items-center gap-1 rounded-[10px] border border-[#e3d6bf] px-3 text-[12px] font-medium text-[#8f7f6f] transition-colors hover:bg-[#f8f4ec] disabled:opacity-50"
                              >
                                <Star className="h-3.5 w-3.5" />
                                {settingDefaultId === address.id ? "Setting..." : "Set Default"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openEditModal(address)}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded-[10px] border border-[rgba(92,107,94,0.18)] px-3 text-[12px] font-medium text-[#5c6b5e] transition-colors hover:bg-white"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDeleteAddress(address)}
                              className="inline-flex min-h-[40px] items-center gap-1 rounded-[10px] border border-[rgba(185,28,28,0.2)] px-3 text-[12px] font-medium text-[#b91c1c] transition-colors hover:bg-[#fff5f5]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      {isFormModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a26]/30 p-4">
          <div className="w-full max-w-[680px] rounded-[28px] bg-[#fffdf9] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-[34px] leading-none text-[#2d2a26]"
                  style={{ fontFamily: "var(--font-noto-serif)" }}
                >
                  {pageTitle}
                </h2>
                <p className="mt-2 text-[13px] text-[#5c6b5e]">
                  Enter shipping details used for delivery and checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="text-[12px] font-medium uppercase tracking-[1px] text-[#8f7f6f]"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitForm} className="mt-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">Full Name</span>
                  <input
                    value={formState.fullName}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, fullName: event.target.value }))
                    }
                    className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">Phone</span>
                  <input
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">Street Address</span>
                <input
                  value={formState.address}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, address: event.target.value }))
                  }
                  className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">Ward</span>
                  <input
                    value={formState.ward}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, ward: event.target.value }))
                    }
                    className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">District</span>
                  <input
                    value={formState.district}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, district: event.target.value }))
                    }
                    className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[12px] uppercase tracking-[1px] text-[#7a6f65]">City</span>
                  <input
                    value={formState.city}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, city: event.target.value }))
                    }
                    className="h-11 w-full rounded-[10px] border border-[rgba(92,107,94,0.2)] bg-white px-3 text-[14px] text-[#2d2a26] outline-none focus:border-[#d0bb95]"
                  />
                </label>
              </div>

              <label className="inline-flex items-center gap-2 pt-1 text-[13px] text-[#5c6b5e]">
                <input
                  type="checkbox"
                  checked={formState.isDefault}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, isDefault: event.target.checked }))
                  }
                />
                Set as default address
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSubmitting}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-5 text-[13px] font-medium text-[#5c6b5e] transition-colors hover:bg-[#f4efe7] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[10px] bg-[#d0bb95] px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#c2a571] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingAddress ? "Save Address" : "Create Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {addressToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a26]/35 p-4">
          <div className="w-full max-w-[480px] rounded-[24px] bg-white p-6">
            <h2
              className="text-[30px] leading-none text-[#2d2a26]"
              style={{ fontFamily: "var(--font-noto-serif)" }}
            >
              Delete address?
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[#5c6b5e]">
              This will remove the address for {addressToDelete.fullName}. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={isDeleting}
                className="inline-flex min-h-[42px] items-center justify-center rounded-[10px] px-4 text-[13px] font-medium text-[#5c6b5e] hover:bg-[#f4efe7] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAddress}
                disabled={isDeleting}
                className="inline-flex min-h-[42px] items-center justify-center rounded-[10px] bg-[#b91c1c] px-4 text-[13px] font-medium text-white hover:bg-[#991b1b] disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Address"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
      <ChatLive />
    </div>
  );
}
