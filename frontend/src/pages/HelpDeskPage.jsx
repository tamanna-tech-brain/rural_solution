import { useEffect, useState } from "react";
import {
  createHelpPost,
  getMyHelpPosts,
  deleteHelpPost,
} from "../api/api";

const HelpDeskPage = () => {
  const token = localStorage.getItem("token");

  const [posts, setPosts] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
  });

  // ================= FETCH USER TICKETS =================
  const fetchPosts = async () => {
    try {
      if (!token) return;

      const res = await getMyHelpPosts();
      setPosts(res.data || []);
    } catch (err) {
      console.log("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ================= CREATE =================
  const handleSubmit = async () => {
    if (!token) return alert("Login required");

    try {
      await createHelpPost(formData);
      alert("Ticket created");
      setFormData({
        title: "",
        description: "",
        category: "other",
      });

      fetchPosts();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to create ticket");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteHelpPost(id);
      fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6 grid lg:grid-cols-3 gap-6 bg-gray-50 min-h-screen">

      {/* FORM */}
      <div className="bg-white p-5 rounded-xl shadow">

        <h2 className="font-bold text-xl text-green-700">
          🧑‍🌾 Help Desk
        </h2>

        <input
          className="border p-2 w-full mt-3"
          placeholder="Title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <textarea
          className="border p-2 w-full mt-2"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <select
          className="border p-2 w-full mt-2"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        >
          <option value="booking">Booking</option>
          <option value="payment">Payment</option>
          <option value="equipment">Equipment</option>
          <option value="technical">Technical</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white w-full p-2 mt-3"
        >
          Submit Ticket
        </button>
      </div>

      {/* LIST */}
      <div className="lg:col-span-2">

        <h2 className="text-xl font-bold mb-4">
          📢 My Tickets
        </h2>

        {posts.map((p) => (
          <div key={p._id} className="bg-white p-4 mb-3 rounded-xl shadow">

            <h3 className="font-bold">{p.title}</h3>
            <p>{p.description}</p>

            <p className="text-sm text-gray-500">
              Category: {p.category}
            </p>

            <p className="text-xs text-gray-500">
              Status: {p.status}
            </p>

            <button
              onClick={() => handleDelete(p._id)}
              className="text-red-500 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default HelpDeskPage;