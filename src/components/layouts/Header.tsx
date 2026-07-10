import { useMatches, useLocation } from "react-router-dom";

interface RouteHandle {
  name?: string;
  icon?: React.ReactNode;
}

function Header() {
  const matches = useMatches();
  const location = useLocation();

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
        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:ring-4 hover:ring-slate-100 transition-all duration-200 ml-1">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&h=150&fit=crop" 
            alt="User Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;