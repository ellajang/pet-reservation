import { fetchJSON, postJSON } from "@/shared/lib/api";

export const authAPI = {
  check: () => fetch("/api/auth/check"),
  login: (email: string, password: string) =>
    postJSON("/api/auth/login", { email, password }),
  logout: () => fetch("/api/auth/logout", { method: "POST" }),
};
