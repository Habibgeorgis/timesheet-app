import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title:{ default:"Tempo", template:"%s | Tempo" }, description:"Employee time tracking and timesheet approvals" };

export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
