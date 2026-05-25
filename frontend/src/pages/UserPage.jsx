import { useState, useEffect } from "react";
import { registerUser, loginUser, verifyEmail, resendVerificationOtp } from "../api/api";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(false);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    village: "",
    region: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) setEditData(user);
  }, [user]);

  const handleVerifyEmail = async () => {
    try {
      const email = prompt("Enter your email for verification:");
      if (!email) return;
      const otp = prompt("Enter the OTP sent to your email:");
      if (!otp) return;
      const res = await verifyEmail({ email, otp });
      alert(res.data.message || "Email verified successfully");
    } catch (err) {
      alert(err?.response?.data?.message || "Verification failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const email = prompt("Enter your email to resend OTP:");
      if (!email) return;
      const res = await resendVerificationOtp({ email });
      const message = res.data.message || "OTP resent to your email";
      const previewUrl = res.data.previewUrl;
      alert(previewUrl ? `${message}\nPreview: ${previewUrl}` : message);
    } catch (err) {
      alert(err?.response?.data?.message || "Resend OTP failed");
    }
  };

  // REGISTER
  const handleRegister = async () => {
    try {
      await registerUser(registerData);
      alert("Registration Successful 🚜");
      setIsLogin(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Register Failed");
    }
  };

  // LOGIN
  const handleLogin = async () => {
    try {
      const res = await loginUser(loginData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setUser(res.data.user);

      alert("Login Successful 🚀");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Login Failed");
    }
  };

  // GET USER
  const getUser = async () => {
    try {
      if (!user?._id) return alert("User ID missing");

      const res = await API.get(`/users/${user._id}`);

      setUser(res.data);
      setEditData(res.data);

      alert("Profile Loaded ✅");
    } catch (err) {
      console.log(err);
      alert("Get Failed");
    }
  };

  // UPDATE USER
  const updateUserHandler = async () => {
    try {
      if (!user?._id) return alert("User ID missing");

      const res = await API.put(`/users/${user._id}`, editData);

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);

      alert("Updated Successfully ✨");
    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  // DELETE USER
  const deleteUserHandler = async () => {
    try {
      if (!user?._id) return alert("User ID missing");

      await API.delete(`/users/${user._id}`);

      localStorage.clear();
      setUser(null);

      alert("Deleted Successfully ❌");
    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  const input =
    "w-full p-3 border rounded-xl text-black outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 p-4">

      <div className="w-full max-w-6xl min-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854"
            className="h-full w-full object-cover"
            alt="farm"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="text-white text-5xl font-bold">🚜 KrishiPool</h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-6 md:p-10 flex flex-col justify-center">

          <h1 className="text-4xl font-bold text-green-700 text-center">
            Farmer System
          </h1>

          {!user && (
            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="flex justify-center gap-3">
                <button onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded-xl ${!isLogin ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                  Register
                </button>

                <button onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 rounded-xl ${isLogin ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                  Login
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={handleVerifyEmail}
                  className="px-4 py-2 rounded-xl bg-yellow-500 text-black">
                  Verify Email
                </button>
                <button onClick={handleResendOtp}
                  className="px-4 py-2 rounded-xl bg-orange-500 text-white">
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          {/* REGISTER */}
          {!isLogin && !user ? (
            <div className="mt-6 space-y-3">
              <input className={input} placeholder="Name"
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} />

              <input className={input} placeholder="Email"
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />

              <input className={input} placeholder="Phone"
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })} />

              <input className={input} placeholder="Village"
                onChange={(e) => setRegisterData({ ...registerData, village: e.target.value })} />

              <input className={input} placeholder="Region"
                onChange={(e) => setRegisterData({ ...registerData, region: e.target.value })} />

              <input type="password" className={input} placeholder="Password"
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />

              <button onClick={handleRegister}
                className="w-full bg-green-600 text-white p-3 rounded-xl">
                Register
              </button>
            </div>
          ) : !user ? (
            /* LOGIN */
            <div className="mt-6 space-y-3">
              <input className={input} placeholder="Email"
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />

              <input type="password" className={input} placeholder="Password"
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />

              <button onClick={handleLogin}
                className="w-full bg-blue-600 text-white p-3 rounded-xl">
                Login
              </button>
            </div>
          ) : (
            /* DASHBOARD */
            <div className="mt-6 space-y-3">

              <h2 className="text-xl font-bold text-center">
                Welcome {user.name} 👋
              </h2>

              <button onClick={getUser}
                className="w-full bg-gray-700 text-white p-2 rounded-xl">
                Refresh Profile
              </button>

              <input className={input} value={editData.name || ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })} />

              <input className={input} value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })} />

              <input className={input} value={editData.village || ""}
                onChange={(e) => setEditData({ ...editData, village: e.target.value })} />

              <button onClick={updateUserHandler}
                className="w-full bg-green-600 text-white p-3 rounded-xl">
                Update
              </button>

              <button onClick={deleteUserHandler}
                className="w-full bg-red-600 text-white p-3 rounded-xl">
                Delete Account
              </button>

              <button onClick={() => {
                localStorage.clear();
                setUser(null);
              }}
                className="w-full bg-black text-white p-3 rounded-xl">
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;