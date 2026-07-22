import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface RouteHandle {
  name?: string;
  icon?: React.ReactNode;
}

/**
 * Breadcrumb configuration — each route maps to a label and optional parent path.
 * Build the trail by walking up via `parent` links.
 */
const ROUTE_META: Record<string, { label: string; parent?: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/budget":    { label: "Budget",       parent: "/dashboard" },
  "/income":    { label: "Income",       parent: "/dashboard" },
  "/transactions": { label: "Transactions", parent: "/dashboard" },
  "/profile":   { label: "Edit Profile", parent: "/dashboard" },
  "/reports":   { label: "Reports",      parent: "/dashboard" },
  "/help":      { label: "Help & Support", parent: "/dashboard" },
  "/settings":  { label: "Settings",     parent: "/dashboard" },
};

/**
 * Build a breadcrumb trail from the route meta map.
 * Returns an array of { label, path } from root → current.
 */
function buildBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const trail: { label: string; path: string }[] = [];
  let current: string | undefined = pathname;

  while (current && ROUTE_META[current]) {
    trail.unshift({ label: ROUTE_META[current].label, path: current });
    current = ROUTE_META[current].parent;
  }

  // If nothing matched, just use the raw path segment as a fallback
  if (trail.length === 0) {
    trail.push({ label: "Dashboard", path: "/dashboard" });
  }

  return trail;
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const isRoot = breadcrumbs.length <= 1;

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/90 dark:bg-slate-950/95 backdrop-blur-md z-20 border-b border-slate-100/60 dark:border-slate-800/80 transition-colors duration-200">
      {/* Left: Back button + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Back button — hidden on root/dashboard */}
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all duration-150 cursor-pointer"
            title="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3 text-slate-300 dark:text-slate-700 flex-shrink-0"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                  {isLast ? (
                    <span className="text-[15px] font-bold text-slate-800 dark:text-white tracking-tight">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-[13px] font-medium text-slate-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors duration-150"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl relative transition-all duration-200 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[22px] h-[22px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="relative ml-1" ref={dropdownRef}>
          <div
            className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:ring-4 hover:ring-emerald-100 transition-all duration-200 select-none"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800 mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || "user@example.com"}</p>
              </div>
              <button
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/profile");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.12l-2.848.318a.75.75 0 01-.81-.81l.318-2.848a4.5 4.5 0 011.12-1.89l13.49-13.49z" />
                </svg>
                Edit Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;