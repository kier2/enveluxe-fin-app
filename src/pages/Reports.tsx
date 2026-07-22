import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "@react-pdf/renderer";

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

interface GeneratedReport {
  id: string;
  name: string;
  type: "expense" | "income";
  startDate: string;
  endDate: string;
  dateGenerated: string;
}

// React-PDF Stylesheet
const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0F172A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 16,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTextCol: {
    marginLeft: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 2,
    textTransform: "uppercase",
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "right",
    textTransform: "uppercase",
  },
  reportMeta: {
    fontSize: 8,
    color: "#64748B",
    textAlign: "right",
    marginTop: 3,
  },
  billingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#94A3B8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  userName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
  },
  userEmail: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 1,
  },
  badge: {
    backgroundColor: "#ECFDF5",
    color: "#065F46",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 6,
  },
  colDate: { width: "20%" },
  colDesc: { width: "40%" },
  colEnv: { width: "22%" },
  colAmt: { width: "18%", textAlign: "right" },
  thText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
  },
  tdText: {
    fontSize: 9,
    color: "#334155",
  },
  tdBold: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "right",
  },
  totalsContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    marginTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: "#64748B",
  },
  totalValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#047857",
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 36,
    right: 36,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#94A3B8",
    fontStyle: "italic",
  },
});

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

// React-PDF Document Component
interface PDFReportDocumentProps {
  report: GeneratedReport;
  user: any;
  transactions: TransactionData[];
  currencySymbol: string;
}

const PDFReportDocument: React.FC<PDFReportDocumentProps> = ({
  report,
  user,
  transactions,
  currencySymbol,
}) => {
  const filtered = transactions.filter((t) => {
    if (t.type !== report.type) return false;
    const tDate = new Date(t.transaction_date.replace(" ", "T"));
    const sDate = new Date(report.startDate);
    const eDate = new Date(report.endDate);
    tDate.setHours(0, 0, 0, 0);
    sDate.setHours(0, 0, 0, 0);
    eDate.setHours(23, 59, 59, 999);
    return tDate >= sDate && tDate <= eDate;
  });

  const totalSum = filtered.reduce((sum, t) => sum + Number(t.amount), 0);

  const sym = currencySymbol === "₱" ? "PHP " : currencySymbol;
  const fmt = (num: number) =>
    `${sym}${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <Document title={`${report.name} - ${report.id}`}>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandRow}>
            {/* Logo */}
            <Svg width="35" height="44" viewBox="0 0 292 365">
              <Path
                d="M146 215.884C206 175.884 221 115.884 221 45.8838L146 5.88379L71 45.8838C71 115.884 86 175.884 146 215.884Z"
                fill="url(#p0)"
                stroke="#10B981"
                strokeWidth={3}
              />
              <Path
                d="M96 95.8838L146 130.884L196 95.8838V145.884C196 165.884 176 190.884 146 200.884C116 190.884 96 165.884 96 145.884V95.8838Z"
                fill="url(#p1)"
                stroke="#10B981"
                strokeWidth={2}
              />
              <Path
                d="M146 0.883789L216 40.8838L146 80.8838L76 40.8838L146 0.883789Z"
                fill="url(#p2)"
              />
              <Defs>
                <LinearGradient id="p0" x1="71" y1="5" x2="71" y2="215">
                  <Stop offset="0" stopColor="#1E293B" />
                  <Stop offset="1" stopColor="#0F172A" />
                </LinearGradient>
                <LinearGradient id="p1" x1="96" y1="95" x2="200" y2="195">
                  <Stop offset="0" stopColor="#1E293B" />
                  <Stop offset="1" stopColor="#0F172A" />
                </LinearGradient>
                <LinearGradient id="p2" x1="76" y1="80" x2="144" y2="-39">
                  <Stop offset="0" stopColor="#10B981" />
                  <Stop offset="1" stopColor="#34D399" />
                </LinearGradient>
              </Defs>
            </Svg>

            <View style={pdfStyles.brandTextCol}>
              <Text style={pdfStyles.brandTitle}>ENVELUXE</Text>
              <Text style={pdfStyles.brandSubtitle}>Financial Budget Tracker</Text>
            </View>
          </View>

          <View>
            <Text style={pdfStyles.reportTitle}>
              {report.type === "expense" ? "Expense Statement" : "Income Statement"}
            </Text>
            <Text style={pdfStyles.reportMeta}>Invoice ID: {report.id}</Text>
            <Text style={pdfStyles.reportMeta}>Date Generated: {report.dateGenerated}</Text>
          </View>
        </View>

        {/* Billing Details */}
        <View style={pdfStyles.billingSection}>
          <View>
            <Text style={pdfStyles.sectionTitle}>Account Details:</Text>
            <Text style={pdfStyles.userName}>{user?.name || "Member Account"}</Text>
            <Text style={pdfStyles.userEmail}>{user?.email || "account@enveluxe.com"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={pdfStyles.sectionTitle}>Statement Period:</Text>
            <Text style={{ fontSize: 9, fontWeight: "bold", color: "#0F172A" }}>
              {formatDate(report.startDate)} — {formatDate(report.endDate)}
            </Text>
            <Text style={pdfStyles.badge}>SETTLED</Text>
          </View>
        </View>

        {/* Transactions Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.colDate, pdfStyles.thText]}>Date</Text>
            <Text style={[pdfStyles.colDesc, pdfStyles.thText]}>Description</Text>
            {report.type === "expense" && (
              <Text style={[pdfStyles.colEnv, pdfStyles.thText]}>Envelope</Text>
            )}
            <Text style={[pdfStyles.colAmt, pdfStyles.thText]}>Amount</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tdText, { width: "100%", textAlign: "center" }]}>
                No transactions recorded in this period.
              </Text>
            </View>
          ) : (
            filtered.map((t) => (
              <View key={t.id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.colDate, pdfStyles.tdText]}>
                  {formatDate(t.transaction_date)}
                </Text>
                <Text style={[pdfStyles.colDesc, pdfStyles.tdText]}>
                  {t.description || "General"}
                </Text>
                {report.type === "expense" && (
                  <Text style={[pdfStyles.colEnv, pdfStyles.tdText]}>
                    {t.envelope?.name || "General"}
                  </Text>
                )}
                <Text style={[pdfStyles.colAmt, pdfStyles.tdBold]}>{fmt(Number(t.amount))}</Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={pdfStyles.totalsContainer}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
            <Text style={pdfStyles.totalValue}>{fmt(totalSum)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Tax (0%):</Text>
            <Text style={pdfStyles.totalValue}>{fmt(0)}</Text>
          </View>
          <View style={pdfStyles.grandTotalRow}>
            <Text style={pdfStyles.grandTotalLabel}>TOTAL AMOUNT:</Text>
            <Text style={pdfStyles.grandTotalValue}>{fmt(totalSum)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            This is an official auto-generated PDF report statement by Enveluxe Finance Tracker.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default function Reports() {
  const { user } = useAuth();
  const { formatCurrency, currency } = useSettings();

  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<GeneratedReport | null>(null);

  // Deletion Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDeleteId, setReportToDeleteId] = useState<string | null>(null);

  // Form State
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formStartDate, setFormStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [formEndDate, setFormEndDate] = useState(new Date().toISOString().split("T")[0]);

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "JPY" ? "¥" : "PHP ";

  // Load resources
  useEffect(() => {
    api.get("/transactions")
      .then((res) => setTransactions(res.data.data || res.data))
      .catch(console.error);

    const saved = localStorage.getItem("generated_reports");
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const id = `REP-${Date.now()}`;
    const name = formType === "expense" ? "Expense Breakdown Invoice" : "Income Summary Statement";
    const dateGenerated = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const newReport: GeneratedReport = {
      id,
      name,
      type: formType,
      startDate: formStartDate,
      endDate: formEndDate,
      dateGenerated,
    };

    const updatedList = [newReport, ...reports];
    setReports(updatedList);
    localStorage.setItem("generated_reports", JSON.stringify(updatedList));

    setIsGenModalOpen(false);
    setPreviewReport(newReport);
  };

  const triggerDeleteReport = (id: string) => {
    setReportToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteReport = () => {
    if (!reportToDeleteId) return;
    const updated = reports.filter((r) => r.id !== reportToDeleteId);
    setReports(updated);
    localStorage.setItem("generated_reports", JSON.stringify(updated));
    if (previewReport?.id === reportToDeleteId) {
      setPreviewReport(null);
    }
  };

  // Filter transactions for preview report
  const filteredTxns = previewReport
    ? transactions.filter((t) => {
        if (t.type !== previewReport.type) return false;
        const tDate = new Date(t.transaction_date.replace(" ", "T"));
        const sDate = new Date(previewReport.startDate);
        const eDate = new Date(previewReport.endDate);
        tDate.setHours(0, 0, 0, 0);
        sDate.setHours(0, 0, 0, 0);
        eDate.setHours(23, 59, 59, 999);
        return tDate >= sDate && tDate <= eDate;
      })
    : [];

  const totalSum = filteredTxns.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="w-full min-h-screen font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Financial Reports</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Generate and export custom statement summaries and invoice breakdowns into PDF format.
          </p>
        </div>
        <button
          onClick={() => setIsGenModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Generated Reports List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Report Name</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Type</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Period</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40">Date Generated</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" className="w-7 h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">No generated reports</p>
                    <p className="text-xs text-gray-400 mt-1">Generate your first report above to export as PDF.</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 dark:border-slate-800/60 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-slate-200">{report.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        report.type === "expense"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {formatDate(report.startDate)} — {formatDate(report.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{report.dateGenerated}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setPreviewReport(report)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          View Statement
                        </button>
                        <PDFDownloadLink
                          document={
                            <PDFReportDocument
                              report={report}
                              user={user}
                              transactions={transactions}
                              currencySymbol={currencySymbol}
                            />
                          }
                          fileName={`${report.name.replace(/\s+/g, "_")}_${report.id}.pdf`}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
                        </PDFDownloadLink>
                        <button
                          onClick={() => triggerDeleteReport(report.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer ml-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
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

      {/* Generate Report Form Modal */}
      {isGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold text-gray-900">Generate Report</h3>
              <button
                onClick={() => setIsGenModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 11-1.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("expense")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      formType === "expense"
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Expense Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("income")}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      formType === "income"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Income Summary
                  </button>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  required
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
                >
                  Generate Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
            {/* Modal Actions Header */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-150 dark:border-slate-800 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                Statement Invoice Preview ({previewReport.id})
              </span>
              <div className="flex items-center gap-3">
                <PDFDownloadLink
                  document={
                    <PDFReportDocument
                      report={previewReport}
                      user={user}
                      transactions={transactions}
                      currencySymbol={currencySymbol}
                    />
                  }
                  fileName={`${previewReport.name.replace(/\s+/g, "_")}_${previewReport.id}.pdf`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  {({ loading }) => (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      {loading ? "Preparing PDF..." : "Download PDF"}
                    </>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 11-1.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Visual Preview */}
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <div className="bg-white text-slate-800 p-8 rounded-xl border border-gray-150 shadow-sm max-w-2xl mx-auto font-sans leading-relaxed">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <svg width="45" height="56" viewBox="0 0 292 365" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M146 215.884C206 175.884 221 115.884 221 45.8838L146 5.88379L71 45.8838C71 115.884 86 175.884 146 215.884Z" fill="#0F172A" stroke="#10B981" strokeWidth="3"/>
                      <path d="M96 95.8838L146 130.884L196 95.8838V145.884C196 165.884 176 190.884 146 200.884C116 190.884 96 165.884 96 145.884V95.8838Z" fill="#10B981" stroke="#10B981" strokeWidth="2"/>
                    </svg>
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">ENVELUXE</h1>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Financial Budget Tracker</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider">
                      {previewReport.type === "expense" ? "Expense Statement" : "Income Statement"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Invoice ID: <span className="font-semibold">{previewReport.id}</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Date Created: {previewReport.dateGenerated}</p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Generated For:</span>
                    <h3 className="text-sm font-bold text-slate-900">{user?.name || "Member Account"}</h3>
                    <p className="text-xs text-slate-500">{user?.email || "account@enveluxe.com"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Statement Period:</span>
                    <p className="text-xs text-slate-900 font-semibold">{formatDate(previewReport.startDate)} — {formatDate(previewReport.endDate)}</p>
                    <span className="mt-2 inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded border border-emerald-200">
                      SETTLED
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <table className="w-full text-left border-collapse mb-6">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-2 text-[10px] font-bold uppercase text-slate-400">Date</th>
                      <th className="py-2 text-[10px] font-bold uppercase text-slate-400">Description</th>
                      {previewReport.type === "expense" && (
                        <th className="py-2 text-[10px] font-bold uppercase text-slate-400">Envelope</th>
                      )}
                      <th className="py-2 text-[10px] font-bold uppercase text-slate-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.length === 0 ? (
                      <tr>
                        <td colSpan={previewReport.type === "expense" ? 4 : 3} className="py-4 text-center text-xs text-slate-400">
                          No transactions found in this period.
                        </td>
                      </tr>
                    ) : (
                      filteredTxns.map((txn) => (
                        <tr key={txn.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-2.5 text-xs text-slate-500">{formatDate(txn.transaction_date)}</td>
                          <td className="py-2.5 text-xs text-slate-800 font-semibold">{txn.description || "General"}</td>
                          {previewReport.type === "expense" && (
                            <td className="py-2.5 text-xs text-slate-500">
                              {txn.envelope?.name || "General"}
                            </td>
                          )}
                          <td className="py-2.5 text-xs font-bold text-slate-950 text-right">
                            {formatCurrency(Number(txn.amount))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Totals Breakdown */}
                <div className="border-t border-slate-200 pt-4 flex flex-col items-end gap-1.5">
                  <div className="flex justify-between w-64 text-xs">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(totalSum)}</span>
                  </div>
                  <div className="flex justify-between w-64 text-xs">
                    <span className="text-slate-500">Estimated Tax (0%):</span>
                    <span className="font-semibold text-slate-950">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between w-64 border-t border-slate-100 pt-2 text-sm font-bold">
                    <span className="text-slate-900 uppercase">Total amount:</span>
                    <span className="text-emerald-700">{formatCurrency(totalSum)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReportToDeleteId(null);
        }}
        onConfirm={handleDeleteReport}
        title="Delete Generated Report"
        message="Are you sure you want to delete this report from history? This action is permanent."
      />
    </div>
  );
}
