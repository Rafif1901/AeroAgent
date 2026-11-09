import React from 'react';
import Link from 'next/link'; // Import Link dari Next.js
import { MapPin, Clock, ArrowRight, AlertTriangle, Leaf, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FCFB] relative overflow-hidden font-sans">
      
      {/* Dekorasi Background Abstrak */}
      <div className="absolute top-0 right-0 w-2/3 h-[90%] bg-[#E6F5F2] rounded-bl-[150px] -z-10 opacity-70 hidden md:block"></div>
      
      {/* NAVBAR */}
      <header className="container mx-auto px-6 py-5 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2 text-teal-600">
          <Leaf size={28} className="fill-current" />
          <span className="text-2xl font-bold tracking-tight text-slate-800">AeroAgent</span>
        </div>
        
        {/* Tombol yang sudah diubah menjadi Link */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-6 py-2 text-teal-600 font-semibold rounded-full border-2 border-teal-600 hover:bg-teal-50 transition-colors">
            Log In
          </Link>
          <Link href="/signup" className="px-6 py-2.5 bg-[#0aa389] hover:bg-teal-600 text-white font-semibold rounded-full transition-colors shadow-lg">
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="container mx-auto px-6 pt-12 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Kolom Kiri: Teks & Call to Action */}
          <div className="max-w-xl">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#1c3547] leading-[1.15] mb-6">
              Pantau Kualitas Udara Jakarta Secara <span className="text-[#0aa389]">Real-time</span> dengan AI
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-md">
              Dapatkan rekomendasi kesehatan personalized dan pantau rute aman untuk aktivitasmu.
            </p>
            <button className="flex items-center gap-2 px-8 py-4 bg-[#0aa389] hover:bg-teal-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_8px_20px_rgba(10,163,137,0.3)] hover:-translate-y-1">
              Cek Lokasiku Sekarang
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Kolom Kanan: Ilustrasi Bapak Batik & Kota Jakarta */}
          <div className="relative flex justify-center items-center w-full h-[400px] lg:h-[500px]">
             {/* Gambar ilustrasi yang sudah disesuaikan namanya */}
             <img 
               src="/photo1.png" 
               alt="Ilustrasi Bapak Batik dan Jakarta" 
               className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
             />
          </div>
        </div>

        {/* FLOATING CARD: Area Paling Kritis */}
        <div className="mt-12 max-w-[800px] mx-auto bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2rem] p-6 shadow-2xl shadow-teal-900/5 relative z-20">
          
          {/* Header Card */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-5">
            <div className="flex items-center gap-2 text-teal-800">
              <MapPin className="fill-[#0aa389] text-white" size={24} />
              <h3 className="font-bold text-xl">Area Paling Kritis</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium">
              <Clock size={16} />
              <span>Update 08:42 WIB</span>
            </div>
          </div>

          {/* Konten Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
            
            {/* Bagian Kiri Konten (Peta & Nama Lokasi) */}
            <div className="flex items-center gap-6 w-full sm:w-auto">
              
              {/* Thumbnail Peta (Mockup) */}
              <div className="w-24 h-24 bg-gray-100 rounded-2xl relative overflow-hidden shadow-inner">
                 <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] bg-[#f43f5e] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md z-10 whitespace-nowrap">
                   AQI 142
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1 text-[#f43f5e]">
                   <MapPin size={28} className="fill-current text-[#f43f5e]" />
                 </div>
              </div>

              {/* Data Lokasi */}
              <div>
                <h4 className="text-2xl font-bold text-[#1c3547]">Cawang</h4>
                <p className="text-sm text-gray-500 mb-1">Jakarta Timur</p>
                <div className="flex items-end gap-1">
                  <span className="text-[2.75rem] font-extrabold text-[#f43f5e] leading-none tracking-tighter">142</span>
                  <span className="text-sm font-bold text-gray-400 mb-1.5 ml-1">AQI</span>
                </div>
              </div>
            </div>

            {/* Bagian Kanan Konten (Badge Status & Tombol Lanjut) */}
            <div className="flex items-center gap-5 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-[#f43f5e] rounded-md">
                <AlertTriangle size={20} />
                <span className="font-bold text-sm tracking-wide">Tidak Sehat</span>
              </div>
              <button className="w-12 h-12 flex items-center justify-center bg-[#E6F5F2] hover:bg-[#0aa389] text-[#0aa389] hover:text-white rounded-full transition-all duration-300">
                <ArrowRight size={22} strokeWidth={2.5} />
              </button>
            </div>
            
          </div>
        </div>
      </main>

      {/* Siluet Gedung Jakarta di bagian paling bawah (Dekoratif) */}
      <div className="absolute bottom-0 left-0 w-full h-[15vh] opacity-20 pointer-events-none -z-10 bg-[url('/path-to-your-city-skyline-silhouette.png')] bg-repeat-x bg-bottom bg-contain"></div>

    </div>
  );
}