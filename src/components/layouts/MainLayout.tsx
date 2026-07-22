import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import AddTransactionModal from "../AddTransactionModal";

function MainLayout() {
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar onAddTransaction={() => setIsAddTxnOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header component */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 px-8 pb-8 w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxnOpen}
        onClose={() => setIsAddTxnOpen(false)}
      />
    </div>
  );
}

export default MainLayout;