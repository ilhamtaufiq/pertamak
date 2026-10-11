import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Alert, Dimensions, Platform, TouchableOpacity as NativeTouchableOpacity } from 'react-native';
import { View, Text, ActivityIndicator } from '../../tw';
import { MapPin, Layers, Navigation, LocateFixed, Zap, ShieldCheck, Activity, Users } from 'lucide-react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { APP_CONFIG } from '../../config';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../tokens';

// Destructive/stop state. White label on this red passes WCAG AA.
const DANGER_SOLID = '#E11D48';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Center: Alun-Alun Kabupaten Cianjur
const CIANJUR_LAT = -6.8204;
const CIANJUR_LON = 107.1403;

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
                                html: '<div style="width:28px;height:28px;background-color:#10B981;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:12px;font-weight:bold;font-family:sans-serif;">' + initial + '</span></div>',
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

  // Poll only while this tab is on screen, and only for admins: /users/online is admin-only
  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );
  const isAdmin = user?.role === 'admin';

  const { data: onlineUsersData } = useQuery({
    queryKey: ['online-users'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await fetch(`${APP_CONFIG.API_URL}/users/online`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    refetchInterval: isAdmin && isFocused ? 10000 : false,
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
      <View style={s.topBar}>
        <Animated.View entering={FadeInDown} style={s.topRow}>
          <View>
            <Text style={s.topLabel}>Leaflet intelligence</Text>
            <Text style={s.topTitle}>Geo tracking</Text>
          </View>
          <NativeTouchableOpacity onPress={recenter} style={s.recenterBtn} accessibilityRole="button" accessibilityLabel="Pusatkan ke lokasi saya">
            <LocateFixed color="white" size={20} />
          </NativeTouchableOpacity>
        </Animated.View>
      </View>

      {/* Side Controls */}
      <View style={s.sideControls}>
        <Animated.View entering={SlideInRight.delay(200)}>
          <NativeTouchableOpacity style={s.mapControlBtn} accessibilityRole="button" accessibilityLabel="Lapisan peta">
            <Layers color="white" size={20} />
          </NativeTouchableOpacity>
        </Animated.View>
        <Animated.View entering={SlideInRight.delay(300)}>
          <NativeTouchableOpacity style={s.mapControlBtn} accessibilityRole="button" accessibilityLabel="Status keamanan">
            <ShieldCheck color={COLORS.emerald} size={20} />
          </NativeTouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom Tracking Card */}
      <View style={s.bottomCardWrapper}>
        <Animated.View entering={FadeInUp.delay(400)}>
          <View style={s.trackingCard}>
            {/* Header Row */}
            <View style={s.trackingHeader}>
              <View style={s.trackingLeft}>
                <View style={s.trackingIcon}>
                  {isTracking ? <Activity color={COLORS.primary} size={24} /> : <MapPin color={COLORS.primary} size={24} />}
                </View>
                <View style={s.trackingAddrBox}>
                  <Text style={s.trackingLabel}>Lokasi presisi</Text>
                  <Text style={s.trackingAddr} numberOfLines={2}>{address}</Text>
                </View>
              </View>
              <View style={[s.statusPill, isTracking ? s.statusActive : s.statusIdle]}>
                <View style={s.statusRow}>
                  <View style={[s.statusDot, { backgroundColor: isTracking ? COLORS.emerald : COLORS.textSecondary }]} />
                  <Text style={[s.statusPillText, { color: isTracking ? COLORS.emerald : COLORS.textSecondary }]}>
                    {isTracking ? 'Aktif' : 'Siaga'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Metrics */}
            <View style={s.metricsRow}>
              <View style={s.metricItem}>
                <Users color={COLORS.textSecondary} size={14} />
                <View style={s.metricText}>
                  <Text style={s.metricLabel}>Tim aktif</Text>
                  <Text style={s.metricValue}>{otherUsers.length} petugas</Text>
                </View>
              </View>
              <View style={s.metricItem}>
                <ShieldCheck color={COLORS.textSecondary} size={14} />
                <View style={s.metricText}>
                  <Text style={s.metricLabel}>Akurasi</Text>
                  <Text style={s.metricValue}>+/- 10 m</Text>
                </View>
              </View>
            </View>

            {/* Track Button */}
            <NativeTouchableOpacity
              onPress={toggleTracking}
              accessibilityRole="button"
              style={[s.trackBtn, { backgroundColor: isTracking ? DANGER_SOLID : COLORS.primaryDeep }]}
            >
              <Text style={s.trackBtnText}>
                {isTracking ? 'Hentikan pelacakan' : 'Mulai pelacakan'}
              </Text>
              {isTracking ? <ShieldCheck color="white" size={18} /> : <Navigation color="white" size={18} />}
            </NativeTouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },

  // Top bar: flat, translucent so the map stays readable underneath
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    paddingTop: 64, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(2,6,23,0.85)',
    borderBottomWidth: 1, borderBottomColor: COLORS.darkBorder,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLabel: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginBottom: 2 },
  topTitle: { color: 'white', ...TYPOGRAPHY.title, fontSize: 24, lineHeight: 30 },
  recenterBtn: {
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.darkBorder,
  },

  // Side controls
  sideControls: { position: 'absolute', top: 152, right: SPACING.lg, gap: SPACING.sm, zIndex: 10 },
  mapControlBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.darkSurface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.darkBorder,
  },

  // Bottom card
  bottomCardWrapper: { position: 'absolute', bottom: 112, left: SPACING.lg, right: SPACING.lg, zIndex: 10 },
  trackingCard: {
    backgroundColor: COLORS.darkSurface, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.darkBorder,
    padding: SPACING.lg,
  },
  trackingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  trackingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  trackingIcon: { width: 32, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  trackingAddrBox: { flex: 1, maxWidth: 200 },
  trackingLabel: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption, marginBottom: 2 },
  trackingAddr: { color: 'white', ...TYPOGRAPHY.subheading },
  statusPill: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1, marginLeft: SPACING.sm },
  statusActive: { backgroundColor: COLORS.darkBg, borderColor: 'rgba(16,185,129,0.4)' },
  statusIdle: { backgroundColor: COLORS.darkBg, borderColor: COLORS.darkBorder },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusPillText: { ...TYPOGRAPHY.badge },

  // Metrics
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg, paddingHorizontal: SPACING.xs },
  metricItem: { flexDirection: 'row', alignItems: 'center' },
  metricText: { marginLeft: SPACING.sm },
  metricLabel: { color: COLORS.textSecondary, ...TYPOGRAPHY.caption },
  metricValue: { color: 'white', ...TYPOGRAPHY.bodySecondary },

  // Track button
  trackBtn: {
    height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  trackBtnText: { color: 'white', ...TYPOGRAPHY.subheading, marginRight: SPACING.sm },
});
