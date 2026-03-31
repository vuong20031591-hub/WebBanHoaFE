import {
  ProfileFavorite,
  ProfileFavoritesCollection,
  ProfileCommunicationPreference,
  ProfileMember,
  ProfilePreferencesGiftingSection,
  ProfilePreferencesRegionalSection,
  ProfilePreferencesRibbonColor,
  ProfilePreferencesSelectField,
  ProfilePreferencesSettingsPageData,
  ProfilePreferencesToggleOption,
  ProfileNotificationsPreference,
  ProfileNotificationsSection,
  ProfileNotificationsSettingsPageData,
  ProfileOrder,
  ProfileRewardsCard,
  ProfileSecurityPasswordField,
  ProfileSecuritySettingsPageData,
  ProfileSecurityToggleOption,
  ProfileSettingsNavItem,
  ProfileSettingsPageData,
  ProfileTab,
  ProfileTabId,
} from "./types";

export const profileMember: ProfileMember = {
  membershipLabel: "Gold Member since 2026",
  name: "Nguy\u1ec5n Ti\u1ebfn V\u01b0\u01a1ng",
  email: "vuong20032604@gmail.com",
  phone: "+84 397707745",
  address:
    "L\u00f4 E1 ho\u1eb7c E2b-4 (Trung t\u00e2m \u0110\u00e0o t\u1ea1o nh\u00e2n l\u1ef1c ch\u1ea5t l\u01b0\u1ee3ng cao HUTECH), Khu C\u00f4ng ngh\u1ec7 cao TP.HCM (SHTP), Xa l\u1ed9 H\u00e0 N\u1ed9i, ph\u01b0\u1eddng T\u0103ng Nh\u01a1n Ph\u00fa B, TP. Th\u1ee7 \u0110\u1ee9c, TP. H\u1ed3 Ch\u00ed Minh.",
  avatar: "/images/gallery-photo.png",
  editHref: "/profile",
};

const profileTabItems: Omit<ProfileTab, "active">[] = [
  {
    id: "orders",
    label: "My Orders",
    href: "/profile",
  },
  {
    id: "favorites",
    label: "Favorites",
    href: "/profile/favorites",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/profile/settings",
  },
];

export function getProfileTabs(activeTabId: ProfileTabId): ProfileTab[] {
  return profileTabItems.map((tab) => ({
    ...tab,
    active: tab.id === activeTabId,
  }));
}

export const profileOrders: ProfileOrder[] = [
  {
    id: "order-1",
    status: "Delivered",
    date: "Oct 12, 2024",
    title: "The Midnight Peony Collection",
    description: "Large arrangement, custom glass vase, handwritten note.",
    price: 185,
    image: "/images/hero-main.png",
    href: "/checkout/tracking",
  },
  {
    id: "order-2",
    status: "Delivered",
    date: "Sep 24, 2024",
    title: "Wildflower Sympathy Basket",
    description: "Medium rustic basket, seasonal white blooms.",
    price: 120,
    image: "/images/sympathy.png",
    href: "/checkout/tracking",
  },
  {
    id: "order-3",
    status: "Delivered",
    date: "Aug 15, 2024",
    title: "Bespoke Anniversary Trio",
    description: "Set of three minimalist ceramic vases with rare roses.",
    price: 245,
    image: "/images/anniversary.png",
    href: "/checkout/tracking",
  },
];

const profileFavorites: ProfileFavorite[] = [
  {
    id: "favorite-1",
    productId: 101,
    name: "The Moonlight Garden",
    price: 145,
    image: "/images/hero-main.png",
    href: "/products",
  },
  {
    id: "favorite-2",
    productId: 102,
    name: "Ethereal Blush",
    price: 98,
    image: "/images/gallery-photo.png",
    href: "/products",
  },
  {
    id: "favorite-3",
    productId: 103,
    name: "Wild Forest Dreams",
    price: 125,
    image: "/images/heritage-main.png",
    href: "/products",
  },
];

export const profileFavoritesCollection: ProfileFavoritesCollection = {
  title: "Your Curated Collection",
  countLabel: "6 Items Favorited",
  ctaLabel: "Continue Shopping",
  ctaHref: "/products",
  items: profileFavorites,
};

const profileSettingsNavigationItems: Omit<ProfileSettingsNavItem, "active">[] = [
  {
    id: "account-info",
    label: "Account Info",
    icon: "account",
    href: "/profile/settings",
  },
  {
    id: "security",
    label: "Security",
    icon: "security",
    href: "/profile/settings/security",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "notifications",
    href: "/profile/settings/notifications",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: "preferences",
    href: "/profile/settings/preferences",
  },
];

export function getProfileSettingsNavigation(
  activeItemId: string
): ProfileSettingsNavItem[] {
  return profileSettingsNavigationItems.map((item) => ({
    ...item,
    active: item.id === activeItemId,
  }));
}

const profileRewardsCard: ProfileRewardsCard = {
  title: "Bloom Rewards",
  description: "You have 450 points to spend on your next bouquet.",
  ctaLabel: "View Details",
};

const profileCommunicationPreferences: ProfileCommunicationPreference[] = [
  {
    id: "newsletter",
    label: "Newsletter & Seasonal Curations",
    description: "The latest floral trends and early access to collections.",
    enabled: true,
  },
  {
    id: "order-updates",
    label: "Order Updates",
    description: "Real-time tracking and delivery confirmation of your stems.",
    enabled: true,
  },
  {
    id: "sms-notifications",
    label: "SMS Notifications",
    description: "Direct alerts for limited edition drops.",
    enabled: false,
  },
];

export const profileSettingsPage: ProfileSettingsPageData = {
  title: "Account Settings",
  subtitle: "Manage your profile, security, and preferences.",
  navigation: getProfileSettingsNavigation("account-info"),
  rewards: profileRewardsCard,
  accountInfo: {
    photo: profileMember.avatar,
    changePhotoLabel: "Change Photo",
    fullName: profileMember.name,
    email: profileMember.email,
    phone: profileMember.phone,
    address: profileMember.address,
  },
  communicationTitle: "Communication Preferences",
  communicationSubtitle: "How would you like to hear from our studio?",
  communicationPreferences: profileCommunicationPreferences,
  cancelLabel: "Cancel",
  saveLabel: "Save Changes",
};

const profileSecurityPasswordFields: ProfileSecurityPasswordField[] = [
  {
    id: "current-password",
    label: "Current Password",
    placeholder: "Enter current password",
  },
  {
    id: "new-password",
    label: "New Password",
    placeholder: "Min. 8 characters",
  },
  {
    id: "confirm-password",
    label: "Confirm New Password",
    placeholder: "Re-enter new password",
  },
];

const profileSecurityTwoFactorOptions: ProfileSecurityToggleOption[] = [
  {
    id: "sms-2fa",
    label: "Enable 2FA via SMS",
    description: "Receive a security code on your phone when signing in.",
    enabled: false,
  },
  {
    id: "authenticator-app",
    label: "Authenticator App",
    description: "Use an app like Google Authenticator for added security.",
    enabled: true,
  },
];

export const profileSecuritySettingsPage: ProfileSecuritySettingsPageData = {
  title: "Security Settings",
  subtitle: "Manage your profile, security, and preferences.",
  navigation: getProfileSettingsNavigation("security"),
  rewards: profileRewardsCard,
  passwordSectionTitle: "Change Password",
  passwordSectionSubtitle:
    "Update your password to keep your account secure.",
  passwordFields: profileSecurityPasswordFields,
  updatePasswordLabel: "Update Password",
  twoFactorTitle: "Two-Factor Authentication",
  twoFactorSubtitle: "Add an extra layer of security to your account.",
  twoFactorOptions: profileSecurityTwoFactorOptions,
  cancelLabel: "Cancel",
  saveLabel: "Save Changes",
};

const profileNotificationEmailPreferences: ProfileNotificationsPreference[] = [
  {
    id: "order-updates",
    label: "Order Updates",
    description:
      "Detailed summaries, tracking links, and delivery confirmations for every arrangement.",
    enabled: true,
  },
  {
    id: "seasonal-curations",
    label: "Seasonal Curations",
    description:
      "Our lead floral artist's monthly picks and early access to limited holiday collections.",
    enabled: true,
  },
  {
    id: "boutique-news",
    label: "Boutique News",
    description:
      "Occasional updates on workshop events, new flower varieties, and sustainability initiatives.",
    enabled: false,
  },
];

const profileNotificationPushPreferences: ProfileNotificationsPreference[] = [
  {
    id: "delivery-alerts",
    label: "Delivery Alerts",
    description:
      "Instant notifications when your bouquet is out for delivery and has been safely received.",
    enabled: true,
  },
  {
    id: "artist-updates",
    label: "Artist Updates",
    description:
      "Be the first to know when your favorite florist releases a new signature series.",
    enabled: false,
  },
];

const profileNotificationEmailSection: ProfileNotificationsSection = {
  title: "Email Notifications",
  subtitle: "Stay connected with our boutique via curated emails.",
  preferences: profileNotificationEmailPreferences,
};

const profileNotificationPushSection: ProfileNotificationsSection = {
  title: "Push Notifications",
  subtitle: "Real-time alerts delivered straight to your device.",
  preferences: profileNotificationPushPreferences,
};

export const profileNotificationsSettingsPage: ProfileNotificationsSettingsPageData =
  {
    title: "Notifications Settings",
    subtitle: "Tailor your boutique experience to your lifestyle.",
    navigation: getProfileSettingsNavigation("notifications"),
    rewards: profileRewardsCard,
    emailSection: profileNotificationEmailSection,
    pushSection: profileNotificationPushSection,
    discardLabel: "Discard Changes",
    updateLabel: "Update Preferences",
  };

const profilePreferencesRegionalFields: ProfilePreferencesSelectField[] = [
  {
    id: "language",
    label: "LANGUAGE",
    value: "en",
    description: "Preferred language for communication and interface.",
    options: [
      { id: "en", label: "English (EN)", value: "en" },
      { id: "vi", label: "Vietnamese (VI)", value: "vi" },
      { id: "fr", label: "French (FR)", value: "fr" },
    ],
  },
  {
    id: "currency",
    label: "CURRENCY",
    value: "usd",
    description: "Prices will be displayed in this currency.",
    options: [
      { id: "usd", label: "USD ($)", value: "usd" },
      { id: "vnd", label: "VND (₫)", value: "vnd" },
      { id: "eur", label: "EUR (€)", value: "eur" },
    ],
  },
];

const profilePreferencesGiftingToggles: ProfilePreferencesToggleOption[] = [
  {
    id: "signature-gift-wrap",
    label: "Signature Gift Wrap",
    description: "Always include our premium packaging",
    enabled: true,
  },
  {
    id: "eco-friendly-delivery",
    label: "Eco-Friendly Delivery",
    description: "Minimalist recyclable packaging",
    enabled: false,
  },
];

const profilePreferencesRibbonColors: ProfilePreferencesRibbonColor[] = [
  {
    id: "blush",
    label: "Blush",
    color: "#f2d5d5",
    borderColor: "#edd1d1",
    selected: true,
  },
  {
    id: "sage",
    label: "Sage",
    color: "#9db4a0",
    selected: false,
  },
  {
    id: "cream",
    label: "Cream",
    color: "#fdf8f1",
    borderColor: "#e7e5e4",
    selected: false,
  },
  {
    id: "noir",
    label: "Noir",
    color: "#292524",
    selected: false,
  },
];

const profilePreferencesRegionalSection: ProfilePreferencesRegionalSection = {
  title: "Regional Preferences",
  fields: profilePreferencesRegionalFields,
};

const profilePreferencesGiftingSection: ProfilePreferencesGiftingSection = {
  title: "Gifting Preferences",
  toggles: profilePreferencesGiftingToggles,
  ribbonLabel: "SIGNATURE RIBBON COLOR",
  ribbonColors: profilePreferencesRibbonColors,
  preview: {
    image: "/images/gallery-photo.png",
    alt: "Aesthetic bouquet preview",
    label: "AESTHETIC PREVIEW",
  },
};

export const profilePreferencesSettingsPage: ProfilePreferencesSettingsPageData =
  {
    title: "Preferences Settings",
    subtitle:
      "Customize your shopping experience to match your personal aesthetic.",
    navigation: getProfileSettingsNavigation("preferences"),
    rewards: profileRewardsCard,
    regionalSection: profilePreferencesRegionalSection,
    giftingSection: profilePreferencesGiftingSection,
    saveLabel: "Save Changes",
    resetLabel: "Reset to Default",
  };
