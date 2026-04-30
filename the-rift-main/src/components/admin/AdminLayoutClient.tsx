"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface AdminLayoutClientProps {
  role: "admin" | "kitchen";
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  role,
  userName,
  userRole,
  children,
}: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar
        role={role}
        userName={userName}
        userRole={userRole}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content — offset by sidebar width on desktop only */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-hidden">
        <AdminTopbar
          user={{ name: userName, role }}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
