"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ClipboardList,
  Eye,
  LayoutDashboard,
  Package2,
  Pencil,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { adminUsersApi, isApiError } from "@/lib/api";
import type {
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUserDTO,
} from "@/lib/api/types";
import { SafeImage } from "@/components/common/SafeImage";
import { Navbar } from "@/src/components/layout";
import { useAuth } from "@/src/contexts";

type RoleFilter = "ALL" | "USER" | "ADMIN";
type RoleOption = "USER" | "ADMIN";

type UserFormState = {
  email: string;
  fullName: string;
  phone: string;
  role: RoleOption;
  password: string;
  avatarUrl: string;
};

const PAGE_SIZE = 8;
const ADMIN_API_MAX_PAGE_SIZE = 100;
const DEFAULT_AVATAR = "/images/hero-main.png";

function normalizeRole(role: string): RoleOption {
  return role?.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
}

function sortUsers(list: AdminUserDTO[]): AdminUserDTO[] {
  return [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

function mapLoadErrorMessage(loadError: unknown): string {
  if (isApiError(loadError)) {
    if (!loadError.status) {
      return "Cannot connect to backend. Please ensure BE is running on http://127.0.0.1:8080 (or http://localhost:8080).";
    }
    return loadError.message;
  }
  return "Unable to load users right now.";
}

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");
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

function UserFormModal({
  open,
  mode,
  saving,
  error,
  initialUser,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  saving: boolean;
  error: string | null;
  initialUser: AdminUserDTO | null;
  onClose: () => void;
  onSubmit: (payload: AdminCreateUserRequest | AdminUpdateUserRequest) => Promise<void>;
}) {
  const [form, setForm] = useState<UserFormState>(() => {
    if (mode === "edit" && initialUser) {
      return {
        email: initialUser.email ?? "",
        fullName: initialUser.fullName ?? "",
        phone: initialUser.phone ?? "",
        role: normalizeRole(initialUser.role),
        password: "",
        avatarUrl: initialUser.avatarUrl?.trim() || "",
      };
    }

    return {
      email: "",
      fullName: "",
      phone: "",
      role: "USER",
      password: "",
      avatarUrl: "",
    };
  });

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "create") {
      void onSubmit({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        avatarUrl: form.avatarUrl.trim() || null,
      });
      return;
    }

    void onSubmit({
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      role: form.role,
      avatarUrl: form.avatarUrl.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(20,18,16,0.45)] p-4">
      <div className="w-full max-w-[620px] rounded-[24px] border border-[#ece2d8] bg-[#fbfaf8] p-6 shadow-xl md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-[28px] leading-[1.1] text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            {mode === "create" ? "Add User" : "Edit User"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#8d8177] transition-colors hover:bg-[#f2ede7]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-[12px] text-[#5f564d]">
              Full name
              <input
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                required
                className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                placeholder="Customer name"
              />
            </label>

            <label className="grid gap-2 text-[12px] text-[#5f564d]">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
                className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                placeholder="user@example.com"
              />
            </label>

            <label className="grid gap-2 text-[12px] text-[#5f564d]">
              Phone
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                required
                className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                placeholder="0901234567"
              />
            </label>

            <label className="grid gap-2 text-[12px] text-[#5f564d]">
              Role
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value === "ADMIN" ? "ADMIN" : "USER",
                  }))
                }
                className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>

            {mode === "create" ? (
              <label className="grid gap-2 text-[12px] text-[#5f564d] md:col-span-2">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  required
                  className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                  placeholder="At least 8 chars, 1 uppercase, 1 special"
                />
              </label>
            ) : null}

            <label className="grid gap-2 text-[12px] text-[#5f564d] md:col-span-2">
              Avatar URL (optional)
              <input
                value={form.avatarUrl}
                onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                className="h-11 rounded-[14px] border border-[#e4ddd4] bg-white px-4 outline-none transition-colors focus:border-[#8d6030]"
                placeholder="https://..."
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#ddd2c6] px-5 text-[12px] font-medium text-[#6a5c4e] transition-colors hover:bg-[#f3eee8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#8d6030] px-6 text-[12px] font-semibold uppercase tracking-[0.6px] text-white transition-colors hover:bg-[#754f28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserViewModal({
  user,
  onClose,
}: {
  user: AdminUserDTO | null;
  onClose: () => void;
}) {
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(20,18,16,0.45)] p-4">
      <div className="w-full max-w-[560px] rounded-[24px] border border-[#ece2d8] bg-[#fbfaf8] p-6 shadow-xl md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2
            className="text-[28px] leading-[1.1] text-[#2d2a26]"
            style={{ fontFamily: "var(--font-noto-serif)" }}
          >
            User Detail
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#8d8177] transition-colors hover:bg-[#f2ede7]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5">
          <div className="flex items-center gap-4 rounded-[16px] border border-[#e9dfd4] bg-white px-4 py-4">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full bg-[#eee6dd]">
              <SafeImage
                src={user.avatarUrl?.trim() || DEFAULT_AVATAR}
                alt={user.fullName}
                fill
                fallbackSrc={DEFAULT_AVATAR}
                sizes="64px"
                className="object-cover"
              />
            </span>
            <div>
              <p className="text-[20px] font-semibold text-[#2d2a26]">{user.fullName}</p>
              <p className="text-[13px] text-[#7a7068]">ID: {user.id}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[16px] border border-[#e9dfd4] bg-white px-4 py-4 text-[13px] text-[#4f463e]">
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Phone:</span> {user.phone}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {normalizeRole(user.role)}
            </p>
            <p className="break-all">
              <span className="font-semibold">Avatar URL:</span> {user.avatarUrl?.trim() || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [page, setPage] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  const [selectedUser, setSelectedUser] = useState<AdminUserDTO | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const allUsers: AdminUserDTO[] = [];
        let currentPage = 0;
        let totalPages = 1;

        while (currentPage < totalPages) {
          const response = await adminUsersApi.getUsers({
            page: currentPage,
            size: ADMIN_API_MAX_PAGE_SIZE,
          });

          allUsers.push(...response.content);
          totalPages = Math.max(1, response.totalPages ?? 1);
          currentPage += 1;
        }

        if (!active) {
          return;
        }

        setUsers(sortUsers(allUsers));
      } catch (loadError) {
        if (active) {
          setError(mapLoadErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      active = false;
    };
  }, [authLoading, isAdmin, reloadToken, user]);

  const filteredUsers = useMemo(() => {
    const lowered = search.trim().toLowerCase();

    return users.filter((item) => {
      const roleMatches = roleFilter === "ALL" || normalizeRole(item.role) === roleFilter;
      if (!roleMatches) {
        return false;
      }

      if (!lowered) {
        return true;
      }

      return (
        item.fullName.toLowerCase().includes(lowered) ||
        item.email.toLowerCase().includes(lowered) ||
        item.phone.toLowerCase().includes(lowered)
      );
    });
  }, [roleFilter, search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = filteredUsers.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const closeModals = () => {
    setIsCreateOpen(false);
    setEditingUser(null);
    setSelectedUser(null);
    setActionError(null);
  };

  const refreshCurrentList = () => {
    setReloadToken((current) => current + 1);
  };

  const handleCreateUser = async (payload: AdminCreateUserRequest | AdminUpdateUserRequest) => {
    if ("password" in payload === false) {
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      const created = await adminUsersApi.createUser(payload);
      setUsers((current) => sortUsers([...current, created]));
      closeModals();
    } catch (saveError) {
      setActionError(mapLoadErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (payload: AdminCreateUserRequest | AdminUpdateUserRequest) => {
    if (!editingUser || "password" in payload) {
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await adminUsersApi.updateUser(editingUser.id, payload);
      setUsers((current) =>
        sortUsers(current.map((item) => (item.id === updated.id ? updated : item)))
      );
      closeModals();
    } catch (saveError) {
      setActionError(mapLoadErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (target: AdminUserDTO) => {
    const shouldDelete = window.confirm(`Delete user ${target.fullName} (${target.email})?`);
    if (!shouldDelete) {
      return;
    }

    setActionError(null);
    try {
      await adminUsersApi.deleteUser(target.id);
      setUsers((current) => current.filter((item) => item.id !== target.id));
      setSelectedUser((current) => (current?.id === target.id ? null : current));
    } catch (deleteError) {
      setActionError(mapLoadErrorMessage(deleteError));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#d8d4d4] px-4 py-10 md:px-8">
        <div className="mx-auto h-[760px] max-w-[1320px] animate-pulse rounded-[24px] bg-[#fbfaf8]" />
      </div>
    );
  }

  if (!user) {
    return (
      <AccessStateCard
        title="Sign in to manage users"
        description="User management is available for authenticated administrators only."
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
        description="Your account does not have permission to open user management."
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
              { icon: Users, label: "Customers", href: "/admin/customers", active: true },
              { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
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
            <span className="relative block h-10 w-10 overflow-hidden rounded-full bg-[#ece8e3]">
              <SafeImage
                src={user.avatarUrl?.trim() || DEFAULT_AVATAR}
                alt={user.fullName}
                fill
                fallbackSrc={DEFAULT_AVATAR}
                sizes="40px"
                className="object-cover"
              />
            </span>
            <div>
              <p className="text-[12px] font-medium text-[#3f3934]">{user.fullName}</p>
              <p className="text-[10px] uppercase tracking-[1.2px] text-[#b2aaa2]">Administrator</p>
            </div>
          </div>
        </aside>

        <main className="px-4 py-7 md:px-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-[48px] font-black leading-[1] text-[#1b1c1a]"
                style={{ fontFamily: "var(--font-noto-serif)" }}
              >
                User Management
              </h1>
              <p className="mt-4 max-w-[620px] text-[16px] italic text-[#6e5a4f]">
                Avatar updates from user profiles are reflected here automatically. You can also add, view, edit, and delete users directly from admin.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#7d562d] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.8px] text-white transition-colors hover:bg-[#694925]"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              <p>{error}</p>
              <button
                type="button"
                onClick={refreshCurrentList}
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-[#8d6030] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#724c25]"
              >
                Retry
              </button>
            </div>
          ) : null}

          {actionError ? (
            <div className="mt-4 rounded-[14px] border border-[#efd0cc] bg-[#fbefec] px-4 py-3 text-[13px] text-[#8f3d35]">
              {actionError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 rounded-[16px] border border-[#ebe2d8] bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_120px] md:items-center">
            <label className="flex items-center gap-2 rounded-full border border-[#e6ddd3] bg-[#fcfbfa] px-4 py-2">
              <Search className="h-4 w-4 text-[#9d9185]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Search by name, email, phone"
                className="w-full bg-transparent text-[13px] text-[#2d2a26] outline-none placeholder:text-[#baaea2]"
              />
            </label>

            <select
              value={roleFilter}
              onChange={(event) => {
                const next = event.target.value.toUpperCase();
                setRoleFilter(next === "ADMIN" ? "ADMIN" : next === "USER" ? "USER" : "ALL");
                setPage(0);
              }}
              className="h-10 rounded-full border border-[#e6ddd3] bg-[#fcfbfa] px-4 text-[13px] text-[#2d2a26] outline-none"
            >
              <option value="ALL">All roles</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button
              type="button"
              onClick={refreshCurrentList}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#d6cbc0] px-4 text-[12px] font-medium text-[#6d5742] transition-colors hover:bg-[#f5efe8]"
            >
              Reload
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#ebe2d8] bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[#f6f2ed]">
                    <th className="px-6 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.8px] text-[#6f6256]">User</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.8px] text-[#6f6256]">Email</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.8px] text-[#6f6256]">Phone</th>
                    <th className="px-6 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.8px] text-[#6f6256]">Role</th>
                    <th className="px-6 py-4 text-right text-[12px] font-semibold uppercase tracking-[0.8px] text-[#6f6256]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-[14px] text-[#8a7d71]">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((item) => (
                      <tr key={item.id} className="border-t border-[#f0e8de]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="relative block h-11 w-11 overflow-hidden rounded-full bg-[#eee6dd]">
                              <SafeImage
                                src={item.avatarUrl?.trim() || DEFAULT_AVATAR}
                                alt={item.fullName}
                                fill
                                fallbackSrc={DEFAULT_AVATAR}
                                sizes="44px"
                                className="object-cover"
                              />
                            </span>
                            <div>
                              <p className="text-[14px] font-semibold text-[#2d2a26]">{item.fullName}</p>
                              <p className="text-[11px] uppercase tracking-[0.6px] text-[#9c8f83]">
                                {getInitials(item.fullName) || "NA"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-[#4f463e]">{item.email}</td>
                        <td className="px-6 py-4 text-[13px] text-[#4f463e]">{item.phone}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                              normalizeRole(item.role) === "ADMIN"
                                ? "bg-[#f6dfcf] text-[#85562f]"
                                : "bg-[#e5efe0] text-[#4f6a45]"
                            }`}
                          >
                            {normalizeRole(item.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const detailed = await adminUsersApi.getUserById(item.id);
                                  setSelectedUser(detailed);
                                } catch {
                                  setSelectedUser(item);
                                }
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e7ded4] text-[#6a5c4e] transition-colors hover:bg-[#f7f1ea]"
                              aria-label={`View ${item.fullName}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setEditingUser(item);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e7ded4] text-[#6a5c4e] transition-colors hover:bg-[#f7f1ea]"
                              aria-label={`Edit ${item.fullName}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteUser(item);
                              }}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f0d5cf] text-[#a34f44] transition-colors hover:bg-[#fbefec]"
                              aria-label={`Delete ${item.fullName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="flex items-center justify-between border-t border-[#f0e8de] bg-[#fbf8f5] px-6 py-4 text-[12px] text-[#7f7368]">
                <p>
                  Showing {safePage * PAGE_SIZE + 1} to {Math.min((safePage + 1) * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                    disabled={safePage === 0}
                    className="rounded-full border border-[#ddd2c6] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span>
                    {safePage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                    disabled={safePage >= totalPages - 1}
                    className="rounded-full border border-[#ddd2c6] px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <UserFormModal
        key={`create-${isCreateOpen ? "open" : "closed"}`}
        open={isCreateOpen}
        mode="create"
        saving={isSaving}
        error={actionError}
        initialUser={null}
        onClose={closeModals}
        onSubmit={handleCreateUser}
      />

      <UserFormModal
        key={`edit-${editingUser?.id ?? "none"}`}
        open={Boolean(editingUser)}
        mode="edit"
        saving={isSaving}
        error={actionError}
        initialUser={editingUser}
        onClose={closeModals}
        onSubmit={handleUpdateUser}
      />

      <UserViewModal user={selectedUser} onClose={closeModals} />
    </div>
  );
}
