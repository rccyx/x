import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "black",
          color: "white",
          fontSize: "1.25rem",
          fontFamily: "sans-serif",
          flexDirection: "column",
        }}
      >
        {children}
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </body>
    </html>
  );
}
