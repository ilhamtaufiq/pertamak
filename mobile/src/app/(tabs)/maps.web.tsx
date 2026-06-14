import React, { useState } from 'react';
import Head from 'expo-router/head';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { Animated } from '../../tw/animated';
import { BlurView, LinearGradient } from '../../tw';
import { FadeInDown } from 'react-native-reanimated';

// Center: Alun-Alun Cianjur
const CIANJUR_LAT = -6.8204;
const CIANJUR_LON = 107.1403;

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
};

export default function MapsWeb() {
  const [address, setAddress] = useState('Lokasi Web (Simulasi)');

  return (
    <View style={s.container}>
      <Head>
        <title>Peta Tracking - Pertamak</title>
        <meta name="description" content="Peta real-time tracking kegiatan lapangan di Kabupaten Cianjur" />
        <meta property="og:title" content="Peta Tracking - Pertamak" />
      </Head>
      {/* Real Leaflet Map for Web */}
      <View style={{ flex: 1 }}>
        <iframe 
            srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
                        var map = L.map('map', { zoomControl: false }).setView([${CIANJUR_LAT}, ${CIANJUR_LON}], 13);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                            maxZoom: 20
                        }).addTo(map);
                    </script>
                </body>
                </html>
            `}
            style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </View>

      {/* Top Header Overlays */}
      <View pointerEvents="none" style={s.topOverlay}>
        <LinearGradient colors={['rgba(2,6,23,0.9)', 'rgba(2,6,23,0.6)', 'transparent']} style={s.topGradient}>
            <View pointerEvents="auto" style={s.topRow}>
                <View>
                    <Text style={s.topLabel}>WEB PREVIEW MODE</Text>
                    <Text style={s.topTitle}>Leaflet Explorer</Text>
                </View>
                <View style={s.platformBadge}>
                    <Text style={s.platformBadgeText}>WEB PLATFORM</Text>
                </View>
            </View>

            {/* Info Card (Moved up below Header) */}
            <View pointerEvents="auto" style={s.infoCardWrapper}>
              <Animated.View entering={FadeInDown.delay(200)}>
                  <BlurView intensity={40} tint="dark" style={s.infoCard}>
                      <View style={s.infoCardContent}>
                          <View style={s.iconBox}>
                              <Globe color="white" size={32} />
                          </View>
                          <View style={s.textContent}>
                              <Text style={s.infoLabel}>AKSES TERBATAS</Text>
                              <Text style={s.infoTitle}>Gunakan Aplikasi Mobile</Text>
                              <Text style={s.infoDesc}>Fungsi GPS & pelacakan real-time hanya tersedia penuh di Android/iOS.</Text>
                          </View>
                      </View>
                  </BlurView>
              </Animated.View>
            </View>
        </LinearGradient>
      </View>
    </View>
  );
}

function MonitorOff({ color, size }: { color: string, size: number }) {
    return <Globe color={color} size={size} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  
  // Top overlay
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 320, zIndex: 10 },
  topGradient: { flex: 1, paddingTop: 48, paddingHorizontal: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  topLabel: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 8 },
  topTitle: { color: 'white', fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  platformBadge: { 
    backgroundColor: 'rgba(14,165,233,0.1)', paddingHorizontal: 16, paddingVertical: 8, 
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(14,165,233,0.2)' 
  },
  platformBadgeText: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 2 },

  // Info card section (now under header)
  infoCardWrapper: { width: '100%', maxWidth: 640 },
  infoCard: {
    backgroundColor: 'rgba(2,6,23,0.5)', borderRadius: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 24, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  infoCardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 64, height: 64, borderRadius: 24, backgroundColor: COLORS.primarySolid,
    alignItems: 'center', justifyContent: 'center', marginRight: 24,
    shadowColor: COLORS.primarySolid, shadowOpacity: 0.4, shadowRadius: 15, elevation: 8,
  },
  textContent: { flex: 1 },
  infoLabel: { color: 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  infoTitle: { color: 'white', fontWeight: '900', fontSize: 20, letterSpacing: -0.5 },
  infoDesc: { color: '#94A3B8', fontSize: 14, fontWeight: '500', marginTop: 4 },
});
