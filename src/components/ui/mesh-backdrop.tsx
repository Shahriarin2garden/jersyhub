import { cn } from "@/lib/utils";

/**
 * Haikei-style backdrop: flat, organic blobs in the brand golds, layered to give
 * dark sections some depth without a texture asset.
 *
 * Deliberately STATIC. Infinite decorative motion is reserved for loading
 * indicators only — a permanently drifting background is a distraction that also
 * keeps the compositor awake for the life of the page. Pure CSS shapes (no
 * filters, no images, no JS), so it costs nothing to render.
 */
export function MeshBackdrop({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <span className="absolute -left-[8%] -top-[15%] size-96 rounded-[42%_58%_60%_40%/55%_45%_55%_45%] bg-accent/20" />
      <span className="absolute -right-[10%] top-[20%] size-80 rounded-[60%_40%_45%_55%/50%_60%_40%_50%] bg-secondary/15" />
      <span className="absolute -bottom-[20%] left-[32%] size-96 rounded-[50%_50%_55%_45%/45%_55%_50%_50%] bg-accent/15" />
    </div>
  );
}
