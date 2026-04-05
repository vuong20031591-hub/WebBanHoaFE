export interface ProfileMember {
  membershipLabel: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  editHref: string;
}

export type ProfileTabId = "orders" | "favorites" | "settings" | "addresses";

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
  href: string;
  active: boolean;
}

export interface ProfileOrder {
  id: string;
  status: string;
  date: string;
  title: string;
  description: string;
  price: number;
  image: string;
  href: string;
}

export interface ProfileFavorite {
  id: string;
  productId: number;
  name: string;
  price: number;
  image: string;
  href: string;
  stockQuantity?: number | null;
}

export interface ProfileFavoritesCollection {
  title: string;
  countLabel: string;
  ctaLabel: string;
  ctaHref: string;
  items: ProfileFavorite[];
}

export type ProfileSettingsNavIcon =
  | "account"
  | "security"
  | "notifications"
  | "preferences";

export interface ProfileSettingsNavItem {
  id: string;
  label: string;
  icon: ProfileSettingsNavIcon;
  active: boolean;
  href?: string;
}

export interface ProfileRewardsCard {
  title: string;
  description: string;
  ctaLabel: string;
}

export interface ProfileSettingsAccountInfo {
  photo: string;
  changePhotoLabel: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

export interface ProfileCommunicationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ProfileSettingsPageData {
  title: string;
  subtitle: string;
  navigation: ProfileSettingsNavItem[];
  rewards: ProfileRewardsCard;
  accountInfo: ProfileSettingsAccountInfo;
  communicationTitle: string;
  communicationSubtitle: string;
  communicationPreferences: ProfileCommunicationPreference[];
  cancelLabel: string;
  saveLabel: string;
}

export interface ProfileSecurityPasswordField {
  id: string;
  label: string;
  placeholder: string;
}

export interface ProfileSecurityToggleOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  disabled?: boolean;
}

export interface ProfileSecuritySettingsPageData {
  title: string;
  subtitle: string;
  navigation: ProfileSettingsNavItem[];
  rewards: ProfileRewardsCard;
  passwordSectionTitle: string;
  passwordSectionSubtitle: string;
  passwordFields: ProfileSecurityPasswordField[];
  updatePasswordLabel: string;
  twoFactorTitle: string;
  twoFactorSubtitle: string;
  twoFactorOptions: ProfileSecurityToggleOption[];
  cancelLabel: string;
  saveLabel: string;
}

export interface ProfileNotificationsPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ProfileNotificationsSection {
  title: string;
  subtitle: string;
  preferences: ProfileNotificationsPreference[];
}

export interface ProfileNotificationsSettingsPageData {
  title: string;
  subtitle: string;
  navigation: ProfileSettingsNavItem[];
  rewards: ProfileRewardsCard;
  emailSection: ProfileNotificationsSection;
  pushSection: ProfileNotificationsSection;
  discardLabel: string;
  updateLabel: string;
}

export interface ProfilePreferencesSelectOption {
  id: string;
  label: string;
  value: string;
}

export interface ProfilePreferencesSelectField {
  id: string;
  label: string;
  value: string;
  description: string;
  options: ProfilePreferencesSelectOption[];
}

export interface ProfilePreferencesToggleOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ProfilePreferencesRegionalSection {
  title: string;
  fields: ProfilePreferencesSelectField[];
}

export interface ProfilePreferencesSettingsPageData {
  title: string;
  subtitle: string;
  navigation: ProfileSettingsNavItem[];
  rewards: ProfileRewardsCard;
  regionalSection: ProfilePreferencesRegionalSection;
  saveLabel: string;
  resetLabel: string;
}
