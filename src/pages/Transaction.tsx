import { useState, useEffect } from "react";
import api from "../utils/axios";

interface EnvelopeOption {
  id: number;
  name: string;
  budget_limit: number;
}

interface TransactionData {
  id: number;
  envelope_id: number | null;
  envelope?: { id: number; name: string } | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

/**
 * Safely formats a date string into a readable format like "Aug 03 2026".
 */
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const normalized = dateStr.replace(" ", "T");
  const date = new Date(normalized);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount: number): string => {
  return `₱${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function Transaction() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [envelopes, setEnvelopes] = useState<EnvelopeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    envelope_id: "",
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnvelopes = async () => {
    try {
      const response = await api.get("/envelopes");
      setEnvelopes(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching envelopes:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchEnvelopes();
  }, []);

  // --- Modal Handlers ---

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentTransactionId(null);
    setFormData({
      type: "expense",
      envelope_id: "",
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (txn: TransactionData) => {
    setIsEditing(true);
    setCurrentTransactionId(txn.id);
    setFormData({
      type: txn.type,
      envelope_id: txn.envelope_id ? txn.envelope_id.toString() : "",
      description: txn.description || "",
      amount: txn.amount.toString(),
      transaction_date: txn.transaction_date
        ? txn.transaction_date.split("T")[0]
        : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        type: formData.type,
        envelope_id: formData.type === "expense" && formData.envelope_id
          ? parseInt(formData.envelope_id)
          : null,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
      };

      if (isEditing && currentTransactionId) {
        await api.put(`/transactions/${currentTransactionId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.delete(`/transactions/${id}`);
        setTransactions(transactions.filter((txn) => txn.id !== id));
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Transactions</h2>
          <p className="text-sm text-gray-500">
            Track all your income and expenses in one place.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Date</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Type</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Description</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Envelope</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-lg w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-36"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-lg w-24"></div></td>
                    <td className="px-6 py-4 flex justify-end"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No transactions yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first transaction to get started.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(txn.transaction_date)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        txn.type === "income"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {txn.type === "income" ? "↗ Income" : "↘ Expense"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{txn.description || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {txn.envelope ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        </svg>
                        {txn.envelope.name}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold text-right ${
                    txn.type === "income" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {txn.type === "income" ? "+" : "-"}{formatCurrency(Number(txn.amount))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(txn)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(txn.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {isEditing ? "Edit Transaction" : "Add Transaction"}
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Type Toggle */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income", envelope_id: "" })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      formData.type === "income"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    ↗ Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "expense" })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      formData.type === "expense"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    ↘ Expense
                  </button>
                </div>
              </div>

              {/* Envelope Selector (only for expense) */}
              {formData.type === "expense" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Envelope</label>
                  <select
                    value={formData.envelope_id}
                    onChange={(e) => setFormData({ ...formData, envelope_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all bg-white"
                  >
                    <option value="">No envelope (general expense)</option>
                    {envelopes.map((env) => (
                      <option key={env.id} value={env.id}>
                        {env.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder={formData.type === "income" ? "e.g. Salary, Freelance" : "e.g. Grab Food, Electric Bill"}
                />
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isEditing ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}