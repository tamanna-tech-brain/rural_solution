import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createMandi,
  getMandi,
  updateMandi,
  deleteMandi,
  getMandiById,
  getUsers,
  updateMandiLocation,
} from "../api/api";

const images = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
];

const MandiPage = () => {
  const navigate = useNavigate();
  const [mandiList, setMandiList] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    mandiDate: "",
    mandiLocation: "",
    driverName: "",
    driverPhone: "",
    truckCapacity: "",
    totalWeight: "",
    status: "Pending",
    farmersJoined: [{ farmerId: "", cropType: "", cropWeight: "", shareCost: "" }],
  });

  const fetchMandi = async () => {
    try {
      const res = await getMandi();
      setMandiList(res.data || []);
    } catch (err) {
      console.log("FETCH MANDI ERROR:", err);
      alert(err.response?.data?.message || "Error fetching mandi");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.log("FETCH USERS ERROR:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchMandi();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await updateMandiLocation(editingId, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } catch (err) {
          console.log("LOCATION UPDATE ERROR:", err);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [editingId]);

  const handleChangeFarmer = (index, field, value) => {
    const updated = [...formData.farmersJoined];
    updated[index][field] = value;
    setFormData({ ...formData, farmersJoined: updated });
  };

  const addFarmer = () => {
    if (formData.farmersJoined.length >= 2) return;
    setFormData({
      ...formData,
      farmersJoined: [
        ...formData.farmersJoined,
        { farmerId: "", cropType: "", cropWeight: "", shareCost: "" },
      ],
    });
  };

  const hasDuplicateFarmers = () => {
    const ids = formData.farmersJoined.map((f) => f.farmerId).filter(Boolean);
    return new Set(ids).size !== ids.length;
  };

  const canAddFarmer = formData.farmersJoined.length < 2;

  const buildPayload = () => ({
    ...formData,
    truckCapacity: Number(formData.truckCapacity) || 0,
    totalWeight: Number(formData.totalWeight) || 0,
    farmersJoined: formData.farmersJoined
      .filter((f) => f.farmerId)
      .map((f) => ({
        farmerId: f.farmerId,
        cropType: f.cropType || "",
        cropWeight: Number(f.cropWeight) || 0,
        shareCost: Number(f.shareCost) || 0,
      })),
  });

  const handleSubmit = async () => {
    try {
      if (!formData.mandiDate || !formData.mandiLocation) {
        return alert("Fill required fields");
      }

      if (hasDuplicateFarmers()) {
        return alert("Duplicate farmers not allowed");
      }

      const payload = buildPayload();

      if (editingId) {
        await updateMandi(editingId, payload);
        alert("Updated Successfully");
      } else {
        await createMandi(payload);
        alert("Created Successfully");
      }

      resetForm();
      fetchMandi();
    } catch (err) {
      console.log("MANDI SUBMIT ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save mandi");
    }
  };

  const resetForm = () => {
    setFormData({
      mandiDate: "",
      mandiLocation: "",
      driverName: "",
      driverPhone: "",
      truckCapacity: "",
      totalWeight: "",
      status: "scheduled",
      farmersJoined: [{ farmerId: "", cropType: "", cropWeight: "", shareCost: "" }],
    });
    setEditingId(null);
  };

  const handleEdit = async (id) => {
    try {
      const res = await getMandiById(id);

      setFormData({
        mandiDate: res.data?.mandiDate?.split("T")[0] ?? "",
        mandiLocation: res.data?.mandiLocation ?? "",
        driverName: res.data?.driverName ?? "",
        driverPhone: res.data?.driverPhone ?? "",
        truckCapacity: res.data?.truckCapacity ?? "",
        totalWeight: res.data?.totalWeight ?? "",
        status: res.data?.status ?? "scheduled",
        farmersJoined:
          res.data?.farmersJoined?.length > 0
            ? res.data.farmersJoined.map((f) => ({
                farmerId: f?.farmerId?._id ?? f?.farmerId ?? "",
                cropType: f?.cropType ?? "",
                cropWeight: f?.cropWeight ?? "",
                shareCost: f?.shareCost ?? "",
              }))
            : [{ farmerId: "", cropType: "", cropWeight: "", shareCost: "" }],
      });

      setEditingId(id);
    } catch (err) {
      console.log("EDIT MANDI ERROR:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMandi(id);
      fetchMandi();
    } catch (err) {
      console.log("DELETE MANDI ERROR:", err);
    }
  };

  const inputStyle = "w-full p-3 mb-3 rounded-xl border bg-white text-black";

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="bg-green-700 text-white p-5 rounded-2xl mb-5">
        <h1 className="text-2xl font-bold">🚛 Mandi Pool Dashboard</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl">
          <input
            type="date"
            className={inputStyle}
            value={formData.mandiDate}
            onChange={(e) => setFormData({ ...formData, mandiDate: e.target.value })}
          />

          <input
            className={inputStyle}
            placeholder="Mandi Location"
            value={formData.mandiLocation}
            onChange={(e) => setFormData({ ...formData, mandiLocation: e.target.value })}
          />

          <input
            className={inputStyle}
            placeholder="Driver Name"
            value={formData.driverName}
            onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
          />

          <input
            className={inputStyle}
            placeholder="Driver Phone"
            value={formData.driverPhone}
            onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
          />

          <input
            className={inputStyle}
            placeholder="Truck Capacity"
            value={formData.truckCapacity}
            onChange={(e) => setFormData({ ...formData, truckCapacity: e.target.value })}
          />

          <input
            className={inputStyle}
            placeholder="Total Weight"
            value={formData.totalWeight}
            onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
          />

          <div className="mb-3">
            <button
              type="button"
              disabled={!canAddFarmer}
              onClick={addFarmer}
              className={`w-full p-2 rounded-xl text-white ${
                canAddFarmer ? "bg-green-600" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Add Farmer (Max 2)
            </button>

            {formData.farmersJoined.map((f, index) => (
              <div key={index} className="mt-2 border p-2 rounded">
                <select
                  className={inputStyle}
                  value={f.farmerId || ""}
                  onChange={(e) => handleChangeFarmer(index, "farmerId", e.target.value)}
                >
                  <option value="">Select Farmer</option>
                  {users.map((u) => {
                    const disabled = formData.farmersJoined.some(
                      (farmer, i) => farmer.farmerId === u._id && i !== index
                    );

                    return (
                      <option key={u._id} value={u._id} disabled={disabled}>
                        {u.name}
                      </option>
                    );
                  })}
                </select>

                <input
                  className={inputStyle}
                  placeholder="Crop Type"
                  value={f.cropType}
                  onChange={(e) => handleChangeFarmer(index, "cropType", e.target.value)}
                />

                <input
                  className={inputStyle}
                  placeholder="Crop Weight"
                  value={f.cropWeight}
                  onChange={(e) => handleChangeFarmer(index, "cropWeight", e.target.value)}
                />

                <input
                  className={inputStyle}
                  placeholder="Share Cost"
                  value={f.shareCost}
                  onChange={(e) => handleChangeFarmer(index, "shareCost", e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-xl"
          >
            {editingId ? "Update" : "Create"}
          </button>
        </div>

        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          {mandiList.map((m, i) => (
            <div key={m._id} className="bg-white rounded-xl shadow">
              <img
                src={images[i % images.length]}
                alt={m.mandiLocation}
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h2 className="font-bold text-green-700">📍 {m.mandiLocation}</h2>
                <p>🚛 {m.driverName}</p>
                <p>📞 {m.driverPhone}</p>

                {m.driverLocation?.lat && (
                  <p className="text-blue-600 text-sm">
                    📍 Live: {m.driverLocation.lat.toFixed(4)}, {m.driverLocation.lng.toFixed(4)}
                  </p>
                )}

                <span className="text-xs bg-yellow-100 px-2 py-1 rounded">
                  {m.status}
                </span>

                {user?._id === m.ownerId?._id && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(m._id)}
                      className="bg-yellow-500 flex-1 text-white p-2 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(m._id)}
                      className="bg-red-500 flex-1 text-white p-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}

                <button
                  disabled={m.isBooked}
                  onClick={() => navigate(`/booking/mandi/${m._id}`)}
                  className={`px-3 py-1 rounded text-white mt-2 mr-2 ${
                    m.isBooked ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600"
                  }`}
                >
                  {m.isBooked ? "BOOKED" : "BOOK"}
                </button>

                <button
                  disabled={!m.isBooked}
                  onClick={() => navigate(`/trip/${m._id}`)}
                  className={`px-3 py-1 rounded text-white mt-2 mr-2 ${
                    !m.isBooked ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  Start Trip
                </button>

                <button
                  onClick={() => updateMandiLocation(m._id, { endTrip: true })}
                  className="bg-red-600 text-white px-3 py-1 rounded mt-2"
                >
                  End Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MandiPage;