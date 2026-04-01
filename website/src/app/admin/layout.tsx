"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

// Admin shell layout — wraps all /admin/* pages except /admin/login.
// Auth is enforced by middleware; this layout only handles the UI shell.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Hide the shell on the login page so it renders clean
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col border-r bg-background px-3 py-6 gap-2">
        <p className="px-2 mb-4 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Admin
        </p>

        <nav className="flex-1 space-y-1">
          <Link
            href="/admin/orders"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith("/admin/orders") &&
                "bg-accent text-accent-foreground"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Orders
          </Link>
        </nav>

        <Button
          variant="ghost"
          className="justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
