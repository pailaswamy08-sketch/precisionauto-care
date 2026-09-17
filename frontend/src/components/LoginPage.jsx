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
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

    // Canvas Background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Noise Grid Lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = '#52525b';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct rotations
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
        role,
        organization: organization || 'Fleet Logistics'
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

  const executeGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      const googleUser = await api.loginWithGoogle();
      setSuccessMsg(`Google Authentication Verified! Welcome, ${googleUser.fullName}.`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(googleUser);
      }, 500);
    } catch (err) {
      setError(err.message || "Google Sign-In was unsuccessful.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#09090b]">
      <Card className="w-full max-w-md p-8 bg-zinc-900/90 border border-zinc-800 rounded-lg shadow-2xl space-y-6 relative backdrop-blur-md">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        {/* Header Branding */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center mb-3 border border-zinc-700">
            <Icon name="precision_manufacturing" size={20} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isRegister ? 'Create an Account' : 'Sign In to PrecisionAuto'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isRegister
              ? 'Register with your fleet credentials to access operations'
              : 'Enter your credentials or continue with Google to access the platform'}
          </p>
        </div>

        {/* Sign in with Google Button */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={executeGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full h-10 text-xs font-semibold rounded-md border-zinc-800 bg-zinc-950 hover:bg-zinc-850 text-zinc-100 flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            {/* Google Multicolor Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-zinc-800 w-full"></div>
            <span className="bg-zinc-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono absolute">
              Or with email
            </span>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-md">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              !isRegister
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
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
            className={`py-1.5 text-xs font-medium rounded transition-colors ${
              isRegister
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-md bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start gap-2.5">
            <Icon name="error" size={16} />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs flex items-start gap-2.5">
            <Icon name="check_circle" size={16} />
            <span className="leading-tight">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isRegister ? executeRegister : executeLogin} className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Full Name</label>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-xs text-zinc-100 focus-visible:outline-none focus-visible:border-zinc-400"
                >
                  <option value="CLIENT">Client / Fleet Customer</option>
                  <option value="TECHNICIAN">Service Technician</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Organization / Fleet Name</label>
                <Input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. FleetCorp Express"
                />
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">Password</label>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
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
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Icon name="verified_user" size={14} /> Security Verification (CAPTCHA)
              </label>
              <button
                type="button"
                onClick={handleRefreshCaptcha}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                title="Generate new CAPTCHA challenge"
              >
                <Icon name="refresh" size={13} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Rendered Canvas Code */}
              <div className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-950 shrink-0 select-none">
                <canvas
                  ref={canvasRef}
                  width="130"
                  height="36"
                  className="block cursor-pointer"
                  onClick={handleRefreshCaptcha}
                  title="Click to refresh CAPTCHA code"
                />
              </div>

              {/* User Entry */}
              <Input
                type="text"
                required
                maxLength={5}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter 5 characters"
                className="font-mono text-center tracking-widest uppercase font-semibold h-9"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-3 text-xs font-semibold rounded-md"
          >
            {loading ? 'Authenticating with Supabase...' : isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          PrecisionAuto Care &bull; PostgreSQL on Supabase
        </div>
      </Card>
    </div>
  );
}
