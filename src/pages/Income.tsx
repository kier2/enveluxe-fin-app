import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Pagination from "../components/Pagination";
import { useSettings } from "../contexts/SettingsContext";

interface TransactionData {
  id: number;
  envelope_id: number | null;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

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



export default function Income() {
  const { formatCurrency } = useSettings();
  const [incomes, setIncomes] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIncomeId, setCurrentIncomeId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [incomeToDeleteId, setIncomeToDeleteId] = useState<number | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(incomes.length / itemsPerPage);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [incomes.length, currentPage, totalPages]);

  const fetchIncomes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/transactions");
      const allTxns: TransactionData[] = response.data.data || response.data;
      // Filter strictly for type === "income"
      const filteredIncomes = allTxns.filter((txn) => txn.type === "income");
      setIncomes(filteredIncomes);
    } catch (error) {
      console.error("Error fetching income transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Calculate Summary metrics
  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
  const incomesCount = incomes.length;

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentIncomeId(null);
    setFormData({
      description: "",
      amount: "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (txn: TransactionData) => {
    setIsEditing(true);
    setCurrentIncomeId(txn.id);
    setFormData({
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
        type: "income" as const,
        envelope_id: null,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
      };

      if (isEditing && currentIncomeId) {
        await api.put(`/transactions/${currentIncomeId}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      setIsModalOpen(false);
      fetchIncomes();
    } catch (error) {
      console.error("Error saving income transaction:", error);
    }
  };

  const triggerDelete = (id: number) => {
    setIncomeToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (incomeToDeleteId === null) return;
    try {
      await api.delete(`/transactions/${incomeToDeleteId}`);
      setIncomes(incomes.filter((item) => item.id !== incomeToDeleteId));
    } catch (error) {
      console.error("Error deleting income transaction:", error);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Income</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Track and manage all your income transactions and sources.
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
          Add Income
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Total Income Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#047857" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Income</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalIncome)}</h4>
          </div>
        </div>

        {/* Average Income Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#047857" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Average / Entry</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(avgIncome)}</h4>
          </div>
        </div>

        {/* Transactions Count Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#047857" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 9h3.375M9.75 3h4.5c.18 0 .35.04.5.115M9.75 3c-.18 0-.35.04-.5.115M9.75 3A1.125 1.125 0 0 0 8.625 4.125v15.75c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125V4.125c0-.621-.504-1.125-1.125-1.125M15.75 9h1.5a1.125 1.125 0 0 1 1.125 1.125v8a1.125 1.125 0 0 1-1.125 1.125h-1.5M15.75 14h1.5" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Entries</p>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{incomesCount}</h4>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Date</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Description</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-36"></div></td>
                    <td className="px-6 py-4 flex justify-end"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No income entries yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first income transaction to get started.</p>
                  </td>
                </tr>
              ) : (
                incomes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800/60 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{formatDate(item.transaction_date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200 font-medium">{item.description || "—"}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                      +{formatCurrency(Number(item.amount))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => triggerDelete(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
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
        <Pagination
          currentPage={currentPage}
          totalItems={incomes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              {isEditing ? "Edit Income Entry" : "Add Income Entry"}
            </h3>
            <form onSubmit={handleSubmit}>
              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="e.g. Salary, Freelance project"
                  required
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
                  {isEditing ? "Save Changes" : "Add Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setIncomeToDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Income Transaction"
        message="Are you sure you want to delete this income entry? This action cannot be undone."
      />
    </div>
  );
}
