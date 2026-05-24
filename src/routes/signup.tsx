import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — QuickBite" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! Check your email to verify.");
    nav({ to: "/login" });
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <div className="container mx-auto px-4 py-16 grid place-items-center">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-card rounded-3xl p-8 shadow-card">
        <h1 className="font-display text-3xl font-bold">Create your account</h1>
        <p className="text-muted-foreground mt-1">Start ordering in seconds.</p>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <Field label="Full name" type="text" value={fullName} onChange={setFullName} required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Password" type="password" value={password} onChange={setPassword} required />
          <button disabled={loading} className="w-full bg-gradient-warm text-primary-foreground font-semibold py-3 rounded-xl shadow-warm disabled:opacity-60">
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>
        <div className="my-5 text-center text-xs text-muted-foreground uppercase tracking-wider">or</div>
        <button onClick={google} className="w-full border border-border font-semibold py-3 rounded-xl hover:bg-muted">Continue with Google</button>
        <p className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
