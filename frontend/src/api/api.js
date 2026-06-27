import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

// ── Request Interceptor — auto-attach JWT ──────────────────────────────────
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  },
  (err) => Promise.reject(err)
);

// ── Response Interceptor — auto-logout on 401 ─────────────────────────────
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — clear auth state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/user")) {
        window.location.href = "/user";
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────
export const registerUser          = (data)      => API.post("/auth/register", data);
export const loginUser             = (data)      => API.post("/auth/login", data);
export const verifyEmail           = (data)      => API.post("/auth/verify-email", data);
export const resendVerificationOtp = (data)      => API.post("/auth/resend-otp", data);

// ── USERS ─────────────────────────────────────────────────────────────────
export const getUsers    = ()        => API.get("/users");
export const getUserById = (id)      => API.get(`/users/${id}`);
export const updateUser  = (id, data)=> API.put(`/users/${id}`, data);
export const deleteUser  = (id)      => API.delete(`/users/${id}`);

// ── EQUIPMENT ─────────────────────────────────────────────────────────────
export const createEquipment  = (data)       => API.post("/equipment", data, { headers: { "Content-Type": "multipart/form-data" } });
export const getEquipment     = ()           => API.get("/equipment");
export const getEquipmentById = (id)         => API.get(`/equipment/${id}`);
export const updateEquipment  = (id, data)   => API.put(`/equipment/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteEquipment  = (id)         => API.delete(`/equipment/${id}`);

// ── BOOKINGS ──────────────────────────────────────────────────────────────
export const createBooking  = (data)      => API.post("/bookings", data);
export const getBookings    = ()          => API.get("/bookings");
export const getBookingById = (id)        => API.get(`/bookings/${id}`);
export const updateBooking  = (id, data)  => API.put(`/bookings/${id}`, data);
export const deleteBooking  = (id)        => API.delete(`/bookings/${id}`); // ✅ fixed: no body needed, JWT handles auth

// ── MANDI ─────────────────────────────────────────────────────────────────
export const createMandi         = (data)      => API.post("/mandi", data);
export const getMandi            = ()          => API.get("/mandi");
export const getMandiById        = (id)        => API.get(`/mandi/${id}`);
export const updateMandi         = (id, data)  => API.put(`/mandi/${id}`, data);
export const deleteMandi         = (id)        => API.delete(`/mandi/${id}`);
export const joinMandi           = (id, data)  => API.post(`/mandi/${id}/join`, data);
export const updateMandiLocation = (id, data)  => API.put(`/mandi/${id}/location`, data);
export const updateMandiStatus   = (id, data)  => API.put(`/mandi/${id}/status`, data);

// ── PAYMENTS ─────────────────────────────────────────────────────────────
export const createPayment = (data)      => API.post("/payments", data, { headers: { "Content-Type": "multipart/form-data" } });
export const getPayments   = ()          => API.get("/payments");
export const updatePayment = (id, data)  => API.put(`/payments/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
export const deletePayment = (id)        => API.delete(`/payments/${id}`);

// ── DISPUTES ─────────────────────────────────────────────────────────────
export const createDispute  = (data)      => API.post("/disputes", data);
export const getDisputes    = ()          => API.get("/disputes");
export const resolveDispute = (id)        => API.put(`/disputes/${id}/resolve`);
export const updateDispute  = (id, data)  => API.put(`/disputes/${id}`, data);
export const deleteDispute  = (id)        => API.delete(`/disputes/${id}`);

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────
export const getNotifications    = ()   => API.get("/notifications");
export const markNotificationRead= (id) => API.put(`/notifications/${id}/read`);
export const deleteNotification  = (id) => API.delete(`/notifications/${id}`);

// ── HELP DESK ─────────────────────────────────────────────────────────────
export const createHelpPost = (data)      => API.post("/help", data);
export const getHelpPosts   = ()          => API.get("/help");
export const replyToPost    = (id, data)  => API.put(`/help/reply/${id}`, data);
export const deleteHelpPost = (id)        => API.delete(`/help/${id}`);

// ── ADMIN ─────────────────────────────────────────────────────────────────
export const getAdminStats   = ()          => API.get("/admin/stats");
export const getAdminUsers   = (params)    => API.get("/admin/users", { params });
export const updateUserRole  = (id, role)  => API.put(`/admin/users/${id}/role`, { role });
export const deactivateUser  = (id)        => API.put(`/admin/users/${id}/deactivate`);

export default API;