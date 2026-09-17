import React, { useState } from 'react';
import { api } from '../services/api';
import { Icon } from './ui/icon';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

export default function LoginPage({ onLoginSuccess, onClose, isModal = false }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('alex@fleetcorp.com');
  const [password, setPassword] = useState('Client@123');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const demoPersonas = [
    { name: "Alex Mercer", role: "CLIENT", email: "alex@fleetcorp.com", pass: "Client@123" },
    { name: "Johnathan Miller", role: "TECHNICIAN", email: "tech.john@precisionauto.com", pass: "Tech@123" },
    { name: "Robert Vance", role: "ADMIN", email: "admin@precisionauto.com", pass: "Admin@123" }
  ];

  const handleQuickPersona = (persona) => {
    setEmail(persona.email);
    setPassword(persona.pass);
    executeAuth(persona.email, persona.pass);
  };

  const executeAuth = async (userEmail, userPassword) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const user = await api.login(userEmail, userPassword);
      setSuccessMsg(`Welcome, ${user.fullName || user.email}!`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(user);
      }, 350);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isRegister) {
      executeAuth(email, password);
    } else {
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setError("Please complete all registration fields.");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const newUser = await api.register({
          email,
          password,
          fullName,
          role,
          organization: organization || 'Fleet Logistics Corp'
        });
        setSuccessMsg(`Account created for ${newUser.fullName}!`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(newUser);
        }, 350);
      } catch (err) {
        setError(err.message || "Registration failed.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0c0712]">
      <Card className="w-full max-w-md p-8 bg-[#150c20] border-[#29173a] shadow-xl space-y-6 relative">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        <div className="space-y-1">
          <div className="w-10 h-10 rounded-lg bg-[#7c1782] flex items-center justify-center mb-4 border border-[#9b24a3]">
            <Icon name="precision_manufacturing" size={20} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {isRegister ? 'Create an Account' : 'Sign in to PrecisionAuto'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isRegister ? 'Register your fleet organization' : 'Enter your credentials to access operations'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
            <Icon name="error" size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
            <Icon name="check_circle" size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Full Name</label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Mercer"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@fleetcorp.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Password</label>
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
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} size={16} />
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 text-xs font-semibold"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="hover:text-white transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : 'Create new account'}
            </button>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500 font-mono">Port 8080</span>
          </div>
        </form>

        <div className="pt-4 border-t border-[#271638] space-y-2">
          <div className="text-[11px] text-zinc-400 font-medium">
            Demo Accounts:
          </div>
          <div className="flex flex-wrap gap-2">
            {demoPersonas.map((p, idx) => (
              <Button
                key={idx}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickPersona(p)}
                className="h-7 text-xs"
              >
                {p.name} ({p.role})
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
