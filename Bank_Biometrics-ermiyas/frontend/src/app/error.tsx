"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B192C",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        <h1>Something went wrong</h1>

        <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={() => reset()}
          style={{
            background: "#C69A4C",
            color: "#0B192C",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}