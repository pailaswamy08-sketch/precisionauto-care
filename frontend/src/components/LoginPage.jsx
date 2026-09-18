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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // CAPTCHA State & Canvas Generation
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef(null);

  const generateCaptcha = () => {
    // Highly readable characters (avoid confusing 0/O, 1/I/L)
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
    // Dark clean background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle background lines
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // High readability font
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 16 + i * 24;
      const y = canvas.height / 2;
      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#818cf8';
      ctx.fillText(code[i], x - 5, y);
      ctx.restore();
    }
  };

  useEffect(() => {
    const newCode = generateCaptcha();
    setTimeout(() => {
      drawCaptchaCanvas(newCode);
    }, 60);
  }, [isRegister]);

  const handleRefreshCaptcha = () => {
    const newCode = generateCaptcha();
    drawCaptchaCanvas(newCode);
  };

  const validateCaptcha = () => {
    if (!captchaInput.trim()) {
      setError("Please enter the security CAPTCHA code shown.");
      return false;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError("Incorrect CAPTCHA code. Please check the letters and try again.");
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
      setError(err.message || "Invalid email or password. Please verify your credentials.");
      handleRefreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const executeRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your Name, Email, and Password.");
      return;
    }

    setError(null);
    setSuccessMsg(null);

    if (!validateCaptcha()) return;

    setLoading(true);

    try {
      // Clean sign up with just Name, Email, and Password (defaults role to CLIENT / Customer)
      const newUser = await api.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role: 'CLIENT',
        organization: 'Individual Customer',
        phone: '9876543210'
      });
      setSuccessMsg(`Account created successfully for ${newUser.fullName}! Signing in...`);
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
    setError(null);
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
    <div className={`w-full flex items-center justify-center ${isModal ? '' : 'min-h-screen p-4 sm:p-6 bg-[#09090b]'}`}>
      <Card className="w-full max-w-md p-6 sm:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl space-y-6 relative backdrop-blur-md">
        
        {/* Close Button for Modal Mode */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-xl transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40">
            <Icon name="precision_manufacturing" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isRegister ? 'Create Customer Account' : 'Customer & Staff Portal Login'}
          </h1>
        </div>

        {/* Tab Selector: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
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
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              isRegister
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <Icon name="error" size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-fadeIn">
            <Icon name="check_circle" size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}

        {/* Clean, Simple Form */}
        <form onSubmit={isRegister ? executeRegister : executeLogin} className="space-y-4">
          
          {/* Full Name (Sign Up Only) */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Swamy Paila"
                  className="h-10 pl-9 rounded-xl bg-zinc-950 border-zinc-800 focus:border-blue-500 text-xs text-white"
                />
                <Icon name="person" size={16} className="absolute left-3 top-3 text-zinc-500" />
              </div>
            </div>
          )}

          {/* Email / Gmail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Email / Gmail Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-10 pl-9 rounded-xl bg-zinc-950 border-zinc-800 focus:border-blue-500 text-xs text-white"
              />
              <Icon name="mail" size={16} className="absolute left-3 top-3 text-zinc-500" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 pl-9 pr-10 rounded-xl bg-zinc-950 border-zinc-800 focus:border-blue-500 text-xs text-white"
              />
              <Icon name="lock" size={16} className="absolute left-3 top-3 text-zinc-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} size={16} />
              </button>
            </div>
          </div>

          {/* Security CAPTCHA */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Icon name="verified_user" size={14} className="text-blue-400" />
                <span>Security Check (CAPTCHA)</span>
              </label>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-[11px] text-zinc-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                title="Generate new code"
              >
                <Icon name="refresh" size={13} />
                <span>Refresh Code</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* High-legibility Canvas Code */}
              <div 
                className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shrink-0 cursor-pointer shadow-inner"
                onClick={handleRefreshCaptcha}
                title="Click to refresh CAPTCHA"
              >
                <canvas
                  ref={canvasRef}
                  width="140"
                  height="40"
                  className="block"
                />
              </div>

              {/* User Code Input */}
              <Input
                type="text"
                required
                maxLength={5}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter Code"
                className="font-mono text-center tracking-widest uppercase font-bold h-10 rounded-xl bg-zinc-950 border-zinc-800 focus:border-blue-500 text-sm text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </span>
            ) : isRegister ? (
              'Create Customer Account'
            ) : (
              'Sign In to Customer Portal'
            )}
          </Button>
        </form>

        {/* 1-Click Demo Accounts (Organized for Quick Testing) */}
        <div className="pt-2">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span className="font-semibold text-zinc-300">Quick Test Logins:</span>
              <span className="text-[10px] text-zinc-500">Auto-fills credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('USER')}
                className="py-1.5 px-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/40 text-blue-300 text-xs font-bold text-center transition-colors truncate"
              >
                👤 User
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('TECH')}
                className="py-1.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 text-xs font-bold text-center transition-colors truncate"
              >
                🧑🔧 Technician
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="py-1.5 px-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 text-xs font-bold text-center transition-colors truncate"
              >
                👑 Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-500 font-mono">
          PrecisionAuto Care &bull; Fleet Maintenance Platform
        </div>
      </Card>
    </div>
  );
}
