import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title:{ default:"Time Track", template:"%s | Time Track" }, description:"Employee time tracking and weekly team reports" };

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
