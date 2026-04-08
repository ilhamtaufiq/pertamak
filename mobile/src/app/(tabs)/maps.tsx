import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { View, Text, TouchableOpacity, LinearGradient, BlurView } from '../../tw';
import { MapPin, Layers, Navigation, LocateFixed, Zap, ShieldCheck, Activity } from 'lucide-react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';
import { Animated } from '../../tw/animated';
import { FadeInDown, FadeInUp, ZoomIn, SlideInRight } from 'react-native-reanimated';
import { haptics } from '../../services/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Leaflet HTML Template with Premium Dark Theme (CartoDB Dark Matter)
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
            width: 20px;
            height: 20px;
            background-color: #0EA5E9;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.8);
        }
        .pulse {
            width: 40px;
            height: 40px;
            border: 2px solid #0EA5E9;
            border-radius: 50%;
            position: absolute;
            top: -10px;
            left: -10px;
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
        var map = L.map('map', { zoomControl: false }).setView([-6.8167, 107.1417], 13);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        }).addTo(map);

        var marker = L.divIcon({
            className: 'custom-div-icon',
            html: '<div class="user-marker"><div class="pulse"></div></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        var userMarker = L.marker([-6.8167, 107.1417], { icon: marker }).addTo(map);

        document.addEventListener('message', function(event) {
            var data = JSON.parse(event.data);
            if (data.type === 'UPDATE_LOCATION') {
                userMarker.setLatLng([data.lat, data.lon]);
                if (data.center) {
                    map.setView([data.lat, data.lon], data.zoom || 16);
                }
            }
        });
        
        window.addEventListener('message', function(event) {
             var data = JSON.parse(event.data);
             if (data.type === 'UPDATE_LOCATION') {
                userMarker.setLatLng([data.lat, data.lon]);
                if (data.center) {
                    map.setView([data.lat, data.lon], data.zoom || 16);
                }
            }
        });
    </script>
</body>
</html>
`;

export default function MapsTab() {
  const webViewRef = useRef<WebView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [address, setAddress] = useState('Mencari lokasi...');
  const [isLoading, setIsLoading] = useState(true);

  // Initial Location Fetch
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

  // Tracking Logic
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

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isTracking]);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (geo && geo.length > 0) {
        const addr = geo[0];
        const formatted = [addr.street, addr.district, addr.city].filter(Boolean).join(', ');
        setAddress(formatted || 'Lokasi tidak dikenal');
      }
    } catch (e) {
      setAddress('Gagal mendapatkan alamat');
    }
  };

  const updateMap = (lat: number, lon: number, center: boolean = false) => {
    const script = `
        window.postMessage(JSON.stringify({
            type: 'UPDATE_LOCATION',
            lat: ${lat},
            lon: ${lon},
            center: ${center}
        }), '*');
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const recenter = () => {
    haptics.impactLight();
    if (location) {
      updateMap(location.coords.latitude, location.coords.longitude, true);
    }
  };

  const toggleTracking = () => {
    haptics.impactMedium();
    if (isTracking) {
        haptics.success();
    }
    setIsTracking(!isTracking);
  };

  // If web, the override file maps.web.tsx handles it.
  // react-native-webview might still cause issues on web if bundled incorrectly,
  // but it's usually polyfilled or excluded.

  return (
    <View className="flex-1 bg-[#020617]">
      {/* Background Map (Leaflet via WebView) */}
      <View style={StyleSheet.absoluteFill}>
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: LEAFLET_HTML }}
            scrollEnabled={false}
            overScrollMode="never"
            style={{ backgroundColor: '#020617' }}
            onLoadEnd={() => {
                if (location) {
                    updateMap(location.coords.latitude, location.coords.longitude, true);
                }
            }}
        />
      </View>

      {/* Top Header Overlays */}
      <View className="absolute top-0 inset-x-0 h-40">
        <LinearGradient colors={['rgba(2,6,23,0.9)', 'transparent']} className="flex-1 pt-16 px-6">
            <Animated.View entering={FadeInDown} className="flex-row items-center justify-between">
                <View>
                    <Text className="text-[#38BDF8] font-black text-[10px] uppercase tracking-[4px] mb-1">Leaflet Intelligence</Text>
                    <Text className="text-white text-3xl font-black tracking-tight">Geo Tracking</Text>
                </View>
                <TouchableOpacity onPress={recenter} className="bg-white/10 p-4 rounded-3xl border border-white/20">
                    <LocateFixed color="white" size={24} />
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
      </View>

      {/* Side Controls */}
      <View className="absolute top-48 right-6 gap-4">
          <Animated.View entering={SlideInRight.delay(200)}>
            <MapControl icon={<Layers color="white" size={20} />} />
          </Animated.View>
          <Animated.View entering={SlideInRight.delay(300)}>
            <MapControl icon={<ShieldCheck color="#10B981" size={20} />} />
          </Animated.View>
      </View>

      {/* Bottom Tracking Card */}
      <View style={{ position: 'absolute', bottom: 120, left: 16, right: 16 }}>
        <Animated.View entering={FadeInUp.delay(400)}>
            <BlurView intensity={40} tint="dark" className="bg-[#020617]/60 rounded-[40px] border border-white/10 p-8 shadow-2xl overflow-hidden">
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center">
                        <View className="w-14 h-14 rounded-[20px] bg-sky-500 items-center justify-center mr-4 shadow-lg shadow-sky-500/40">
                            {isTracking ? <Activity color="white" size={28} /> : <MapPin color="white" size={28} />}
                        </View>
                        <View className="max-w-[180px]">
                            <Text className="text-white/60 font-black text-[9px] uppercase tracking-widest mb-1">Lokasi Presisi</Text>
                            <Text className="text-white font-black text-lg leading-tight" numberOfLines={2}>{address}</Text>
                        </View>
                    </View>
                    <View className={`px-4 py-2 rounded-full border ${isTracking ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <Text className={`font-black text-[9px] uppercase tracking-widest ${isTracking ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {isTracking ? 'Active' : 'Standby'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Tracking Metrics */}
                <View className="flex-row justify-between mb-8 px-2">
                    <Metric label="Sinyal Open" value="Leaflet" icon={<Zap color="#38BDF8" size={12} />} />
                    <Metric label="Akurasi" value="+/- 10m" icon={<ShieldCheck color="#10B981" size={12} />} />
                </View>

                <TouchableOpacity 
                    onPress={toggleTracking}
                    className={`h-20 rounded-3xl items-center justify-center flex-row shadow-xl ${isTracking ? 'bg-rose-500 shadow-rose-500/30' : 'bg-sky-500 shadow-sky-500/30'}`}
                >
                    <Text className="text-white font-black text-lg uppercase tracking-[3px] mr-3">
                        {isTracking ? 'HENTIKAN PELACAKAN' : 'MULAI PELACAKAN'}
                    </Text>
                    {isTracking ? <ShieldCheck color="white" size={20} /> : <Navigation color="white" size={20} />}
                </TouchableOpacity>
            </BlurView>
        </Animated.View>
      </View>
    </View>
  );
}

function MapControl({ icon }: { icon: React.ReactNode }) {
    return (
        <TouchableOpacity className="w-16 h-16 rounded-[24px] bg-[#020617]/80 shadow-2xl items-center justify-center border border-white/10">
            {icon}
        </TouchableOpacity>
    );
}

function Metric({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <View className="flex-row items-center">
            <View className="mr-3">{icon}</View>
            <View>
                <Text className="text-white/40 font-black text-[8px] uppercase tracking-widest">{label}</Text>
                <Text className="text-white font-bold text-xs uppercase">{value}</Text>
            </View>
        </View>
    );
}
