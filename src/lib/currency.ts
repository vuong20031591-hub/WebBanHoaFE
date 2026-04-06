import { type AppLocale } from "@/lib/i18n/messages";

const USD_EXCHANGE_RATE = 25000;

export function currencyCodeForLocale(locale: AppLocale): "USD" | "VND" {
  return locale === "en" ? "USD" : "VND";
}

export function currencySymbolForLocale(locale: AppLocale): "$" | "₫" {
  return locale === "en" ? "$" : "₫";
}

export function formatCurrency(valueInVnd: number, locale: AppLocale = "vi"): string {
  const currency = currencyCodeForLocale(locale);
  const numberLocale = locale === "en" ? "en-US" : "vi-VN";
  const displayValue = locale === "en" ? valueInVnd / USD_EXCHANGE_RATE : valueInVnd;

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: locale === "en" ? 2 : 0,
  }).format(displayValue);
}
