import { ToastProvider } from "@/components/ui/toast";

export const metadata = { title: "Admin" };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
