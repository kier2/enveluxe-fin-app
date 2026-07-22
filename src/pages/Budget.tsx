import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Pagination from "../components/Pagination";
import { useSettings } from "../contexts/SettingsContext";

interface Transaction {
  id: number;
  envelope_id: number | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

interface Envelope {
  id: number;
  name: string;
  budget_limit: number;
  balance: number;
  spent: number;
  transactions_count: number;
  transactions?: Transaction[];
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



const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-red-500";
  if (percentage >= 75) return "bg-amber-500";
  return "bg-emerald-500";
};

const getProgressBg = (percentage: number): string => {
  if (percentage >= 90) return "bg-red-100";
  if (percentage >= 75) return "bg-amber-100";
  return "bg-emerald-100";
};

export default function Envelope() {
  const { formatCurrency } = useSettings();
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsEnvelopeName, setDetailsEnvelopeName] = useState("");

  // Envelope modal state
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false);
  const [isEditingEnvelope, setIsEditingEnvelope] = useState(false);
  const [currentEnvelopeId, setCurrentEnvelopeId] = useState<number | null>(null);
  const [envelopeForm, setEnvelopeForm] = useState({ name: "", budget_limit: "" });

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseEnvelopeId, setExpenseEnvelopeId] = useState<number | null>(null);
  const [expenseEnvelopeName, setExpenseEnvelopeName] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [envelopeToDeleteId, setEnvelopeToDeleteId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(envelopes.length / itemsPerPage);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [envelopes.length, currentPage, totalPages]);

  const fetchEnvelopes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/envelopes");
      setEnvelopes(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching envelopes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvelopes();
  }, []);

  // --- Envelope CRUD ---

  const openCreateEnvelopeModal = () => {
    setIsEditingEnvelope(false);
    setCurrentEnvelopeId(null);
    setEnvelopeForm({ name: "", budget_limit: "" });
    setIsEnvelopeModalOpen(true);
  };

  const openEditEnvelopeModal = (env: Envelope) => {
    setIsEditingEnvelope(true);
    setCurrentEnvelopeId(env.id);
    setEnvelopeForm({
      name: env.name,
      budget_limit: env.budget_limit ? env.budget_limit.toString() : "0",
    });
    setIsEnvelopeModalOpen(true);
  };

  const handleEnvelopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: envelopeForm.name,
        budget_limit: envelopeForm.budget_limit
          ? parseFloat(envelopeForm.budget_limit)
          : 0,
      };

      if (isEditingEnvelope && currentEnvelopeId) {
        await api.put(`/envelopes/${currentEnvelopeId}`, payload);
      } else {
        await api.post("/envelopes", payload);
      }

      setIsEnvelopeModalOpen(false);
      fetchEnvelopes();
    } catch (error) {
      console.error("Error saving envelope:", error);
    }
  };

  const triggerDeleteEnvelope = (id: number) => {
    setEnvelopeToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEnvelope = async () => {
    if (envelopeToDeleteId === null) return;
    try {
      await api.delete(`/envelopes/${envelopeToDeleteId}`);
      setEnvelopes(envelopes.filter((env) => env.id !== envelopeToDeleteId));
      if (expandedId === envelopeToDeleteId) {
        setExpandedId(null);
        setExpandedTransactions([]);
      }
    } catch (error) {
      console.error("Error deleting envelope:", error);
    }
  };

  // --- View Details ---

  const openDetailsModal = async (env: Envelope) => {
    setExpandedId(env.id);
    setDetailsEnvelopeName(env.name);
    setIsDetailsModalOpen(true);
    setLoadingTransactions(true);
    try {
      const response = await api.get(`/envelopes/${env.id}`);
      const data = response.data.data || response.data;
      setExpandedTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching envelope details:", error);
      setExpandedTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // --- Add Expense ---

  const openExpenseModal = (env: Envelope) => {
    setExpenseEnvelopeId(env.id);
    setExpenseEnvelopeName(env.name);
    setExpenseForm({
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setIsExpenseModalOpen(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transactions", {
        envelope_id: expenseEnvelopeId,
        type: "expense",
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        transaction_date: expenseForm.transaction_date,
      });

      setIsExpenseModalOpen(false);
      fetchEnvelopes();

      // Refresh expanded transactions if this envelope is expanded
      if (expandedId === expenseEnvelopeId) {
        const response = await api.get(`/envelopes/${expenseEnvelopeId}`);
        const data = response.data.data || response.data;
        setExpandedTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Budget Envelopes</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Allocate your budget into envelopes and track spending per category.
          </p>
        </div>
        <button
          onClick={openCreateEnvelopeModal}
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
          New Envelope
        </button>
      </div>

      {/* Envelope Cards Grid */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Name</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Budget</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Spent</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Remaining</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800 min-w-[150px]">Usage</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-100 rounded w-24"></div>
                          <div className="h-3 bg-gray-50 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                        <div className="w-8 h-3 bg-gray-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <div className="h-7 w-7 bg-gray-100 rounded-lg"></div>
                      <div className="h-7 w-7 bg-gray-100 rounded-lg"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : envelopes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No envelopes yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first envelope to start budgeting.</p>
          <button
            onClick={openCreateEnvelopeModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            + Create Envelope
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Name</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Budget</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Spent</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800">Remaining</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800 min-w-[150px]">Usage</th>
                  <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {envelopes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((env) => {
                  const budgetLimit = Number(env.budget_limit || 0);
                  const spent = Number(env.spent || 0);
                  const balance = Number(env.balance || 0);
                  const percentage = budgetLimit > 0 ? Math.min((spent / budgetLimit) * 100, 100) : 0;

                  return (
                    <React.Fragment key={env.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/20 group transition-colors flex flex-col md:table-row">
                        <td className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-200">{env.name}</h3>
                              <p className="text-xs text-gray-400 dark:text-slate-500">{env.transactions_count} transaction{env.transactions_count !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-800">
                          {formatCurrency(budgetLimit)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-red-500 border-b border-gray-200 dark:border-slate-800">
                          {formatCurrency(spent)}
                        </td>
                        <td className={`px-6 py-4 text-sm font-bold border-b border-gray-200 dark:border-slate-800 ${balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className={`w-full h-2 rounded-full ${getProgressBg(percentage)}`}>
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-[11px] font-semibold w-8 text-right ${percentage >= 90 ? "text-red-500" : percentage >= 75 ? "text-amber-500" : "text-emerald-600"}`}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openDetailsModal(env)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openExpenseModal(env)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Add Expense"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditEnvelopeModal(env)}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => triggerDeleteEnvelope(env.id)}
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
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={envelopes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create/Edit Envelope Modal */}
      {isEnvelopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {isEditingEnvelope ? "Edit Envelope" : "New Envelope"}
            </h3>
            <form onSubmit={handleEnvelopeSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={envelopeForm.name}
                  onChange={(e) => setEnvelopeForm({ ...envelopeForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="e.g. Groceries"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Limit (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={envelopeForm.budget_limit}
                  onChange={(e) => setEnvelopeForm({ ...envelopeForm, budget_limit: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEnvelopeModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isEditingEnvelope ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Expense</h3>
            <p className="text-sm text-gray-500 mb-5">
              Adding expense to <span className="font-semibold text-emerald-700">{expenseEnvelopeName}</span>
            </p>
            <form onSubmit={handleExpenseSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="e.g. Vegetables, Meat"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={expenseForm.transaction_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, transaction_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Expense Breakdown</h3>
                <p className="text-sm text-gray-500">
                  Transactions for <span className="font-semibold text-emerald-700">{detailsEnvelopeName}</span>
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {loadingTransactions ? (
                <div className="text-center py-10 text-sm text-gray-400">Loading transactions...</div>
              ) : expandedTransactions.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No expenses recorded yet.</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Date</th>
                        <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Description</th>
                        <th className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 text-right border-b border-gray-200">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expandedTransactions.map((txn) => (
                        <tr key={txn.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(txn.transaction_date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 font-medium">{txn.description || "—"}</td>
                          <td className="px-4 py-3 text-sm text-red-500 font-semibold text-right">
                            -{formatCurrency(Number(txn.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEnvelopeToDeleteId(null);
        }}
        onConfirm={handleDeleteEnvelope}
        title="Delete Envelope"
        message="Are you sure you want to delete this envelope? All transactions under it will be affected."
      />
    </div>
  );
}