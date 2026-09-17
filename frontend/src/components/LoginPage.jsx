import React, { useState } from 'react';
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
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const executeLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await api.login(email, password);
      setSuccessMsg(`Welcome back, ${user.fullName || user.email}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 400);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const executeRegister = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
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
    } finally {
      setLoading(false);
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
              : 'Enter your email and password to access the platform'}
          </p>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 text-xs font-semibold rounded-md"
          >
            {loading ? 'Authenticating with Supabase...' : isRegister ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Meta */}
        <div className="pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-500">
          PrecisionAuto Care &bull; PostgreSQL on Supabase
        </div>
      </Card>
    </div>
  );
}
