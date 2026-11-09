"use client"; // Wajib ditambahkan agar bisa menggunakan interaksi klik dan router

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Fungsi untuk menangani saat tombol login diklik
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah halaman me-refresh bawaan browser
    // Logika validasi backend nanti bisa ditaruh di sini
    
    // Arahkan ke halaman dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FCFB] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl shadow-teal-900/10 border border-teal-50">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 text-teal-600 mb-6 hover:scale-105 transition-transform">
            <Leaf size={32} className="fill-current" />
            <span className="text-3xl font-bold tracking-tight text-slate-800">AeroAgent</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#1c3547]">Selamat Datang Kembali</h1>
          <p className="text-slate-500 text-sm mt-2">Masuk untuk memantau polusi dan rute amanmu.</p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
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
            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <a href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700">Lupa password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-[#0aa389] hover:bg-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:-translate-y-0.5">
            Masuk Sekarang
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Belum punya akun?{' '}
          <Link href="/signup" className="text-teal-600 font-bold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}