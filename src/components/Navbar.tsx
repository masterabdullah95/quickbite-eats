import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, UtensilsCrossed, LogOut, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/store/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Navbar() {
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0];

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <span className="h-9 w-9 rounded-xl bg-gradient-warm grid place-items-center text-primary-foreground shadow-warm">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <span>QuickBite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Home</Link>
          <Link to="/menu" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Menu</Link>
          <Link to="/about" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">About</Link>
          {user && <Link to="/orders" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">My Orders</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" /> Hi, <span className="font-semibold text-foreground">{firstName}</span>
              </span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted transition-colors">
              Sign in
            </Link>
          )}
          <button
            onClick={open}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-6 w-6" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs font-bold grid place-items-center"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
}
