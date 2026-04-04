"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  ProfilePreferencesGiftingSection,
  ProfilePreferencesRegionalSection,
  ProfilePreferencesRibbonColor,
  ProfilePreferencesSelectField,
  ProfilePreferencesToggleOption,
} from "@/lib/profile/types";
import {
  getUserPreferences,
  updateUserPreferences,
  isApiError,
} from "@/lib/api";

interface ProfilePreferencesSettingsFormProps {
  regionalSection: ProfilePreferencesRegionalSection;
  giftingSection: ProfilePreferencesGiftingSection;
  saveLabel: string;
  resetLabel: string;
}

interface PreferenceSelectFieldProps {
  field: ProfilePreferencesSelectField;
  value: string;
  onChange: (value: string) => void;
}

interface PreferenceToggleProps {
  option: ProfilePreferencesToggleOption;
  onToggle: (id: string) => void;
}

const fieldLabelClassName =
  "text-[11px] font-normal uppercase tracking-[1.1px] text-[#a8a29e]";
const fieldDescriptionClassName =
  "mt-[7.6px] text-[11px] font-light leading-[16.5px] text-[#a8a29e]";

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

function PreferenceToggle({ option, onToggle }: PreferenceToggleProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="max-w-[360px]">
        <p className="text-[14px] font-medium leading-5 text-[#44403c]">
          {option.label}
        </p>
        <p className="mt-0.5 text-[12px] font-light leading-4 text-[#a8a29e]">
          {option.description}
        </p>
      </div>

      <button
        type="button"
        aria-pressed={option.enabled}
        onClick={() => onToggle(option.id)}
        className={`relative mt-2 h-5 w-10 shrink-0 rounded-full transition-all duration-300 ease-in-out hover:opacity-90 active:scale-95 ${
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
  );
}

function RibbonColorOption({
  color,
  onSelect,
}: {
  color: ProfilePreferencesRibbonColor;
  onSelect: (id: string) => void;
}) {
  const selectedSwatchClassName = color.selected
    ? "border-[rgba(74,58,61,0.32)] shadow-[0_0_0_3px_rgba(208,187,149,0.20)]"
    : color.borderColor
      ? ""
      : "border-transparent";

  return (
    <button
      type="button"
      onClick={() => onSelect(color.id)}
      className="flex w-8 flex-col items-center"
    >
      <span
        className={`h-8 w-8 rounded-full border transition-transform duration-200 hover:scale-105 ${selectedSwatchClassName}`}
        style={{
          backgroundColor: color.color,
          borderColor: color.selected
            ? undefined
            : color.borderColor ?? "transparent",
        }}
      />
      <span
        className={`mt-2 text-center text-[10px] font-light leading-[15px] ${
          color.selected ? "text-[#57534e]" : "text-[#a8a29e]"
        }`}
      >
        {color.label}
      </span>
    </button>
  );
}

export function ProfilePreferencesSettingsForm({
  regionalSection,
  giftingSection,
  saveLabel,
  resetLabel,
}: ProfilePreferencesSettingsFormProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    Object.fromEntries(
      regionalSection.fields.map((field) => [field.id, field.value])
    )
  );
  const [toggleOptions, setToggleOptions] = useState(
    giftingSection.toggles.map((toggle) => ({ ...toggle }))
  );
  const [ribbonColors, setRibbonColors] = useState(
    giftingSection.ribbonColors.map((color) => ({ ...color }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await getUserPreferences();
      
      setFieldValues((current) => ({
        ...current,
        language: prefs.language,
        currency: prefs.currency.toLowerCase(),
        theme: prefs.theme,
        timezone: prefs.timezone,
      }));

      setToggleOptions((current) =>
        current.map((toggle) => {
          if (toggle.id === "signature_wrap") {
            return { ...toggle, enabled: prefs.signatureWrap };
          }
          if (toggle.id === "eco_delivery") {
            return { ...toggle, enabled: prefs.ecoDelivery };
          }
          return toggle;
        })
      );

      setRibbonColors((current) =>
        current.map((color) => ({
          ...color,
          selected: color.id === prefs.ribbonColor,
        }))
      );
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setFieldValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handleToggle = (toggleId: string) => {
    setToggleOptions((current) =>
      current.map((toggle) =>
        toggle.id === toggleId ? { ...toggle, enabled: !toggle.enabled } : toggle
      )
    );
  };

  const handleRibbonSelect = (colorId: string) => {
    setRibbonColors((current) =>
      current.map((color) => ({
        ...color,
        selected: color.id === colorId,
      }))
    );
  };

  const handleReset = () => {
    loadPreferences();
    setToggleOptions(giftingSection.toggles.map((toggle) => ({ ...toggle })));
    setRibbonColors(
      giftingSection.ribbonColors.map((color) => ({ ...color }))
    );
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const signatureWrapToggle = toggleOptions.find((t) => t.id === "signature_wrap");
      const ecoDeliveryToggle = toggleOptions.find((t) => t.id === "eco_delivery");
      const selectedRibbon = ribbonColors.find((c) => c.selected);

      await updateUserPreferences({
        language: fieldValues.language,
        currency: fieldValues.currency.toUpperCase(),
        theme: fieldValues.theme,
        timezone: fieldValues.timezone,
        signatureWrap: signatureWrapToggle?.enabled,
        ecoDelivery: ecoDeliveryToggle?.enabled,
        ribbonColor: selectedRibbon?.id,
      });

      setMessage({ type: "success", text: "Preferences saved successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: isApiError(err) ? err.message : "Failed to save preferences.",
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

      <section className="mt-20">
        <h2
          className="text-[20px] font-light leading-7 text-[#4a3a3d]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {giftingSection.title}
        </h2>

        <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,496px)_224px] xl:gap-16">
          <div>
            <div className="space-y-6">
              {toggleOptions.map((toggle) => (
                <PreferenceToggle
                  key={toggle.id}
                  option={toggle}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            <div className="mt-10">
              <p className={fieldLabelClassName}>{giftingSection.ribbonLabel}</p>
              <div className="mt-[16px] flex flex-wrap gap-4">
                {ribbonColors.map((color) => (
                  <RibbonColorOption
                    key={color.id}
                    color={color}
                    onSelect={handleRibbonSelect}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative h-[299px] overflow-hidden rounded-[24px] bg-[#f5f5f4]">
            <Image
              src={giftingSection.preview.image}
              alt={giftingSection.preview.alt}
              fill
              className="object-cover"
              sizes="224px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(45,42,38,0.30)] via-transparent to-transparent" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <span className="text-[9px] font-medium leading-[13.5px] tracking-[1.8px] text-[rgba(255,255,255,0.9)]">
                {giftingSection.preview.label}
              </span>
            </div>
          </div>
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
          {saving ? "Saving..." : saveLabel}
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
