import { useEffect, useState } from "react";
import {
  createMandi,
  getMandi,
  updateMandi,
  deleteMandi,
  getMandiById,
  getUsers,
} from "../api/api";


const images = [
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
];

const MandiPage = () => {
  const [mandiList, setMandiList] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    mandiDate: "",
    mandiLocation: "",
    driverName: "",
    truckCapacity: "",
    totalWeight: "",
    status: "scheduled",
    farmersJoined: [
      {
        farmerId: "",
        cropType: "",
        cropWeight: "",
        shareCost: "",
      },
    ],
  });

  // FETCH
  const fetchMandi = async () => {
    const res = await getMandi();
    setMandiList(res.data || []);
  };

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  useEffect(() => {
    fetchMandi();
    fetchUsers();
  }, []);

  // FARMER CHANGE
  const handleChangeFarmer = (index, field, value) => {
    const updated = [...formData.farmersJoined];
    updated[index][field] = value;
    setFormData({ ...formData, farmersJoined: updated });
  };

  const addFarmer = () => {
    setFormData({
      ...formData,
      farmersJoined: [
        ...formData.farmersJoined,
        { farmerId: "", cropType: "", cropWeight: "", shareCost: "" },
      ],
    });
  };

  // CREATE / UPDATE
  const handleSubmit = async () => {
    if (!formData.mandiDate || !formData.mandiLocation) {
      return alert("Fill required fields");
    }

    if (editingId) {
      await updateMandi(editingId, formData);
      alert("Updated Successfully");
    } else {
      await createMandi(formData);
      alert("Created Successfully");
    }

    resetForm();
    fetchMandi();
  };

  // RESET
  const resetForm = () => {
    setFormData({
      mandiDate: "",
      mandiLocation: "",
      driverName: "",
      truckCapacity: "",
      totalWeight: "",
      status: "scheduled",
      farmersJoined: [
        {
          farmerId: "",
          cropType: "",
          cropWeight: "",
          shareCost: "",
        },
      ],
    });
    setEditingId(null);
  };

  // EDIT (FIXED)
  const handleEdit = async (id) => {
    const res = await getMandiById(id);

    setFormData({
      ...res.data,
      mandiDate: res.data.mandiDate?.split("T")[0],
    });

    setEditingId(id);
  };

  // DELETE (FIXED)
  const handleDelete = async (id) => {
    await deleteMandi(id);
    alert("Deleted Successfully");
    fetchMandi();
  };

  const inputStyle =
    "w-full p-3 mb-3 rounded-xl border border-gray-200 bg-white text-black focus:ring-2 focus:ring-green-500 outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-6 rounded-2xl shadow-lg mb-6">
        <h1 className="text-3xl font-bold">🚛 Mandi Pool Dashboard</h1>
        <p className="text-sm opacity-90 mt-1">
          Smart farming logistics system
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="bg-white p-5 rounded-2xl shadow-xl">

          <h2 className="text-xl font-bold text-green-700 mb-4">
            {editingId ? "✏️ Update Pool" : "➕ Create Pool"}
          </h2>

          <input
            type="date"
            className={inputStyle}
            value={formData.mandiDate}
            onChange={(e) =>
              setFormData({ ...formData, mandiDate: e.target.value })
            }
          />

          <input
            className={inputStyle}
            placeholder="📍 Mandi Location"
            value={formData.mandiLocation}
            onChange={(e) =>
              setFormData({ ...formData, mandiLocation: e.target.value })
            }
          />

          <input
            className={inputStyle}
            placeholder="🚛 Driver Name"
            value={formData.driverName}
            onChange={(e) =>
              setFormData({ ...formData, driverName: e.target.value })
            }
          />

          <input
            className={inputStyle}
            placeholder="📦 Truck Capacity"
            value={formData.truckCapacity}
            onChange={(e) =>
              setFormData({ ...formData, truckCapacity: e.target.value })
            }
          />

          <input
            className={inputStyle}
            placeholder="⚖️ Total Weight"
            value={formData.totalWeight}
            onChange={(e) =>
              setFormData({ ...formData, totalWeight: e.target.value })
            }
          />

          {/* FARMERS */}
          <div className="border rounded-xl p-3 mb-3 bg-gray-50">
            <h3 className="font-bold mb-2">👨‍🌾 Farmers Joined</h3>

            {formData.farmersJoined.map((f, i) => (
              <div key={i}>

                <select
                  className={inputStyle}
                  value={f.farmerId}
                  onChange={(e) =>
                    handleChangeFarmer(i, "farmerId", e.target.value)
                  }
                >
                  <option value="">Select Farmer</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <input
                  className={inputStyle}
                  placeholder="Crop Type"
                  value={f.cropType}
                  onChange={(e) =>
                    handleChangeFarmer(i, "cropType", e.target.value)
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="Crop Weight"
                  value={f.cropWeight}
                  onChange={(e) =>
                    handleChangeFarmer(i, "cropWeight", e.target.value)
                  }
                />

                <input
                  className={inputStyle}
                  placeholder="Share Cost"
                  value={f.shareCost}
                  onChange={(e) =>
                    handleChangeFarmer(i, "shareCost", e.target.value)
                  }
                />
              </div>
            ))}

            <button
              onClick={addFarmer}
              className="w-full bg-blue-600 text-white py-2 rounded-xl"
            >
              + Add Farmer
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
          >
            {editingId ? "Update Pool" : "Create Pool"}
          </button>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-5">

          {mandiList.map((m, i) => (
            <div
              key={m._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >

              <img
                src={images[i % images.length]}
                className="h-44 w-full object-cover"
              />

              <div className="p-4">

                <h2 className="font-bold text-green-700">
                  📍 {m.mandiLocation}
                </h2>

                <p>🚛 {m.driverName}</p>
                <p>📦 {m.truckCapacity} kg</p>
                <p>⚖️ {m.totalWeight} kg</p>
                <p>📅 {m.mandiDate?.split("T")[0]}</p>

                <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                  {m.status}
                </span>

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => handleEdit(m._id)}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(m._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                  >
                    Delete
                  </button>

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default MandiPage;