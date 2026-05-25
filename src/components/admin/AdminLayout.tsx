import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Users, BarChart3,
  LogOut, Menu as MenuIcon, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type NavItem = { to: "/admin" | "/admin/orders" | "/admin/menu" | "/admin/customers" | "/admin/analytics"; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const name =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Admin";

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-800">
        <span className="h-9 w-9 rounded-xl bg-[#E8470A] grid place-items-center text-white">
          <UtensilsCrossed className="h-5 w-5" />
        </span>
        <div>
          <div className="font-bold text-white">QuickBite</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Admin Panel</div>
        </div>
      </div>
      <nav className="px-3 py-6 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#E8470A] text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-[#0F172A] text-slate-200 fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[#0F172A] text-slate-200 z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100">
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="font-semibold text-slate-900">
            {NAV.find((n) => (n.exact ? pathname === n.to : pathname.startsWith(n.to)))?.label ?? "Admin"}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-slate-600">
              Hi, <span className="font-semibold text-slate-900">{name}</span>
            </span>
            <Link to="/" className="text-xs text-slate-500 hover:text-[#E8470A]">View site</Link>
            <button onClick={logout} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="flex-1 p-4 md:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

export const STATUS_OPTIONS = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof STATUS_OPTIONS)[number];

export const STATUS_BADGE: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Preparing: "bg-blue-100 text-blue-800 border-blue-200",
  "Out for Delivery": "bg-purple-100 text-purple-800 border-purple-200",
  Delivered: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};
