// Admin root layout — covers the main app layout (Header/Footer) with a fixed overlay
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      {children}
    </div>
  );
}
