import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

// This layout sits above the app root layout which has Navbar/Footer.
// We use fixed inset-0 z-50 to cover them for admin pages.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className={`${inter.variable} fixed inset-0 z-50 bg-[#faf7f2] overflow-auto`}>
        {children}
      </div>
    </>
  )
}
