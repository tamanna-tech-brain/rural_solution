

import {
  Tractor,
  Truck,
  Users,
  MapPin,
  Wallet,
  Globe,
  LogOut,
  UserPlus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [language, setLanguage] = useState(
    localStorage.getItem("lang") || "en"
  );

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
    window.dispatchEvent(new CustomEvent("krishiLangChanged", { detail: { lang } }));
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/user");
  };

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">

      {/* NAVBAR */}
      <div className="bg-white shadow-lg sticky top-0 z-50 border-b">

        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">

          {/* LEFT */}
          <div>
            <h1 className="text-3xl font-extrabold text-green-700">
              KrishiPool
            </h1>

            <p className="text-gray-500 text-sm">
              Smart Farming Platform
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 flex-wrap">

            {/* LANGUAGE */}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">

              <Globe size={18} className="text-green-700" />

              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent outline-none text-black"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="gu">ગુજરાતી</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="mr">मराठी</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="ur">اردو</option>
                <option value="or">ଓଡ଼ିଆ</option>
                <option value="as">অসমীয়া</option>
                <option value="sd">سنڌي</option>
                <option value="ne">नेपाली</option>
              </select>
            </div>

            {/* LOGIN / LOGOUT */}
            {!user ? (
              <button
                onClick={() => navigate("/user")}
                className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-2 rounded-xl flex items-center gap-2"
              >
                <UserPlus size={18} />
                Register / Login
              </button>
            ) : (
              <button
                onClick={logoutHandler}
                className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-2 rounded-xl flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative">

        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop"
          alt="farm"
          className="w-full h-[420px] object-cover"
        />

        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center px-6 md:px-16">

          <h1 className="text-4xl md:text-6xl font-extrabold text-white max-w-3xl">
            Welcome {user?.name || "Farmer"} 👋
          </h1>

          <p className="text-white mt-5 max-w-2xl text-lg">
            Real-time farming equipment rental platform with mandi transport pooling system.
          </p>

          <div className="flex flex-wrap gap-4 mt-7">

            <button
              onClick={() => navigate("/equipment")}
              className="bg-green-600 hover:bg-green-700 transition px-6 py-3 rounded-2xl text-white font-semibold"
            >
              Explore Equipment
            </button>

            <button
              onClick={() => navigate("/user")}
              className="bg-white hover:bg-gray-200 transition px-6 py-3 rounded-2xl text-black font-semibold"
            >
              Registered Farmer
            </button>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6 hover:-translate-y-2 transition">

            <div className="bg-green-100 w-fit p-4 rounded-2xl">
              <Tractor size={40} className="text-green-700" />
            </div>

            <h2 className="text-2xl font-bold mt-5 text-gray-800">
              Equipment
            </h2>

            <p className="text-gray-500 mt-3">
              Book tractors and farming tools instantly.
            </p>

            <button
              onClick={() => navigate("/equipment")}
              className="mt-5 bg-green-600 text-white px-5 py-2 rounded-xl"
            >
              Open
            </button>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6 hover:-translate-y-2 transition">

            <div className="bg-blue-100 w-fit p-4 rounded-2xl">
              <Truck size={40} className="text-blue-700" />
            </div>

            <h2 className="text-2xl font-bold mt-5 text-gray-800">
              Transport
            </h2>

            <p className="text-gray-500 mt-3">
              Shared mandi logistics and transport pooling.
            </p>

            <button
              onClick={() => navigate("/mandi")}
              className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-xl"
            >
              Open
            </button>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6 hover:-translate-y-2 transition">

            <div className="bg-purple-100 w-fit p-4 rounded-2xl">
              <Users size={40} className="text-purple-700" />
            </div>

            <h2 className="text-2xl font-bold mt-5 text-gray-800">
              Farmers
            </h2>

            <p className="text-gray-500 mt-3">
              Connected village farming community network.
            </p>

            <button
              onClick={() => navigate("/user")}
              className="mt-5 bg-purple-600 text-white px-5 py-2 rounded-xl"
            >
              Open
            </button>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-3xl shadow-xl p-6 hover:-translate-y-2 transition">

            <div className="bg-red-100 w-fit p-4 rounded-2xl">
              <MapPin size={40} className="text-red-700" />
            </div>

            <h2 className="text-2xl font-bold mt-5 text-gray-800">
              Live Map
            </h2>

            <p className="text-gray-500 mt-3">
              Real-time equipment location tracking.
            </p>

            <button
              onClick={() => navigate("/map")}
              className="mt-5 bg-red-600 text-white px-5 py-2 rounded-xl"
            >
              Open
            </button>
          </div>
        </div>
      </div>

      {/* ACTION IMAGES */}
      <div className="max-w-7xl mx-auto px-4 pb-16">

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

            <img
              src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-60 w-full object-cover"
            />

            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Equipment Booking
              </h2>

              <p className="text-gray-500 mt-3">
                Rent farming machines easily from nearby farmers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

            <img
              src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-60 w-full object-cover"
            />

            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Mandi Pool
              </h2>

              <p className="text-gray-500 mt-3">
                Share transport and reduce mandi costs.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">

            <img
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop"
              alt=""
              className="h-60 w-full object-cover"
            />

            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Payments
              </h2>

              <p className="text-gray-500 mt-3">
                Secure online payment system for farmers.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;