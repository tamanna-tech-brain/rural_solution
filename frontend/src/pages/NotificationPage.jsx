import { useEffect, useState } from "react";
import {
  createNotification,
  getNotifications,
  markNotificationRead,
  updateNotification,
  deleteNotification,
  getUsers,
} from "../api/api";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    message: "",
    type: "booking",
  });

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  const fetchNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setFormData({
      userId: "",
      message: "",
      type: "booking",
    });
    setEditingId(null);
  };

  // CREATE / UPDATE
  const submitHandler = async () => {
    if (!formData.userId || !formData.message) {
      return alert("Fill all fields");
    }

    try {
      if (editingId) {
        await updateNotification(editingId, formData);
        alert("Notification Updated");
      } else {
        await createNotification(formData);
        alert("Notification Created");
      }

      resetForm();
      fetchNotifications();
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  // MARK READ
  const markRead = async (id) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  // EDIT (OWNER ONLY CHECK IS BACKEND)
  const handleEdit = (n) => {
    setFormData({
      userId: n.userId?._id,
      message: n.message,
      type: n.type,
    });
    setEditingId(n._id);
  };

  // DELETE (OWNER ONLY CHECK IS BACKEND)
  const handleDelete = async (id) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 grid lg:grid-cols-2 gap-6">

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded-2xl shadow border">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {editingId ? "Update Notification" : "Create Notification"}
        </h2>

        {/* USER */}
        <select
          className="w-full p-3 mb-3 border rounded-xl text-gray-900"
          value={formData.userId}
          onChange={(e) =>
            setFormData({ ...formData, userId: e.target.value })
          }
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* MESSAGE */}
        <textarea
          className="w-full p-3 mb-3 border rounded-xl text-gray-900"
          placeholder="Message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />

        {/* TYPE */}
        <select
          className="w-full p-3 mb-3 border rounded-xl text-gray-900"
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value })
          }
        >
          <option value="booking">Booking</option>
          <option value="payment">Payment</option>
          <option value="mandi">Mandi</option>
        </select>

        <button
          onClick={submitHandler}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl"
        >
          {editingId ? "Update Notification" : "Send Notification"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">

        <h2 className="text-xl font-bold text-gray-900">
          Notifications
        </h2>

        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications found</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className="bg-white p-5 rounded-2xl shadow border"
            >

              {/* USER */}
              <p className="font-bold text-gray-900">
                👤 {n.userId?.name || "Unknown User"}
              </p>

              {/* MESSAGE */}
              <p className="text-gray-800 mt-1">
                {n.message}
              </p>

              {/* TYPE */}
              <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">
                {n.type}
              </span>

              {/* STATUS */}
              <span
                className={`ml-2 inline-block px-3 py-1 text-sm rounded-full font-medium ${
                  n.read
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {n.read ? "Read" : "Unread"}
              </span>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">

                {!n.read && (
                  <button
                    onClick={() => markRead(n._id)}
                    className="flex-1 bg-green-600 text-white p-2 rounded-xl"
                  >
                    Mark Read
                  </button>
                )}

                <button
                  onClick={() => handleEdit(n)}
                  className="flex-1 bg-yellow-500 text-white p-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(n._id)}
                  className="flex-1 bg-red-600 text-white p-2 rounded-xl"
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;