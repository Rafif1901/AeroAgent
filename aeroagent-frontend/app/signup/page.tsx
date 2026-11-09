"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

  // Fungsi untuk menangani saat tombol daftar diklik
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Logika pendaftaran akun (API call) ditaruh di sini nantinya
    
    // Arahkan ke halaman dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FCFB] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl shadow-teal-900/10 border border-teal-50">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-teal-600 mb-4 hover:scale-105 transition-transform">
            <Leaf size={32} className="fill-current" />
            <span className="text-3xl font-bold tracking-tight text-slate-800">AeroAgent</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1c3547]">Buat Akun Baru</h1>
          <p className="text-slate-500 text-sm mt-2 text-center">Bergabunglah untuk akses penuh peringatan dini polusi Jakarta.</p>
        </div>

        {/* Form Sign Up */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <User size={20} />
              </div>
              <input 
                type="text" 
                required
                placeholder="Nama kamu"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required
                placeholder="nama@email.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                required
                placeholder="Minimal 8 karakter"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 bg-[#1c3547] hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
            Daftar Sekarang
            <ShieldCheck size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-teal-600 font-bold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}