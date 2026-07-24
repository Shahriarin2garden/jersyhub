"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";

export function LogoutButton() {
  const { t } = useI18n();
  return (
    <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
      <LogOut className="size-4" /> {t("nav.logout")}
    </Button>
  );
}
