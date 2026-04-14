"use client";

import { useState } from "react";
import { Edit3, Save, X, MapPin, Truck } from "lucide-react";

interface DeliveryEditFormProps {
  orderId: string;
  initialData: {
    delivery_address: string;
    delivery_city: string;
    delivery_type: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
  };
}

export function DeliveryEditForm({ orderId, initialData }: DeliveryEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    delivery_address: initialData.delivery_address,
    delivery_city: initialData.delivery_city,
    delivery_type: initialData.delivery_type,
    customer_name: initialData.customer_name,
    customer_phone: initialData.customer_phone,
    customer_email: initialData.customer_email || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      delivery_address: initialData.delivery_address,
      delivery_city: initialData.delivery_city,
      delivery_type: initialData.delivery_type,
      customer_name: initialData.customer_name,
      customer_phone: initialData.customer_phone,
      customer_email: initialData.customer_email || "",
    });
    setIsEditing(false);
  };

  return (
    <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
        <MapPin size={120} className="text-slate-400" />
      </div>

      <div className="relative z-10">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
              <Truck size={20} />
            </div>
            <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
              Delivery Details
            </h3>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-[#1a1a2e] text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              <Edit3 size={14} /> Edit
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group/item">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Customer Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                  <p className="text-sm font-bold text-[#1a1a2e]">{form.customer_name}</p>
                </div>
              )}
            </div>

            <div className="group/item">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Phone Number</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                  <p className="text-sm font-bold text-[#1a1a2e] font-mono">{form.customer_phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="group/item">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Email Address</p>
            {isEditing ? (
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                <p className="text-sm font-bold text-[#1a1a2e]">{form.customer_email || "Not Provided"}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group/item">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Delivery Type</p>
              {isEditing ? (
                <select
                  value={form.delivery_type}
                  onChange={(e) => setForm({ ...form, delivery_type: e.target.value })}
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all"
                >
                  <option value="delivery">Delivery</option>
                  <option value="pickup">Pickup</option>
                  <option value="shipping">Shipping</option>
                </select>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                  <p className="text-sm font-bold text-[#1a1a2e] capitalize">{form.delivery_type}</p>
                </div>
              )}
            </div>

            <div className="group/item">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">City / Region</p>
              {isEditing ? (
                <input
                  type="text"
                  value={form.delivery_city}
                  onChange={(e) => setForm({ ...form, delivery_city: e.target.value })}
                  className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                  <p className="text-sm font-bold text-[#1a1a2e]">{form.delivery_city}</p>
                </div>
              )}
            </div>
          </div>

          <div className="group/item">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Delivery Address</p>
            {isEditing ? (
              <textarea
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                rows={3}
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#1a1a2e] focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/10 outline-none transition-all resize-none"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50/30 border border-transparent">
                <p className="text-sm font-bold text-[#1a1a2e] leading-relaxed">{form.delivery_address}</p>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] bg-[#22c55e] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#1ea34a] transition-all disabled:opacity-50"
              >
                <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-[24px] bg-slate-100 text-[#1a1a2e] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
