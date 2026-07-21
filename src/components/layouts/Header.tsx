import { useMatches, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface RouteHandle {
  name?: string;
  icon?: React.ReactNode;
}

function Header() {
  const matches = useMatches();
  const location = useLocation();
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

  const currentMatch = [...matches].reverse().find((match) => (match.handle as RouteHandle)?.name);
  const handle = currentMatch?.handle as RouteHandle;

  // 1. Resolve title using route handle name if configured
  let routeName = handle?.name;

  // 2. Fallback to location-pathname matching for bulletproof support
  if (!routeName) {
    switch (location.pathname) {
      case '/':
        routeName = 'Dashboard Overview';
        break;
      case '/envelope':
        routeName = 'Envelope';
        break;
      case '/transactions':
        routeName = 'Transactions';
        break;
      case '/goals':
        routeName = 'Goals';
        break;
      case '/reports':
        routeName = 'Reports';
        break;
      case '/help':
        routeName = 'Help & Support';
        break;
      case '/settings':
        routeName = 'Settings';
        break;
      default:
        routeName = 'Dashboard Overview';
    }
  }

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-md z-20">
      {/* Title */}
      <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">{routeName}</h1>
      
      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl relative transition-all duration-200 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-[22px] h-[22px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="relative ml-1" ref={dropdownRef}>
          <div 
            className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:ring-4 hover:ring-slate-100 transition-all duration-200"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&fit=crop" 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setIsProfileOpen(false);
                  // navigate('/settings'); // If you add a settings page later
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.12l-2.848.318a.75.75 0 01-.81-.81l.318-2.848a4.5 4.5 0 011.12-1.89l13.49-13.49z" />
                </svg>
                Edit Profile
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
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