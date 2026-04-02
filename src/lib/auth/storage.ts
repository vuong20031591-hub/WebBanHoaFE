const TOKEN_KEY = "auth_token";
const STORAGE_TYPE_KEY = "auth_storage_type";

type StorageType = "localStorage" | "sessionStorage";

function getStorage(type: StorageType): Storage | null {
  if (typeof window === "undefined") return null;
  return type === "localStorage" ? window.localStorage : window.sessionStorage;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const storageType = window.localStorage.getItem(STORAGE_TYPE_KEY) as StorageType | null;
  
  if (storageType === "localStorage") {
    return window.localStorage.getItem(TOKEN_KEY);
  } else if (storageType === "sessionStorage") {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string, rememberMe: boolean): void {
  if (typeof window === "undefined") return;

  const storageType: StorageType = rememberMe ? "localStorage" : "sessionStorage";
  const storage = getStorage(storageType);

  if (storage) {
    storage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(STORAGE_TYPE_KEY, storageType);
  }
}

export function clearToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(STORAGE_TYPE_KEY);
}
