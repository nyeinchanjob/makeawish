import { createContext } from "react";
import type { PrototypeAdminSession } from "./prototype-admin-auth";

export interface AdminAuthContextValue {
  session: PrototypeAdminSession | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
