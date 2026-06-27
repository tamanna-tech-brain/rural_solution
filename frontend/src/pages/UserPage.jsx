import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Wheat, Mail, Lock, User, Phone, MapPin, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { registerUser, loginUser, verifyEmail, resendVerificationOtp } from '../api/api';
import API from '../api/api';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const InputField = ({ icon: Icon, type = 'text', placeholder, value, onChange, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative">
      {Icon && (
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      )}
      <input
        type={isPassword ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

const UserPage = () => {
  const navigate = useNavigate();
  const { user, login, logoutUser } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
  const [loading, setLoading] = useState(false);

  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', village: '', region: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [otpData, setOtpData] = useState({ email: '', otp: '' });
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (user) setEditData({ name: user.name, email: user.email, village: user.village, region: user.region });
  }, [user]);

  const handleRegister = async () => {
    const { name, email, phone, village, region, password } = registerData;
    if (!name || !email || !phone || !village || !region || !password) {
      return toast.error('Please fill all fields.');
    }
    setLoading(true);
    try {
      const res = await registerUser(registerData);
      setOtpData({ email: registerData.email, otp: '' });
      toast.success(res.data.message || 'OTP sent to your email!');
      setMode('otp');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) return toast.error('Enter email and password.');
    setLoading(true);
    try {
      const res = await loginUser(loginData);
      setOtpData({ email: loginData.email, otp: '' });
      toast.success(res.data.message || 'OTP sent!');
      setMode('otp');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpData.email || !otpData.otp) return toast.error('Enter email and OTP.');
    setLoading(true);
    try {
      const res = await verifyEmail({ email: otpData.email, otp: otpData.otp });
      login(res.data.user, res.data.token);
      toast.success('Login successful! Welcome 🚀');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpData.email) return toast.error('Enter your email first.');
    setLoading(true);
    try {
      await resendVerificationOtp({ email: otpData.email });
      toast.success('OTP resent successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await API.put(`/users/${user._id}`, editData);
      login(res.data, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    setLoading(true);
    try {
      await API.delete(`/users/${user._id}`);
      logoutUser();
      toast.success('Account deleted.');
    } catch (err) {
      toast.error('Delete failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Logged In View ──────────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
        <div className="page-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-2xl font-bold text-white shadow-lg">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-green">{user.role}</span>
                <span className="badge badge-blue">Trust: {user.trustScore}/10</span>
                {user.verified && <span className="badge badge-green flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <InputField icon={User}  placeholder="Full Name"  value={editData.name    || ''} onChange={e => setEditData(p => ({...p, name: e.target.value}))} />
            <InputField icon={Mail}  placeholder="Email"      value={editData.email   || ''} onChange={e => setEditData(p => ({...p, email: e.target.value}))} />
            <InputField icon={MapPin} placeholder="Village"   value={editData.village || ''} onChange={e => setEditData(p => ({...p, village: e.target.value}))} />
            <InputField icon={Globe}  placeholder="Region"    value={editData.region  || ''} onChange={e => setEditData(p => ({...p, region: e.target.value}))} />
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={handleUpdate} disabled={loading} className="btn btn-primary flex-1">
              {loading ? 'Saving…' : 'Update Profile'}
            </button>
            <button onClick={logoutUser} className="btn btn-ghost flex-1">Logout</button>
          </div>
          <button onClick={handleDelete} className="btn btn-danger mt-3 w-full">Delete Account</button>
        </div>
      </div>
    );
  }

  // ── Auth View ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-2xl grid md:grid-cols-2 animate-scale-in">

        {/* Left Image Panel */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop"
            className="h-full w-full object-cover"
            alt="Farming landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Wheat size={20} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">KrishiPool</p>
                <p className="text-xs text-emerald-300">Smart Farming Platform</p>
              </div>
            </div>
            <p className="text-sm text-white/80">
              Connect with nearby farmers, rent equipment, and share mandi transport costs.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 flex flex-col justify-center">
          {/* Tab Switcher */}
          {mode !== 'otp' && (
            <div className="flex gap-2 rounded-xl bg-slate-100 dark:bg-slate-700 p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all ${
                    mode === m
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Register */}
            {mode === 'register' && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create Account</h2>
                <InputField icon={User}  placeholder="Full Name"  value={registerData.name}     onChange={e => setRegisterData(p=>({...p,name:e.target.value}))} />
                <InputField icon={Mail}  placeholder="Email"      value={registerData.email}    onChange={e => setRegisterData(p=>({...p,email:e.target.value}))} />
                <InputField icon={Phone} placeholder="Phone"      value={registerData.phone}    onChange={e => setRegisterData(p=>({...p,phone:e.target.value}))} />
                <InputField icon={MapPin} placeholder="Village"   value={registerData.village}  onChange={e => setRegisterData(p=>({...p,village:e.target.value}))} />
                <InputField icon={Globe} placeholder="Region"     value={registerData.region}   onChange={e => setRegisterData(p=>({...p,region:e.target.value}))} />
                <InputField icon={Lock}  type="password" placeholder="Password" value={registerData.password} onChange={e => setRegisterData(p=>({...p,password:e.target.value}))} />
                <button onClick={handleRegister} disabled={loading} className="btn btn-primary w-full justify-center">
                  {loading ? 'Registering…' : <><span>Register</span><ArrowRight size={16} /></>}
                </button>
              </motion.div>
            )}

            {/* Login */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h2>
                <InputField icon={Mail} placeholder="Email" value={loginData.email}    onChange={e => setLoginData(p=>({...p,email:e.target.value}))} />
                <InputField icon={Lock} type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData(p=>({...p,password:e.target.value}))} />
                <button onClick={handleLogin} disabled={loading} className="btn btn-primary w-full justify-center">
                  {loading ? 'Sending OTP…' : <><span>Login</span><ArrowRight size={16} /></>}
                </button>
              </motion.div>
            )}

            {/* OTP Verify */}
            {mode === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex flex-col items-center text-center mb-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 mb-3">
                    <Mail size={24} className="text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check Your Email</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    We sent a 6-digit OTP to <strong>{otpData.email}</strong>
                  </p>
                </div>
                <InputField icon={Mail} placeholder="Email" value={otpData.email} onChange={e => setOtpData(p=>({...p,email:e.target.value}))} />
                <input
                  className="input-field text-center text-2xl font-bold tracking-[0.3em]"
                  placeholder="000000"
                  maxLength={6}
                  value={otpData.otp}
                  onChange={e => setOtpData(p=>({...p,otp:e.target.value.replace(/\D/g,'')}))}
                />
                <button onClick={handleVerifyOtp} disabled={loading} className="btn btn-primary w-full justify-center">
                  {loading ? 'Verifying…' : 'Verify OTP'}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button onClick={handleResendOtp} disabled={loading} className="text-emerald-600 hover:underline font-medium">
                    Resend OTP
                  </button>
                  <button onClick={() => setMode('login')} className="text-slate-500 hover:underline">
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserPage;