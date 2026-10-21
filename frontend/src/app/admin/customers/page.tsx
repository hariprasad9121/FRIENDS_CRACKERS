"use client";

import { useEffect, useState } from "react";
import { adminCustomers, getAdminToken } from "@/lib/admin-api";

type Customer = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  created_at: string;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getAdminToken()
      .then((t) => adminCustomers(t))
      .then((res) => setCustomers(res.data as Customer[]))
      .catch(() => setCustomers([]));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Customers</h1>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-navy/5 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.full_name || "—"}</td>
                <td className="p-3 capitalize">{c.role}</td>
                <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
