import { useEffect, useState } from "react";
import {
  createDispute,
  getDisputes,
  resolveDispute,
  getUsers,
} from "../api/api";


const DisputePage = () => {
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    raisedBy: "",
    against: "",
    bookingId: "",
    reason: "",
  });

  // FETCH USERS
  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data || []);
  };

  // FETCH DISPUTES
  const fetchDisputes = async () => {
    const res = await getDisputes();
    setDisputes(res.data || []);
  };

  useEffect(() => {
    fetchUsers();
    fetchDisputes();
  }, []);

  // CREATE
  const submitHandler = async () => {
    if (!formData.raisedBy || !formData.against || !formData.reason) {
      return alert("Fill all required fields");
    }

    await createDispute(formData);

    setFormData({
      raisedBy: "",
      against: "",
      bookingId: "",
      reason: "",
    });

    fetchDisputes();
  };

  // RESOLVE
  const handleResolve = async (id) => {
    await resolveDispute(id);
    fetchDisputes();
    setSelected(null);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-6 p-6 bg-gray-100 text-gray-900">

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          Raise Dispute
        </h2>

        {/* Raised By */}
        <select
          className="w-full p-3 mb-3 border rounded-xl text-gray-800"
          value={formData.raisedBy}
          onChange={(e) =>
            setFormData({ ...formData, raisedBy: e.target.value })
          }
        >
          <option value="">Select Raised By</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Against */}
        <select
          className="w-full p-3 mb-3 border rounded-xl text-gray-800"
          value={formData.against}
          onChange={(e) =>
            setFormData({ ...formData, against: e.target.value })
          }
        >
          <option value="">Select Against</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* BOOKING DROPDOWN (FIXED) */}
        <select
          className="w-full p-3 mb-3 border rounded-xl text-gray-800"
          value={formData.bookingId}
          onChange={(e) =>
            setFormData({ ...formData, bookingId: e.target.value })
          }
        >
          <option value="">Select Booking ID</option>

          {disputes.map((d, index) => (
            <option key={index} value={d.bookingId}>
              {d.bookingId || "Booking"} - {d.reason?.slice(0, 20)}
            </option>
          ))}
        </select>

        {/* REASON */}
        <textarea
          className="w-full p-3 mb-3 border rounded-xl text-gray-800"
          placeholder="Write reason..."
          value={formData.reason}
          onChange={(e) =>
            setFormData({ ...formData, reason: e.target.value })
          }
        />

        <button
          onClick={submitHandler}
          className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-semibold"
        >
          Submit Dispute
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">

        <h2 className="text-xl font-bold text-gray-800">
          All Disputes
        </h2>

        {disputes.length === 0 ? (
          <p className="text-gray-500">No disputes found</p>
        ) : (
          disputes.map((d) => (
            <div
              key={d._id}
              className="bg-white p-5 rounded-2xl shadow-md"
            >

              <p className="font-bold text-gray-900">
                {d.reason}
              </p>

              <p className="text-gray-700">
                👤 Raised By: {d.raisedBy?.name}
              </p>

              <p className="text-gray-700">
                ⚔️ Against: {d.against?.name}
              </p>

              <p className="text-sm text-gray-600">
                Booking: {d.bookingId}
              </p>

              <p
                className={`mt-2 font-bold ${
                  d.status === "resolved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {d.status}
              </p>

              <div className="flex gap-2 mt-3">

                {/* OPEN */}
                <button
                  onClick={() => setSelected(d)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                >
                  Open
                </button>

                {/* RESOLVE */}
                {d.status !== "resolved" && (
                  <button
                    onClick={() => handleResolve(d._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                  >
                    Resolve
                  </button>
                )}

              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

          <div className="bg-white w-[420px] p-6 rounded-2xl shadow-xl">

            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Dispute Details
            </h2>

            <p className="text-gray-800 mb-2">
              <b>Reason:</b> {selected.reason}
            </p>

            <p className="text-gray-800 mb-2">
              <b>Status:</b> {selected.status}
            </p>

            <p className="text-gray-700 mb-2">
              <b>Raised By:</b> {selected.raisedBy?.name}
            </p>

            <p className="text-gray-700 mb-2">
              <b>Against:</b> {selected.against?.name}
            </p>

            <p className="text-gray-700 mb-4">
              <b>Booking:</b> {selected.bookingId}
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-xl"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default DisputePage;