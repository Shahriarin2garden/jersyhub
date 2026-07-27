"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, where
 * `error.tsx` cannot help because the layout that would wrap it is the thing
 * that broke. It must therefore render its own <html> and <body>.
 *
 * This is also what a production visitor sees if `assertEnv()` throws on a
 * misconfigured deploy, so it deliberately depends on nothing — no fonts, no
 * design tokens, no i18n, no components. Inline styles only; anything imported
 * here is another thing that can fail at the same moment.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0b0a",
          color: "#f5efe0",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "26rem" }}>
          <p
            style={{
              letterSpacing: "0.25em",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#c79a2e",
              margin: 0,
            }}
          >
            NEXVIVE
          </p>
          <h1 style={{ fontSize: "1.5rem", margin: "0.75rem 0 0" }}>
            The site is temporarily unavailable
          </h1>
          <p style={{ color: "rgba(245,239,224,0.75)", lineHeight: 1.6 }}>
            We are working on it. Please try again in a few minutes.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "rgba(245,239,224,0.5)" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              border: 0,
              borderRadius: 8,
              background: "#c79a2e",
              color: "#0c0b0a",
              fontSize: "1rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
