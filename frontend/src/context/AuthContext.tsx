import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "../lib/api";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../lib/auth";
import { AuthContext } from "./auth-context";
import type {
  AccountView,
  OrganizationView,
  RegisterInput,
} from "../types/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountView | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile.account);
          setOrganizations(profile.organizations);
        }
      })
      .catch((error: unknown) => {
        if (
          !cancelled &&
          !(error instanceof ApiError && error.status === 401)
        ) {
          console.error(error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function register(input: RegisterInput) {
    await registerRequest(input);
    const account = await loginRequest(input.email, input.password);
    setUser(account);
    return account;
  }

  async function login(email: string, password: string) {
    const account = await loginRequest(email, password);
    setUser(account);
    return account;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setOrganizations([]);
    }
  }

  const value = { user, organizations, loading, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

