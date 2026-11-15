const KEY = "astroguia:admin";

export function isAdmin(): boolean {
  return sessionStorage.getItem(KEY) === "ok";
}

export function loginAdmin(): void {
  sessionStorage.setItem(KEY, "ok");
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(KEY);
}
