"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { isApiError } from "@/lib/api";
import { SafeImage } from "@/components/common/SafeImage";
import {
  ProfileCommunicationPreference,
  ProfileSettingsAccountInfo,
} from "@/lib/profile/types";
import {
  getPhoneValidationMessage,
  normalizePhoneInput,
} from "@/lib/auth/validation";
import { useLocale } from "@/src/contexts";

interface ProfileSettingsFormProps {
  accountInfo: ProfileSettingsAccountInfo;
  communicationTitle: string;
  communicationSubtitle: string;
  communicationPreferences: ProfileCommunicationPreference[];
  cancelLabel: string;
  saveLabel: string;
  manageAddressesHref?: string;
  manageNotificationsHref?: string;
  onUploadAvatar?: (file: File) => Promise<string>;
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
  manageAddressesHref,
  manageNotificationsHref,
  onUploadAvatar,
  onSave,
}: ProfileSettingsFormProps) {
  const { t } = useLocale();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<AccountInfoFormState>({
    fullName: accountInfo.fullName,
    email: accountInfo.email,
    phone: accountInfo.phone,
    address: accountInfo.address,
  });
  const [avatarPreview, setAvatarPreview] = useState(accountInfo.photo);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [preferences, setPreferences] = useState(
    communicationPreferences.map((item) => ({ ...item }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>(null);
  const [avatarMessage, setAvatarMessage] = useState<SubmitMessage>(null);
  const phoneValidationMessage = formState.phone
    ? getPhoneValidationMessage(formState.phone)
    : null;

  // Sync form state when accountInfo changes (after save or reload)
  useEffect(() => {
    setFormState({
      fullName: accountInfo.fullName,
      email: accountInfo.email,
      phone: accountInfo.phone,
      address: accountInfo.address,
    });
    setAvatarPreview(accountInfo.photo);
  }, [accountInfo.fullName, accountInfo.email, accountInfo.phone, accountInfo.address, accountInfo.photo]);

  const handleCancel = () => {
    setFormState({
      fullName: accountInfo.fullName,
      email: accountInfo.email,
      phone: accountInfo.phone,
      address: accountInfo.address,
    });
    setAvatarPreview(accountInfo.photo);
    setPreferences(communicationPreferences.map((item) => ({ ...item })));
    setSubmitMessage(null);
    setAvatarMessage(null);
  };

  const handleOpenAvatarPicker = () => {
    if (isUploadingAvatar || !onUploadAvatar) {
      return;
    }

    avatarInputRef.current?.click();
  };

  const handleAvatarSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarMessage({
        tone: "error",
        text: t("profile.account.photoInvalidType"),
      });
      return;
    }

    if (!onUploadAvatar) {
      setAvatarMessage({
        tone: "error",
        text: t("profile.account.photoUploadError"),
      });
      return;
    }

    setAvatarMessage(null);
    setIsUploadingAvatar(true);
    try {
      const nextAvatarUrl = await onUploadAvatar(file);
      setAvatarPreview(nextAvatarUrl || accountInfo.photo);
      setAvatarMessage({
        tone: "success",
        text: t("profile.account.photoUpdated"),
      });
    } catch (error) {
      const missingAvatarEndpoint =
        isApiError(error) &&
        error.status === 404 &&
        (error.message.toLowerCase().includes("resource not found") ||
          error.message.includes("/api/auth/me/avatar"));

      setAvatarMessage({
        tone: "error",
        text: missingAvatarEndpoint
          ? t("profile.account.photoUploadEndpointMissing")
          : isApiError(error)
            ? error.message
            : t("profile.account.photoUploadError"),
      });
    } finally {
      setIsUploadingAvatar(false);
    }
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
        text: t("profile.account.fullNameRequired"),
      });
      return;
    }

    if (!phone) {
      setSubmitMessage({
        tone: "error",
        text: t("profile.account.phoneRequired"),
      });
      return;
    }

    const normalizedPhone = normalizePhoneInput(phone);
    const phoneError = getPhoneValidationMessage(normalizedPhone);
    if (phoneError) {
      setSubmitMessage({
        tone: "error",
        text: phoneError,
      });
      return;
    }

    if (!onSave) {
      setSubmitMessage({
        tone: "success",
        text: t("profile.account.settingsSaved"),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        fullName,
        phone: normalizedPhone,
        address: formState.address.trim(),
        communicationPreferences: preferences,
      });
      
      // Don't reset form state here - let useEffect handle it when accountInfo updates
      setSubmitMessage({
        tone: "success",
        text: t("profile.account.settingsUpdated"),
      });
    } catch (error) {
      setSubmitMessage({
        tone: "error",
        text: isApiError(error)
          ? error.message
          : t("profile.account.saveError"),
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
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={isUploadingAvatar || !onUploadAvatar}
          onChange={handleAvatarSelected}
        />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            <SafeImage
              src={avatarPreview}
              alt={accountInfo.fullName}
              fill
              fallbackSrc="/images/hero-main.png"
              sizes="96px"
              className="object-cover"
            />

            <button
              type="button"
              onClick={handleOpenAvatarPicker}
              disabled={!onUploadAvatar || isUploadingAvatar}
              className="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-[#8d6030] text-white shadow-sm transition-colors hover:bg-[#754f28] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={t("profile.account.changePhoto")}
              title={t("profile.account.changePhoto")}
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>

          <p className="w-fit text-[12px] font-normal uppercase tracking-[1.2px] text-[#ceb994]">
            {isUploadingAvatar
              ? t("profile.account.uploadingPhoto")
              : accountInfo.changePhotoLabel}
          </p>
        </div>

        <p className="mt-2 text-[11px] text-[rgba(92,107,94,0.8)]">
          PNG, JPG, WebP. Bam icon tren avatar de chon va tai len anh moi.
        </p>

        {avatarMessage ? (
          <p
            className={`mt-3 text-[12px] ${
              avatarMessage.tone === "success" ? "text-[#166534]" : "text-[#b91c1c]"
            }`}
          >
            {avatarMessage.text}
          </p>
        ) : null}

        <div className="mt-8 grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,371.5px)_minmax(0,371.5px)] lg:justify-between">
          <ProfileField
            label={t("profile.account.field.fullName")}
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
              label={t("profile.account.field.email")}
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
              {t("profile.account.field.emailNote")}
            </p>
          </div>
          <div>
            <ProfileField
              label={t("profile.account.field.phone")}
              type="tel"
              value={formState.phone}
              onChange={(phone) =>
                setFormState((current) => ({
                  ...current,
                  phone: normalizePhoneInput(phone),
                }))
              }
            />
            <p className={`mt-2 px-1 text-[11px] ${phoneValidationMessage ? "text-[#b91c1c]" : "text-[rgba(92,107,94,0.8)]"}`}>
              {phoneValidationMessage || t("profile.account.field.phoneHint")}
            </p>
          </div>
          <ProfileTextareaField
            label={t("profile.account.field.primaryAddress")}
            value={formState.address}
            onChange={(address) =>
              setFormState((current) => ({
                ...current,
                address,
              }))
            }
          />
          {manageAddressesHref ? (
            <div className="lg:col-start-2 -mt-4 px-1 text-[11px] text-[rgba(92,107,94,0.8)]">
              {t("profile.account.addressManagementPrompt")}
              <Link
                href={manageAddressesHref}
                className="ml-1 font-medium text-[#5c6b5e] underline underline-offset-2 hover:text-[#2d2a26]"
              >
                {t("profile.account.openAddressBook")}
              </Link>
            </div>
          ) : null}
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

        {preferences.length > 0 ? (
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
        ) : (
          <div className="mt-8 rounded-[24px] border border-[rgba(92,107,94,0.12)] bg-white/45 px-5 py-5 text-[#5c6b5e]">
            <p className="text-[13px] leading-6">
              {t("profile.account.notificationsInfo")}
            </p>
            {manageNotificationsHref ? (
              <Link
                href={manageNotificationsHref}
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[rgba(208,187,149,0.45)] px-5 text-[12px] font-semibold uppercase tracking-[1px] text-[#c7ab78] transition-colors hover:bg-white/50"
              >
                {t("profile.account.manageNotifications")}
              </Link>
            ) : null}
          </div>
        )}
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
          {isSubmitting ? t("profile.common.saving") : saveLabel}
        </button>
      </div>
    </form>
  );
}
