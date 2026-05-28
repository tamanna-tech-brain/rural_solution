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

  const [verificationData, setVerificationData] = useState({
    email: "",
    otp: "",
  });

  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    if (user) setEditData(user);
  }, [user]);

  const handleSendVerificationOtp = async () => {
    try {
      const email = verificationData.email.trim();

      if (!email) {
        setVerificationMessage("Enter your email to send OTP.");
        return;
      }

      const res = await resendVerificationOtp({ email });
      setVerificationMessage(res.data.message || "OTP sent to your email.");
    } catch (err) {
      setVerificationMessage(err?.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const email = verificationData.email.trim();
      const otp = verificationData.otp.trim();

      if (!email || !otp) {
        setVerificationMessage("Enter both email and OTP to verify.");
        return;
      }

      const res = await verifyEmail({ email, otp });
      setVerificationMessage(res.data.message || "Email verified successfully.");
    } catch (err) {
      setVerificationMessage(err?.response?.data?.message || "Verification failed.");
    }
  };

  // REGISTER
  const handleRegister = async () => {
    try {
      await registerUser(registerData);
      setVerificationData((prev) => ({
        ...prev,
        email: registerData.email,
      }));
      setVerificationMessage("Registration successful. Send OTP below to verify your email.");
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
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-xl ${!isLogin ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                Register
              </button>

              <button onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-xl ${isLogin ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                Login
              </button>
            </div>
          )}

          {!user && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-green-800">Email verification</h2>
                  <p className="text-sm text-green-700">Send OTP and verify your email from this page.</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  className={input}
                  placeholder="Email"
                  value={verificationData.email}
                  onChange={(e) => setVerificationData({ ...verificationData, email: e.target.value })}
                />

                <input
                  className={input}
                  placeholder="OTP"
                  value={verificationData.otp}
                  onChange={(e) => setVerificationData({ ...verificationData, otp: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSendVerificationOtp}
                    className="w-full bg-orange-500 text-white p-3 rounded-xl">
                    Send OTP
                  </button>

                  <button onClick={handleVerifyEmail}
                    className="w-full bg-yellow-500 text-black p-3 rounded-xl">
                    Verify Email
                  </button>
                </div>

                {verificationMessage && (
                  <p className="rounded-xl bg-white px-3 py-2 text-sm text-gray-700 border border-green-200">
                    {verificationMessage}
                  </p>
                )}
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