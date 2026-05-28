const Navbar = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-base font-bold text-emerald-700 sm:text-lg">
            🌾 KrishiPool
          </p>
          <p className="text-xs text-slate-500">
            Smart agri coordination dashboard
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-2 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "G"}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.role || "farmer"} • online
            </p>
          </div>

          <span className="ml-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;