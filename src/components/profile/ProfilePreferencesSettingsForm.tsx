"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import {
  ProfilePreferencesRegionalSection,
  ProfilePreferencesSelectField,
} from "@/lib/profile/types";
import {
  getUserPreferences,
  updateUserPreferences,
  isApiError,
} from "@/lib/api";
import { normalizeLocale } from "@/lib/i18n/messages";
import { useLocale } from "@/src/contexts";

interface ProfilePreferencesSettingsFormProps {
  regionalSection: ProfilePreferencesRegionalSection;
  saveLabel: string;
  resetLabel: string;
}

interface PreferenceSelectFieldProps {
  field: ProfilePreferencesSelectField;
  value: string;
  onChange: (value: string) => void;
}

const fieldLabelClassName =
  "text-[11px] font-normal uppercase tracking-[1.1px] text-[#a8a29e]";
const fieldDescriptionClassName =
  "mt-[7.6px] text-[11px] font-light leading-[16.5px] text-[#a8a29e]";

function currencyFromLanguage(language: string): "USD" | "VND" {
  return language === "vi" ? "VND" : "USD";
}

function PreferenceSelectField({
  field,
  value,
  onChange,
}: PreferenceSelectFieldProps) {
  return (
    <label className="block">
      <span className={fieldLabelClassName}>{field.label}</span>
      <div className="relative mt-[8px]">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full appearance-none rounded-[12px] border border-[rgba(168,162,158,0.28)] bg-[rgba(255,255,255,0.68)] px-[17px] pr-12 text-[14px] font-normal leading-5 text-[#2d2a26] outline-none transition-colors focus:border-[rgba(45,42,38,0.24)] focus:ring-0"
        >
          {field.options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#2d2a26]" />
      </div>
      <p className={fieldDescriptionClassName}>{field.description}</p>
    </label>
  );
}

export function ProfilePreferencesSettingsForm({
  regionalSection,
  saveLabel,
  resetLabel,
}: ProfilePreferencesSettingsFormProps) {
  const { setLocale, t } = useLocale();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(
      regionalSection.fields.map((field) => [field.id, field.value])
    )
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const prefs = await getUserPreferences();
      
      setFieldValues((current) => ({
        ...current,
        language: prefs.language,
        theme: prefs.theme,
        timezone: prefs.timezone,
      }));
      setLocale(normalizeLocale(prefs.language));
    } catch (err) {
      setMessage({
        type: "error",
        text: isApiError(err) ? err.message : t("profile.preferences.loadError"),
      });
    } finally {
      setLoading(false);
    }
  }, [setLocale, t]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handleReset = () => {
    loadPreferences();
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const language = normalizeLocale(fieldValues.language);
      await updateUserPreferences({
        language,
        currency: currencyFromLanguage(language),
        theme: fieldValues.theme,
        timezone: fieldValues.timezone,
      });

      setLocale(language);
      setMessage({ type: "success", text: t("profile.preferences.saved") });
    } catch (err) {
      setMessage({
        type: "error",
        text: isApiError(err) ? err.message : t("profile.preferences.saveError"),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] animate-pulse rounded-[24px] bg-white/60" />
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <section>
        <h2
          className="text-[20px] font-light leading-7 text-[#4a3a3d]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {regionalSection.title}
        </h2>

        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {regionalSection.fields.map((field) => (
            <PreferenceSelectField
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? field.value}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}
        </div>
      </section>

      {message && (
        <p
          className={`mt-6 text-[13px] ${
            message.type === "success" ? "text-[#166534]" : "text-[#b91c1c]"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-8 pt-10">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[44px] min-w-[195px] items-center justify-center rounded-[8px] bg-[#2d2a26] px-8 text-[12px] font-medium uppercase tracking-[1.8px] text-white transition-colors hover:bg-[#3a342f] disabled:opacity-50"
        >
          {saving ? t("profile.common.saving") : saveLabel}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
          className="text-[12px] font-medium uppercase tracking-[1.8px] text-[#a8a29e] transition-colors hover:text-[#7c736a] disabled:opacity-50"
        >
          {resetLabel}
        </button>
      </div>
    </form>
  );
}
