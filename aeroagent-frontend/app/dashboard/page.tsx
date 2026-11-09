"use client";

import React, { useState, useEffect } from 'react';
import { 
  MoreHorizontal, ThumbsUp, ThumbsDown, Flag, Plus, Paperclip, Send,
  Thermometer, Wind, Droplets, MapPin, Map, Navigation, ShieldAlert,
  Footprints, Smartphone, Home, Shield
} from 'lucide-react';

export default function DashboardPage() {
  // =====================================================================
  // AREA PERSIAPAN INTEGRASI BACKEND
  // =====================================================================
  
  // 1. State Data Area Kritis
  const [criticalAreas, setCriticalAreas] = useState([
    { id: 1, rank: 1, name: "Cawang", aqi: 142, style: { border: "border-red-100", bgLight: "bg-red-50/50", bgDark: "bg-[#ff7b5c]", textDark: "text-[#ff7b5c]" } },
    { id: 2, rank: 2, name: "Cempaka Putih", aqi: 138, style: { border: "border-orange-100", bgLight: "bg-orange-50/50", bgDark: "bg-orange-400", textDark: "text-orange-500" } },
    { id: 3, rank: 3, name: "Tanjung Priok", aqi: 132, style: { border: "border-yellow-100", bgLight: "bg-yellow-50/50", bgDark: "bg-yellow-400", textDark: "text-yellow-600" } }
  ]);

  // 2. State Riwayat Pesan Chat Bot (Dibuat KOSONG agar mulai dari nol)
  const [messages, setMessages] = useState([]);

  // 3. State Input Ketikan User
  const [inputMessage, setInputMessage] = useState('');

  // 4. Fungsi Mengirim Pesan
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return; 

    // Buat objek pesan baru dari user
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    // Update state agar pesan user muncul di layar
    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage(''); // Kosongkan form input

    // ==========================================
    // DI SINI TEMPAT TEMANMU MEMANGGIL API AI-NYA
    // ==========================================
    /*
    fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newUserMsg.text })
    })
    .then(res => res.json())
    .then(data => {
      // Masukkan balasan AI ke state messages
      const newBotMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        source: data.source || 'AeroAgent AI',
        showFeedbackForm: data.needsFeedback || false
      };
      setMessages((prev) => [...prev, newBotMsg]);
    });
    */
  };


  // =====================================================================
  // UI DASHBOARD
  // =====================================================================

  return (
    <div className="min-h-screen bg-[#c8ebe5] p-4 lg:p-6 font-sans">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ========================================= */}
        {/* KOLOM KIRI: AERO CHAT BOT */}
        {/* ========================================= */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col h-[90vh] lg:h-[95vh]">
          {/* Header Chat */}
          <div className="bg-[#0aa389] text-white px-6 py-4 flex justify-between items-center shrink-0">
            <div>
              <h2 className="font-bold text-lg">Aero Chat Bot</h2>
              <p className="text-xs text-teal-100">Jakarta Pusat • 08:42 WIB</p>
            </div>
            <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Area Chat (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6 custom-scrollbar flex flex-col">
            
            {/* Tampilan Pembuka (Selalu Muncul di Atas) */}
            <div className="rounded-2xl overflow-hidden mb-2 border border-slate-100 shrink-0">
              <img src="/photo1.png" alt="AeroAgent AI" className="w-full h-48 object-cover" />
            </div>
            <p className="text-center text-sm text-slate-500 mb-4 shrink-0 px-4">
              Halo, aku AeroAgent. Aku membantu kamu memantau polusi udara di Jakarta, memberikan saran kesehatan, dan menemukan rute aman ke kantor.
            </p>
            
            {/* Tombol Pilihan Cepat - Akan hilang atau pindah ke atas tergantung desain, di sini kita biarkan statis di atas chat */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 shrink-0 border-b border-slate-100 pb-6">
              <button onClick={() => setInputMessage("Kualitas udara di lokasiku sekarang")} className="px-4 py-2 text-sm font-semibold text-teal-600 bg-white border border-teal-200 rounded-full shadow-sm hover:bg-teal-50 transition">Kualitas udara di lokasiku sekarang</button>
              <button onClick={() => setInputMessage("Cocok olahraga pagi ini?")} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition">Cocok olahraga pagi ini?</button>
              <button onClick={() => setInputMessage("Rute aman ke kantor")} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition">Rute aman ke kantor</button>
            </div>

            {/* Render Pesan Chat secara Dinamis (Mulai dari 0) */}
            {messages.map((msg) => (
              msg.sender === 'user' ? (
                // Bubble User
                <div key={msg.id} className="flex justify-end shrink-0">
                  <div className="bg-[#ff7b5c] text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%] shadow-md">
                    <p className="font-medium text-sm">{msg.text}</p>
                    <p className="text-xs text-white/70 mt-1 text-right">{msg.time}</p>
                  </div>
                </div>
              ) : (
                // Bubble Bot
                <div key={msg.id} className="flex justify-start shrink-0 pb-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
                    <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                    <p className="text-xs text-slate-400 mt-2">{msg.time}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                      <ThumbsUp size={16} className="text-slate-400 cursor-pointer hover:text-teal-600" />
                      <ThumbsDown size={16} className={msg.showFeedbackForm ? "text-teal-600 cursor-pointer" : "text-slate-400 cursor-pointer hover:text-red-500"} />
                      <Flag size={16} className="text-slate-400 cursor-pointer hover:text-orange-500" />
                      {msg.source && <span className="text-xs text-slate-400 ml-auto">Sumber: {msg.source}</span>}
                    </div>
                    
                    {/* Form Feedback Dinamis */}
                    {msg.showFeedbackForm && (
                      <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 mb-2">Apa yang salah? • Contoh setelah memilih thumbs down</p>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                            <input type="radio" name={`feedback-${msg.id}`} className="text-teal-600" /> Data keliru
                          </label>
                          <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                            <input type="radio" name={`feedback-${msg.id}`} className="text-teal-600" /> Tidak relevan
                          </label>
                        </div>
                        <input type="text" placeholder="Tambahkan komentar (opsional)..." className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-teal-500 mb-2" />
                        <button className="text-teal-600 font-bold text-xs hover:underline">Kirim feedback</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Input Chat Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
            <button className="text-teal-600 hover:bg-teal-50 p-2 rounded-full transition">
              <Plus size={24} />
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tulis pesan dengan bahasa natural..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-3 text-sm outline-none focus:border-teal-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600">
                <Paperclip size={18} />
              </button>
            </div>
            <button 
              onClick={handleSendMessage}
              className="bg-[#ff7b5c] hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              Kirim
            </button>
          </div>
        </div>


        {/* ========================================= */}
        {/* KOLOM KANAN: DASHBOARD METRICS */}
        {/* ========================================= */}
        <div className="overflow-y-auto h-[90vh] lg:h-[95vh] pr-2 custom-scrollbar pb-8">
          <div className="flex flex-col gap-4">
            
            {/* Card 1: Hero Location */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-teal-50 shrink-0">
              <div className="relative h-40">
                <img src="/photo2.png" alt="Monas Jakarta" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent"></div>
                <div className="absolute top-4 left-0 w-full text-center">
                  <h2 className="text-xl font-bold text-slate-800">Cilandak, Jakarta</h2>
                  <div className="text-5xl font-black text-[#1c3547] drop-shadow-md">32</div>
                  <div className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-0.5 rounded-full text-xs font-bold mt-1 shadow-sm">
                    Air Quality Index: Good
                  </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-[#0aa389]">32</div>
                  <div>
                    <div className="font-bold text-slate-800">Good</div>
                    <div className="text-xs text-slate-500">PM2.5 <span className="font-bold text-slate-700">12.0 µg/m³</span> air pollution at<br/>Cilandak, Jakarta</div>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Temp</div>
                    <div className="font-bold text-slate-800">25C</div>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Wind</div>
                    <div className="font-bold text-slate-800">2.1km/h</div>
                  </div>
                  <div className="w-px bg-slate-200"></div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Humidity</div>
                    <div className="font-bold text-slate-800">90%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Health Recommendation */}
            <div className="bg-[#0aa389] rounded-3xl p-5 shadow-lg text-white shrink-0">
              <h3 className="font-bold mb-4">Health Recommendation</h3>
              <div className="flex justify-between items-center gap-4 mb-4">
                <div className="bg-white text-[#0aa389] p-3 rounded-2xl flex-1 flex justify-center aspect-square items-center shadow-inner"><Shield size={32} /></div>
                <div className="bg-white/20 p-3 rounded-2xl flex-1 flex justify-center aspect-square items-center"><Footprints size={32} /></div>
                <div className="bg-white/20 p-3 rounded-2xl flex-1 flex justify-center aspect-square items-center"><Smartphone size={32} /></div>
                <div className="bg-white/20 p-3 rounded-2xl flex-1 flex justify-center aspect-square items-center"><Home size={32} /></div>
              </div>
              <p className="text-center font-medium bg-white/20 py-2 rounded-xl text-sm">Wear a mask if you are outside</p>
            </div>

            {/* Card 3: Rute Aman */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-teal-50 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Rute Aman</h3>
                <span className="bg-[#0aa389] text-white text-[10px] font-bold px-2 py-1 rounded-full">PM2.5 lebih rendah 12%</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <div className="bg-[#0aa389] text-white p-1.5 rounded-full mt-0.5"><Navigation size={14} /></div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">1. Bundaran HI → Jl. Sudirman</p>
                    <p className="text-xs text-slate-500">→ Senayan • 25 menit • PM2.5 rata-rata 44 µg/m³</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl">
                  <div className="bg-blue-400 text-white p-1.5 rounded-full mt-0.5"><MapPin size={14} /></div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">Alternatif: via Jl. KH Mas Mansyur</p>
                    <p className="text-xs text-slate-500">HI → Karet → Senayan • 22 menit • PM2.5 50 µg/m³</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#0aa389] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition">
                 Lihat di heatmap
              </button>
            </div>

            {/* Card 4: Area Paling Kritis */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-teal-50 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Area Paling Kritis</h3>
                <span className="text-xs text-slate-400">Update 08:42 WIB</span>
              </div>
              
              <div className="space-y-3">
                {criticalAreas.map((area) => (
                  <div key={area.id} className={`flex items-center justify-between p-3 border ${area.style.border} ${area.style.bgLight} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 ${area.style.bgDark} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                        {area.rank}
                      </div>
                      <span className="font-bold text-sm text-slate-700">{area.name}</span>
                    </div>
                    <span className={`font-bold ${area.style.textDark} text-sm`}>
                      AQI {area.aqi}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(10, 163, 137, 0.2);
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}