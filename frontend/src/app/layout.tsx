import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BTMS",
    template: "%s | BTMS",
  },
  description: "Bachelor's Thesis Examination & Financial Management System",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js?token=d4401569-4e5a-4a2d-b0d8-5975b1c0f64b"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
