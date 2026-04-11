import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Alert, Dimensions, Platform, TouchableOpacity as NativeTouchableOpacity } from 'react-native';
import { View, Text, LinearGradient, BlurView, ActivityIndicator } from '../../tw';
import { MapPin, Layers, Navigation, LocateFixed, Zap, ShieldCheck, Activity, Users } from 'lucide-react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { APP_CONFIG } from '../../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Center: Alun-Alun Kabupaten Cianjur
const CIANJUR_LAT = -6.8204;
const CIANJUR_LON = 107.1403;

const COLORS = {
  primary: '#38BDF8',
  primarySolid: '#0EA5E9',
  darkBg: '#020617',
  darkSurface: '#0F172A',
  emerald: '#10B981',
  rose: '#EF4444',
};

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #020617; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-control-attribution { display: none; }
        .user-marker {
            width: 20px; height: 20px;
            background-color: #0EA5E9;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.8);
        }
        .pulse {
            width: 40px; height: 40px;
            border: 2px solid #0EA5E9;
            border-radius: 50%;
            position: absolute; top: -10px; left: -10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', { zoomControl: false }).setView([${CIANJUR_LAT}, ${CIANJUR_LON}], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        var marker = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="user-marker"><div class="pulse"></div></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        var userMarker = L.marker([${CIANJUR_LAT}, ${CIANJUR_LON}], { icon: marker }).addTo(map);
        var onlineMarkers = {};

        function handleMsg(event) {
            try {
                var data = JSON.parse(event.data);
                if (data.type === 'UPDATE_LOCATION') {
                    userMarker.setLatLng([data.lat, data.lon]);
                    if (data.center) {
                        map.setView([data.lat, data.lon], data.zoom || 16);
                    }
                } else if (data.type === 'UPDATE_ONLINE_USERS') {
                    var newIds = new Set(data.users.map(u => u.id));
                    for (var id in onlineMarkers) {
                        if (!newIds.has(Number(id))) {
                            map.removeLayer(onlineMarkers[id]);
                            delete onlineMarkers[id];
                        }
                    }
                    data.users.forEach(u => {
                        if (onlineMarkers[u.id]) {
                            onlineMarkers[u.id].setLatLng([u.lat, u.lon]);
                        } else {
                            var initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
                            var teamIcon = L.divIcon({
                                className: 'custom-div-icon',
                                html: '<div style="width:28px;height:28px;background-color:#10B981;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(16,185,129,0.8);"><span style="color:white;font-size:12px;font-weight:bold;font-family:sans-serif;">' + initial + '</span></div>',
                                iconSize: [28, 28],
                                iconAnchor: [14, 14]
                            });
                            var remoteMarker = L.marker([u.lat, u.lon], { icon: teamIcon }).addTo(map);
                            remoteMarker.bindPopup('<div style="font-family:sans-serif;text-align:center;padding:4px;"><b style="color:#0F172A;font-size:14px;display:block;margin-bottom:2px;">' + u.name + '</b><span style="color:#64748B;font-size:11px;">Tim Lapangan</span></div>');
                            onlineMarkers[u.id] = remoteMarker;
                        }
                    });
                }
            } catch(e) {}
        }
        document.addEventListener('message', handleMsg);
        window.addEventListener('message', handleMsg);
    </script>
</body>
</html>
`;

export default function MapsTab() {
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [address, setAddress] = useState('Kabupaten Cianjur');
  const [isLoading, setIsLoading] = useState(true);
  
  const { token, user } = useAuthStore();

  const { data: onlineUsersData } = useQuery({
    queryKey: ['online-users'],
    queryFn: async () => {
      const res = await fetch(`${APP_CONFIG.API_URL}/users/online`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const onlineUsers = onlineUsersData?.data || [];
  const otherUsers = onlineUsers.filter((u: any) => u.id !== user?.id && u.latitude && u.longitude);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Aplikasi memerlukan akses lokasi untuk menggunakan fitur peta.');
          setIsLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc);
        reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        setIsLoading(false);
        updateMap(loc.coords.latitude, loc.coords.longitude, true);
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    if (isTracking) {
      (async () => {
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10 },
          (newLoc) => {
            setLocation(newLoc);
            updateMap(newLoc.coords.latitude, newLoc.coords.longitude, true);
          }
        );
      })();
    }
    return () => { if (subscription) subscription.remove(); };
  }, [isTracking]);

  useEffect(() => {
    if (otherUsers.length > 0) {
      const usersPayload = otherUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        lat: Number(u.latitude),
        lon: Number(u.longitude)
      }));
      webViewRef.current?.injectJavaScript(`
        window.postMessage(JSON.stringify({ type:'UPDATE_ONLINE_USERS', users: ${JSON.stringify(usersPayload)} }), '*');
      `);
    }
  }, [onlineUsersData]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geo && geo.length > 0) {
        const addr = geo[0];
        const formatted = [addr.street, addr.district, addr.city].filter(Boolean).join(', ');
        setAddress(formatted || 'Kabupaten Cianjur');
      }
    } catch (e) {
      setAddress('Gagal mendapatkan alamat');
    }
  };

  const updateMap = (lat: number, lon: number, center: boolean = false) => {
    webViewRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({ type:'UPDATE_LOCATION', lat:${lat}, lon:${lon}, center:${center} }), '*');
    `);
  };

  const recenter = () => {
    haptics.impactLight();
    if (location) {
      updateMap(location.coords.latitude, location.coords.longitude, true);
    }
  };

  const toggleTracking = () => {
    haptics.impactMedium();
    if (isTracking) haptics.success();
    setIsTracking(!isTracking);
  };

  return (
    <View style={s.container}>
      {/* Map WebView */}
      <View style={StyleSheet.absoluteFill}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: LEAFLET_HTML }}
          scrollEnabled={false}
          overScrollMode="never"
          style={{ backgroundColor: COLORS.darkBg }}
          onLoadEnd={() => {
            if (location) updateMap(location.coords.latitude, location.coords.longitude, true);
            if (otherUsers.length > 0) {
              const usersPayload = otherUsers.map((u: any) => ({
                id: u.id,
                name: u.name,
                lat: Number(u.latitude),
                lon: Number(u.longitude)
              }));
              webViewRef.current?.injectJavaScript(`
                window.postMessage(JSON.stringify({ type:'UPDATE_ONLINE_USERS', users: ${JSON.stringify(usersPayload)} }), '*');
              `);
            }
          }}
        />
      </View>

      {/* Top Header */}
      <View style={s.topOverlay}>
        <LinearGradient colors={['rgba(2,6,23,0.9)', 'transparent']} style={s.topGradient}>
          <Animated.View entering={FadeInDown} style={s.topRow}>
            <View>
              <Text style={s.topLabel}>LEAFLET INTELLIGENCE</Text>
              <Text style={s.topTitle}>Geo Tracking</Text>
            </View>
            <NativeTouchableOpacity onPress={recenter} style={s.recenterBtn}>
              <LocateFixed color="white" size={24} />
            </NativeTouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </View>

      {/* Side Controls */}
      <View style={s.sideControls}>
        <Animated.View entering={SlideInRight.delay(200)}>
          <NativeTouchableOpacity style={s.mapControlBtn}>
            <Layers color="white" size={20} />
          </NativeTouchableOpacity>
        </Animated.View>
        <Animated.View entering={SlideInRight.delay(300)}>
          <NativeTouchableOpacity style={s.mapControlBtn}>
            <ShieldCheck color={COLORS.emerald} size={20} />
          </NativeTouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Tracking Card */}
      <View style={s.bottomCardWrapper}>
        <Animated.View entering={FadeInUp.delay(400)}>
          <BlurView intensity={40} tint="dark" style={s.trackingCard}>
            {/* Header Row */}
            <View style={s.trackingHeader}>
              <View style={s.trackingLeft}>
                <View style={s.trackingIconBox}>
                  {isTracking ? <Activity color="white" size={28} /> : <MapPin color="white" size={28} />}
                </View>
                <View style={s.trackingAddrBox}>
                  <Text style={s.trackingLabel}>LOKASI PRESISI</Text>
                  <Text style={s.trackingAddr} numberOfLines={2}>{address}</Text>
                </View>
              </View>
              <View style={[s.statusPill, isTracking ? s.statusActive : s.statusIdle]}>
                <View style={s.statusRow}>
                  <View style={[s.statusDot, { backgroundColor: isTracking ? COLORS.emerald : '#94A3B8' }]} />
                  <Text style={[s.statusPillText, { color: isTracking ? COLORS.emerald : '#94A3B8' }]}>
                    {isTracking ? 'Active' : 'Standby'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Metrics */}
            <View style={s.metricsRow}>
              <View style={s.metricItem}>
                <Users color={COLORS.primary} size={12} />
                <View style={s.metricText}>
                  <Text style={s.metricLabel}>TIM AKTIF</Text>
                  <Text style={s.metricValue}>{otherUsers.length} Petugas</Text>
                </View>
              </View>
              <View style={s.metricItem}>
                <ShieldCheck color={COLORS.emerald} size={12} />
                <View style={s.metricText}>
                  <Text style={s.metricLabel}>AKURASI</Text>
                  <Text style={s.metricValue}>+/- 10m</Text>
                </View>
              </View>
            </View>

            {/* Track Button */}
            <NativeTouchableOpacity
              onPress={toggleTracking}
              style={[s.trackBtn, { backgroundColor: isTracking ? COLORS.rose : COLORS.primarySolid }]}
            >
              <Text style={s.trackBtnText}>
                {isTracking ? 'HENTIKAN PELACAKAN' : 'MULAI PELACAKAN'}
              </Text>
              {isTracking ? <ShieldCheck color="white" size={20} /> : <Navigation color="white" size={20} />}
            </NativeTouchableOpacity>
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },

  // Top overlay
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, zIndex: 10 },
  topGradient: { flex: 1, paddingTop: 64, paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLabel: { color: COLORS.primary, fontWeight: '900', fontSize: 10, letterSpacing: 4, marginBottom: 4 },
  topTitle: { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  recenterBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },

  // Side controls
  sideControls: { position: 'absolute', top: 192, right: 24, gap: 16, zIndex: 10 },
  mapControlBtn: {
    width: 64, height: 64, borderRadius: 24,
    backgroundColor: 'rgba(2,6,23,0.8)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },

  // Bottom card
  bottomCardWrapper: { position: 'absolute', bottom: 120, left: 16, right: 16, zIndex: 10 },
  trackingCard: {
    backgroundColor: 'rgba(2,6,23,0.6)', borderRadius: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 32, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  trackingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  trackingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackingIconBox: {
    width: 56, height: 56, borderRadius: 20, backgroundColor: COLORS.primarySolid,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
    shadowColor: COLORS.primarySolid, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  trackingAddrBox: { flex: 1, maxWidth: 180 },
  trackingLabel: { color: 'rgba(255,255,255,0.6)', fontWeight: '900', fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  trackingAddr: { color: 'white', fontWeight: '900', fontSize: 18, lineHeight: 22 },
  statusPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginLeft: 12 },
  statusActive: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
  statusIdle: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusPillText: { fontWeight: '900', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase' },

  // Metrics
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, paddingHorizontal: 8 },
  metricItem: { flexDirection: 'row', alignItems: 'center' },
  metricText: { marginLeft: 12 },
  metricLabel: { color: 'rgba(255,255,255,0.4)', fontWeight: '900', fontSize: 8, letterSpacing: 2 },
  metricValue: { color: 'white', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },

  // Track button
  trackBtn: {
    height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
    shadowColor: COLORS.primarySolid, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8,
  },
  trackBtnText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 3, marginRight: 12 },
});
