const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center">

      <p className="font-bold text-green-600">
        🌾 KrishiPool
      </p>

      <div className="text-sm text-gray-600 flex gap-3 items-center">
        <span>👤 {user?.name || "Guest"}</span>
        <span className="bg-green-100 px-2 py-1 rounded">
          {user?.role || "farmer"}
        </span>
      </div>

    </div>
  );
};

export default Navbar;