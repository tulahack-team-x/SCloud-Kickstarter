import { apiFetch } from "./api";
import type { AccountView, Profile, RegisterInput } from "../types/api";

export function register(input: RegisterInput): Promise<AccountView> {
  return apiFetch<AccountView>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(email: string, password: string): Promise<AccountView> {
  return apiFetch<AccountView>("/auth/login", {
    method: "POST",
    body: new URLSearchParams({ email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

export function getMe(): Promise<Profile> {
  return apiFetch<Profile>("/me");
}
