"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import {
  X,
  CheckCircle2,
  ClipboardList,
  Flower2,
  LayoutDashboard,
  MoreVertical,
  Package2,
  Settings,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import {
  adminCollaboratorsApi,
  getNotificationPreferences,
  getUserPreferences,
  isApiError,
  updateNotificationPreferences,
  updateUserPreferences,
} from "@/lib/api";
import type {
  AdminCollaboratorDTO,
  AdminUserDTO,
  CollaboratorBadge,
  NotificationPreferencesDTO,
} from "@/lib/api/types";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

type Badge = "Admin" | "Staff";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  positionTitle: string;
  positionDescription: string | null;
  badge: Badge;
  initials: string;
  avatar: string | null;
}

interface NotifPref {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface SettingsSnapshot {
  storeName: string;
  contactEmail: string;
  currency: string;
  bio: string;
  logoUrl: string;
  notifications: NotifPref[];
}

interface SettingsCacheEntry {
  userId: string;
  expiresAt: number;
  snapshot: SettingsSnapshot;
  team: TeamMember[];
}

const FALLBACK_AVATARS = [
  "/images/avatar-minh-quan.png",
  "/images/avatar-elena-rossi.png",
  "/images/avatar-samuel-thorne.png",
];

const CURRENCIES = [
  "USD ($) - US Dollar",
  "VND (₫) - Vietnamese Dong",
  "EUR (€) - Euro",
  "GBP (£) - British Pound",
];

const DEFAULT_BIO =
  "Where wild blooms meet curated elegance. Our boutique specializes in rare seasonal arrangements and botanical artistry.";
const SETTINGS_CACHE_TTL_MS = 60_000;
let settingsCache: SettingsCacheEntry | null = null;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
        on ? "bg-[#52634c]" : "bg-[#d6d3d1]"
      }`}
    >
      <span
        className={`mt-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function BadgePill({ badge }: { badge: Badge }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[-0.5px] ${
        badge === "Admin" ? "bg-[#d2e5c8] text-[#52634c]" : "bg-[#efd4c6] text-[#6e5a4f]"
      }`}
    >
      {badge}
    </span>
  );
}

function AccessStateCard({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-[980px] rounded-[24px] border border-[#ebe5de] bg-[#fbfaf8] px-8 py-16 text-center">
        <h1
          className="text-[38px] leading-[1.1] text-[#2d2a26]"
          style={{ fontFamily: "var(--font-noto-serif)" }}
        >
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-7 text-[#5c6b5e]">
          {description}
        </p>
        {action ? <div className="mt-9">{action}</div> : null}
      </div>
    </div>
  );
}

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");
}

function toTeamMembers(collaborators: AdminCollaboratorDTO[]): TeamMember[] {
  return collaborators.map((member, index) => ({
    id: member.id,
    name: member.fullName,
    email: member.email?.trim() || "No email",
    positionTitle:
      member.positionTitle?.trim() ||
      (member.badge === "ADMIN" ? "Shop Administrator" : "Shop Staff"),
    positionDescription: member.positionDescription?.trim() || null,
    badge: member.badge === "ADMIN" ? "Admin" : "Staff",
    initials: getInitials(member.fullName || "Admin"),
    avatar: FALLBACK_AVATARS[index % FALLBACK_AVATARS.length] ?? null,
  }));
}

function currencyToCode(value: string): string {
  if (value.startsWith("USD")) {
    return "USD";
  }
  if (value.startsWith("VND")) {
    return "VND";
  }
  if (value.startsWith("EUR")) {
    return "EUR";
  }
  if (value.startsWith("GBP")) {
    return "GBP";
  }
  return "VND";
}

function codeToCurrencyLabel(value: string): string {
  return CURRENCIES.find((currency) => currency.startsWith(value)) ?? CURRENCIES[1];
}

function mapErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("no static resource api/admin/users") ||
      lower.includes("no static resource api/admin/collaborators")
    ) {
      return "Backend chưa nạp endpoint Team Access mới. Restart BE để bật đầy đủ tính năng collaborator.";
    }
    return error.message;
  }
  return fallback;
}

function notificationDtoToState(value: NotificationPreferencesDTO): NotifPref[] {
  return [
    {
      id: "emailOrderUpdates",
      title: "Order Success Alerts",
      description: "Receive instant push notification for every new order.",
      enabled: value.emailOrderUpdates,
    },
    {
      id: "emailNewsletter",
      title: "Daily Boutique Digest",
      description: "Summary of sales and stock levels every morning at 8:00 AM.",
      enabled: value.emailNewsletter,
    },
    {
      id: "pushArtistUpdates",
      title: "Inventory Low-Stock Warning",
      description: "Alert when specific flower varieties drop below set thresholds.",
      enabled: value.pushArtistUpdates,
    },
  ];
}

function notificationStateToPayload(notifs: NotifPref[]): NotificationPreferencesDTO {
  const map = Object.fromEntries(notifs.map((item) => [item.id, item.enabled]));

  return {
    emailOrderUpdates: Boolean(map.emailOrderUpdates),
    emailPromotions: true,
    emailNewsletter: Boolean(map.emailNewsletter),
    smsOrderUpdates: false,
    pushArtistUpdates: Boolean(map.pushArtistUpdates),
  };
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[1]);
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [notifs, setNotifs] = useState<NotifPref[]>([
    {
      id: "emailOrderUpdates",
      title: "Order Success Alerts",
      description: "Receive instant push notification for every new order.",
      enabled: true,
    },
    {
      id: "emailNewsletter",
      title: "Daily Boutique Digest",
      description: "Summary of sales and stock levels every morning at 8:00 AM.",
      enabled: false,
    },
    {
      id: "pushArtistUpdates",
      title: "Inventory Low-Stock Warning",
      description: "Alert when specific flower varieties drop below set thresholds.",
      enabled: true,
    },
  ]);
  const [logoUrl, setLogoUrl] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsSnapshot | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteCandidates, setInviteCandidates] = useState<AdminUserDTO[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [selectedInviteUserId, setSelectedInviteUserId] = useState("");
  const [inviteBadge, setInviteBadge] = useState<CollaboratorBadge>("STAFF");
  const [invitePositionTitle, setInvitePositionTitle] = useState("");
  const [invitePositionDescription, setInvitePositionDescription] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [openMenuMemberId, setOpenMenuMemberId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editBadge, setEditBadge] = useState<CollaboratorBadge>("STAFF");
  const [editPositionTitle, setEditPositionTitle] = useState("");
  const [editPositionDescription, setEditPositionDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  const hasChanges = useMemo(() => {
    if (!savedSnapshot) {
      return false;
    }

    return JSON.stringify(savedSnapshot) !== JSON.stringify({
      storeName,
      contactEmail,
      currency,
      bio,
      logoUrl,
      notifications: notifs,
    });
  }, [bio, contactEmail, currency, logoUrl, notifs, savedSnapshot, storeName]);

  const refreshSettingsCache = (snapshot: SettingsSnapshot, teamValue: TeamMember[]) => {
    if (!user) {
      return;
    }

    settingsCache = {
      userId: String(user.id),
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
      snapshot,
      team: teamValue,
    };
  };

  const loadTeamAccess = useCallback(
    async (userId: string, fallbackUserName: string, fallbackUserEmail: string): Promise<TeamMember[]> => {
      try {
        const collaborators = await adminCollaboratorsApi.getCollaborators();
        const nextTeam = toTeamMembers(collaborators);
        if (nextTeam.length === 0) {
          return [
            {
              id: Number(userId) || 1,
              name: fallbackUserName,
              email: fallbackUserEmail?.trim() || "No email",
              positionTitle: "Shop Administrator",
              positionDescription: null,
              badge: "Admin",
              initials: getInitials(fallbackUserName || "Admin"),
              avatar: FALLBACK_AVATARS[0],
            },
          ];
        }
        return nextTeam;
      } catch (error) {
        setTeamError(mapErrorMessage(error, "Unable to load collaborator team list right now."));
        return [
          {
            id: Number(userId) || 1,
            name: fallbackUserName,
            email: fallbackUserEmail?.trim() || "No email",
            positionTitle: "Shop Administrator",
            positionDescription: null,
            badge: "Admin",
            initials: getInitials(fallbackUserName || "Admin"),
            avatar: FALLBACK_AVATARS[0],
          },
        ];
      }
    },
    []
  );

  const refreshTeamAccessState = async () => {
    if (!user) {
      return;
    }
    const nextTeam = await loadTeamAccess(String(user.id), user.fullName, user.email);
    setTeam(nextTeam);
    setTeamError(null);
    if (savedSnapshot) {
      refreshSettingsCache(savedSnapshot, nextTeam);
    }
  };

  const openInviteModal = async () => {
    setOpenMenuMemberId(null);
    setInviteModalOpen(true);
    setInviteError(null);
    setInviteSuccess(null);
    setSelectedInviteUserId("");
    setInviteBadge("STAFF");
    setInvitePositionTitle("");
    setInvitePositionDescription("");
    setInviteCandidates([]);
    setInviteLoading(true);

    try {
      const users = await adminCollaboratorsApi.getInviteCandidates();
      setInviteCandidates(users);
      if (users.length > 0) {
        setSelectedInviteUserId(String(users[0].id));
      }
    } catch (error) {
      setInviteError(mapErrorMessage(error, "Unable to load user list for invitation."));
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInviteModal = () => {
    setInviteModalOpen(false);
    setInviteError(null);
    setInviteSuccess(null);
    setInviteCandidates([]);
    setSelectedInviteUserId("");
    setInviteBadge("STAFF");
    setInvitePositionTitle("");
    setInvitePositionDescription("");
  };

  const handleInviteCollaborator = async () => {
    if (!user) {
      return;
    }

    if (!selectedInviteUserId) {
      setInviteError("Please choose a user to invite.");
      return;
    }

    const inviteUserId = Number(selectedInviteUserId);
    if (Number.isNaN(inviteUserId)) {
      setInviteError("Selected user is invalid.");
      return;
    }
    if (!invitePositionTitle.trim()) {
      setInviteError("Please enter collaborator position title.");
      return;
    }

    setInviteSubmitting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await adminCollaboratorsApi.inviteCollaborator({
        userId: inviteUserId,
        badge: inviteBadge,
        positionTitle: invitePositionTitle.trim(),
        positionDescription: invitePositionDescription.trim() || undefined,
      });
      await refreshTeamAccessState();

      const usersAfterInvite = inviteCandidates.filter((candidate) => candidate.id !== inviteUserId);
      setInviteCandidates(usersAfterInvite);
      setSelectedInviteUserId(usersAfterInvite.length > 0 ? String(usersAfterInvite[0].id) : "");
      setInvitePositionTitle("");
      setInvitePositionDescription("");
      setInviteBadge("STAFF");
      setInviteSuccess("Collaborator invited successfully.");
    } catch (error) {
      setInviteError(mapErrorMessage(error, "Unable to invite selected collaborator."));
    } finally {
      setInviteSubmitting(false);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setOpenMenuMemberId(null);
    setEditingMember(member);
    setEditBadge(member.badge === "Admin" ? "ADMIN" : "STAFF");
    setEditPositionTitle(member.positionTitle);
    setEditPositionDescription(member.positionDescription ?? "");
    setEditError(null);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingMember(null);
    setEditBadge("STAFF");
    setEditPositionTitle("");
    setEditPositionDescription("");
    setEditSubmitting(false);
    setEditError(null);
  };

  const handleUpdateCollaborator = async () => {
    if (!editingMember) {
      return;
    }
    if (!editPositionTitle.trim()) {
      setEditError("Please enter collaborator position title.");
      return;
    }

    setEditSubmitting(true);
    setEditError(null);

    try {
      await adminCollaboratorsApi.updateCollaborator(editingMember.id, {
        badge: editBadge,
        positionTitle: editPositionTitle.trim(),
        positionDescription: editPositionDescription.trim() || undefined,
      });
      await refreshTeamAccessState();
      closeEditModal();
    } catch (error) {
      setEditError(mapErrorMessage(error, "Unable to update collaborator."));
      setEditSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (member: TeamMember) => {
    setOpenMenuMemberId(null);
    const confirmed = window.confirm(`Remove ${member.name} from Team Access?`);
    if (!confirmed) {
      return;
    }

    try {
      await adminCollaboratorsApi.removeCollaborator(member.id);
      await refreshTeamAccessState();
    } catch (error) {
      setTeamError(mapErrorMessage(error, "Unable to remove collaborator."));
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setPageLoading(false);
      return;
    }

    const currentUserId = String(user.id);
    const now = Date.now();
    const hasWarmCache = settingsCache?.userId === currentUserId;
    const cacheHit =
      hasWarmCache &&
      typeof settingsCache?.expiresAt === "number" &&
      settingsCache.expiresAt > now;

    if (hasWarmCache && settingsCache) {
      const warmSnapshot = settingsCache.snapshot;
      setStoreName(warmSnapshot.storeName);
      setContactEmail(warmSnapshot.contactEmail);
      setCurrency(warmSnapshot.currency);
      setBio(warmSnapshot.bio);
      setLogoUrl(warmSnapshot.logoUrl);
      setNotifs(warmSnapshot.notifications);
      setSavedSnapshot(warmSnapshot);
      setTeam(settingsCache.team);
      setPageLoading(false);
      setPageError(null);
      setTeamError(null);
    }

    if (cacheHit) {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        if (!hasWarmCache) {
          setPageLoading(true);
        }
        setPageError(null);
        setTeamError(null);

        const [userPreferences, notificationPreferences, nextTeam] = await Promise.all([
          getUserPreferences(),
          getNotificationPreferences(),
          loadTeamAccess(String(user.id), user.fullName, user.email),
        ]);

        if (!active) {
          return;
        }

        const nextStoreName =
          localStorage.getItem("shop-settings-store-name") ?? "Floral Boutique";
        const nextContactEmail =
          localStorage.getItem("shop-settings-contact-email") ?? user.email;
        const nextCurrency = codeToCurrencyLabel(userPreferences.currency);
        const nextBio =
          localStorage.getItem("shop-settings-bio") ?? DEFAULT_BIO;
        const nextLogo =
          localStorage.getItem("shop-settings-logo") ?? "";
        const nextNotifs = notificationDtoToState(notificationPreferences);
        const nextSnapshot: SettingsSnapshot = {
          storeName: nextStoreName,
          contactEmail: nextContactEmail,
          currency: nextCurrency,
          bio: nextBio,
          logoUrl: nextLogo,
          notifications: nextNotifs,
        };

        setStoreName(nextSnapshot.storeName);
        setContactEmail(nextSnapshot.contactEmail);
        setCurrency(nextSnapshot.currency);
        setBio(nextSnapshot.bio);
        setLogoUrl(nextSnapshot.logoUrl);
        setNotifs(nextSnapshot.notifications);
        setTeam(nextTeam);
        setSavedSnapshot(nextSnapshot);
        settingsCache = {
          userId: String(user.id),
          expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
          snapshot: nextSnapshot,
          team: nextTeam,
        };
      } catch (error) {
        if (active) {
          setPageError(mapErrorMessage(error, "Unable to load settings from database right now."));
        }
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, loadTeamAccess, user]);

  const toggleNotif = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));

  const markSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const persistGeneral = async () => {
    const nextStoreName = storeName.trim();
    const nextContactEmail = contactEmail.trim();
    const nextBio = bio.trim() || DEFAULT_BIO;

    if (!nextStoreName || !nextContactEmail) {
      throw new Error("Store Name và Contact Email không được để trống.");
    }

    await updateUserPreferences({
      currency: currencyToCode(currency),
    });

    localStorage.setItem("shop-settings-store-name", nextStoreName);
    localStorage.setItem("shop-settings-contact-email", nextContactEmail);
    localStorage.setItem("shop-settings-bio", nextBio);
    localStorage.setItem("shop-settings-logo", logoUrl.trim());
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      await persistGeneral();
      const snapshot: SettingsSnapshot = {
        storeName: storeName.trim(),
        contactEmail: contactEmail.trim(),
        currency,
        bio: bio.trim() || DEFAULT_BIO,
        logoUrl: logoUrl.trim(),
        notifications: notifs,
      };
      setSavedSnapshot(snapshot);
      setStoreName(snapshot.storeName);
      setContactEmail(snapshot.contactEmail);
      setBio(snapshot.bio);
      setLogoUrl(snapshot.logoUrl);
      refreshSettingsCache(snapshot, team);
      markSaved();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mapErrorMessage(error, "Unable to save general settings.");
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      await persistGeneral();
      await updateNotificationPreferences(notificationStateToPayload(notifs));

      const snapshot: SettingsSnapshot = {
        storeName: storeName.trim(),
        contactEmail: contactEmail.trim(),
        currency,
        bio: bio.trim() || DEFAULT_BIO,
        logoUrl: logoUrl.trim(),
        notifications: notifs,
      };
      setSavedSnapshot(snapshot);
      setStoreName(snapshot.storeName);
      setContactEmail(snapshot.contactEmail);
      setBio(snapshot.bio);
      setLogoUrl(snapshot.logoUrl);
      refreshSettingsCache(snapshot, team);
      markSaved();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : mapErrorMessage(error, "Unable to synchronize settings.");
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!savedSnapshot) {
      return;
    }
    setStoreName(savedSnapshot.storeName);
    setContactEmail(savedSnapshot.contactEmail);
    setCurrency(savedSnapshot.currency);
    setBio(savedSnapshot.bio);
    setLogoUrl(savedSnapshot.logoUrl);
    setNotifs(savedSnapshot.notifications);
    refreshSettingsCache(savedSnapshot, team);
    setSaveError(null);
  };

  const handleSetLogo = () => {
    const enteredValue = window.prompt("Enter logo URL or local path", logoUrl);
    if (enteredValue === null) {
      return;
    }
    setLogoUrl(enteredValue.trim());
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
        <div className="mx-auto h-[760px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <AccessStateCard
        title="Sign in to view admin settings"
        description="Settings data is loaded from your database and is available for authenticated administrators only."
        action={
          <Link
            href="/signin"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] bg-[#8d6030] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#7a542a]"
          >
            Go to Sign In
          </Link>
        }
      />
    );
  }

  if (!isAdmin) {
    return (
      <AccessStateCard
        title="Admin access required"
        description="Your account does not have permission to open this settings workspace."
        action={
          <Link
            href="/"
            className="inline-flex min-h-[52px] items-center justify-center rounded-[12px] border border-[#d6cbc0] px-8 text-[14px] font-medium text-[#6d5742] transition-colors hover:bg-[#f5efe8]"
          >
            Back to Store
          </Link>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#d8d4d4]">
      <Navbar />
      <div className="grid overflow-hidden border-t border-[#e9e3dc] bg-[#fbfaf8] md:grid-cols-[218px_minmax(0,1fr)]">
        <aside className="border-b border-[#eee8e1] px-4 py-6 md:min-h-[720px] md:border-b-0 md:border-r md:border-[#eee8e1] md:px-5">
          <nav className="space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: false },
              { icon: ClipboardList, label: "Orders", href: "/admin/orders", active: false },
              { icon: Package2, label: "Products", href: "/admin/products", active: false },
              { icon: Users, label: "Customers", href: "/admin/customers", active: false },
              { icon: Settings, label: "Settings", href: "/admin/settings", active: true },
            ].map((item) => {
              const className = `flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-[13px] transition-colors ${
                item.active
                  ? "bg-[#8d6030] text-white"
                  : "text-[#4a433c] hover:bg-[#f1ede7]"
              }`;

              return (
                <Link key={item.label} href={item.href} className={className}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-14 hidden items-center gap-3 md:flex">
            <div className="h-10 w-10 rounded-full bg-[#ece8e3]" />
            <div>
              <p className="text-[12px] font-medium text-[#3f3934]">{user.fullName}</p>
              <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">Head Florist</p>
            </div>
          </div>
        </aside>

        <main className="px-4 py-7 md:px-7">
          <div>
            <h1 className="text-[46px] leading-[1.04] text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
              Boutique Configuration
            </h1>
            <p className="mt-2 text-[13px] italic text-[#857d76]">
              Manage the essence of your botanical workspace.
            </p>
          </div>

          {pageError ? (
            <div className="mt-6 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              {pageError}
            </div>
          ) : null}

          {saveError ? (
            <div className="mt-3 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              {saveError}
            </div>
          ) : null}

          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_277px]">
              <div className="rounded-[16px] bg-white p-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                      General Information
                    </h2>
                    <p className="mt-1 text-[14px] text-[#a8a29e]">Core details of your digital storefront.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveProfile();
                    }}
                    disabled={saving}
                    className="rounded-full bg-[#7d562d] px-8 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#6a4825] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Update Shop"}
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-8">
                  <div className="flex h-[128px] w-[128px] items-center justify-center overflow-hidden rounded-[12px] border border-[#d2c3c31a] bg-[#f5f3ef]">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="Store mark" className="h-full w-full object-cover" />
                    ) : (
                      <Flower2 className="h-10 w-10 text-[#d0bb95]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[1.2px] text-[#78716c]">Atelier Signature</p>
                    <button
                      type="button"
                      onClick={handleSetLogo}
                      className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-[#7d562d] hover:opacity-80"
                    >
                      <Upload className="h-4 w-4" />
                      Upload New Mark
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#ba1a1a] hover:opacity-80"
                    >
                      <XCircle className="h-4 w-4" />
                      Remove Icon
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                      className="mt-2 w-full border-b border-[#d2c3c34d] bg-transparent pb-2 text-[18px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                      style={{ fontFamily: "var(--font-noto-serif)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">Preferred Currency</label>
                    <select
                      value={currency}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
                      className="mt-2 w-full border-b border-[#d2c3c34d] bg-transparent pb-2 text-[14px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[12px] font-bold tracking-[0.3px] text-[#4f4444]">
                    Atelier Bio / Welcome Message
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none border-b border-[#d2c3c34d] bg-transparent pb-2 text-[14px] leading-[20px] text-[#1b1c1a] outline-none focus:border-[#7d562d]"
                  />
                </div>
              </div>

              <div className="rounded-[16px] bg-[#f5f3ef] p-8">
                <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  Team Access
                </h2>
                {teamError ? (
                  <div className="mt-4 rounded-[12px] border border-[#efd0cc] bg-[#fbefec] px-3 py-2 text-[12px] text-[#8f3d35]">
                    {teamError}
                  </div>
                ) : null}
                <div className="mt-6 space-y-6">
                  {team.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 overflow-hidden rounded-[8px] bg-[#e4e2de]">
                          {member.avatar ? (
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                              onError={() => {
                                setTeam((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, avatar: null } : item
                                  )
                                );
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[13px] font-bold text-[#6e5a4f]">
                              {member.initials}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#1b1c1a]">{member.name}</p>
                          <p className="mt-0.5 text-[12px] text-[#78716c]">{member.positionTitle}</p>
                          {member.positionDescription ? (
                            <p className="mt-0.5 max-w-[180px] text-[11px] leading-4 text-[#9a948e]">
                              {member.positionDescription}
                            </p>
                          ) : null}
                          <BadgePill badge={member.badge} />
                        </div>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuMemberId((current) => (current === member.id ? null : member.id))
                          }
                          className="text-[#a8a29e] hover:text-[#78716c]"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuMemberId === member.id ? (
                          <div className="absolute right-0 top-7 z-20 w-36 overflow-hidden rounded-[10px] border border-[#e4ddd4] bg-white shadow-lg">
                            <button
                              type="button"
                              onClick={() => openEditModal(member)}
                              className="block w-full px-3 py-2 text-left text-[12px] text-[#4f4444] transition-colors hover:bg-[#f6f1eb]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleRemoveCollaborator(member);
                              }}
                              className="block w-full px-3 py-2 text-left text-[12px] text-[#a64036] transition-colors hover:bg-[#fbefec]"
                            >
                              Remove
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void openInviteModal();
                  }}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#d2c3c3] py-3 text-[14px] font-semibold text-[#6e5a4f] transition-colors hover:bg-[#ede9e3]"
                >
                  <UserPlus className="h-4 w-4" />
                  Invite New Collaborator
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[16px] bg-[#f5f3ef] p-8">
              <div className="pointer-events-none absolute right-[-20px] top-[-20px] h-40 w-40 rounded-full bg-[#7d562d0d]" />

              <h2 className="text-[20px] text-[#1b1c1a]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                Notification Preferences
              </h2>

              <div className="mt-6 space-y-3">
                {notifs.map((n) => (
                  <div key={n.id} className="flex items-center justify-between rounded-[12px] bg-white/40 px-4 py-4">
                    <div>
                      <p className="text-[14px] font-bold text-[#1b1c1a]">{n.title}</p>
                      <p className="mt-0.5 text-[12px] text-[#78716c]">{n.description}</p>
                    </div>
                    <Toggle on={n.enabled} onToggle={() => toggleNotif(n.id)} />
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-[#d2c3c31a] pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#a8a29e]">Email Channel Configuration</p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setContactEmail(e.target.value)}
                    className="flex-1 rounded-[8px] bg-white/60 px-4 py-2.5 text-[14px] text-[#6b7280] outline-none focus:ring-1 focus:ring-[#7d562d]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void handleSaveProfile();
                    }}
                    disabled={saving}
                    className="rounded-[8px] bg-[#e4e2de] px-6 py-2.5 text-[12px] font-bold text-[#6e5a4f] transition-colors hover:bg-[#d8d4ce] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Email"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={!hasChanges || saving}
                className="rounded-full px-8 py-3 text-[14px] font-bold text-[#78716c] transition-colors hover:bg-[#f0ece7] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSaveAll();
                }}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#7d562d] px-10 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#6a4825] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  "Synchronizing..."
                ) : saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Saved!
                  </>
                ) : (
                  "Synchronize Shop Settings"
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      {inviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-[20px] border border-[#e5ddd4] bg-[#fbfaf8] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[32px] leading-none text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  Invite New Collaborator
                </h3>
                <p className="mt-2 text-[13px] text-[#7c736c]">
                  Choose user, set position details, and assign Staff/Admin badge.
                </p>
              </div>
              <button
                type="button"
                onClick={closeInviteModal}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ede8] text-[#6e655d] transition-colors hover:bg-[#e7e0d8]"
                aria-label="Close invite modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              {inviteLoading ? (
                <div className="h-11 animate-pulse rounded-[12px] bg-[#ece8e3]" />
              ) : inviteCandidates.length === 0 ? (
                <div className="rounded-[12px] border border-[#ece5dc] bg-white px-4 py-3 text-[13px] text-[#7b726a]">
                  No eligible user accounts available to invite.
                </div>
              ) : (
                <div className="grid gap-3">
                  <label className="grid gap-2 text-[12px] text-[#5f564d]">
                    Select user
                    <select
                      value={selectedInviteUserId}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedInviteUserId(event.target.value)}
                      className="h-11 rounded-[12px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                    >
                      {inviteCandidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.fullName} - {candidate.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-[12px] text-[#5f564d]">
                    Badge
                    <select
                      value={inviteBadge}
                      onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        setInviteBadge(event.target.value as CollaboratorBadge)
                      }
                      className="h-11 rounded-[12px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </label>

                  <label className="grid gap-2 text-[12px] text-[#5f564d]">
                    Position title
                    <input
                      type="text"
                      value={invitePositionTitle}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setInvitePositionTitle(event.target.value)
                      }
                      placeholder="Senior Creative Director"
                      className="h-11 rounded-[12px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                    />
                  </label>

                  <label className="grid gap-2 text-[12px] text-[#5f564d]">
                    Position description
                    <textarea
                      value={invitePositionDescription}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        setInvitePositionDescription(event.target.value)
                      }
                      placeholder="Describe collaborator responsibilities..."
                      rows={3}
                      className="rounded-[12px] border border-[#e4ddd4] bg-white px-4 py-3 outline-none transition-colors focus:border-[#8d6030]"
                    />
                  </label>
                </div>
              )}
            </div>

            {inviteError ? (
              <div className="mt-4 rounded-[12px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
                {inviteError}
              </div>
            ) : null}

            {inviteSuccess ? (
              <div className="mt-4 rounded-[12px] border border-[#d2e5c8] bg-[#f0f7ea] px-4 py-3 text-[13px] text-[#52634c]">
                {inviteSuccess}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeInviteModal}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleInviteCollaborator();
                }}
                disabled={
                  inviteLoading ||
                  inviteSubmitting ||
                  inviteCandidates.length === 0 ||
                  !invitePositionTitle.trim()
                }
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#8d6030] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#724e26] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteSubmitting ? "Inviting..." : "Invite Collaborator"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[560px] rounded-[20px] border border-[#e5ddd4] bg-[#fbfaf8] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[32px] leading-none text-[#2d2a26]" style={{ fontFamily: "var(--font-noto-serif)" }}>
                  Edit Collaborator
                </h3>
                <p className="mt-2 text-[13px] text-[#7c736c]">
                  Update collaborator badge and position details.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2ede8] text-[#6e655d] transition-colors hover:bg-[#e7e0d8]"
                aria-label="Close edit modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {editingMember ? (
              <div className="mt-5 grid gap-3">
                <div className="rounded-[12px] border border-[#ece5dc] bg-white px-4 py-3 text-[13px] text-[#5f564d]">
                  {editingMember.name}
                </div>

                <label className="grid gap-2 text-[12px] text-[#5f564d]">
                  Badge
                  <select
                    value={editBadge}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setEditBadge(event.target.value as CollaboratorBadge)
                    }
                    className="h-11 rounded-[12px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>

                <label className="grid gap-2 text-[12px] text-[#5f564d]">
                  Position title
                  <input
                    type="text"
                    value={editPositionTitle}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setEditPositionTitle(event.target.value)}
                    className="h-11 rounded-[12px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                  />
                </label>

                <label className="grid gap-2 text-[12px] text-[#5f564d]">
                  Position description
                  <textarea
                    value={editPositionDescription}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setEditPositionDescription(event.target.value)
                    }
                    rows={3}
                    className="rounded-[12px] border border-[#e4ddd4] bg-white px-4 py-3 outline-none transition-colors focus:border-[#8d6030]"
                  />
                </label>
              </div>
            ) : null}

            {editError ? (
              <div className="mt-4 rounded-[12px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
                {editError}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleUpdateCollaborator();
                }}
                disabled={editSubmitting || !editPositionTitle.trim()}
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#8d6030] px-5 text-[12px] font-medium text-white transition-colors hover:bg-[#724e26] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
