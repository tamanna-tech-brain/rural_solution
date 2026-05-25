import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { translatePage } from "../api/googleTranslate";

const AppLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const handleLangChange = async (event) => {
      const lang = event?.detail?.lang || "en";
      await translatePage(lang);
    };

    window.addEventListener("krishiLangChanged", handleLangChange);

    const activeLang = localStorage.getItem("lang") || "en";
    translatePage(activeLang).catch((error) => {
      console.error("Translation failed on initial load:", error);
    });

    return () => {
      window.removeEventListener("krishiLangChanged", handleLangChange);
    };
  }, []);

  useEffect(() => {
    const activeLang = localStorage.getItem("lang") || "en";
    translatePage(activeLang).catch((error) => {
      console.error("Translation failed on route change:", error);
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AppLayout;