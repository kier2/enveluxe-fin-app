import React, { useState, useEffect } from "react";
import api from "../utils/axios";

interface EnvelopeOption {
  id: number;
  name: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional callback so the transactions page can refresh itself after save */
  onSaved?: () => void;
}

const defaultForm = () => ({
  type: "expense" as "income" | "expense",
  envelope_id: "",
  description: "",
  amount: "",
  transaction_date: new Date().toISOString().split("T")[0],
});

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSaved,
}: AddTransactionModalProps) {
  const [envelopes, setEnvelopes] = useState<EnvelopeOption[]>([]);
  const [formData, setFormData] = useState(defaultForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch envelopes once modal opens
  useEffect(() => {
    if (!isOpen) return;
    setFormData(defaultForm());
    api
      .get("/envelopes")
      .then((res) => setEnvelopes(res.data.data || res.data))
      .catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/transactions", {
        type: formData.type,
        envelope_id:
          formData.type === "expense" && formData.envelope_id
            ? parseInt(formData.envelope_id)
            : null,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
      });
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add Transaction</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

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

          {/* Envelope (only for expense) */}
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
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Add Transaction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
