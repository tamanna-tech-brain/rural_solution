import { useEffect, useState } from "react";
import {
  createPayment,
  getPayments,
  updatePayment,
  deletePayment,
  getUsers,
} from "../api/api";


const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    payerId: "",
    payeeId: "",
    amount: "",
    status: "pending",
  });

  // ================= FETCH =================
  const fetchPayments = async () => {
    try {
      const res = await getPayments();
      setPayments(res.data || []);
    } catch (err) {
      console.log("Payment fetch error:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.log("User fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, []);

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      payerId: "",
      payeeId: "",
      amount: "",
      status: "pending",
    });
    setEditingId(null);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!formData.payerId || !formData.payeeId || !formData.amount) {
      return alert("Please fill all fields");
    }

    try {
      if (editingId) {
        await updatePayment(editingId, formData);
        alert("Payment Updated");
      } else {
        await createPayment(formData);
        alert("Payment Created");
      }

      resetForm();
      fetchPayments();
    } catch (err) {
      console.log(err);
      alert("Payment failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setFormData({
      payerId: p.payerId?._id || "",
      payeeId: p.payeeId?._id || "",
      amount: p.amount,
      status: p.status,
    });
    setEditingId(p._id);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deletePayment(id);
      fetchPayments();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const inputStyle =
    "w-full p-3 mb-3 border rounded-xl bg-white text-black focus:ring-2 focus:ring-purple-500 outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 grid lg:grid-cols-2 gap-6">

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          {editingId ? "Update Payment" : "Create Payment"}
        </h2>

        {/* PAYER */}
        <select
          className={inputStyle}
          value={formData.payerId}
          onChange={(e) =>
            setFormData({ ...formData, payerId: e.target.value })
          }
        >
          <option value="">Select Payer</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* PAYEE */}
        <select
          className={inputStyle}
          value={formData.payeeId}
          onChange={(e) =>
            setFormData({ ...formData, payeeId: e.target.value })
          }
        >
          <option value="">Select Payee</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* AMOUNT */}
        <input
          type="number"
          className={inputStyle}
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: e.target.value })
          }
        />

        {/* STATUS */}
        <select
          className={inputStyle}
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value })
          }
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="disputed">Disputed</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-700"
        >
          {editingId ? "Update Payment" : "Pay Now"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">

        <h2 className="text-xl font-bold text-gray-700">
          💳 Payment History
        </h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">No payments found</p>
        ) : (
          payments.map((p) => (
            <div
              key={p._id}
              className="bg-white p-4 rounded-2xl shadow-md"
            >

              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
                className="h-40 w-full object-cover rounded-xl mb-3"
              />

              <p className="font-bold text-lg">₹ {p.amount}</p>

              <p>👤 Payer: {p.payerId?.name || "Unknown"}</p>
              <p>👤 Payee: {p.payeeId?.name || "Unknown"}</p>

              <p className="mt-2">
                Status:{" "}
                <b
                  className={
                    p.status === "completed"
                      ? "text-green-600"
                      : p.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                >
                  {p.status}
                </b>
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(p._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-xl"
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

export default PaymentPage;