"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DemoContextValue {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextValue>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export const useDemo = () => useContext(DemoContext);

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;SameSite=Strict`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearDemoState() {
  sessionStorage.removeItem("gastify_demo");
  deleteCookie("gastify_demo");
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check demo state on mount AND on every pathname change
  useEffect(() => {
    const demoFlag = sessionStorage.getItem("gastify_demo") === "true";

    if (!demoFlag) {
      setIsDemo(false);
      return;
    }

    // Demo flag is set — but check if user has a real session
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Real user logged in — demo must be cleared
        clearDemoState();
        setIsDemo(false);
      } else {
        setIsDemo(true);
      }
    });
  }, [pathname]);

  const enterDemo = useCallback(() => {
    sessionStorage.setItem("gastify_demo", "true");
    setCookie("gastify_demo", "true");
    setIsDemo(true);
    router.push("/dashboard");
  }, [router]);

  const exitDemo = useCallback(() => {
    clearDemoState();
    setIsDemo(false);
    router.push("/");
  }, [router]);

  return (
    <DemoContext value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext>
  );
}
