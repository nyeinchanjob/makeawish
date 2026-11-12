import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getPrototypeAdminSession,
  signInPrototypeAdmin,
  signOutPrototypeAdmin,
  type PrototypeAdminSession,
} from "@/lib/prototype-admin-auth";
import { AdminAuthContext } from "@/lib/admin-auth-context";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PrototypeAdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getPrototypeAdminSession()
      .then((savedSession) => {
        if (active) setSession(savedSession);
      })
      .catch((error: unknown) => {
        console.error("Unable to restore the admin session.", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const nextSession = await signInPrototypeAdmin(username, password);
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await signOutPrototypeAdmin();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loading, signIn, signOut }),
    [loading, session, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
