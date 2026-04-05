const SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PHONE_REGEX = /^0\d{9}$/;

type AuthLocale = "en" | "vi";

const PASSWORD_REQUIREMENTS_MESSAGES: Record<AuthLocale, string> = {
  en: "Password must be at least 8 characters, include 1 uppercase letter, and 1 special character.",
  vi: "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ in hoa và 1 ký tự đặc biệt.",
};

const PHONE_REQUIREMENTS_MESSAGES: Record<AuthLocale, string> = {
  en: "Phone number must be exactly 10 digits and start with 0.",
  vi: "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.",
};

const PASSWORD_REQUIRED_MESSAGES: Record<AuthLocale, string> = {
  en: "Password is required.",
  vi: "Mật khẩu là bắt buộc.",
};

const PHONE_REQUIRED_MESSAGES: Record<AuthLocale, string> = {
  en: "Phone number is required.",
  vi: "Số điện thoại là bắt buộc.",
};

export const PASSWORD_REQUIREMENTS_MESSAGE = PASSWORD_REQUIREMENTS_MESSAGES.en;

export const PHONE_REQUIREMENTS_MESSAGE = PHONE_REQUIREMENTS_MESSAGES.en;

export function getPasswordRequirementsMessage(locale: AuthLocale = "en"): string {
  return PASSWORD_REQUIREMENTS_MESSAGES[locale];
}

export function getPhoneRequirementsMessage(locale: AuthLocale = "en"): string {
  return PHONE_REQUIREMENTS_MESSAGES[locale];
}

export function normalizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("840")) {
    return digits.slice(2, 12);
  }

  if (digits.startsWith("84") && digits.length <= 11) {
    return `0${digits.slice(2)}`.slice(0, 10);
  }

  if (digits.startsWith("84")) {
    return digits.slice(2, 12);
  }

  return digits.slice(0, 10);
}

export function getPhoneValidationMessage(phone: string, locale: AuthLocale = "en"): string | null {
  if (!phone.trim()) {
    return PHONE_REQUIRED_MESSAGES[locale];
  }

  if (!PHONE_REGEX.test(phone.trim())) {
    return getPhoneRequirementsMessage(locale);
  }

  return null;
}

export function getPasswordValidationMessage(password: string, locale: AuthLocale = "en"): string | null {
  if (!password) {
    return PASSWORD_REQUIRED_MESSAGES[locale];
  }

  if (password.length < 8) {
    return getPasswordRequirementsMessage(locale);
  }

  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return getPasswordRequirementsMessage(locale);
  }

  if (!SPECIAL_CHARACTER_REGEX.test(password)) {
    return getPasswordRequirementsMessage(locale);
  }

  return null;
}
