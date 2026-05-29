import { useEffect, useState } from "react";

import {
  createDispute,
  getDisputes,
  resolveDispute,
  updateDispute,
  deleteDispute,
  getUsers,
  getMandi,
  getBookings,
} from "../api/api";

const DisputePage = () => {
  const [disputes, setDisputes] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [mandiList, setMandiList] =
    useState([]);

  const [bookings, setBookings] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [formData, setFormData] =
    useState({
      against: "",

      bookingType: "Mandi",

      bookingId: "",

      reason: "",
    });

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      const res = await getUsers();

      setUsers(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH MANDI =================

  const fetchMandi = async () => {
    try {
      const res = await getMandi();

      setMandiList(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH BOOKINGS =================

  const fetchBookings =
    async () => {
      try {
        const res =
          await getBookings();

        setBookings(
          res.data || []
        );
      } catch (err) {
        console.log(err);
      }
    };

  // ================= FETCH DISPUTES =================

  const fetchDisputes =
    async () => {
      try {
        const res =
          await getDisputes();

        setDisputes(
          res.data || []
        );
      } catch (err) {
        console.log(err);
      }
    };

  useEffect(() => {
    fetchUsers();

    fetchDisputes();

    fetchMandi();

    fetchBookings();
  }, []);

  // ================= RESET =================

  const resetForm = () => {
    setFormData({
      against: "",

      bookingType: "Mandi",

      bookingId: "",

      reason: "",
    });

    setEditingId(null);
  };

  // ================= SUBMIT =================

  const submitHandler =
    async () => {
      try {
        if (
          !formData.against ||
          !formData.reason
        ) {
          return alert(
            "Fill all required fields"
          );
        }

        if (editingId) {
          await updateDispute(
            editingId,
            formData
          );

          alert(
            "Dispute Updated"
          );
        } else {
          await createDispute(
            formData
          );

          alert(
            "Dispute Created"
          );
        }

        resetForm();

        fetchDisputes();
      } catch (err) {
        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
            "Failed"
        );
      }
    };

  // ================= EDIT =================

  const handleEdit = (d) => {
    if (!d?._id) {
      return alert(
        "Invalid dispute"
      );
    }

    if (
      d.raisedBy?._id !==
      user?._id
    ) {
      return alert(
        "Not allowed"
      );
    }

    setFormData({
      against:
        d.against?._id || "",

      bookingType:
        d.bookingType ||
        "Mandi",

      bookingId:
        d.bookingId?._id || "",

      reason: d.reason || "",
    });

    setEditingId(d._id);
  };

  // ================= DELETE =================

  const handleDelete =
    async (id, ownerId) => {
      try {
        if (!id) {
          return alert(
            "Invalid dispute"
          );
        }

        if (
          ownerId !==
          user?._id
        ) {
          return alert(
            "Not allowed"
          );
        }

        await deleteDispute(id);

        fetchDisputes();

        alert(
          "Dispute Deleted"
        );
      } catch (err) {
        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
            "Delete failed"
        );
      }
    };

  // ================= RESOLVE =================

  const handleResolve =
    async (id) => {
      try {
        await resolveDispute(id);

        fetchDisputes();

        setSelected(null);

        alert(
          "Dispute Resolved"
        );
      } catch (err) {
        console.log(err);

        alert(
          err?.response?.data
            ?.message ||
            "Resolve failed"
        );
      }
    };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 gap-6 p-6 bg-gray-100 text-gray-900">
      {/* ================= FORM ================= */}

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-5">
          {editingId
            ? "Update Dispute"
            : "Raise Dispute"}
        </h2>

        {/* AGAINST */}

        <select
          className="w-full p-3 mb-3 border rounded-xl"
          value={
            formData.against
          }
          onChange={(e) =>
            setFormData({
              ...formData,

              against:
                e.target.value,
            })
          }
        >
          <option value="">
            Select Against User
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

        {/* BOOKING TYPE */}

        <select
          className="w-full p-3 mb-3 border rounded-xl"
          value={
            formData.bookingType
          }
          onChange={(e) =>
            setFormData({
              ...formData,

              bookingType:
                e.target.value,

              bookingId: "",
            })
          }
        >
          <option value="Mandi">
            Mandi Dispute
          </option>

          <option value="Equipment">
            Equipment Dispute
          </option>
        </select>

        {/* BOOKING */}

        <select
          className="w-full p-3 mb-3 border rounded-xl"
          value={
            formData.bookingId
          }
          onChange={(e) =>
            setFormData({
              ...formData,

              bookingId:
                e.target.value,
            })
          }
        >
          <option value="">
            Select Booking
          </option>

          {formData.bookingType ===
          "Mandi"
            ? mandiList.map(
                (m) => (
                  <option
                    key={m._id}
                    value={m._id}
                  >
                    {
                      m.mandiLocation
                    }
                  </option>
                )
              )
            : bookings.map(
                (b) => (
                  <option
                    key={b._id}
                    value={b._id}
                  >
                    ₹
                    {
                      b.totalAmount
                    }{" "}
                    —{" "}
                    {
                      b.status
                    }
                  </option>
                )
              )}
        </select>

        {/* REASON */}

        <textarea
          className="w-full p-3 mb-3 border rounded-xl"
          placeholder="Write reason..."
          value={formData.reason}
          onChange={(e) =>
            setFormData({
              ...formData,

              reason:
                e.target.value,
            })
          }
        />

        {/* BUTTON */}

        <button
          onClick={submitHandler}
          className="w-full bg-red-600 text-white p-3 rounded-xl"
        >
          {editingId
            ? "Update Dispute"
            : "Submit Dispute"}
        </button>
      </div>

      {/* ================= LIST ================= */}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          All Disputes
        </h2>

        {disputes.length ===
        0 ? (
          <p className="text-gray-500">
            No disputes found
          </p>
        ) : (
          disputes.map((d) => (
            <div
              key={d._id}
              className="bg-white p-5 rounded-2xl shadow"
            >
              <p className="font-bold text-lg">
                {d.reason}
              </p>

              <p>
                👤 Raised By:{" "}
                {
                  d.raisedBy
                    ?.name
                }
              </p>

              <p>
                ⚔️ Against:{" "}
                {
                  d.against
                    ?.name
                }
              </p>

              <p>
                📦 Type:{" "}
                {
                  d.bookingType
                }
              </p>

              <p className="text-sm text-gray-600">
                Booking:{" "}
                {typeof d.bookingId ===
                "object"
                  ? d.bookingId
                      ?.mandiLocation ||
                    d.bookingId
                      ?.name ||
                    `₹${d.bookingId?.totalAmount}` ||
                    "Booking"
                  : d.bookingId}
              </p>

              <p
                className={`font-bold mt-2 ${
                  d.status ===
                  "resolved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {d.status}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() =>
                    setSelected(
                      d
                    )
                  }
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl"
                >
                  Open
                </button>

                {d.status !==
                  "resolved" &&
                  d.raisedBy
                    ?._id ===
                    user?._id && (
                    <button
                      onClick={() =>
                        handleResolve(
                          d._id
                        )
                      }
                      className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                    >
                      Resolve
                    </button>
                  )}

                {d.raisedBy?._id ===
                  user?._id && (
                  <>
                    <button
                      onClick={() =>
                        handleEdit(
                          d
                        )
                      }
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          d._id,
                          d
                            .raisedBy
                            ?._id
                        )
                      }
                      className="flex-1 bg-red-600 text-white py-2 rounded-xl"
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

      {/* ================= MODAL ================= */}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-3">
              Dispute Details
            </h2>

            <p>
              <b>Reason:</b>{" "}
              {
                selected.reason
              }
            </p>

            <p>
              <b>Status:</b>{" "}
              {
                selected.status
              }
            </p>

            <p>
              <b>Raised By:</b>{" "}
              {
                selected
                  .raisedBy
                  ?.name
              }
            </p>

            <p>
              <b>Against:</b>{" "}
              {
                selected
                  .against
                  ?.name
              }
            </p>

            <p>
              <b>Type:</b>{" "}
              {
                selected.bookingType
              }
            </p>

            <p>
              <b>Booking:</b>{" "}
              {typeof selected.bookingId ===
              "object"
                ? selected
                    .bookingId
                    ?.mandiLocation ||
                  selected
                    .bookingId
                    ?.name ||
                  `₹${selected.bookingId?.totalAmount}`
                : selected.bookingId}
            </p>

            <button
              onClick={() =>
                setSelected(
                  null
                )
              }
              className="w-full mt-4 bg-gray-600 text-white p-2 rounded-xl"
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