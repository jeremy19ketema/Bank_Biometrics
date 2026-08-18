"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0B192C",
            color: "white",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1>Something went wrong</h1>
            <p>Please refresh the page and try again.</p>
          </div>
        </div>
      </body>
    </html>
  );
}