"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "@/components/ui/Footer";
import {
  LayoutDashboard,
  BookOpenCheck,
  FileClock,
  History,
  Layers3,
  FileText,
  Activity,
  Settings,
  Shield,
  Contact2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

// Lista de linkuri
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/practice", icon: BookOpenCheck, label: "Practice" },
  { href: "/dashboard/simulate", icon: FileClock, label: "Simulate" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/flashcards", icon: Layers3, label: "Flashcards" },
  { href: "/dashboard/cheatsheet", icon: FileText, label: "Cheatsheet" },
  { href: "/dashboard/activity", icon: Activity, label: "Activity" },
  { href: "/dashboard/general", icon: Settings, label: "Settings" },
  { href: "/dashboard/security", icon: Shield, label: "Security" },
  { href: "/dashboard/contact", icon: Contact2, label: "Contact" },
];

function NavLinks({
  expanded,
  isMobile,
  onClickLink,
}: {
  expanded: boolean;
  isMobile?: boolean;
  onClickLink?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 mt-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div
  onClick={onClickLink}
  className={clsx(
    "flex py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200",
    expanded || isMobile
      ? "px-4 items-center"
      : "justify-center items-center h-10 w-10 mx-auto",
    isActive
      ? "bg-white text-teal-800 shadow-md"
      : "hover:bg-teal-600 text-white"
  )}
>

              <item.icon className="h-6 w-6" />
              {(expanded || isMobile) && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden lg:fixed top-0 left-0 right-0 bg-teal-800 text-white flex items-center justify-between px-4 py-3 z-50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-md" />
          <span className="ml-3 font-bold text-lg">CloudPractitioneer</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden lg:fixed top-14 left-0 right-0 bg-teal-800 z-40 py-4">
          <NavLinks expanded={true} isMobile={true} onClickLink={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Sidebar desktop (fixat) */}
      <aside
        className={clsx(
          "hidden lg:fixed lg:flex top-0 left-0 h-screen z-40 bg-teal-800 text-white flex-col justify-between transition-all duration-300",
          expanded ? "w-64" : "w-20"
        )}
      >
        <div className="flex flex-col py-6">
          <div className="flex items-center px-4 mb-6 mx-auto">
            <div className="w-10 h-10 bg-white rounded-lg" />
            {expanded && (
              <span className="ml-3 font-bold text-lg">CloudPractitioneer</span>
            )}
          </div>

          <NavLinks expanded={expanded} />
        </div>

        <div className="p-4 flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:text-gray-200 transition"
          >
            {expanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={clsx(
          "sm:overflow-y-auto pl-0 lg:pt-6 lg:pr-6 p-0  mt-14 lg:mt-0 h-screen bg-teal-800",
          expanded ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {children}
        <Footer />
      </main>
      
    </div>
  );
}
