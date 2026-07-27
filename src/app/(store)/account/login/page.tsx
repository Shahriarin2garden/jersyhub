"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Phone, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/components/i18n-provider";

export default function AccountLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { t } = useI18n();

  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Could not send code", "error");
        return;
      }
      setStep("code");
      if (json.data.devCode) toast(`Dev code: ${json.data.devCode}`, "info");
      else toast("Code sent to your phone", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("customer-otp", {
      phone,
      code,
      name,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast("Incorrect or expired code", "error");
      return;
    }
    toast("Logged in", "success");
    router.push("/account");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-light">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("nav.login")}
          </h1>
          <p className="text-sm text-text-muted">
            {step === "phone"
              ? t("account.phone")
              : t("account.enterCode")}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={sendCode} className="space-y-4">
            <Input
              label={t("account.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional for returning users"
            />
            <Input
              label={t("account.phone")}
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button type="submit" fullWidth loading={loading}>
              <Phone className="size-4" /> {t("account.sendCode")}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <Input
              label="Code"
              inputMode="numeric"
              required
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" fullWidth loading={loading}>
              {t("account.verify")}
            </Button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-center text-sm text-ink hover:underline"
            >
              Change number
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
