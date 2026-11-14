import { createContext } from "react";
import type {
  AccountView,
  OrganizationView,
  RegisterInput,
} from "../types/api";

export type AuthContextValue = {
  user: AccountView | null;
  organizations: OrganizationView[];
  loading: boolean;
  register: (input: RegisterInput) => Promise<AccountView>;
  login: (email: string, password: string) => Promise<AccountView>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
