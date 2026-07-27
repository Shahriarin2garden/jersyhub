import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

/**
 * 404. Reached most often from a stale product link — a jersey that sold out
 * and was unpublished, or an old shared URL. So the page routes onward to the
 * catalogue rather than just reporting the miss: a dead end here is a lost
 * sale, and the visitor arrived wanting to buy something.
 */
export default async function NotFound() {
  const { t } = await getT();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-light">
        <SearchX aria-hidden className="size-8 text-primary" />
      </span>
      <div>
        <p className="tabular font-display text-5xl font-bold text-foreground">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-foreground">
          {t("notFound.title")}
        </h1>
        <p className="mt-2 text-text-secondary">{t("notFound.subtitle")}</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/shop" className="group sm:w-auto">
          <Button variant="accent" size="lg" fullWidth>
            {t("notFound.cta")}
            <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="/" className="sm:w-auto">
          <Button variant="outline" size="lg" fullWidth>
            {t("notFound.home")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
