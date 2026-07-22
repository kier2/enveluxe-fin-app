import React, { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";

type Tab = "general" | "integrations";

export default function Settings() {
  const { theme, setTheme, currency, setCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>("general");

  // Mock integration items
  // Load integrations from localStorage or use defaults
  const [integrations, setIntegrations] = useState(() => {
    const saved = localStorage.getItem("integrations_settings");
    let parsed: Record<string, boolean> = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    return [
      {
        id: "slack",
        name: "Slack Notifications",
        description: "Receive instant notifications when budget limits reach 75% or 90%.",
        icon: (
          <svg className="w-8 h-8 text-[#4A154B]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52H3.778a2.528 2.528 0 0 1-2.522-2.52V8.824a2.528 2.528 0 0 1 2.522-2.52h5.043zm10.135 3.779a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.262 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.778a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zm-2.52 10.135a2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52v-2.52h2.522a2.528 2.528 0 0 1 2.52 2.52zm0-1.262a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.043a2.528 2.528 0 0 1-2.522 2.52h-5.043z" />
          </svg>
        ),
        connected: parsed.slack !== undefined ? parsed.slack : false,
      },
      {
        id: "sheets",
        name: "Google Sheets Export",
        description: "Auto-export income and expense records to a target spreadsheet.",
        icon: (
          <svg className="w-8 h-8 text-[#0F9D58]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
          </svg>
        ),
        connected: parsed.sheets !== undefined ? parsed.sheets : false,
      },
      {
        id: "csv",
        name: "Auto-Backup (CSV)",
        description: "Weekly export of your transaction history directly to your email.",
        icon: (
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        connected: parsed.csv !== undefined ? parsed.csv : true,
      },
    ];
  });

  const toggleIntegration = (id: string) => {
    const updated = integrations.map((item) =>
      item.id === id ? { ...item, connected: !item.connected } : item
    );
    setIntegrations(updated);

    const savedStates = updated.reduce((acc, item) => {
      acc[item.id] = item.connected;
      return acc;
    }, {} as Record<string, boolean>);
    localStorage.setItem("integrations_settings", JSON.stringify(savedStates));
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Personalize your layout, configure defaults, and link external applications.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-4 px-4 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === "general"
              ? "text-emerald-600 dark:text-emerald-500"
              : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          General & Appearance
          {activeTab === "general" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`pb-4 px-4 font-semibold text-sm transition-all relative cursor-pointer ${
            activeTab === "integrations"
              ? "text-emerald-600 dark:text-emerald-500"
              : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Integrations
          {activeTab === "integrations" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "general" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Theme settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Color Theme</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
              Choose your preferred layout color palette.
            </p>

            <div className="space-y-3">
              {/* Light Mode */}
              <button
                onClick={() => setTheme("light")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  theme === "light"
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Light Mode</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Clean and bright user interface.</p>
                  </div>
                </div>
                {theme === "light" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                )}
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme("dark")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  theme === "dark"
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Comfortable setting for low-light rooms.</p>
                  </div>
                </div>
                {theme === "dark" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                )}
              </button>

              {/* System Theme */}
              <button
                onClick={() => setTheme("system")}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                  theme === "system"
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">System Preference</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Sync dashboard theme with OS settings.</p>
                  </div>
                </div>
                {theme === "system" && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                )}
              </button>
            </div>
          </div>

          {/* Card: Currency defaults */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 h-fit">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Local Currency</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
              Set standard currency to display balances and ledger entries.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Select Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                >
                  <option value="PHP">₱ Philippine Peso (PHP)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="JPY">¥ Japanese Yen (JPY)</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-gray-100 dark:border-slate-800/60">
                <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Format Preview
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {currency === "PHP" && "₱1,250.75"}
                  {currency === "USD" && "$1,250.75"}
                  {currency === "EUR" && "€1.250,75"}
                  {currency === "GBP" && "£1,250.75"}
                  {currency === "JPY" && "¥1,251.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Card: Integrations list */
        <div className="space-y-4 max-w-3xl">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-5 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {item.name}
                    {item.connected && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold rounded-full border border-emerald-100 dark:border-emerald-900/30">
                        Connected
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                </div>
              </div>

              {/* Action Toggle Button */}
              <button
                onClick={() => toggleIntegration(item.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.connected ? "bg-emerald-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
                role="switch"
                aria-checked={item.connected}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.connected ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
