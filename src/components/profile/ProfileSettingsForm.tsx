"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { isApiError } from "@/lib/api";
import {
  ProfileCommunicationPreference,
  ProfileSettingsAccountInfo,
} from "@/lib/profile/types";

interface ProfileSettingsFormProps {
  accountInfo: ProfileSettingsAccountInfo;
  communicationTitle: string;
  communicationSubtitle: string;
  communicationPreferences: ProfileCommunicationPreference[];
  cancelLabel: string;
  saveLabel: string;
  onSave?: (payload: SaveProfileSettingsPayload) => Promise<void>;
}

interface AccountInfoFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface SaveProfileSettingsPayload {
  fullName: string;
  phone: string;
  address?: string;
  communicationPreferences: ProfileCommunicationPreference[];
}

type SubmitMessage = {
  tone: "success" | "error";
  text: string;
} | null;

const fieldLabelClassName =
  "px-1 text-[12px] font-bold uppercase tracking-[0.6px] text-[rgba(92,107,94,0.6)]";
const inputFrameClassName =
  "mt-[11px] flex h-[45px] items-center rounded-[11.9px] border border-[rgba(92,107,94,0.14)] bg-[rgba(255,255,255,0.5)] px-[16.7px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]";
const textInputClassName =
  "h-5 w-full appearance-none border-0 bg-transparent p-0 text-[13.994px] font-light leading-5 text-[#2d2a26] outline-none shadow-none ring-0 placeholder:text-[#2d2a26] focus:outline-none focus:ring-0";
const textareaFrameClassName =
  "mt-[11px] rounded-[11.9px] border border-[rgba(92,107,94,0.14)] bg-[rgba(255,255,255,0.5)] px-[17px] py-[12.8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]";

interface ProfileFieldProps {
  label: string;
  type: "text" | "email" | "tel";
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

function ProfileField({
  label,
  type,
  value,
  onChange,
  readOnly = false,
}: ProfileFieldProps) {
  return (
    <label className="block">
      <span className={fieldLabelClassName}>{label}</span>
      <div className={inputFrameClassName}>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className={`${textInputClassName} ${readOnly ? "cursor-not-allowed opacity-60" : ""}`}
        />
      </div>
    </label>
  );
}

interface ProfileTextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ProfileTextareaField({
  label,
  value,
  onChange,
}: ProfileTextareaFieldProps) {
  return (
    <label className="block">
      <span className={fieldLabelClassName}>{label}</span>
      <div className={textareaFrameClassName}>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="h-20 w-full resize-none appearance-none border-0 bg-transparent p-0 text-[13.994px] font-light leading-5 text-[#2d2a26] outline-none shadow-none ring-0 focus:outline-none focus:ring-0"
        />
      </div>
    </label>
  );
}

export function ProfileSettingsForm({
  accountInfo,
  communicationTitle,
  communicationSubtitle,
  communicationPreferences,
  cancelLabel,
  saveLabel,
  onSave,
}: ProfileSettingsFormProps) {
  const [formState, setFormState] = useState<AccountInfoFormState>({
    fullName: accountInfo.fullName,
    email: accountInfo.email,
    phone: accountInfo.phone,
    address: accountInfo.address,
  });
  const [preferences, setPreferences] = useState(
    communicationPreferences.map((item) => ({ ...item }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>(null);

  // Sync form state when accountInfo changes (after save or reload)
  useEffect(() => {
    setFormState({
      fullName: accountInfo.fullName,
      email: accountInfo.email,
      phone: accountInfo.phone,
      address: accountInfo.address,
    });
  }, [accountInfo.fullName, accountInfo.email, accountInfo.phone, accountInfo.address]);

  const handleCancel = () => {
    setFormState({
      fullName: accountInfo.fullName,
      email: accountInfo.email,
      phone: accountInfo.phone,
      address: accountInfo.address,
    });
    setPreferences(communicationPreferences.map((item) => ({ ...item })));
    setSubmitMessage(null);
  };

  const handlePreferenceToggle = (id: string) => {
    setPreferences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);

    const fullName = formState.fullName.trim();
    const phone = formState.phone.trim();

    if (!fullName) {
      setSubmitMessage({
        tone: "error",
        text: "Full name is required.",
      });
      return;
    }

    if (!phone) {
      setSubmitMessage({
        tone: "error",
        text: "Phone number is required.",
      });
      return;
    }

    if (!onSave) {
      setSubmitMessage({
        tone: "success",
        text: "Settings saved.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName,
        phone,
        address: formState.address.trim(),
        communicationPreferences: preferences,
      });
      
      // Don't reset form state here - let useEffect handle it when accountInfo updates
      setSubmitMessage({
        tone: "success",
        text: "Account settings updated successfully.",
      });
    } catch (error) {
      setSubmitMessage({
        tone: "error",
        text: isApiError(error)
          ? error.message
          : "Unable to save settings right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[40px] border border-white/40 bg-[rgba(255,255,255,0.4)] px-6 py-8 sm:px-8 xl:px-[49px] xl:py-[49px]"
    >
      <section id="account-info">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Image
              src={accountInfo.photo}
              alt={accountInfo.fullName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <button
            type="button"
            className="w-fit text-[12px] font-normal uppercase tracking-[1.2px] text-[#ceb994]"
          >
            {accountInfo.changePhotoLabel}
          </button>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,371.5px)_minmax(0,371.5px)] lg:justify-between">
          <ProfileField
            label="Full Name"
            type="text"
            value={formState.fullName}
            onChange={(fullName) =>
              setFormState((current) => ({
                ...current,
                fullName,
              }))
            }
          />
          <div>
            <ProfileField
              label="Email Address"
              type="email"
              value={formState.email}
              onChange={(email) =>
                setFormState((current) => ({
                  ...current,
                  email,
                }))
              }
              readOnly
            />
            <p className="mt-2 px-1 text-[11px] text-[rgba(92,107,94,0.7)]">
              Email cannot be changed from this screen.
            </p>
          </div>
          <ProfileField
            label="Phone Number"
            type="tel"
            value={formState.phone}
            onChange={(phone) =>
              setFormState((current) => ({
                ...current,
                phone,
              }))
            }
          />
          <ProfileTextareaField
            label="Primary Address"
            value={formState.address}
            onChange={(address) =>
              setFormState((current) => ({
                ...current,
                address,
              }))
            }
          />
        </div>
      </section>

      <div className="mt-10 border-t border-[rgba(92,107,94,0.12)]" />

      <section id="communication-preferences" className="mt-10">
        <h2
          className="text-[24px] font-normal leading-8 text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {communicationTitle}
        </h2>
        <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
          {communicationSubtitle}
        </p>

        <div className="mt-8 space-y-6">
          {preferences.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-6"
            >
              <div className="max-w-[540px]">
                <p className="text-[14px] font-medium leading-5 text-[#2d2a26]">
                  {item.label}
                </p>
                <p className="mt-1 text-[12px] font-light leading-4 text-[rgba(92,107,94,0.7)]">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                aria-pressed={item.enabled}
                onClick={() => handlePreferenceToggle(item.id)}
                className={`relative h-5 w-10 shrink-0 rounded-full transition-all duration-300 ease-in-out hover:opacity-90 active:scale-95 ${
                  item.enabled ? "bg-[#d0bb95]" : "bg-[#e7e5e4]"
                }`}
              >
                <span
                  className={`absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                    item.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {submitMessage ? (
        <p
          className={`mt-8 text-[13px] ${
            submitMessage.tone === "success" ? "text-[#166534]" : "text-[#b91c1c]"
          }`}
        >
          {submitMessage.text}
        </p>
      ) : null}

      <div id="account-actions" className="mt-10 flex flex-wrap justify-end gap-4">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex min-h-[53px] items-center justify-center rounded-xl px-8 text-[14px] font-medium text-[#5b6a5d] transition-colors hover:bg-white/50"
        >
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[53px] items-center justify-center rounded-xl bg-[#d0bb96] px-10 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : saveLabel}
        </button>
      </div>
    </form>
  );
}
