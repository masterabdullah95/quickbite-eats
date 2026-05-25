import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/menu")({
  component: MenuAdmin,
});

type Item = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
  rating: number | null;
  is_available: boolean | null;
};

const CATEGORIES = ["Burgers", "Pizza", "Pasta", "Drinks", "Desserts"];

function MenuAdmin() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null);

  const load = async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    setItems((data as Item[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (i: Item) => {
    const { error } = await supabase.from("menu_items").update({ is_available: !i.is_available }).eq("id", i.id);
    if (error) return toast.error(error.message);
    setItems((p) => p.map((x) => x.id === i.id ? { ...x, is_available: !x.is_available } : x));
  };

  const remove = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", confirmDelete.id);
    if (error) return toast.error(error.message);
    toast.success("Item deleted");
    setItems((p) => p.filter((x) => x.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500 text-sm">{items.length} items</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 bg-[#E8470A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#c93b08]">
          <Plus className="h-4 w-4" /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Image</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Available</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden">
                      {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{i.name}</td>
                  <td className="px-4 py-3 text-slate-600">{i.category}</td>
                  <td className="px-4 py-3 font-semibold">${Number(i.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{i.rating?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(i)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${i.is_available ? "bg-green-500" : "bg-slate-300"}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${i.is_available ? "translate-x-5" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(i); setShowForm(true); }}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDelete(i)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 ml-1"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ItemForm
        open={showForm}
        initial={editing}
        onClose={() => setShowForm(false)}
        onSaved={(saved, isNew) => {
          setItems((p) => isNew ? [...p, saved] : p.map((x) => x.id === saved.id ? saved : x));
          setShowForm(false);
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete menu item?"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ItemForm({
  open, initial, onClose, onSaved,
}: { open: boolean; initial: Item | null; onClose: () => void; onSaved: (i: Item, isNew: boolean) => void }) {
  const [form, setForm] = useState({
    name: "", category: CATEGORIES[0], description: "", price: "", image_url: "", rating: "4.5",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        name: initial.name, category: initial.category, description: initial.description ?? "",
        price: String(initial.price), image_url: initial.image_url ?? "", rating: String(initial.rating ?? 4.5),
      } : { name: "", category: CATEGORIES[0], description: "", price: "", image_url: "", rating: "4.5" });
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name, category: form.category, description: form.description || null,
      price: Number(form.price), image_url: form.image_url || null, rating: Number(form.rating),
    };
    if (initial) {
      const { data, error } = await supabase.from("menu_items").update(payload).eq("id", initial.id).select().single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Item updated");
      onSaved(data as Item, false);
    } else {
      const { data, error } = await supabase.from("menu_items").insert(payload).select().single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("Item created");
      onSaved(data as Item, true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
            <motion.form onSubmit={submit}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 pointer-events-auto max-h-[90vh] overflow-y-auto space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{initial ? "Edit Item" : "Add New Item"}</h3>
                <button type="button" onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X className="h-5 w-5" /></button>
              </div>
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <div>
                <label className="text-xs font-medium text-slate-700">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($)" type="number" step="0.01" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
                <Field label="Rating" type="number" step="0.1" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
              </div>
              <Field label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} placeholder="https://..." />
              <button disabled={saving} className="w-full bg-[#E8470A] text-white font-semibold py-2.5 rounded-lg disabled:opacity-60">
                {saving ? "Saving..." : initial ? "Update Item" : "Create Item"}
              </button>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = "text", step, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; step?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8470A]" />
    </div>
  );
}

function ConfirmDialog({
  open, title, message, onConfirm, onCancel,
}: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel} className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 z-50 grid place-items-center p-4 pointer-events-none">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 pointer-events-auto">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-slate-600 mt-2">{message}</p>
              <div className="mt-5 flex gap-2 justify-end">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">Delete</button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
