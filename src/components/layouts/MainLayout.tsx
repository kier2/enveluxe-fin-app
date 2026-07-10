import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header component */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 px-8 pb-8 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;