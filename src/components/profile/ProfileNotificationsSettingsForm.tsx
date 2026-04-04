"use client";

import { useState, useEffect } from "react";
import {
  ProfileNotificationsPreference,
  ProfileNotificationsSection,
} from "@/lib/profile/types";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  isApiError,
} from "@/lib/api";

interface ProfileNotificationsSettingsFormProps {
  emailSection: ProfileNotificationsSection;
  pushSection: ProfileNotificationsSection;
  discardLabel: string;
  updateLabel: string;
}

interface NotificationPreferenceSectionProps {
  section: ProfileNotificationsSection;
  preferences: ProfileNotificationsPreference[];
  onToggle: (id: string) => void;
}

interface NotificationToggleButtonProps {
  enabled: boolean;
  onClick: () => void;
}

function NotificationToggleButton({
  enabled,
  onClick,
}: NotificationToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onClick}
      className={`relative h-6 w-[44px] shrink-0 rounded-full transition-all duration-300 ease-in-out hover:opacity-90 active:scale-95 ${
        enabled ? "bg-[#d0bb95]" : "bg-[#e5e7eb]"
      }`}
    >
      <span
        className={`absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function NotificationPreferenceSection({
  section,
  preferences,
  onToggle,
}: NotificationPreferenceSectionProps) {
  return (
    <section>
      <header>
        <h2
          className="text-[24px] font-light leading-8 text-[#4a3a3d]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {section.title}
        </h2>
        <p className="mt-2 text-[14px] font-light leading-5 text-[#5c6b5e]">
          {section.subtitle}
        </p>
      </header>

      <div className="mt-10 space-y-[31.75px]">
        {preferences.map((preference) => (
          <div
            key={preference.id}
            className="flex items-start justify-between gap-6"
          >
            <div className="max-w-[620px] pr-2">
              <p
                className="text-[18px] font-light leading-7 text-[#4a3a3d]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                {preference.label}
              </p>
              <p className="mt-1 text-[14px] font-light leading-[22.75px] text-[rgba(92,107,94,0.7)]">
                {preference.description}
              </p>
            </div>

            <NotificationToggleButton
              enabled={preference.enabled}
              onClick={() => onToggle(preference.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileNotificationsSettingsForm({
  emailSection,
  pushSection,
  discardLabel,
  updateLabel,
}: ProfileNotificationsSettingsFormProps) {
  const [emailPreferences, setEmailPreferences] = useState(
    emailSection.preferences.map((preference) => ({ ...preference }))
  );
  const [pushPreferences, setPushPreferences] = useState(
    pushSection.preferences.map((preference) => ({ ...preference }))
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
      const prefs = await getNotificationPreferences();
      
      setEmailPreferences((current) =>
        current.map((pref) => {
          if (pref.id === "order_updates") return { ...pref, enabled: prefs.emailOrderUpdates };
          if (pref.id === "seasonal_curations") return { ...pref, enabled: prefs.emailPromotions };
          if (pref.id === "boutique_news") return { ...pref, enabled: prefs.emailNewsletter };
          return pref;
        })
      );

      setPushPreferences((current) =>
        current.map((pref) => {
          if (pref.id === "delivery_alerts") return { ...pref, enabled: prefs.smsOrderUpdates };
          if (pref.id === "artist_updates") return { ...pref, enabled: prefs.pushArtistUpdates };
          return pref;
        })
      );
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    loadPreferences();
    setMessage(null);
  };

  const handleToggle = (
    sectionId: "email" | "push",
    preferenceId: string
  ) => {
    const updatePreferences = (preferences: ProfileNotificationsPreference[]) =>
      preferences.map((preference) =>
        preference.id === preferenceId
          ? { ...preference, enabled: !preference.enabled }
          : preference
      );

    if (sectionId === "email") {
      setEmailPreferences((current) => updatePreferences(current));
      return;
    }

    setPushPreferences((current) => updatePreferences(current));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const orderUpdates = emailPreferences.find((p) => p.id === "order_updates")?.enabled ?? true;
      const promotions = emailPreferences.find((p) => p.id === "seasonal_curations")?.enabled ?? true;
      const newsletter = emailPreferences.find((p) => p.id === "boutique_news")?.enabled ?? false;
      const smsUpdates = pushPreferences.find((p) => p.id === "delivery_alerts")?.enabled ?? false;
      const artistUpdates = pushPreferences.find((p) => p.id === "artist_updates")?.enabled ?? false;

      await updateNotificationPreferences({
        emailOrderUpdates: orderUpdates,
        emailPromotions: promotions,
        emailNewsletter: newsletter,
        smsOrderUpdates: smsUpdates,
        pushArtistUpdates: artistUpdates,
      });

      setMessage({ type: "success", text: "Notification preferences updated successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: isApiError(err) ? err.message : "Failed to update preferences.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[600px] animate-pulse rounded-[40px] bg-white/60" />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[40px] border border-white/40 bg-[rgba(255,255,255,0.4)] px-6 py-8 sm:px-8 xl:px-[48.8px] xl:py-[48.8px]"
    >
      <NotificationPreferenceSection
        section={emailSection}
        preferences={emailPreferences}
        onToggle={(id) => handleToggle("email", id)}
      />

      <div className="mt-[64.05px] border-t border-[rgba(92,107,94,0.12)]" />

      <div className="mt-[48px]">
        <NotificationPreferenceSection
          section={pushSection}
          preferences={pushPreferences}
          onToggle={(id) => handleToggle("push", id)}
        />
      </div>

      {message && (
        <p
          className={`mt-6 text-[13px] ${
            message.type === "success" ? "text-[#166534]" : "text-[#b91c1c]"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-[63.5px] flex flex-wrap justify-end gap-4 pt-8">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={saving}
          className="inline-flex min-h-[52px] min-w-[171px] items-center justify-center rounded-[12px] px-8 text-[14px] font-medium text-[#5c6b5e] transition-colors hover:bg-white/50 disabled:opacity-50"
        >
          {discardLabel}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[52px] min-w-[205px] items-center justify-center rounded-[12px] bg-[#d0bb95] px-10 text-[14px] font-medium text-white transition-colors hover:bg-[#c2a571] disabled:opacity-50"
        >
          {saving ? "Saving..." : updateLabel}
        </button>
      </div>
    </form>
  );
}
