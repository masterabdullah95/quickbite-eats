import { Facebook, Instagram, Twitter, UtensilsCrossed } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-charcoal text-cream">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span className="h-9 w-9 rounded-xl bg-gradient-warm grid place-items-center"><UtensilsCrossed className="h-5 w-5" /></span>
            QuickBite
          </div>
          <p className="mt-3 text-sm opacity-70 max-w-xs">Hot meals, fast. Order from your favorite kitchens and we'll deliver in minutes.</p>
        </div>
        <div className="flex gap-12">
          <div>
            <h4 className="text-sm font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/login" className="hover:text-primary">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-primary">Sign Up</Link></li>
            </ul>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Follow</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Twitter" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs opacity-60">© {new Date().getFullYear()} QuickBite. All rights reserved.</div>
    </footer>
  );
}
