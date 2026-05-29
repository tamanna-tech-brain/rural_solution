import { useEffect, useState } from "react";

import {
  createPayment,
  getPayments,
  updatePayment,
  deletePayment,
  getUsers,
  getBookings,
  getMandi,
} from "../api/api";

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mandiList, setMandiList] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [paymentScreenshot, setPaymentScreenshot] =
    useState(null);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [formData, setFormData] = useState({
    payerId: "",
    payeeId: "",
    amount: "",
    status: "pending",

    paymentType: "Equipment",

    equipmentBookingId: "",

    mandiId: "",
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

  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(res.data || []);
    } catch (err) {
      console.log("Booking fetch error:", err);
    }
  };

  const fetchMandi = async () => {
    try {
      const res = await getMandi();
      setMandiList(res.data || []);
    } catch (err) {
      console.log("Mandi fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchBookings();
    fetchMandi();
  }, []);

  // ================= RESET =================

  const resetForm = () => {
    setFormData({
      payerId: "",
      payeeId: "",
      amount: "",
      status: "pending",

      paymentType: "Equipment",

      equipmentBookingId: "",

      mandiId: "",
    });

    setPaymentScreenshot(null);
    setEditingId(null);
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    if (
      !formData.payerId ||
      !formData.payeeId ||
      !formData.amount
    ) {
      return alert("Please fill all fields");
    }

    try {
      const sendData = new FormData();

      sendData.append(
        "payerId",
        formData.payerId
      );

      sendData.append(
        "payeeId",
        formData.payeeId
      );

      sendData.append(
        "amount",
        formData.amount
      );

      sendData.append(
        "status",
        formData.status
      );

      sendData.append(
        "paymentType",
        formData.paymentType
      );

      if (
  formData.paymentType ===
    "Equipment" &&
  formData.equipmentBookingId
) {
  sendData.append(
    "equipmentBookingId",
    formData.equipmentBookingId
  );
} 

      if (
  formData.paymentType ===
    "Mandi" &&
  formData.mandiId
) {
  sendData.append(
    "mandiId",
    formData.mandiId
  );
} 


      if (paymentScreenshot) {
        sendData.append(
          "paymentScreenshot",
          paymentScreenshot
        );
      }

      if (editingId) {
        await updatePayment(
          editingId,
          sendData
        );

        alert("Payment Updated");
      } else {
        await createPayment(sendData);

        alert("Payment Created");
      }

      resetForm();
      fetchPayments();
      console.log("EDITING ID:", editingId);
console.log("FORM DATA:", formData);
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          "Payment failed"
      );
    }
  };

const handleEdit = (p) => {
  console.log("EDIT PAYMENT:", p);

  if (!p?._id) {
    return alert("Invalid payment");
  }

  // VALID OBJECT ID LENGTH
  if (p._id.length !== 24) {
    return alert("Corrupted payment ID");
  }

  if (
    p.createdBy?._id !== user?._id
  ) {
    return alert("Not allowed");
  }

  setFormData({
    payerId: p.payerId?._id || "",

    payeeId: p.payeeId?._id || "",

    amount: p.amount || "",

    status: p.status || "pending",

    paymentType:
      p.paymentType || "Equipment",

    equipmentBookingId:
      p.equipmentBookingId?._id || "",

    mandiId:
      p.mandiId?._id || "",
  });

  // IMPORTANT
  setEditingId(p._id);

  setPaymentScreenshot(null);
};

  // ================= DELETE =================

 const handleDelete = async (
  id,
  createdById
) => {
  try {
    console.log("DELETE ID:", id);

    if (!id) {
      return alert("Invalid payment");
    }

    if (id.length !== 24) {
      return alert("Corrupted payment ID");
    }

    if (createdById !== user?._id) {
      return alert("Not allowed");
    }

    await deletePayment(id);

    fetchPayments();
  } catch (err) {
    console.log(err);

    alert(
      err?.response?.data?.message ||
        "Delete failed"
    );
  }
};

  const inputStyle =
    "w-full p-3 mb-3 border rounded-xl bg-white text-black focus:ring-2 focus:ring-purple-500 outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 grid lg:grid-cols-2 gap-6">
      {/* ================= FORM ================= */}

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          {editingId
            ? "Update Payment"
            : "Create Payment"}
        </h2>

        {/* PAYER */}

        <select
          className={inputStyle}
          value={formData.payerId}
          onChange={(e) =>
            setFormData({
              ...formData,
              payerId: e.target.value,
            })
          }
        >
          <option value="">
            Select Payer
          </option>

          {users.map((u) => (
            <option
              key={u._id}
              value={u._id}
            >
              {u.name}
            </option>
          ))}
        </select>

        {/* PAYEE */}

        <select
          className={inputStyle}
          value={formData.payeeId}
          onChange={(e) =>
            setFormData({
              ...formData,
              payeeId: e.target.value,
            })
          }
        >
          <option value="">
            Select Payee
          </option>

          {users.map((u) => (
            <option
              key={u._id}
              value={u._id}
            >
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
            setFormData({
              ...formData,
              amount: e.target.value,
            })
          }
        />

        {/* PAYMENT TYPE */}

        <select
          className={inputStyle}
          value={formData.paymentType}
          onChange={(e) =>
            setFormData({
              ...formData,
              paymentType:
                e.target.value,
            })
          }
        >
          <option value="Equipment">
            Equipment Payment
          </option>

          <option value="Mandi">
            Mandi Payment
          </option>
        </select>

        {/* EQUIPMENT BOOKINGS */}

        {formData.paymentType ===
          "Equipment" && (
          <select
            className={inputStyle}
            value={
              formData.equipmentBookingId
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                equipmentBookingId:
                  e.target.value,
              })
            }
          >
            <option value="">
              Select Equipment Booking
            </option>

            {bookings.map((b) => (
              <option
                key={b._id}
                value={b._id}
              >
                ₹{b.totalAmount} —{" "}
                {b.status}
              </option>
            ))}
          </select>
        )}

        {/* MANDI BOOKINGS */}

        {formData.paymentType ===
          "Mandi" && (
          <select
            className={inputStyle}
            value={formData.mandiId}
            onChange={(e) =>
              setFormData({
                ...formData,
                mandiId:
                  e.target.value,
              })
            }
          >
            <option value="">
              Select Mandi Trip
            </option>

            {mandiList.map((m) => (
              <option
                key={m._id}
                value={m._id}
              >
                {m.mandiLocation} —{" "}
                {m.mandiDate?.split(
                  "T"
                )[0]}
              </option>
            ))}
          </select>
        )}

        {/* STATUS */}

        <select
          className={inputStyle}
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value,
            })
          }
        >
          <option value="pending">
            Pending
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="disputed">
            Disputed
          </option>
        </select>

        {/* IMAGE */}

        <input
          type="file"
          accept="image/*"
          className={inputStyle}
          onChange={(e) =>
            setPaymentScreenshot(
              e.target.files[0]
            )
          }
        />

        {paymentScreenshot && (
          <img
            src={URL.createObjectURL(
              paymentScreenshot
            )}
            alt="preview"
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        )}

        {/* BUTTON */}

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold hover:bg-purple-700"
        >
          {editingId
            ? "Update Payment"
            : "Pay Now"}
        </button>
      </div>

      {/* ================= HISTORY ================= */}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-700">
          💳 Payment History
        </h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">
            No payments found
          </p>
        ) : (
          payments.map((p) => (
            <div
              key={p._id}
              className="bg-white p-4 rounded-2xl shadow-md"
            >
              <img
                src={
                  p.paymentScreenshot ||
                  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
                }
                className="h-40 w-full object-cover rounded-xl mb-3"
                alt="payment"
              />

              <p className="font-bold text-lg">
                ₹ {p.amount}
              </p>

              <p>
                👤 Payer:{" "}
                {p.payerId?.name ||
                  "Unknown"}
              </p>

              <p>
                👤 Payee:{" "}
                {p.payeeId?.name ||
                  "Unknown"}
              </p>

              <p>
                💰 Type:{" "}
                {p.paymentType}
              </p>

              <p className="mt-2">
                Status:{" "}
                <b
                  className={
                    p.status ===
                    "completed"
                      ? "text-green-600"
                      : p.status ===
                        "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                >
                  {p.status}
                </b>
              </p>

              <div className="flex gap-2 mt-3">
                {p.createdBy?._id ===
                  user?._id && (
                  <>
                    <button
                      onClick={() =>
                        handleEdit(p)
                      }
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          p._id,
                          p.createdBy?._id
                        )
                      }
                      className="flex-1 bg-red-500 text-white py-2 rounded-xl"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentPage;