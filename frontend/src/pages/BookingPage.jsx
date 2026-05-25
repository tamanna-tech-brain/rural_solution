import { useEffect, useState } from "react";
import {
  getBookings,
  getEquipment,
  updateBooking,
  deleteBooking,
  getBookingById,
  createBooking,
} from "../api/api";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    equipmentId: "",
    renterId: user?._id || "",
    startDate: "",
    endDate: "",
    totalAmount: "",
    status: "pending",
  });

  // FETCH BOOKINGS
  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.log("Booking fetch error:", err);
    }
  };

  // FETCH EQUIPMENT
  const fetchEquipments = async () => {
    try {
      const res = await getEquipment();
      setEquipments(res.data || []);
    } catch (err) {
      console.log("Equipment fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEquipments();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setFormData({
      equipmentId: "",
      renterId: user?._id || "",
      startDate: "",
      endDate: "",
      totalAmount: "",
      status: "pending",
    });
    setEditingId(null);
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!formData.equipmentId || !formData.startDate || !formData.endDate) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateBooking(editingId, formData);
      } else {
        await createBooking(formData);
      }

      resetForm();
      fetchBookings();
    } catch (err) {
      console.log("Submit error:", err);
    }
  };

  // EDIT
  const handleEdit = async (id) => {
    try {
      const res = await getBookingById(id);

      setFormData({
        equipmentId: res.data.equipmentId?._id || "",
        renterId: res.data.renterId?._id || "",
        startDate: res.data.startDate || "",
        endDate: res.data.endDate || "",
        totalAmount: res.data.totalAmount || "",
        status: res.data.status || "pending",
      });

      setEditingId(id);
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold">🚜 Booking Marketplace</h1>
        <p className="text-sm opacity-90">
          Rent farming equipment easily
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="bg-white rounded-2xl shadow-lg p-5">

          <h2 className="text-lg font-bold text-blue-600 mb-4">
            {editingId ? "Update Booking" : "Create Booking"}
          </h2>

          {/* EQUIPMENT */}
          <select
            className="w-full p-3 mb-3 border rounded-xl"
            value={formData.equipmentId}
            onChange={(e) =>
              setFormData({ ...formData, equipmentId: e.target.value })
            }
          >
            <option value="">Select Equipment</option>
            {equipments.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>

          {/* USER */}
          <input
            className="w-full p-3 mb-3 border rounded-xl bg-gray-100"
            value={user?.name || ""}
            disabled
          />

          {/* START DATE */}
          <label className="text-xs text-gray-600">
            Start Date 
          </label>
          <input
            type="date"
            className="w-full p-3 mb-3 border rounded-xl"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
          />

          {/* END DATE */}
          <label className="text-xs text-gray-600">
            End Date 
          </label>
          <input
            type="date"
            className="w-full p-3 mb-3 border rounded-xl"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
          />

          {/* AMOUNT */}
          <input
            type="number"
            placeholder="Total Amount"
            className="w-full p-3 mb-3 border rounded-xl"
            value={formData.totalAmount}
            onChange={(e) =>
              setFormData({ ...formData, totalAmount: e.target.value })
            }
          />

          {/* STATUS */}
          <select
            className="w-full p-3 mb-3 border rounded-xl"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold"
          >
            {editingId ? "Update Booking" : "Book Now 🚜"}
          </button>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">

          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl shadow p-4"
            >
              <h2 className="font-bold text-lg">
                🚜 {b.equipmentId?.name}
              </h2>

              <p className="text-gray-700">
                👤 {b.renterId?.name}
              </p>

              <p className="text-sm text-gray-600">
                📅 {b.startDate} → {b.endDate}
              </p>

              <p className="text-blue-700 font-bold">
                ₹ {b.totalAmount}
              </p>

              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-gray-200">
                {b.status}
              </span>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => handleEdit(b._id)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(b._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
};

export default BookingPage;