import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios";
import { useSettings } from "../contexts/SettingsContext";

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

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

export default function Dashboard() {
  const { formatCurrency } = useSettings();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/transactions")
      .then((res) => {
        setTransactions(res.data.data || res.data);
      })
      .catch((err) => {
        console.error("Error fetching transactions for dashboard:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Compute metrics
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  // Monthly Spend calculation (current month/year)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const monthlySpend = transactions
    .filter((t) => {
      if (t.type !== "expense") return false;
      const tDate = new Date(t.transaction_date.replace(" ", "T"));
      return (
        !isNaN(tDate.getTime()) &&
        tDate.getFullYear() === currentYear &&
        tDate.getMonth() === currentMonth
      );
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Find most expensive expense
  const expensesList = transactions.filter((t) => t.type === "expense");
  const topExpense =
    expensesList.length > 0
      ? expensesList.reduce((max, t) => (Number(t.amount) > Number(max.amount) ? t : max), expensesList[0])
      : null;

  // Get recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5);

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Here is a breakdown of your current finances and expenses for this month.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 h-28 rounded-2xl border border-gray-100 dark:border-slate-800"></div>
          ))}
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Income */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-emerald-600 dark:text-emerald-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306 7.52-7.52M18 8.25h3v3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Income</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalIncome)}</h4>
            </div>
          </div>

          {/* Card 2: Expenses */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-rose-500 dark:text-rose-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.306-4.306 7.52 7.52m0 0-3-3m3 3h-3" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Expenses</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalExpenses)}</h4>
            </div>
          </div>

          {/* Card 3: Monthly Spend */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-amber-500 dark:text-amber-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Monthly Spend</p>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(monthlySpend)}</h4>
            </div>
          </div>

          {/* Card 4: Top Expense */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm flex items-center gap-4 transition-colors duration-200">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-indigo-500 dark:text-indigo-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider truncate">Top Expense</p>
              {topExpense ? (
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {formatCurrency(Number(topExpense.amount))}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                    {topExpense.description || "General"}
                  </p>
                </div>
              ) : (
                <h4 className="text-base font-bold text-gray-400 dark:text-slate-600 mt-1">—</h4>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Grid split: Left Recent list, Right Summary progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
              <Link to="/transactions" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-500">
                View All
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 dark:bg-slate-800 rounded-xl"></div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400 dark:text-slate-500">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentTransactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3.5 rounded-xl border border-gray-50 dark:border-slate-850 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon based on Type */}
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        item.type === "income"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "bg-red-50 text-red-500 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {item.type === "income" ? "+" : "-"}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.description || (item.type === "income" ? "Income Deposit" : "General Expense")}
                        </h4>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                          {formatDate(item.transaction_date)} {item.envelope && `• ${item.envelope.name}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${
                      item.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                    }`}>
                      {item.type === "income" ? "+" : "-"}{formatCurrency(Number(item.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Net Cash Flow Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800/80 shadow-sm p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Financial Summary</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">Current net status across accounts</p>

            <div className="mt-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800/50 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
                Net Balance
              </span>
              <span className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                {formatCurrency(netBalance)}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 block">
                {netBalance >= 0 ? "You've saved money this cycle!" : "Spending exceeds income this cycle."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}