"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Phone, Lock, Eye, EyeOff, Check, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { AuthPageWrapper } from '@/components/auth/AuthPageWrapper';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (!/(?=.*[a-z])/.test(formData.password) || !/(?=.*[A-Z])/.test(formData.password) || !/(?=.*\d)/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase, lowercase, and a number.");
      return;
    }
    if (!isVerified) {
      toast.error("Please slide to verify you are human.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      toast.success("Confirmation code sent!");
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const titleMain = (
    <>
      Create your<br />
      <span className="font-serif italic text-slate-500 font-normal">account</span>
    </>
  );

  return (
    <AuthPageWrapper
      titleTop="JOIN CRYPTOFIN"
      titleMain={titleMain}
      subtitle="Start your crypto journey today, Trade, swap, earn and grow your digital assets with ease."
      imageSrc="/login%20and%20signup%20hero%20image.png"
    >
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100">
        <h2 className="text-3xl font-black text-[#111111] mb-2 tracking-tight">Sign Up</h2>
        <p className="text-slate-500 font-medium text-sm mb-8">Create your account in just a few minutes.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl px-11 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              required
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm font-semibold focus:outline-none focus:border-[#D4FF00] focus:ring-2 focus:ring-[#D4FF00]/20 transition-all placeholder:text-slate-400"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Anti-bot Slider */}
          <div className="w-full bg-[#FBF9F1] border border-slate-200 rounded-xl h-14 relative overflow-hidden flex items-center justify-center group shadow-inner">
            <div className="absolute left-0 top-0 bottom-0 bg-[#D4FF00] transition-all duration-75" style={{ width: `${sliderValue}%` }} />
            
            <div className="absolute left-1 top-1 bottom-1 w-12 bg-white rounded-lg shadow-sm flex items-center justify-center pointer-events-none transition-all duration-75" style={{ left: `calc(${sliderValue}% - 48px + 4px)` }}>
                {isVerified ? <Check className="w-5 h-5 text-green-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </div>

            <span className={`relative z-10 text-sm font-bold transition-colors ${isVerified ? 'text-[#111111]' : 'text-slate-400'}`}>
                {isVerified ? 'Verified Human' : 'Slide to verify'}
            </span>
            
            <input 
              type="range" 
              min="0" max="100" 
              value={sliderValue}
              onChange={(e) => {
                if (isVerified) return;
                const val = parseInt(e.target.value);
                setSliderValue(val);
                if (val > 95) {
                  setIsVerified(true);
                  setSliderValue(100);
                }
              }}
              onMouseUp={() => { if (!isVerified) setSliderValue(0) }}
              onTouchEnd={() => { if (!isVerified) setSliderValue(0) }}
              className="absolute inset-0 opacity-0 cursor-pointer z-20"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded text-[#D4FF00] focus:ring-[#D4FF00] border-slate-300"
            />
            <label htmlFor="terms" className="text-xs font-medium text-slate-500">
              I agree to the <Link href="#" className="text-[#0052FF] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#0052FF] hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF00] hover:bg-[#c8f200] text-[#111111] font-black text-sm py-3.5 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2 shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Account →'}
          </button>

          <p className="text-center text-xs font-semibold text-slate-500 mt-6">
            Already have an account? <Link href="/auth/login" className="text-[#0052FF] hover:underline">Log In</Link>
          </p>
        </form>
      </div>
    </AuthPageWrapper>
  );
}
