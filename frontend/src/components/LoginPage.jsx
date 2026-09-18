import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function LoginPage({ onLoginSuccess, onClose, isModal = false }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // CAPTCHA State & Canvas
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
    return code;
  };

  const drawCaptchaCanvas = (code) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = '#52525b';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 16 + i * 22;
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#fafafa';
      ctx.fillText(code[i], -6, 2);
      ctx.restore();
    }
  };

  useEffect(() => {
    const newCode = generateCaptcha();
    setTimeout(() => {
      drawCaptchaCanvas(newCode);
    }, 50);
  }, [isRegister]);

  const handleRefreshCaptcha = () => {
    const newCode = generateCaptcha();
    drawCaptchaCanvas(newCode);
  };

  const validateCaptcha = () => {
    if (!captchaInput.trim()) {
      setError("Please complete the security CAPTCHA verification.");
      return false;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Security check failed: Incorrect CAPTCHA code. Please enter the characters shown.");
      handleRefreshCaptcha();
      return false;
    }
    return true;
  };

  const executeLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!validateCaptcha()) return;

    setLoading(true);

    try {
      const user = await api.login(email, password);
      setSuccessMsg(`Welcome back, ${user.fullName || user.email}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
      handleRefreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const executeRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required registration fields.");
      return;
    }

    setError(null);
    setSuccessMsg(null);

    if (!validateCaptcha()) return;

    setLoading(true);

    try {
      const newUser = await api.register({
        email,
        password,
        fullName,
        phone,
        role,
        organization: organization || 'PrecisionAuto Customer'
      });
      setSuccessMsg(`Account created for ${newUser.fullName}! Authenticating...`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(newUser);
      }, 500);
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
      handleRefreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-Click Demo Logins
  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'USER') {
      setEmail('swamy@gmail.com');
      setPassword('Client@123');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@precisionauto.com');
      setPassword('Admin@123');
    } else if (demoRole === 'TECH') {
      setEmail('ravi@precisionauto.com');
      setPassword('Tech@123');
    }
    setCaptchaInput(captchaCode);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#09090b]">
      <Card className="w-full max-w-md p-8 bg-zinc-900/95 border border-zinc-800 rounded-3xl shadow-2xl space-y-6 relative backdrop-blur-md">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        {/* Header Branding */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-3 text-white shadow-lg shadow-blue-900/30">
            <Icon name="precision_manufacturing" size={22} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isRegister ? 'Create Customer Account' : 'Sign In to PrecisionAuto'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isRegister
              ? 'Register as a customer to manage vehicles, book service bays, and track invoices.'
              : 'Enter your credentials to access your garage management portal.'}
          </p>
        </div>

        {/* 1-Click Quick Demo Switchers */}
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-2">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold block text-center">
            Quick 1-Click Demo Accounts
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('USER')}
              className="py-1.5 px-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-900/40 text-blue-300 text-[11px] font-bold text-center transition-colors"
            >
              👤 Swamy (User)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('TECH')}
              className="py-1.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-900/40 text-amber-300 text-[11px] font-bold text-center transition-colors"
            >
              🧑🔧 Ravi (Tech)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="py-1.5 px-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-900/40 text-purple-300 text-[11px] font-bold text-center transition-colors"
            >
              👨💼 Admin Manager
            </button>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              !isRegister
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isRegister
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
            <Icon name="error" size={16} />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-xs flex items-start gap-2.5">
            <Icon name="check_circle" size={16} />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? executeRegister : executeLogin} className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Swamy Paila"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Phone Number *</label>
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="h-9 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Account Type</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-9 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="CLIENT">👤 Customer / Vehicle Owner</option>
                  <option value="TECHNICIAN">🧑🔧 Workshop Technician</option>
                  <option value="ADMIN">👨💼 Garage Manager (Admin)</option>
                </select>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="swamy@gmail.com"
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Password *</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10 h-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-zinc-400 hover:text-white"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} size={16} />
              </button>
            </div>
          </div>

          {/* CAPTCHA Security Verification */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Icon name="verified_user" size={14} className="text-blue-400" /> Security Check (CAPTCHA)
              </label>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Icon name="refresh" size={13} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shrink-0 select-none">
                <canvas
                  ref={canvasRef}
                  width="130"
                  height="36"
                  className="block cursor-pointer"
                  onClick={handleRefreshCaptcha}
                  title="Click to refresh CAPTCHA code"
                />
              </div>

              <Input
                type="text"
                required
                maxLength={5}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter 5 chars"
                className="font-mono text-center tracking-widest uppercase font-bold h-9 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Portal'}
          </Button>
        </form>

        <div className="pt-3 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          PrecisionAuto Care &bull; Multi-Role Garage Platform
        </div>
      </Card>
    </div>
  );
}
