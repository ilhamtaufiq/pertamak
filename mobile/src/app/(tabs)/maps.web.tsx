import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, LinearGradient, BlurView } from '../../tw';
import { MapPin, Layers, Navigation, LocateFixed, Zap, ShieldCheck, Activity, Globe } from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function MapsWeb() {
  const [address, setAddress] = useState('Lokasi Web (Simulasi)');

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Real Leaflet Map for Web */}
      <View style={{ flex: 1 }}>
        <iframe 
            srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                        body { margin: 0; padding: 0; }
                        #map { height: 100vh; width: 100vw; background: #020617; }
                        .leaflet-control-attribution { display: none; }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <script>
                        var map = L.map('map', { zoomControl: false }).setView([-6.2088, 106.8456], 13);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
                    </script>
                </body>
                </html>
            `}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </View>

      {/* Top Header Overlays */}
      <View className="absolute top-0 inset-x-0 h-40 pointer-events-none">
        <LinearGradient colors={['rgba(2,6,23,0.9)', 'transparent']} className="flex-1 pt-12 px-10">
            <View className="flex-row items-center justify-between pointer-events-auto">
                <View>
                    <Text className="text-[#38BDF8] font-black text-[10px] uppercase tracking-[4px] mb-1">Web Preview Mode</Text>
                    <Text className="text-white text-4xl font-black tracking-tight">Leaflet Explorer</Text>
                </View>
                <View className="flex-row gap-4">
                    <View className="bg-sky-500/10 px-4 py-2 rounded-full border border-sky-500/20">
                        <Text className="text-sky-400 font-black text-[10px] uppercase tracking-widest">Web Platform</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
      </View>

      {/* Bottom Info Card */}
      <View className="absolute bottom-12 left-10 right-10 flex-row justify-center">
        <Animated.View entering={FadeInDown} className="w-full max-w-2xl">
            <BlurView intensity={30} tint="dark" className="bg-[#020617]/60 rounded-[40px] border border-white/10 p-10 shadow-2xl flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="w-20 h-20 rounded-[28px] bg-sky-500 items-center justify-center mr-8 shadow-2xl shadow-sky-500/40">
                        <Globe color="white" size={40} />
                    </View>
                    <View>
                        <Text className="text-white/40 font-black text-xs uppercase tracking-widest mb-2">Akses Terbatas</Text>
                        <Text className="text-white font-black text-2xl tracking-tighter">Gunakan Aplikasi Mobile</Text>
                        <Text className="text-slate-400 text-sm font-medium mt-1">Fitur pelacakan real-time hanya tersedia di Android/iOS.</Text>
                    </View>
                </View>
                
                <TouchableOpacity className="bg-white/10 p-6 rounded-3xl border border-white/10">
                    <MonitorOff color="white" size={24} />
                </TouchableOpacity>
            </BlurView>
        </Animated.View>
      </View>
    </View>
  );
}

function MonitorOff({ color, size }: { color: string, size: number }) {
    return <Globe color={color} size={size} />;
}
