import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SRC = "/assets/logos/nexvive-logo.jpg";
const ALT = "NexVive — Style that defines you";

/**
 * The official NexVive logo — used exactly as supplied, never recoloured,
 * cropped, or reproportioned. The source art is a square lockup on a white
 * ground, so it sits inside a white chip; on dark surfaces the chip reads as
 * an intentional tile while the logo pixels stay untouched.
 */
export function BrandLogo({
  size = 44,
  href = "/",
  priority = false,
  className,
}: {
  size?: number;
  /** Wrap in a link; pass null to render the mark alone. */
  href?: string | null;
  priority?: boolean;
  className?: string;
}) {
  const mark = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm",
        className,
      )}
      style={{ padding: Math.round(size * 0.05) }}
    >
      <Image
        src={SRC}
        alt={ALT}
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className="block h-auto w-auto"
        style={{ width: size, height: size }}
      />
    </span>
  );

  if (href === null) return mark;
  return (
    <Link href={href} aria-label="NexVive home" className="inline-flex">
      {mark}
    </Link>
  );
}
