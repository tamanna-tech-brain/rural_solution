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

  const user = JSON.parse(localStorage.getItem("user"));
  const [equipmentImage, setEquipmentImage] = useState(null);

  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    type: "",
    rentalRatePerDay: "",
    village: "",
    condition: "Good",
  });

  const fetchEquipment = async () => {
    try {
      const res = await getEquipment();
      setEquipments(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchUsers();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();

        const village =
          data.address.village ||
          data.address.town ||
          data.address.city ||
          data.address.state ||
          "";

        setFormData((prev) => ({
          ...prev,
          village,
        }));
      } catch (error) {
        console.log(error);
      }
    });
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.ownerId ||
        !formData.name ||
        !formData.type ||
        !formData.rentalRatePerDay ||
        !formData.village
      ) {
        return alert("Fill all fields");
      }

      const sendData = new FormData();
      sendData.append("ownerId", formData.ownerId);
      sendData.append("name", formData.name);
      sendData.append("type", formData.type);
      sendData.append("rentalRatePerDay", formData.rentalRatePerDay);
      sendData.append("location", formData.village);
      sendData.append("condition", formData.condition);

      if (equipmentImage) {
        sendData.append("equipmentImage", equipmentImage);
      }

      if (editingId) {
        await updateEquipment(editingId, sendData);
      } else {
        await createEquipment(sendData);
      }

      setFormData({
        ownerId: "",
        name: "",
        type: "",
        rentalRatePerDay: "",
        village: "",
        condition: "Good",
      });

      setEquipmentImage(null);
      setEditingId(null);
      fetchEquipment();

      alert(editingId ? "Equipment Updated" : "Equipment Added");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Operation Failed");
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getEquipmentById(id);

      setFormData({
        ownerId: res.data.ownerId?._id || "",
        name: res.data.name || "",
        type: res.data.type || "",
        rentalRatePerDay: res.data.rentalRatePerDay || "",
        village: res.data.location || "",
        condition: res.data.condition || "Good",
      });

      setEditingId(id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEquipment(id);
      fetchEquipment();
      alert("Deleted Successfully");
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Delete Failed");
    }
  };

  const inputStyle =
    "w-full p-3 mb-3 rounded-xl border text-gray-900 bg-white focus:ring-2 focus:ring-green-500";

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-gray-900">
      <div className="bg-green-700 text-white p-5 rounded-2xl mb-5">
        <h1 className="text-2xl font-bold">🚜 Equipment Marketplace</h1>
        <p className="text-sm opacity-90">Manage farming equipment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold text-green-700 mb-4">
            {editingId ? "Update Equipment" : "Add Equipment"}
          </h2>

          <select
            className={inputStyle}
            value={formData.ownerId}
            onChange={(e) =>
              setFormData({
                ...formData,
                ownerId: e.target.value,
              })
            }
          >
            <option value="">Select Owner</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            className={inputStyle}
            placeholder="Equipment Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <input
            className={inputStyle}
            placeholder="Write Equipment Type"
            value={formData.type}
            onChange={(e) =>
              setFormData({
                ...formData,
                type: e.target.value,
              })
            }
          />

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

          <div className="flex gap-2">
            <input
              className={inputStyle}
              placeholder="Village / Area"
              value={formData.village}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  village: e.target.value,
                })
              }
            />

            <button
              onClick={getCurrentLocation}
              className="bg-blue-600 text-white px-4 rounded-xl h-[50px]"
            >
              📍
            </button>
          </div>

          <select
            className={inputStyle}
            value={formData.condition}
            onChange={(e) =>
              setFormData({
                ...formData,
                condition: e.target.value,
              })
            }
          >
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Old">Old</option>
          </select>

          {equipmentImage && (
            <img
              src={URL.createObjectURL(equipmentImage)}
              alt="preview"
              className="w-full h-52 object-cover rounded-xl mb-3"
            />
          )}

          <input
            type="file"
            accept="image/*"
            className={inputStyle}
            onChange={(e) => setEquipmentImage(e.target.files[0])}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white p-3 rounded-xl font-bold hover:bg-green-700"
          >
            {editingId ? "Update Equipment" : "Add Equipment"}
          </button>
        </div>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {equipments.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <img
                src={item.equipmentImage || "https://via.placeholder.com/400"}
                alt={item.name}
                className="w-full h-52 object-cover"
              />

              <div className="p-4 text-gray-900">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p>🚜 Type: {item.type}</p>
                <p>👤 Owner: {item.ownerId?.name}</p>
                <p className="text-green-700 font-bold">₹ {item.rentalRatePerDay}/day</p>
                <p>📍 {item.location}</p>
                <p>⚙️ Condition: {item.condition}</p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {user?._id === item.ownerId?._id && (
                    <>
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
                    </>
                  )}

                  {item.isBooked ? (
                    <button
                      disabled
                      className="px-3 py-1 rounded text-white bg-gray-400 cursor-not-allowed"
                    >
                      BOOKED
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/booking/equipment/${item._id}`)}
                      className="px-3 py-1 rounded text-white bg-blue-600"
                    >
                      BOOK
                    </button>
                  )}
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