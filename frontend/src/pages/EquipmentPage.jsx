import { useEffect, useState } from "react";
import {
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getUsers,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const EquipmentPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    type: "",
    rentalRatePerDay: "",
    location: "",
    condition: "Good",
  });

  const fetchEquipment = async () => {
    const res = await getEquipment();
    setEquipments(res.data || []);
  };

  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  useEffect(() => {
    fetchEquipment();
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    if (
      !formData.ownerId ||
      !formData.name ||
      !formData.type ||
      !formData.rentalRatePerDay ||
      !formData.location
    ) {
      return alert("Fill all fields");
    }

    if (editingId) {
      await updateEquipment(editingId, formData);
    } else {
      await createEquipment(formData);
    }

    setFormData({
      ownerId: "",
      name: "",
      type: "",
      rentalRatePerDay: "",
      location: "",
      condition: "Good",
    });

    setEditingId(null);
    fetchEquipment();
  };

  const handleEdit = async (id) => {
    const res = await getEquipmentById(id);
    setFormData({
      ownerId: res.data.ownerId?._id || res.data.ownerId,
      name: res.data.name,
      type: res.data.type,
      rentalRatePerDay: res.data.rentalRatePerDay,
      location: res.data.location,
      condition: res.data.condition || "Good",
    });
    setEditingId(id);
  };

  const handleDelete = async (id) => {
    await deleteEquipment(id);
    fetchEquipment();
  };

  const inputStyle =
    "w-full p-3 mb-3 rounded-xl border text-gray-900 bg-white focus:ring-2 focus:ring-green-500";

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-gray-900">

      {/* HEADER */}
      <div className="bg-green-700 text-white p-5 rounded-2xl mb-5">
        <h1 className="text-2xl font-bold">🚜 Equipment Marketplace</h1>
        <p className="text-sm opacity-90">
          Manage farming equipment (CRUD)
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* FORM */}
        <div className="bg-white p-4 rounded-2xl shadow-lg">

          <h2 className="text-lg font-bold text-green-700 mb-4">
            {editingId ? "Update Equipment" : "Add Equipment"}
          </h2>

          {/* OWNER */}
          <select
            className={inputStyle}
            value={formData.ownerId}
            onChange={(e) =>
              setFormData({ ...formData, ownerId: e.target.value })
            }
          >
            <option value="">Select Owner</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* NAME */}
          <input
            className={inputStyle}
            placeholder="Equipment Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          {/* TYPE */}
          <select
            className={inputStyle}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="Tractor">Tractor</option>
            <option value="Harvester">Harvester</option>
            <option value="Drone">Drone</option>
          </select>

          {/* RENT */}
          <input
            className={inputStyle}
            placeholder="Rental Rate Per Day"
            type="number"
            value={formData.rentalRatePerDay}
            onChange={(e) =>
              setFormData({
                ...formData,
                rentalRatePerDay: e.target.value,
              })
            }
          />

          {/* LOCATION */}
          <input
            className={inputStyle}
            placeholder="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />

          {/* CONDITION (MODEL FIELD) */}
          <select
            className={inputStyle}
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
          >
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Old">Old</option>
          </select>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-bold"
          >
            {editingId ? "Update Equipment" : "Add Equipment"}
          </button>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">

          {equipments.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden"
            >

              <div className="p-4 text-gray-900">

                <h3 className="font-bold text-lg">{item.name}</h3>

                <p>🚜 Type: {item.type}</p>

                <p>👤 Owner: {item.ownerId?.name}</p>

                <p className="text-green-700 font-bold">
                  ₹ {item.rentalRatePerDay}/day
                </p>

                <p>📍 {item.location}</p>

                <p>⚙️ Condition: {item.condition}</p>

                <div className="flex gap-2 mt-3">

                  <button
                    onClick={() => handleEdit(item._id)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-xl"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      localStorage.setItem("selectedEquipment", item._id);
                      navigate("/booking");
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                  >
                    Book
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

export default EquipmentPage;