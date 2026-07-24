import { Providers } from "@/components/providers";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </Providers>
  );
}
