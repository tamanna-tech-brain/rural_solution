import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-5">

      <h1 className="text-xl font-bold text-green-600 mb-8">
        KrishiPool
      </h1>

      <nav className="flex flex-col gap-3 text-gray-700">

        <Link className="hover:text-green-600" to="/">Dashboard</Link>
        <Link className="hover:text-green-600" to="/equipment">Equipment</Link>
        <Link className="hover:text-green-600" to="/booking">Bookings</Link>
        <Link className="hover:text-green-600" to="/mandi">Mandi</Link>
        <Link className="hover:text-green-600" to="/payment">Payments</Link>
        <Link className="hover:text-green-600" to="/dispute">Disputes</Link>
<Link className="hover:text-green-600" to="/notifications">
  Notifications
</Link>
      </nav>

    </div>
  );
};

export default Sidebar;