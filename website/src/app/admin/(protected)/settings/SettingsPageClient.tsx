"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  CreditCard,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  created_at: string;
}

interface SettingsPageClientProps {
  initialSettings: Record<string, unknown> | null;
  adminUsers: Omit<AdminUser, "email"> & { email: string | null };
  mpesaEnv: "sandbox" | "production";
}

const DEFAULT_SETTINGS = {
  store_name: "Ayola Foods KE",
  support_email: "",
  support_phone: "",
  default_delivery_fee: 150,
  delivery_cities: ["Nairobi"],
  order_notification_emails: [],
};

export default function SettingsPageClient({
  initialSettings,
  adminUsers,
  mpesaEnv,
}: SettingsPageClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage store settings, payments, and admin accounts
        </p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="store">
            <Settings className="w-4 h-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="mpesa">
            <CreditCard className="w-4 h-4" />
            M-Pesa
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Shield className="w-4 h-4" />
            Admin Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreTab initialSettings={initialSettings} />
        </TabsContent>

        <TabsContent value="mpesa">
          <MpesaTab environment={mpesaEnv} />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsTab adminUsers={adminUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Store Tab ─────────────────────────────────────────────────────────────

function StoreTab({
  initialSettings,
}: {
  initialSettings: Record<string, unknown> | null;
}) {
  const defaults = DEFAULT_SETTINGS as Record<string, unknown>;
  const getValue = (
    key: string,
    fallback: unknown
  ): unknown =>
    (initialSettings?.[key] ?? fallback) as unknown;

  const [name, setName] = useState(getValue("store_name", defaults.store_name) as string);
  const [supportEmail, setSupportEmail] = useState(
    getValue("support_email", defaults.support_email) as string
  );
  const [supportPhone, setSupportPhone] = useState(
    getValue("support_phone", defaults.support_phone) as string
  );
  const [deliveryFee, setDeliveryFee] = useState(
    String(getValue("default_delivery_fee", defaults.default_delivery_fee))
  );
  const [cities, setCities] = useState<string[]>(
    getValue("delivery_cities", defaults.delivery_cities) as string[]
  );
  const [citiesInput, setCitiesInput] = useState("");
  const [notifEmails, setNotifEmails] = useState<string[]>(
    getValue(
      "order_notification_emails",
      defaults.order_notification_emails
    ) as string[]
  );
  const [notifEmailsInput, setNotifEmailsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const addTag = (
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
    }
    inputSetter("");
  };

  const removeTag = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(list.filter((c) => c !== value));
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: name,
          support_email: supportEmail,
          support_phone: supportPhone,
          default_delivery_fee: parseInt(deliveryFee) || 0,
          delivery_cities: cities,
          order_notification_emails: notifEmails,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ type: "error", message: data.error.message });
      } else {
        setToast({ type: "success", message: "Settings saved successfully." });
      }
    } catch {
      setToast({
        type: "error",
        message: "Failed to save settings. Try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl space-y-5">
      <h2 className="font-semibold text-gray-900 text-lg">Store Details</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store name <span className="text-red-500">*</span>
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support email
          </label>
          <Input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Support phone
          </label>
          <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default delivery fee (KES)
          </label>
          <Input
            type="number"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery cities
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {cities.map((city) => (
              <Badge
                key={city}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {city}
                <button
                  onClick={() => removeTag(city, cities, setCities)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={citiesInput}
              onChange={(e) => setCitiesInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(citiesInput, cities, setCities, setCitiesInput);
                }
              }}
              placeholder="Add city..."
            />
            <Button
              size="sm"
              onClick={() =>
                addTag(citiesInput, cities, setCities, setCitiesInput)
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order notification emails
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {notifEmails.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {email}
                <button
                  onClick={() =>
                    removeTag(email, notifEmails, setNotifEmails)
                  }
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={notifEmailsInput}
              onChange={(e) => setNotifEmailsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag(
                    notifEmailsInput,
                    notifEmails,
                    setNotifEmails,
                    setNotifEmailsInput
                  );
                }
              }}
              placeholder="Add email..."
            />
            <Button
              size="sm"
              onClick={() =>
                addTag(
                  notifEmailsInput,
                  notifEmails,
                  setNotifEmails,
                  setNotifEmailsInput
                )
              }
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`p-3 rounded-md text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── M-Pesa Tab ────────────────────────────────────────────────────────────

function MpesaTab({ environment }: { environment: "sandbox" | "production" }) {
  const isProd = environment === "production";

  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [passkey, setPasskey] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-mpesa", {
        method: "POST",
      });
      const data = await res.json();
      setTestResult(data.data);
    } catch {
      setTestResult({
        success: false,
        message: "Failed to test connection.",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const mask = (value: string) => {
    if (!value) return "";
    if (value.length <= 4) return "••••";
    return "•".repeat(value.length - 4) + value.slice(-4);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {isProd && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Production Environment
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              You are editing production M-Pesa credentials. Be careful.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">
              M-Pesa Credentials
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure your Daraja API connection settings
            </p>
          </div>
          <Badge
            variant={isProd ? "destructive" : "secondary"}
            className={isProd ? "" : "bg-green-100 text-green-800"}
          >
            {environment === "production" ? "Production" : "Sandbox"}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consumer Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={consumerKey ? mask(consumerKey) : ""}
                onChange={(e) => setConsumerKey(e.target.value)}
                placeholder="Enter consumer key..."
              />
              {consumerKey && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consumer Secret
            </label>
            <div className="relative">
              <Input
                type={showSecret ? "text" : "password"}
                value={consumerSecret ? mask(consumerSecret) : ""}
                onChange={(e) => setConsumerSecret(e.target.value)}
                placeholder="Enter consumer secret..."
              />
              {consumerSecret && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shortcode
            </label>
            <Input
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="e.g. 174379"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passkey
            </label>
            <Input
              type="password"
              value={passkey ? mask(passkey) : ""}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter passkey..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Callback URL
            </label>
            <Input
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
              placeholder="https://yourdomain.com/api/payments/mpesa/callback"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button
            onClick={handleTest}
            disabled={testLoading}
            variant="outline"
          >
            {testLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>

        {testResult && (
          <div
            className={`mt-4 p-3 rounded-md text-sm ${
              testResult.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success && <Check className="w-4 h-4" />}
              {testResult.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Accounts Tab ────────────────────────────────────────────────────

function AccountsTab({
  adminUsers,
}: {
  adminUsers: Omit<AdminUser, "email"> & { email: string | null };
}) {
  const [users, setUsers] = useState<AdminUser[]>(
    (adminUsers ?? []).map((u) => ({
      ...u,
      email: u.email ?? "",
    }))
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "kitchen">("admin");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ type: "error", message: data.error.message });
      } else {
        setToast({
          type: "success",
          message: `Invitation sent to ${inviteEmail}.`,
        });
        setInviteEmail("");
        setInviteModalOpen(false);
      }
    } catch {
      setToast({
        type: "error",
        message: "Failed to send invitation.",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from admin access? They will be downgraded to a customer role.`))
      return;

    try {
      const res = await fetch(`/api/admin/settings/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setToast({ type: "error", message: data.error.message });
      } else {
        setToast({ type: "success", message: `${name} downgraded to customer.` });
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch {
      setToast({ type: "error", message: "Failed to remove user." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Admin & Staff Accounts</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage who can access the admin panel
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Invite admin
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No admin accounts yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className="text-gray-900 font-medium">
                        {user.full_name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{user.email}</td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                        className={
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() =>
                          handleRemove(
                            user.id,
                            user.full_name || user.email
                          )
                        }
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove admin access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`p-3 rounded-md text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Invite Admin User
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inviteRole"
                      value="admin"
                      checked={inviteRole === "admin"}
                      onChange={() => setInviteRole("admin")}
                      className="accent-orange-500"
                    />
                    <span className="text-sm">Admin</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="inviteRole"
                      value="kitchen"
                      checked={inviteRole === "kitchen"}
                      onChange={() => setInviteRole("kitchen")}
                      className="accent-orange-500"
                    />
                    <span className="text-sm">Kitchen</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

