"use client";

import { useState } from "react";
import { isApiError } from "@/lib/api";
import {
  ProfileSecurityPasswordField,
  ProfileSecurityToggleOption,
} from "@/lib/profile/types";

interface ProfileSecuritySettingsFormProps {
  passwordSectionTitle: string;
  passwordSectionSubtitle: string;
  passwordFields: ProfileSecurityPasswordField[];
  updatePasswordLabel: string;
  twoFactorTitle: string;
  twoFactorSubtitle: string;
  twoFactorOptions: ProfileSecurityToggleOption[];
  cancelLabel: string;
  saveLabel: string;
  onUpdatePassword?: (payload: UpdatePasswordPayload) => Promise<void>;
  onSaveTwoFactor?: (options: ProfileSecurityToggleOption[]) => Promise<void>;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type FormMessage = {
  tone: "success" | "error";
  text: string;
} | null;

const fieldLabelClassName =
  "px-1 text-[12px] font-bold uppercase tracking-[0.6px] text-[rgba(92,107,94,0.6)]";
const inputFrameClassName =
  "mt-3 flex h-[46px] items-center rounded-[12px] border border-[rgba(92,107,94,0.14)] bg-[rgba(255,255,255,0.5)] px-[16.8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]";
const inputClassName =
  "h-5 w-full appearance-none border-0 bg-transparent p-0 text-[14px] font-light leading-5 text-[#2d2a26] outline-none shadow-none ring-0 placeholder:text-[#9ca3af] focus:outline-none focus:ring-0";

interface SecurityPasswordFieldProps {
  field: ProfileSecurityPasswordField;
  value: string;
  onChange: (value: string) => void;
}

function SecurityPasswordField({
  field,
  value,
  onChange,
}: SecurityPasswordFieldProps) {
  return (
    <label className="block">
      <span className={fieldLabelClassName}>{field.label}</span>
      <div className={inputFrameClassName}>
        <input
          type="password"
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
        />
      </div>
    </label>
  );
}

export function ProfileSecuritySettingsForm({
  passwordSectionTitle,
  passwordSectionSubtitle,
  passwordFields,
  updatePasswordLabel,
  twoFactorTitle,
  twoFactorSubtitle,
  twoFactorOptions,
  cancelLabel,
  saveLabel,
  onUpdatePassword,
  onSaveTwoFactor,
}: ProfileSecuritySettingsFormProps) {
  const [passwordState, setPasswordState] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorState, setTwoFactorState] = useState(
    twoFactorOptions.map((option) => ({ ...option }))
  );
  const [passwordMessage, setPasswordMessage] = useState<FormMessage>(null);
  const [settingsMessage, setSettingsMessage] = useState<FormMessage>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleCancel = () => {
    setPasswordState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTwoFactorState(twoFactorOptions.map((option) => ({ ...option })));
    setPasswordMessage(null);
    setSettingsMessage(null);
  };

  const handlePasswordChange = (id: string, value: string) => {
    setPasswordState((current) => {
      if (id === "current-password") {
        return { ...current, currentPassword: value };
      }

      if (id === "new-password") {
        return { ...current, newPassword: value };
      }

      return { ...current, confirmPassword: value };
    });
  };

  const handleToggle = (id: string) => {
    setTwoFactorState((current) =>
      current.map((option) =>
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const getPasswordValue = (id: string) => {
    if (id === "current-password") {
      return passwordState.currentPassword;
    }

    if (id === "new-password") {
      return passwordState.newPassword;
    }

    return passwordState.confirmPassword;
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage(null);

    const currentPassword = passwordState.currentPassword.trim();
    const newPassword = passwordState.newPassword.trim();
    const confirmPassword = passwordState.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({
        tone: "error",
        text: "Please fill all password fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        tone: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        tone: "error",
        text: "New password and confirm password do not match.",
      });
      return;
    }

    if (!onUpdatePassword) {
      setPasswordMessage({
        tone: "success",
        text: "Password updated.",
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await onUpdatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage({
        tone: "success",
        text: "Password updated successfully.",
      });
    } catch (error) {
      setPasswordMessage({
        tone: "error",
        text: isApiError(error)
          ? error.message
          : "Unable to update password right now.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage(null);

    if (!onSaveTwoFactor) {
      setSettingsMessage({
        tone: "success",
        text: "Security preferences saved.",
      });
      return;
    }

    setIsSavingSettings(true);
    try {
      await onSaveTwoFactor(twoFactorState);
      setSettingsMessage({
        tone: "success",
        text: "Security preferences saved.",
      });
    } catch (error) {
      setSettingsMessage({
        tone: "error",
        text: isApiError(error)
          ? error.message
          : "Unable to save security preferences right now.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[40px] border border-white/40 bg-[rgba(255,255,255,0.4)] px-6 py-8 sm:px-8 xl:px-[48.8px] xl:py-[48.8px]"
    >
      <section id="change-password">
        <header>
          <h2
            className="text-[24px] font-normal leading-8 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {passwordSectionTitle}
          </h2>
          <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
            {passwordSectionSubtitle}
          </p>
        </header>

        <div className="mt-8 grid gap-y-8">
          <SecurityPasswordField
            field={passwordFields[0]}
            value={getPasswordValue(passwordFields[0].id)}
            onChange={(value) =>
              handlePasswordChange(passwordFields[0].id, value)
            }
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,377px)_minmax(0,377px)] lg:justify-between">
            {passwordFields.slice(1).map((field) => (
              <SecurityPasswordField
                key={field.id}
                field={field}
                value={getPasswordValue(field.id)}
                onChange={(value) => handlePasswordChange(field.id, value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="button"
            disabled={isUpdatingPassword}
            onClick={() => {
              void handleUpdatePassword();
            }}
            className="inline-flex min-h-[52px] min-w-[175px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUpdatingPassword ? "Updating..." : updatePasswordLabel}
          </button>
        </div>

        {passwordMessage ? (
          <p
            className={`mt-5 text-[13px] ${
              passwordMessage.tone === "success"
                ? "text-[#166534]"
                : "text-[#b91c1c]"
            }`}
          >
            {passwordMessage.text}
          </p>
        ) : null}
      </section>

      <div className="mt-16 border-t border-[rgba(92,107,94,0.12)]" />

      <section id="two-factor-authentication" className="mt-12">
        <header>
          <h2
            className="text-[24px] font-normal leading-8 text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {twoFactorTitle}
          </h2>
          <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
            {twoFactorSubtitle}
          </p>
        </header>

        <div className="mt-8 space-y-6">
          {twoFactorState.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between gap-6"
            >
              <div className="max-w-[318px]">
                <p className="text-[14px] font-medium leading-5 text-[#2d2a26]">
                  {option.label}
                </p>
                <p className="mt-1 text-[12px] font-light leading-4 text-[rgba(92,107,94,0.7)]">
                  {option.description}
                </p>
              </div>

              <button
                type="button"
                aria-pressed={option.enabled}
                onClick={() => handleToggle(option.id)}
                className={`relative h-5 w-10 shrink-0 rounded-full transition-all duration-300 ease-in-out hover:opacity-90 active:scale-95 ${
                  option.enabled ? "bg-[#d0bb95]" : "bg-[#e7e5e4]"
                }`}
              >
                <span
                  className={`absolute left-1 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-transform duration-300 ease-in-out ${
                    option.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {settingsMessage ? (
        <p
          className={`mt-8 text-[13px] ${
            settingsMessage.tone === "success"
              ? "text-[#166534]"
              : "text-[#b91c1c]"
          }`}
        >
          {settingsMessage.text}
        </p>
      ) : null}

      <div
        id="security-actions"
        className="mt-16 flex flex-wrap justify-end gap-4"
      >
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex min-h-[52px] min-w-[108px] items-center justify-center rounded-[12px] px-8 text-[14px] font-medium text-[#5b6a5d] transition-colors hover:bg-white/50"
        >
          {cancelLabel}
        </button>
        <button
          type="submit"
          disabled={isSavingSettings}
          className="inline-flex min-h-[52px] min-w-[172px] items-center justify-center rounded-[12px] bg-[#d0bb96] px-10 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSavingSettings ? "Saving..." : saveLabel}
        </button>
      </div>
    </form>
  );
}
