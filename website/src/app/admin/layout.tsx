// This layout sits above the app root layout which has Navbar/Footer.
// We use fixed inset-0 z-50 to cover them for admin pages.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      {children}
    </div>
  );
}
