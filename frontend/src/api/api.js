import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// TOKEN INTERCEPTOR
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ================= USERS =================

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const verifyEmail = (data) =>
  API.post("/auth/verify-email", data);

export const resendVerificationOtp = (data) =>
  API.post("/auth/resend-otp", data);

// ================= USERS =================
export const getUsers = () =>
  API.get("/users");

export const getUserById = (id) =>
  API.get(`/users/${id}`);

export const updateUser = (id, data) =>
  API.put(`/users/${id}`);

export const deleteUser = (id) =>
  API.delete(`/users/${id}`);


// ================= EQUIPMENT =================


export const createEquipment = (data) =>
  API.post("/equipment", data);

export const getEquipment = () =>
  API.get("/equipment");

export const getEquipmentById = (id) =>
  API.get(`/equipment/${id}`);

export const updateEquipment = (id, data) =>
  API.put(`/equipment/${id}`, data);

export const deleteEquipment = (id) =>
  API.delete(`/equipment/${id}`);

// ================= BOOKINGS =================

// BOOKINGS
export const createBooking = (data) =>
  API.post("/bookings", data);

export const getBookings = () =>
  API.get("/bookings");

export const getBookingById = (id) =>
  API.get(`/bookings/${id}`);

export const updateBooking = (id, data) =>
  API.put(`/bookings/${id}`, data);

export const deleteBooking = (id) =>
  API.delete(`/bookings/${id}`);

// ================= MANDI =================

export const createMandi = (data) => API.post("/mandi", data);
export const getMandi = () => API.get("/mandi");
export const getMandiById = (id) => API.get(`/mandi/${id}`);
export const updateMandi = (id, data) => API.put(`/mandi/${id}`, data);
export const deleteMandi = (id) => API.delete(`/mandi/${id}`);

// ================= PAYMENTS =================

export const createPayment = (data) =>
  API.post("/payments", data);

export const getPayments = () =>
  API.get("/payments");

export const updatePayment = (id, data) =>
  API.put(`/payments/${id}`, data);

export const deletePayment = (id) =>
  API.delete(`/payments/${id}`);

// ================= DISPUTES =================

export const createDispute = (data) =>
  API.post("/disputes", data);

export const getDisputes = () =>
  API.get("/disputes");

export const resolveDispute = (id) =>
  API.put(`/disputes/${id}`);

export const deleteDispute = (id) =>
  API.delete(`/disputes/${id}`);

// ================= NOTIFICATIONS =================

export const createNotification = (data) =>
  API.post("/notifications", data);

export const getNotifications = () =>
  API.get("/notifications");

export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}`);

export default API;