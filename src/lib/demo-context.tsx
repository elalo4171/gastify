"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";

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

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const demo = sessionStorage.getItem("gastify_demo") === "true";
    setIsDemo(demo);
  }, []);

  const enterDemo = useCallback(() => {
    sessionStorage.setItem("gastify_demo", "true");
    setCookie("gastify_demo", "true");
    setIsDemo(true);
    router.push("/dashboard");
  }, [router]);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem("gastify_demo");
    deleteCookie("gastify_demo");
    setIsDemo(false);
    router.push("/");
  }, [router]);

  return (
    <DemoContext value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext>
  );
}
