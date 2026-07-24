"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Shirt, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("admin-credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-light">
            <Shirt className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Admin login</h1>
          <p className="text-sm text-text-muted">JersyHub dashboard</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={show ? "text" : "password"}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-9 text-text-muted hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
