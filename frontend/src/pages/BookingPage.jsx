import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookings,
  getEquipment,
  updateBooking,
  deleteBooking,
  getBookingById,
  createBooking,
  updateMandiStatus,
  getEquipmentById,
  getMandiById,
} from "../api/api";

const BookingPage = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();

  const isMandi = type === "mandi";
  const isEquipment = type === "equipment";

  const safeJSONParse = (value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const user = safeJSONParse(localStorage.getItem("user"));

  const [bookings, setBookings] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    equipmentId: "",
    renterId: user?._id || "",
    startDate: "",
    endDate: "",
    totalAmount: "",
    status: "pending",
  });

  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.log("Bookings error:", err);
      setBookings([]);
    }
  };

  const fetchEquipments = async () => {
    try {
      const res = await getEquipment();
      setEquipments(res.data || []);
    } catch (err) {
      console.log("Equipment list error:", err);
      setEquipments([]);
    }
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);

      if (!id || !type) {
        setData(null);
        return;
      }

      if (isMandi) {
        const res = await getMandiById(id);
        setData(res.data || null);
      } else if (isEquipment) {
        const res = await getEquipmentById(id);
        const equipment = res.data || null;
        setData(equipment);

        setFormData((prev) => ({
          ...prev,
          equipmentId: equipment?._id || "",
        }));
      } else {
        setData(null);
      }
    } catch (err) {
      console.log("Details fetch error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEquipments();
    fetchDetails();
  }, [id, type]);

  const resetForm = () => {
    setFormData({
      equipmentId: isEquipment ? data?._id || "" : "",
      renterId: user?._id || "",
      startDate: "",
      endDate: "",
      totalAmount: "",
      status: "pending",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
  try {
    if (isEquipment) {
      if (
        !formData.equipmentId ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.totalAmount
      ) {
        return alert("Fill all required fields");
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start >= end) {
        return alert("End date must be after start date");
      }

      if (Number(formData.totalAmount) <= 0) {
        return alert("Total amount must be greater than 0");
      }

      const payload = {
        equipmentId: formData.equipmentId,
        renterId: user?._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalAmount: Number(formData.totalAmount),
        status: formData.status,
      };

      console.log("Sending booking payload:", payload);

      if (editingId) {
        await updateBooking(editingId, payload);
        alert("Booking Updated");
      } else {
        await createBooking(payload);
        alert("Equipment Booked");
      }

      await fetchBookings();
      await fetchEquipments();
      await fetchDetails();
      resetForm();
    } else if (isMandi) {
      await updateMandiStatus(id, {
        status: "Confirmed",
        isBooked: true,
        renterId: user?._id,
      });

      alert("Mandi Booked Successfully");
      navigate("/mandi");
    }
  } catch (err) {
    console.log("Submit full error:", err);
    console.log("Submit response data:", err?.response?.data);
    console.log("Submit response status:", err?.response?.status);

    alert(
      err?.response?.data?.message ||
      JSON.stringify(err?.response?.data) ||
      "Booking failed"
    );
  }
};

  const handleEdit = async (bookingId) => {
    try {
      const res = await getBookingById(bookingId);
      const booking = res.data;

      if (booking.renterId?._id !== user?._id) {
        return alert("Not allowed");
      }

      setFormData({
        equipmentId: booking.equipmentId?._id || "",
        renterId: user?._id || "",
        startDate: booking.startDate?.split("T")[0] || "",
        endDate: booking.endDate?.split("T")[0] || "",
        totalAmount: booking.totalAmount || "",
        status: booking.status || "pending",
      });

      setEditingId(bookingId);
    } catch (err) {
      console.log("Edit error:", err);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await deleteBooking(bookingId, {
        data: { renterId: user?._id },
      });

      await fetchBookings();
      await fetchEquipments();
      alert("Deleted");
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  if (loading) return <div className="p-5 text-xl">Loading...</div>;
  if (!id || !type) return <div className="p-5 text-red-600">Invalid route params</div>;
  if (!isMandi && !isEquipment) return <div className="p-5 text-red-600">Invalid booking type</div>;
  if (!data) return <div className="p-5 text-red-600">No data found</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-gray-900">
      <div className="bg-blue-700 text-white p-5 rounded-2xl mb-5">
        <h1 className="text-2xl font-bold">🚜 Booking Marketplace</h1>
        <p className="text-sm opacity-90">
          {isMandi ? "Book mandi service" : "Rent farming equipment"}
        </p>
      </div>

      <div className="p-5 bg-white rounded-2xl shadow mb-5">
        {isMandi ? (
          <div>
            <h1 className="text-xl font-bold mb-2">🚛 Mandi Booking</h1>
            <p>📍 {data.mandiLocation}</p>
            <p>🚚 Driver: {data.driverName}</p>
            <p>Status: {data.status}</p>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-xl"
              disabled={data.isBooked}
            >
              {data.isBooked ? "Already Booked" : "Confirm Mandi Booking"}
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold mb-2">🚜 Equipment Booking</h1>
            <p>📦 {data.name}</p>
            <img
              src={data.equipmentImage || "https://via.placeholder.com/400"}
              alt={data.name}
              className="w-full max-w-md h-56 object-cover rounded-xl mt-3"
            />
          </div>
        )}
      </div>

      {isEquipment && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold text-blue-700 mb-4">
              {editingId ? "Update Booking" : "Create Booking"}
            </h2>

            <input
              className="w-full p-3 mb-3 border rounded-xl bg-gray-100"
              value={user?.name || ""}
              disabled
            />

            <input
              type="date"
              className="w-full p-3 mb-3 border rounded-xl"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full p-3 mb-3 border rounded-xl"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Enter total amount"
              className="w-full p-3 mb-3 border rounded-xl"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: e.target.value })
              }
            />

            <select
              className="w-full p-3 mb-3 border rounded-xl"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700"
            >
              {editingId ? "Update Booking" : "Book Now 🚜"}
            </button>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <img
                  src={b.equipmentId?.equipmentImage || "https://via.placeholder.com/400"}
                  alt={b.equipmentId?.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4">
                  <h2 className="font-bold text-lg">🚜 {b.equipmentId?.name}</h2>
                  <p>👤 {b.renterId?.name}</p>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-blue-700 font-bold">₹ {b.totalAmount}</p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                    {b.status}
                  </span>

                  {b.renterId?._id === user?._id && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;